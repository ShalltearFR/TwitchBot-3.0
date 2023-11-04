// script.js
const snowflakesContainer = document.querySelector('.snowflakes');

function createSnowflake() {
    const snowflake = document.createElement('div');
    snowflake.className = 'snowflake';
    snowflake.style.left = `${Math.random() * 100}vw`;
    snowflake.style.animationDuration = `${Math.random() * 3 + 2}s`;
    snowflake.style.opacity = Math.random();
    const randomSize = Math.floor(Math.random() * 40) + 20
    snowflake.style.width = `${randomSize}px`
    snowflake.style.height = `${randomSize}px`
    snowflake.innerText = '';
    snowflakesContainer.appendChild(snowflake);

    snowflake.addEventListener('animationiteration', () => {
        snowflake.style.left = `${Math.random() * 100}vw`;
        snowflake.style.opacity = Math.random();
    });

    setTimeout(() => {
        snowflake.remove();
    }, 5000);
}

setInterval(createSnowflake, 500);
