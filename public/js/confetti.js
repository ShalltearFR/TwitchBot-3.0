socket.on("Confetti", () => {
  console.log("Animation de confettis déclenchée!");
  var end = Date.now() + 5 * 1000;
  var colors = ["#fff600", "#ffa200", "#f18e8e"];

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 80,
      origin: { x: 0 },
      colors: colors,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 80,
      origin: { x: 1 },
      colors: colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }

    setTimeout(() => {
      confetti.reset();
    }, end);
  })();
});
