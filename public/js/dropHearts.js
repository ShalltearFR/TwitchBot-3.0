// script.js
const dropHeartsContainer = document.querySelector('.dropHearts');

function createdropHeart() {
    const dropHeart = document.createElement('div');
    dropHeart.className = 'dropHeart';
    dropHeart.style.left = `${Math.random() * 100}vw`;
    dropHeart.style.animationDuration = `${Math.random() * 3 + 2}s`;
    dropHeart.style.opacity = Math.random();

    const randomSize = Math.floor(Math.random() * 100) + 60
    dropHeart.style.width = `${randomSize}px`
    dropHeart.style.height = `${randomSize}px`

    dropHeart.innerHTML = `<img src="/media/coeur.png" width="${randomSize}px" height="${randomSize}px">`;
    dropHeartsContainer.appendChild(dropHeart);

    dropHeart.addEventListener('animationiteration', () => {
        dropHeart.style.left = `${Math.random() * 100}vw`;
        dropHeart.style.opacity = Math.random();
    });

    setTimeout(() => {
        dropHeart.remove();
    }, 5000);
}

setInterval(createdropHeart, 500);
