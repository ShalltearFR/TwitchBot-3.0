const { twitch: twitchAuth } = require("../json/connect.json");
const express = require("express");
const axios = require("axios");
const fs = require("fs");
const { obs } = require("./obsConnexion");
const twitchBot = require("./twitchConnexion");

const redirectUri = "http://localhost:3005/auth/callback";
const app = express();
app.use(express.static("public"));

app.get("/auth", (req, res) => {
  const authUrl = `https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=${twitchAuth.clientID}&redirect_uri=${redirectUri}&scope=chat:read+chat:edit+channel:read:redemptions+channel:manage:redemptions+channel:moderate+moderator:read:followers+channel:read:subscriptions+bits:read`;
  res.redirect(authUrl);
});

app.get("/auth/callback", async (req, res) => {
  const { code } = req.query;

  try {
    const response = await axios.post(
      "https://id.twitch.tv/oauth2/token",
      null,
      {
        params: {
          client_id: twitchAuth.clientID,
          client_secret: twitchAuth.clientSecret,
          code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
        },
      }
    );

    const { access_token, refresh_token } = response.data;

    const tokens = {
      accessToken: access_token,
      refreshToken: refresh_token,
    };

    // Stockez les tokens dans un fichier JSON
    fs.writeFileSync("assets/json/twitchToken.json", JSON.stringify(tokens));

    res.send("Authentification réussie. Vous pouvez fermer cette fenêtre.");
  } catch (error) {
    console.error("Erreur lors de l'authentification :", error);
    res
      .status(500)
      .send("Erreur lors de l'authentification. Veuillez réessayer.");
  }
});

app.listen(3005, () => {
  console.log("   -> Serveur d'authentification démarré sur le port 3005");
});

module.exports = { app };

if (!fs.existsSync("assets/json/twitchToken.json")) {
  //fs.writeFileSync("assets/json/twitchToken.json", JSON.stringify({}));
  return null;
}

twitchBot.then(({ twitchListener, twitchChat, twitchAPI }) => {
  app.get("/api/rewardsFile", (req, res) => {
    fs.readFile("assets/json/rewards.json", "utf8", (err, data) => {
      if (err) {
        console.error("erreur '/json/rewards' :", err);
        return;
      }
      res.send(data);
    });
  });

  app.get("/api/thanksTo", (req, res) => {
    fs.readFile("assets/json/thanksTo.json", "utf8", (err, data) => {
      if (err) {
        console.error("erreur '/json/thanksTo' :", err);
        return;
      }
      res.send(data);
    });
  });

  app.get("/api/rewardsList", (req, res) => {
    twitchAPI.channelPoints
      .getCustomRewards(twitchAuth.channelID, false)
      .then((response) => {
        const data = response.map((element) => {
          return {
            id: element.id,
            title: element.title,
          };
        });
        res.send(data);
      });
  });

  app.get("/api/obsItemsList", (req, res) => {
    const { sceneName } = req.query;
    if (!sceneName) {
      return;
    }
    obs.client
      .call("GetSceneItemList", { sceneName: sceneName })
      .then((list) => {
        const data = list.sceneItems.map((source) => {
          return {
            sourceName: source.sourceName,
            sceneItemId: source.sceneItemId,
          };
        });
        res.send(data);
      });
  });

  app.get("/api/obsScenesList", (req, res) => {
    obs.client.call("GetSceneList").then((list) => {
      res.send(list.scenes);
    });
  });

  app.get("/api/obsFiltersItemList", (req, res) => {
    const { sourceName } = req.query;
    if (!sourceName) {
      return;
    }
    obs.client
      .call("GetSourceFilterList", { sourceName: sourceName })
      .then((list) => {
        const data = list.filters.map((filter) => {
          return {
            filterName: filter.filterName,
            filterIndex: filter.filterIndex,
          };
        });
        res.send(data);
      });
  });

  app.get("/api/clip", (req, res) => {
    const test = twitchAPI.clips.getClipsForBroadcasterPaginated(
      twitchAuth.channelID
    );
    test.getAll().then((clips) => {
      const randomClip = clips[Math.floor(Math.random() * clips.length)];
      res.send({
        embed: randomClip.embedUrl,
        duration: randomClip.duration,
      });
    });
  });
});
