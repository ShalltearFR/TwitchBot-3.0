const { twitch: twitchAuth } = require("../json/connect.json");
const fs = require("fs");
const openUrl = require("openurl");
const rewardJSON = require("../json/rewards.json");
const { obs } = require("./obsConnexion");
const player = require("play-sound")(
  (opts = { player: "./MPlayer/mplayer.exe" })
);
const twitchBot = require("./twitchConnexion");
const { io } = require("./socketio");

if (!fs.existsSync("assets/json/twitchToken.json")) {
  console.log("   -> Veuillez vous authentifier puis relancer le bot");
  openUrl.open("http://localhost:3005/auth/");
  return null;
}

twitchBot.then(({ twitchListener, twitchChat, twitchAPI }) => {
  twitchChat.onMessage(async (channel, user, text, details) => {
    // console.log("| Message chat |", details.userInfo.displayName, ":", text);
  });

  // Recup les infos de scène
  // obs.client.call("GetSceneItemList", {"sceneName" : "Dev"}).then(list => {
  //   console.log(list)
  // })

  const getTwitchAvatar = async(user) => {
    const data = await twitchAPI.users.getUserByName(user)
    return data.profilePictureUrl
  }

  twitchChat.onRitual(async (channel, user, ritualInfo, msg) => {
    player.play("sons/misc/wizz.mp3", function (err) {
      if (err) throw err;
    });
    getTwitchAvatar(user).then(avatarUrl => {
      io.emit("ritualAvatar", avatarUrl)
    })
  });

  twitchListener.onChannelRedemptionAdd(twitchAuth.channelID, (e) => {
    console.log("REWARD |", e.rewardId);


    rewardJSON.data.forEach((element) => {
      if (element.rewardID.includes(e.rewardId)) {
        // Activer/desactiver un ou plusieurs effets d'une ou plusieurs source(s)
        if (element.type === "obs filterEnabled") {
          if (element.sounds) {
            player.play(element.sounds[0], function (err) {
              if (err) throw err;
            });
          }
          element.exec.forEach((data) =>
            obs.client.call("SetSourceFilterEnabled", data)
          );
          setTimeout(() => {
            if (element.sounds) {
              if (element.sounds[1]) {
                player.play(element.sounds[1], function (err) {
                  if (err) throw err;
                });
              }
            }
            element.exec.forEach((data) =>
              obs.client.call("SetSourceFilterEnabled", {
                sourceName: data.sourceName,
                filterName: data.filterName,
                filterEnabled: false,
              })
            );
          }, Number(element.effectCooldown));
        }

        // Change la rotation d'une source
        if (element.type === "obs rotation") {
          element.exec.forEach((singleExec) => {
            setRotation("begin", singleExec, 0);

            setTimeout(() => {
              setRotation("end", singleExec, singleExec.degree);
            }, Number(element.effectCooldown));
          });
        }

        // Reward Socket io
        if (element.type === "socket io") {
          element.exec.forEach((singleExec) => {
            if (singleExec.arg === "") {
              io.emit(singleExec.name)
            } else {
              io.emit(singleExec.name, singleExec.arg)
            }
          })
        }
      }
    });
  });

  // Change la rotation d'une source
  function setRotation(fade, data, rotation) {
    if (fade === "begin" && rotation <= data.degree) {
      rotation += 1;
    }
    if (fade === "end" && rotation >= 0) {
      rotation -= 1;
    }

    obs.client.call("SetSceneItemTransform", {
      sceneName: data.sceneName,
      sceneItemId: data.sceneItemId,
      sceneItemTransform: { rotation: rotation },
    });

    if (fade === "begin" && rotation <= 9) {
      setTimeout(function () {
        setRotation("begin", data, rotation);
      }, 15);
    }
    if (fade === "end" && rotation >= 1) {
      setTimeout(function () {
        setRotation("end", data, rotation);
      }, 15);
    }
  }
});
