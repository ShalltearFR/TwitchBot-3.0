const fetchJSON = async (url) => {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.json();
};

const followsListElement = document.getElementById("followsList");
const subsListElement = document.getElementById("subsList");
const giftsListElement = document.getElementById("giftsList");
const bitsListElement = document.getElementById("bitsList");
const raidsListElement = document.getElementById("raidsList");

const init = async () => {
  const thanksJson = await fetchJSON("/api/thanksTo");

  thanksJson?.follows?.forEach((follow) => {
    const followElement = document.createElement("li");
    followElement.textContent = follow;
    followsListElement.appendChild(followElement);
  });

  thanksJson?.subs?.forEach((sub) => {
    const subElement = document.createElement("li");
    subElement.textContent = sub;
    subsListElement.appendChild(subElement);
  });

  thanksJson?.gifts?.forEach((gift) => {
    const giftElement = document.createElement("li");
    giftElement.textContent = `${gift.name} avec ${gift.amount} subs`;
    giftsListElement.appendChild(giftElement);
  });

  thanksJson?.bits?.forEach((cheer) => {
    const cheerElement = document.createElement("li");
    cheerElement.textContent = `${cheer.name} avec ${cheer.amount} bits`;
    bitsListElement.appendChild(cheerElement);
  });

  thanksJson?.raids?.forEach((raids) => {
    const raidsElement = document.createElement("li");
    raidsElement.textContent = raids;
    raidsListElement.appendChild(raidsElement);
  });
  const conteneur = document.querySelector('main');
  conteneur.style.opacity = 0

  setTimeout(()=> {
    conteneur.style.opacity = 1
    if (conteneur.scrollHeight > 800) {
      const list = document.querySelector('#list');
      list.classList.add('defilement');
    }
  },1000)
  
  // N'affiche pas les evenements s'il n'y en a pas eu pendant le stream
  const followsSectionElement = document.getElementById("followsSection");
  const subsSectionElement = document.getElementById("subsSection");
  const giftsSectionElement = document.getElementById("giftsSection");
  const bitsSectionElement = document.getElementById("bitsSection");
  const raidsSectionElement = document.getElementById("raidsSection");

  !thanksJson.follows.length && (followsSectionElement.style.display = "none");
  !thanksJson.subs.length && (subsSectionElement.style.display = "none");
  !thanksJson.gifts.length && (giftsSectionElement.style.display = "none");
  !thanksJson.bits.length && (bitsSectionElement.style.display = "none");
  !thanksJson.raids.length && (raidsSectionElement.style.display = "none");
};

init();
