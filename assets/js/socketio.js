const { app } = require("./expressApp");
const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3005", // Permettre les requêtes provenant de ce domaine
    methods: ["GET", "POST"], // Autoriser les méthodes GET et POST
  },
});

httpServer.listen(3006, () => {
  console.log("   -> Serveur socket démarré sur le port 3006");
});

module.exports = { io };