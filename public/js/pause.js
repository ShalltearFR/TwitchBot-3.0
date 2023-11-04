const pauseElement = document.querySelector("#pauseVideo");
const audioPause = new Audio("/media/Whooo.wav");
let clips;
fetch("http://localhost:3005/api/clips")
  .then((response) => {
    if (response.ok) {
      // Parsez la réponse JSON
      return response.json();
    }
    // Si la réponse n'est pas OK, lancez une erreur
    throw new Error("Problème de récuperation du clip");
  })
  .then((data) => {
    clips = data;
    const loadingElement = document.querySelector("#loading")
    loadingElement.computedStyleMap.display = "none"
    launchClip();
  })
  .catch((error) => {
    // Gérez les erreurs de réseau ou les erreurs liées à l'API ici
    console.error("Erreur lors de la récupération des données:", error);
  });

function launchClip() {
  const iframe = document.createElement("iframe");
  const randomIndex = Math.round(Math.random() * clips.total);

  iframe.src = `https://clips.twitch.tv/embed?clip=${clips.data[randomIndex].id}&parent=localhost&autoplay=true&width=960&height=540`;
  iframe.width = "960";
  iframe.height = "540";
  pauseElement.appendChild(iframe);

  setTimeout(() => {
    iframe.classList.add("pauseTransition")
    launchClip();
    audioPause.play();
    
    setTimeout(() => {
      audioPause.currentTime = 0;
      iframe.remove();
    }, 1500);
  }, Number(Math.floor(clips.data[randomIndex].duration * 1000)) - 1500);
}
