const { twitch: twitchAuth } = require("../json/connect.json");
const fs = require("fs");
const openUrl = require("openurl");
const rewardJSON = require("../json/rewards.json");
const sources = require("../json/initPage.json");
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

let trainLevel = 0;

twitchBot.then(({ twitchListener, twitchChat, twitchAPI }) => {
  // Recup les infos de scène
  // obs.client.call("GetSceneItemList", { sceneName: "Dev" }).then((list) => {
  //   console.log(list);
  // });
  const getTwitchAvatar = async (user) => {
    const data = await twitchAPI.users.getUserByName(user);
    return data.profilePictureUrl;
  };

  initPage();

  twitchChat.onMessage(async (channel, user, text, msg) => {
    // console.log("| Message chat |", details.userInfo.displayName, ":", text);
    if (msg.isFirst) {
      console.log(`RITUAL EVENT | USER : ${user} |`);
      getTwitchAvatar(user).then((avatarUrl) => {
        io.emit("RitualAvatar", avatarUrl);
      });
      player.play("sons/misc/wizz.mp3", function (err) {
        if (err) throw err;
      });
    }
  });

  // Evenement de train de la hyppe qui debute
  twitchListener.onChannelHypeTrainBegin(twitchAuth.channelID, (event) => {
    io.emit("Confetti", "beginTrain");
  });

  // Evenement de train de la hyppe qui monte de niveau
  twitchListener.onChannelHypeTrainProgress(twitchAuth.channelID, (event) => {
    if (trainLevel < event.level) {
      trainLevel = event.level;
      io.emit("Confetti", "ProgressTrain");
      player.play("/sons/misc/TrainLevelUp.mp3", function (err) {
        if (err) throw err;
      });
    }
  });

  // Evenement de train de la hyppe qui prend fin
  twitchListener.onChannelHypeTrainEnd(twitchAuth.channelID, (event) => {
    io.emit("Confetti", "endTrain");
  });

  // Ajoute le follow dans la liste
  twitchListener.onChannelFollow(
    twitchAuth.channelID,
    twitchAuth.channelID,
    (event) => {
      console.log(`FOLLOW EVENT | NAME : ${event.userDisplayName} |`);
      const followerName = event.userDisplayName;
      if (!thanksTo.follows.includes(followerName)) {
        thanksTo.follows.push(followerName);
        fs.writeFileSync(
          "assets/json/thanksTo.json",
          JSON.stringify(thanksTo, null, 4)
        );
      }
    }
  );

  // Ajoute le sub dans la liste
  twitchListener.onChannelSubscription(twitchAuth.channelID, (event) => {
    console.log(`SUBSCRIBE EVENT | NAME : ${event.userDisplayName} |`);
    const subscriberName = event.userDisplayName;
    if (!thanksTo.subs.includes(subscriberName) && !event.isGift) {
      thanksTo.subs.push(subscriberName);
      fs.writeFileSync(
        "assets/json/thanksTo.json",
        JSON.stringify(thanksTo, null, 4)
      );
    }
  });

  // Ajoute le gift dans la liste
  twitchListener.onChannelSubscriptionGift(twitchAuth.channelID, (event) => {
    console.log(`GIFTER EVENT | NAME : ${event.gifterDisplayName} |`);
    let isGifterAlreadyExist = false;

    for (let i = 0; i < thanksTo.gifts.length; i++) {
      if (thanksTo.gifts[i].name === event.gifterDisplayName ?? "Anonymous") {
        isGifterAlreadyExist = true;
        // Mise à jour de la propriété amount du gifter existant
        thanksTo.gifts[i].amount += event.amount;
        break; // Sortir de la boucle une fois que le gifter a été mis à jour
      }
    }

    if (!isGifterAlreadyExist) {
      thanksTo.gifts.push({
        name: event.gifterDisplayName ?? "Anonymous",
        amount: event.amount,
      });
    }

    fs.writeFileSync(
      "assets/json/thanksTo.json",
      JSON.stringify(thanksTo, null, 4)
    );
  });

  // Ajoute le raid dans la liste
  twitchListener.onChannelRaidTo(twitchAuth.channelID, (event) => {
    console.log(
      `RAID EVENT | NAME: ${event.raidingBroadcasterDisplayName} AVEC ${event.viewers} VIEWERS|`
    );

    twitchChat.say(
      twitchAuth.channelName,
      `!topin ${event.raidingBroadcasterDisplayName}`
    );

    twitchChat.say(
      twitchAuth.channelName,
      `/shoutout ${event.raidingBroadcasterDisplayName}`
    );

    thanksTo.raids.push(
      `${event.raidingBroadcasterDisplayName} avec ${event.viewers} viewers`
    );
    fs.writeFileSync(
      "assets/json/thanksTo.json",
      JSON.stringify(thanksTo, null, 4)
    );
  });

  // Ajoute les bits dans la liste
  twitchListener.onChannelCheer(twitchAuth.channelID, (event) => {
    console.log(`CHEER EVENT | NAME : ${event.userDisplayName} |`);
    let isGifterAlreadyExist = false;
    for (let i = 0; i < thanksTo.bits.length; i++) {
      if (thanksTo.bits[i].name === event.userDisplayName ?? "Anonymous") {
        isGifterAlreadyExist = true;
        // Mise à jour de la propriété amount du gifter existant
        thanksTo.bits[i].amount += event.bits;
        break; // Sortir de la boucle une fois que le gifter a été mis à jour
      }
    }

    // Si le gifter n'existe pas, l'ajouter à thanksTo.bits
    if (!isGifterAlreadyExist) {
      thanksTo.bits.push({
        name: event.userDisplayName ?? "Anonymous",
        amount: event.bits,
      });
    }

    fs.writeFileSync(
      "assets/json/thanksTo.json",
      JSON.stringify(thanksTo, null, 4)
    );
  });

  twitchListener.onChannelRedemptionAdd(twitchAuth.channelID, (e) => {
    console.log(`REWARD EVENT | ID : ${e.rewardId} NAME : ${e.rewardTitle} |`);
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

function initPage() {
  sources.forEach((source) => {
    obs.client.call("SetSceneItemEnabled", {
      sceneName: source.scene,
      sceneItemId: source.id,
      sceneItemEnabled: false,
    });

    setTimeout(() => {
      obs.client.call("SetSceneItemEnabled", {
        sceneName: source.scene,
        sceneItemId: source.id,
        sceneItemEnabled: true,
      });
    }, 1000);
  });
}
