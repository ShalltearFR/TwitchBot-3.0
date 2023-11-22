const HyppeTrainElement = document.querySelector("#HyppeTrain");

socket.on("Confetti", (name) => {
  console.log("Animation de confettis déclenchée!");
  let end, colors, angle, origin;

  switch (name) {
    case undefined: // Récompense de chaine
      end = Date.now() + 5 * 1000;
      colors = ["#fff600", "#ffa200", "#f18e8e"];
      angle = [60, 120];
      origin = [
        { x: 0, y: 0.5 },
        { x: 1, y: 0.5 },
      ];
      break;
    case "beginTrain": // Train de la hyppe
    case "ProgressTrain":
      end = Date.now() + 10 * 1000;
      colors = ["#fff600", "#ffa200", "#f18e8e"];
      angle = [60, 60, 60, 60];
      origin = [
        { x: 0, y: 0 },
        { x: 0.3, y: 0 },
        { x: 0.6, y: 0 },
        { x: 0.9, y: 0 },
      ];
      break;
    case "endTrain": // Train de la hyppe
      end = Date.now() + 10 * 1000;
      colors = ["#fff600", "#ffa200", "#f18e8e"];
      angle = [60, 60, 60, 60];
      origin = [
        { x: 0, y: 0 },
        { x: 0.3, y: 0 },
        { x: 0.6, y: 0 },
        { x: 0.9, y: 0 },
      ];
      const tchouTchouAudioEnd = new Audio("/media/Tchou Tchou end.mp3");
      tchouTchouAudioEnd.play();

      setTimeout(() => {
        HyppeTrainElement.classList.remove("activeTrain");
      }, 8000);
      break;
  }

  if (name === "beginTrain") {
    HyppeTrainElement.classList.add("activeTrain");
    const tchouTchouAudio = new Audio("/media/Tchou Tchou.mp3");
    tchouTchouAudio.play();
  }
  
  (function frame() {
    for (let i = 0; i < angle.length; i++) {
      confetti({
        particleCount: colors.length,
        angle: angle[i],
        spread: 80,
        origin: { x: origin[i].x, y: origin[i].y },
        colors: colors,
      });
    }

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();

  // Déplacez confetti.reset() à l'extérieur de la fonction frame()
  setTimeout(() => {
    console.log("oui");
    confetti.reset();
  }, end);
});
