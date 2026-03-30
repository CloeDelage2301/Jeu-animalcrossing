

const gameArea = document.querySelector('.game-area');
const scoreEl = document.querySelector('.score');
const livesEl = document.querySelector('.lives');
const net = document.querySelector('.net');
const gameOverScreen = document.querySelector('.game-over');
const promoCodeEl = document.querySelector('.promo-code');
const leftBtn = document.querySelector('.left-btn');
const rightBtn = document.querySelector('.right-btn');

let score = 0;
let lives = 3;
let gameActive = true;
let lastPromo = localStorage.getItem('lastPromo') || "";

const promoCodes = ["Ile20", "New26", "Filet14"];

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function setNetPosition(x) {
    const areaRect = gameArea.getBoundingClientRect();
    const netRect = net.getBoundingClientRect();
    const maxLeft = Math.max(0, areaRect.width - netRect.width);
    net.style.left = clamp(x, 0, maxLeft) + 'px';
}

function getNetXFromClientX(clientX) {
    const rect = gameArea.getBoundingClientRect();
    const netRect = net.getBoundingClientRect();
    const netHalfWidth = netRect.width / 2;
    let netX = clientX - rect.left - netHalfWidth;
    return clamp(netX, 0, Math.max(0, rect.width - netRect.width));
}

function moveNetBy(delta) {
    const currentLeft = parseFloat(window.getComputedStyle(net).left) || 0;
    setNetPosition(currentLeft + delta);
}

leftBtn?.addEventListener('click', () => moveNetBy(-20));
rightBtn?.addEventListener('click', () => moveNetBy(20));

gameArea.addEventListener('mouseenter', () => gameActive && (gameArea.style.cursor = 'none'));
gameArea.addEventListener('mouseleave', () => (gameArea.style.cursor = 'default'));
gameArea.addEventListener('mousemove', (e) => {
    if (!gameActive) return;
    setNetPosition(getNetXFromClientX(e.clientX));
});
gameArea.addEventListener('touchmove', (e) => {
    if (!gameActive) return;
    const touch = e.touches[0];
    if (!touch) return;
    e.preventDefault();
    setNetPosition(getNetXFromClientX(touch.clientX));
}, { passive: false });

// Gestion curseur
gameArea.onmouseenter = () => gameActive && (gameArea.style.cursor = 'none');
gameArea.onmouseleave = () => (gameArea.style.cursor = 'default');

// Mouvement horizontal
gameArea.onmousemove = (e) => {
    if (!gameActive) return;
    const rect = gameArea.getBoundingClientRect();
    let netX = (e.clientX - rect.left) - 50;
    if (netX < 0) netX = 0;
    if (netX > 220) netX = 220;
    net.style.left = netX + 'px';
};

function createItem() {
    if (!gameActive) return;

    const item = document.createElement('img');
    const isClochette = Math.random() > 0.4; 
    item.src = isClochette ? 'cochette.png' : 'ruche d abeille.png';
    item.className = 'item';
    gameArea.appendChild(item);

    const itemWidth = item.getBoundingClientRect().width || 48;
    const maxLeft = Math.max(0, gameArea.clientWidth - itemWidth);
    item.style.left = Math.random() * maxLeft + 'px';
    item.style.top = '-50px';

    let pos = -50;
    const fall = setInterval(() => {
        if (!gameActive) { clearInterval(fall); item.remove(); return; }

        pos += (3 + score * 0.1);
        item.style.top = pos + 'px';

        // COLLISION RÉDUITE (Précision accrue)
        const r = item.getBoundingClientRect();
        const n = net.getBoundingClientRect();

        // On réduit les marges de collision de 15px de chaque côté
        const padding = 15;
        if (r.bottom > n.top + 5 && r.top < n.bottom - 20 &&
            r.left + padding < n.right - padding &&
            r.right - padding > n.left + padding) {

            if (isClochette) {
                score++;
                scoreEl.innerText = score;
                if (score >= 15) endGame(true);
            } else {
                lives--;
                livesEl.innerText = lives;
                if (lives <= 0) endGame(false);
            }
            clearInterval(fall);
            item.remove();
        }

        if (pos > gameArea.clientHeight) { clearInterval(fall); item.remove(); }
    }, 20);
}

function endGame(win) {
    gameActive = false;
    gameOverScreen.classList.add('visible');
    document.querySelector('.status-text').innerText = win ? "Gagné ! " : "Perdu... ";
    document.querySelector('.final-score').innerText = score;
    gameArea.style.cursor = 'default';

    if (win) {
        // Choix d'un code différent du précédent
        let availableCodes = promoCodes.filter(c => c !== lastPromo);
        let newPromo = availableCodes[Math.floor(Math.random() * availableCodes.length)];

        promoCodeEl.innerText = newPromo;
        document.querySelector('.promo-container').style.display = 'block';
        localStorage.setItem('lastPromo', newPromo); // Sauvegarde pour la prochaine fois
    }
}

setInterval(createItem, 900);

function copyCode() {
    const code = promoCodeEl.innerText;
    navigator.clipboard.writeText(code).then(() => {
        const btn = document.querySelector('.copy-btn');
        btn.innerText = "Copié !";
        setTimeout(() => btn.innerText = "Copier", 2000);
    }).catch(err => {
        alert("Erreur lors de la copie : " + code);
    });
}