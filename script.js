const gameArea = document.getElementById('game-area');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const net = document.getElementById('net');
const gameOverScreen = document.getElementById('game-over');
const promoCodeEl = document.getElementById('promo-code');

let score = 0;
let lives = 3;
let gameActive = true;
let lastPromo = localStorage.getItem('lastPromo') || "";

const promoCodes = ["Ile20", "New26", "Filet14"];

// --- Utilitaire : largeur dynamique de la zone de jeu ---
function getGameWidth() {
  return gameArea.getBoundingClientRect().width;
}
function getNetWidth() {
  return net.getBoundingClientRect().width;
}

// --- Curseur souris ---
gameArea.onmouseenter = () => gameActive && (gameArea.style.cursor = 'none');
gameArea.onmouseleave = () => (gameArea.style.cursor = 'default');

// --- Déplacement souris ---
gameArea.onmousemove = (e) => {
  if (!gameActive) return;
  const rect = gameArea.getBoundingClientRect();
  const maxX = getGameWidth() - getNetWidth();
  let netX = (e.clientX - rect.left) - getNetWidth() / 2;
  netX = Math.max(0, Math.min(netX, maxX));
  net.style.left = netX + 'px';
};

// --- Déplacement tactile (doigt) ---
gameArea.addEventListener('touchmove', (e) => {
  if (!gameActive) return;
  e.preventDefault(); // empêche le scroll de la page
  const touch = e.touches[0];
  const rect = gameArea.getBoundingClientRect();
  const maxX = getGameWidth() - getNetWidth();
  let netX = (touch.clientX - rect.left) - getNetWidth() / 2;
  netX = Math.max(0, Math.min(netX, maxX));
  net.style.left = netX + 'px';
}, { passive: false });

gameArea.addEventListener('touchstart', (e) => {
  if (!gameActive) return;
  e.preventDefault();
  const touch = e.touches[0];
  const rect = gameArea.getBoundingClientRect();
  const maxX = getGameWidth() - getNetWidth();
  let netX = (touch.clientX - rect.left) - getNetWidth() / 2;
  netX = Math.max(0, Math.min(netX, maxX));
  net.style.left = netX + 'px';
}, { passive: false });

function createItem() {
  if (!gameActive) return;

  const item = document.createElement('img');
  const isClochette = Math.random() > 0.4;
  item.src = isClochette ? 'cochette.png' : 'ruche d abeille.png';
  item.className = 'item';

  // Position horizontale responsive (basée sur la largeur réelle de la zone)
  const areaWidth = getGameWidth();
  const itemWidth = 50; // largeur approximative de l'item
  item.style.left = Math.random() * (areaWidth - itemWidth) + 'px';
  item.style.top = '-50px';
  gameArea.appendChild(item);

  let pos = -50;
  const fall = setInterval(() => {
    if (!gameActive) { clearInterval(fall); item.remove(); return; }

    pos += (3 + score * 0.1);
    item.style.top = pos + 'px';

    const r = item.getBoundingClientRect();
    const n = net.getBoundingClientRect();

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

    // Hauteur responsive
    const areaHeight = gameArea.getBoundingClientRect().height;
    if (pos > areaHeight + 10) { clearInterval(fall); item.remove(); }
  }, 20);
}

function endGame(win) {
  gameActive = false;
  gameOverScreen.classList.add('visible');
  document.getElementById('status-text').innerText = win ? "Gagné ! " : "Perdu... ";
  document.getElementById('final-score').innerText = score;
  gameArea.style.cursor = 'default';

  if (win) {
    let availableCodes = promoCodes.filter(c => c !== lastPromo);
    let newPromo = availableCodes[Math.floor(Math.random() * availableCodes.length)];
    promoCodeEl.innerText = newPromo;
    document.getElementById('promo-container').style.display = 'block';
    localStorage.setItem('lastPromo', newPromo);
  }
}

setInterval(createItem, 900);