
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


gameArea.onmouseenter = () => gameActive && (gameArea.style.cursor = 'none');
gameArea.onmouseleave = () => (gameArea.style.cursor = 'default');


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
  item.style.left = Math.random() * 270 + 'px';
  item.style.top = '-50px';
  gameArea.appendChild(item);

  let pos = -50;
  const fall = setInterval(() => {
    if (!gameActive) { clearInterval(fall); item.remove(); return; }

    pos += (3 + score * 0.1);
    item.style.top = pos + 'px';


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
  document.getElementById('status-text').innerText = win ? "Gagné ! " : "Perdu... ";
  document.getElementById('final-score').innerText = score;
  gameArea.style.cursor = 'default';

  if (win) {
    // Choix d'un code différent du précédent
    let availableCodes = promoCodes.filter(c => c !== lastPromo);
    let newPromo = availableCodes[Math.floor(Math.random() * availableCodes.length)];

    promoCodeEl.innerText = newPromo;
    document.getElementById('promo-container').style.display = 'block';
    localStorage.setItem('lastPromo', newPromo); // Sauvegarde pour la prochaine fois
  }
}

setInterval(createItem, 900);

