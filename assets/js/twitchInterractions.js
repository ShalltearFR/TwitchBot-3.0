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
let thanksTo = {
  follows: [],
  subs: [],
  gifts: [],
  bits: [],
  raids: [],
};

twitchBot.then(({ twitchListener, twitchChat, twitchAPI }) => {
  twitchChat.onMessage(async (channel, user, text, details) => {
    // console.log("| Message chat |", details.userInfo.displayName, ":", text);
    // if (!thanksTo.subs.includes({"filterMoi"})) {
    // }
  });

  // Recup les infos de scène
  // obs.client.call("GetSceneItemList", {"sceneName" : "Dev"}).then(list => {
  //   console.log(list)
  // })

  // Ajoute le follow dans la liste
  twitchListener.onChannelFollow(
    twitchAuth.channelID,
    twitchAuth.channelID,
    (event) => {
      const followerName = event.userDisplayName;
      if (!thanksTo.follows.includes(followerName)) {
        thanksTo.follows.push(followerName);
        fs.writeFileSync(
          "assets/json/thanksTo.json",
          JSON.stringify(thanksTo, null, 4)
        );
        console.log("FOLLOW EVENT | NAME :", event.userDisplayName, "|");
      }
    }
  );

  // Ajoute le sub dans la liste
  twitchListener.onChannelSubscription(twitchAuth.channelID, (event) => {
    const subscriberName = event.userDisplayName;
    if (!thanksTo.subs.includes(subscriberName) && !event.isGift) {
      thanksTo.subs.push(subscriberName);
      fs.writeFileSync(
        "assets/json/thanksTo.json",
        JSON.stringify(thanksTo, null, 4)
      );
      console.log("SUBSCRIBE EVENT | NAME :", event.userDisplayName, "|");
    }
  });

  // Ajoute le gift dans la liste
  twitchListener.onChannelSubscriptionGift(twitchAuth.channelID, (event) => {
    // Verifie si le gifter existe
    let isGifterAllReadyExist = false;
    for (let i = 0; i < thanksTo.gifts.length; i++) {
      if (thanksTo.gifts[i].hasOwnProperty(event.gifterDisplayName)) {
        isGifterAllReadyExist = true;
        break;
      }
    }

    // S'il n'existe pas, l'ajoute
    if (!isGifterAllReadyExist) {
      let newGifter = {};
      newGifter[event.gifterDisplayName] = {
        amount: event.cumulativeAmount,
      };
      thanksTo.gifts.push(newGifter);
    } else {
      // S'il existe, change juste la propriété de amount du gifter
      thanksTo.gifts[event.gifterDisplayName].amount = event.cumulativeAmount;
    }

    fs.writeFileSync(
      "assets/json/thanksTo.json",
      JSON.stringify(thanksTo, null, 4)
    );
    console.log("GIFTER EVENT | NAME :", event.gifterDisplayName, "|");
  });

  // Ajoute le raid dans la liste
  twitchListener.onChannelRaidFrom(twitchAuth.channelID, (event) => {
    thanksTo.raids.push(
      `${event.raidingBroadcasterDisplayName} avec ${event.viewers} viewers`
    );
    fs.writeFileSync(
      "assets/json/thanksTo.json",
      JSON.stringify(thanksTo, null, 4)
    );
    console.log(
      `RAID EVENT | NAME: ${event.raidingBroadcasterDisplayName} AVEC ${event.viewers} VIEWERS|`
    );
  });

  // Ajoute les bits dans la liste
  twitchListener.onChannelCheer(
    twitchAuth.channelID,
    twitchAuth.channelID,
    (event) => {
      // Verifie si le gifter existe
      let isGifterAllReadyExist = false;
      for (let i = 0; i < thanksTo.bits.length; i++) {
        if (thanksTo.bits[i].hasOwnProperty(event.userDisplayName)) {
          isGifterAllReadyExist = true;
          break;
        }
      }

      // S'il n'existe pas, l'ajoute
      if (!isGifterAllReadyExist) {
        let newCheer = {};
        newCheer[event.userDisplayName] = {
          amount: event.bits,
        };
        thanksTo.bits.push(newCheer);
      } else {
        // S'il existe, change juste la propriété de amount de la personne qui a cheer
        thanksTo.bits[event.userDisplayName].amount += event.bits;
      }
      fs.writeFileSync(
        "assets/json/thanksTo.json",
        JSON.stringify(thanksTo, null, 4)
      );
      console.log("CHEER EVENT | NAME :", event.userDisplayName, "|");
    }
  );

  const getTwitchAvatar = async (user) => {
    const data = await twitchAPI.users.getUserByName(user);
    return data.profilePictureUrl;
  };

  twitchChat.onRitual(async (channel, user, ritualInfo, msg) => {
    player.play("sons/misc/wizz.mp3", function (err) {
      if (err) throw err;
    });
    getTwitchAvatar(user).then((avatarUrl) => {
      io.emit("RitualAvatar", avatarUrl);
    });
  });

  twitchListener.onChannelRedemptionAdd(twitchAuth.channelID, (e) => {
    console.log(
      "REWARD EVENT | ID :",
      e.rewardId,
      " NAME :",
      e.rewardTitle,
      "|"
    );

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
              io.emit(singleExec.name);
            } else {
              io.emit(singleExec.name, singleExec.arg);
            }
          });
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
