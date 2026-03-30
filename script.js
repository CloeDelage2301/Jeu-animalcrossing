

const gameArea = document.querySelector('.game-area');
const scoreEl = document.querySelector('.score');
const livesEl = document.querySelector('.lives');
const net = document.querySelector('.net');
const gameOverScreen = document.querySelector('.game-over');
const promoCodeEl = document.querySelector('.promo-code');

let score = 0;
let lives = 3;
let gameActive = true;
let lastPromo = localStorage.getItem('lastPromo') || "";

const promoCodes = ["Ile20", "New26", "Filet14"];

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
    const isClochette = Math.random() > 0.4; // Un peu plus de ruches pour le challenge
    item.src = isClochette ? 'cochette.png' : 'ruche d abeille.png';
    item.className = 'item';
    item.style.left = Math.random() * 270 + 'px';
    item.style.top = '-50px';
    gameArea.appendChild(item);

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

        if (pos > 480) { clearInterval(fall); item.remove(); }
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