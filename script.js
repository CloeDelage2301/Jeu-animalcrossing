
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

        // --- MOUVEMENT SOURIS (PC) ---
        gameArea.onmousemove = (e) => {
            if (!gameActive) return;
            const rect = gameArea.getBoundingClientRect();
            updateNetPos((e.clientX - rect.left) - 50);
        };

        // --- MOUVEMENT FLÈCHES (TEL) ---
        let moveInterval;
        function updateNetPos(x) {
            if (x < 0) x = 0;
            if (x > 220) x = 220;
            net.style.left = x + 'px';
        }

        function startMoving(dir) {
            if (!gameActive) return;
            moveInterval = setInterval(() => {
                let currentX = parseInt(net.style.left) || 110;
                updateNetPos(currentX + (dir * 8));
            }, 20);
        }

        function stopMoving() {
            clearInterval(moveInterval);
        }

        // Événements tactiles pour les flèches
        document.getElementById('left-arrow').addEventListener('touchstart', (e) => { e.preventDefault(); startMoving(-1); });
        document.getElementById('right-arrow').addEventListener('touchstart', (e) => { e.preventDefault(); startMoving(1); });
        document.getElementById('left-arrow').addEventListener('touchend', stopMoving);
        document.getElementById('right-arrow').addEventListener('touchend', stopMoving);
        
        // Support souris pour les flèches aussi
        document.getElementById('left-arrow').onmousedown = () => startMoving(-1);
        document.getElementById('right-arrow').onmousedown = () => startMoving(1);
        window.onmouseup = stopMoving;

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

                // Vitesse réduite (2.5 au lieu de 3) pour que ce soit moins dur
                pos += (2.5 + score * 0.08); 
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

                if (pos > 480) { clearInterval(fall); item.remove(); }
            }, 20);
        }

        function endGame(win) {
            gameActive = false;
            gameOverScreen.classList.add('visible');
            document.getElementById('status-text').innerText = win ? "Gagné ! 🎉" : "Perdu... 🐝";
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

        // Fonction pour copier le code
        function copyCode() {
            const code = promoCodeEl.innerText;
            navigator.clipboard.writeText(code).then(() => {
                const btn = document.getElementById('copy-btn');
                btn.innerText = "Copié !";
                setTimeout(() => btn.innerText = "Copier", 2000);
            }).catch(err => {
                alert("Erreur lors de la copie : " + code);
            });
        }

        setInterval(createItem, 1000); // Un peu plus lent (1000ms au lieu de 900ms)
*