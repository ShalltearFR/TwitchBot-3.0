// const welcomeSoundList = require("../json/welcomeSoundList.json")
// const { twitch } = require('./twitchConnexion.js')
// const player = require('play-sound')(opts = {player: "./MPlayer/mplayer.exe"})

// let viewersList = []

// twitch.client.on("chat", function (channel, userstate) {
//     if (welcomeSoundList.find(record => record.Viewer === userstate['username']) != null)
//     {
//         if (!viewersList.includes(userstate['username'])){
//             let json = welcomeSoundList.find(record => record.Viewer === userstate['username'])

//             player.play(json.File, function(err){
//                 if (err) throw err})
//                 viewersList.push(userstate['username'])
//         }
//     }
// })