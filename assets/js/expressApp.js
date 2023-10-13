const { twitch: twitchAuth } = require("../json/connect.json");
const express = require("express");
const axios = require("axios");
const fs = require("fs");

const redirectUri = "http://localhost:3005/auth/callback";
const app = express();
app.use(express.static("public"));

app.get("/auth", (req, res) => {
  const authUrl = `https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=${twitchAuth.clientID}&redirect_uri=${redirectUri}&scope=chat:read+chat:edit+channel:read:redemptions+channel:manage:redemptions+channel:moderate`;
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




module.exports = { app }