const obsConnect = require('../json/connect.json')
const OBSWebSocket = require('obs-websocket-js').default;
//const obs = new OBSWebSocket();
// //import OBSWebSocket, {EventSubscription} from 'obs-websocket-js';

class OBS{
    constructor(){
        this.client = new OBSWebSocket()
    }
    init(){
        this.client.connect( obsConnect.obs.ip, obsConnect.obs.password)
        .then(() => { console.log("   -> Connexion vers OBS réussi."); })
        .catch(err => { console.log("   -> OBS n'a pas été demarré."); });
    }
}

const obs = new OBS()

obs.init()

module.exports = { obs };