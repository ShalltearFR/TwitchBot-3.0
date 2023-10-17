const { twitch: twitchAuth } = require("../json/connect.json");
const fs = require("fs");
const { ApiClient } = require("@twurple/api");
const { EventSubWsListener } = require("@twurple/eventsub-ws");
const { RefreshingAuthProvider } = require("@twurple/auth");
const { ChatClient } = require("@twurple/chat");
require("./expressApp.js");

let token;
if (!fs.existsSync("assets/json/twitchToken.json")) {
  //fs.writeFileSync("assets/json/twitchToken.json", JSON.stringify({}));
  return null;
} else {
  token = require("../json/twitchToken.json");
}

async function initializeAuthProvider() {
  const authProvider = new RefreshingAuthProvider({
    clientId: twitchAuth.clientID,
    clientSecret: twitchAuth.clientSecret,
  });

  authProvider.onRefresh(async (userId, newTokenData) => {
    fs.writeFileSync(
      "assets/json/twitchToken.json",
      JSON.stringify(newTokenData, null, 4)
    );
    console.log("   -> Refresh du token twitch");
  });

  await authProvider
    .addUserForToken(token, ["chat"])
    .then(() => {
      console.log("   -> Authentification Twitch reussi");
    })
    .catch(() => console.log("   -> Erreur d'authentification twitch"));
  return authProvider;
}

async function setupBot() {
  const authProvider = await initializeAuthProvider();

  if (authProvider) {
    const twitchAPI = new ApiClient({ authProvider });
    const twitchListener = new EventSubWsListener({ apiClient: twitchAPI });
    twitchListener.start();

    const twitchChat = new ChatClient({
      authProvider,
      channels: [twitchAuth.channelName],
    });
    twitchChat.connect();

    console.log("   -> Bot connecté au chat Twitch");

    return { twitchListener, twitchChat, twitchAPI };
  } else {
    console.log(
      "   -> Authentification en attente. Relancez le bot après l'authentification"
    );
  }
}

module.exports = setupBot();
