// Affiche l'avatar twitch pour les nouveaux arrivant
const mainRitualElement = document.querySelector("#MainRitual");
socket.on("RitualAvatar", (avatarUrl) => {
  // Creation de la div d'image avec ajout de class
  const ritualDivElement = document.createElement("div");
  ritualDivElement.classList.add("ritualDiv");

  // Creation de l'image avec ajout de class
  const ritualImageElement = document.createElement("img");
  ritualImageElement.classList.add("ritualImage");

  // Defini une position aléatoire
  const positionX = Math.floor(Math.random() * 1816);
  const positionY = Math.floor(Math.random() * 976);

  ritualDivElement.style.position = "absolute";
  ritualDivElement.style.marginLeft = `${positionX}px`;
  ritualDivElement.style.marginTop = `${positionY}px`;

  // Mise en cache de l'image
  const img = new Image();
  img.src = avatarUrl;
  img.onload = () => {
    // Une fois chargé, ajoute le lien de l'image dans la balise img, fais l'arborescence et les affichent
    ritualImageElement.src = img.src;
    mainRitualElement.appendChild(ritualDivElement);
    ritualDivElement.appendChild(ritualImageElement);

    // Suppression auto au bout de 5 secondes
    setTimeout(() => {
      ritualImageElement.classList.add("ritualImageFadeOut");
      setTimeout(() => {
        ritualDivElement.remove();
      }, 1000);
    }, 5000);
  };
});
