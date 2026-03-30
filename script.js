
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

        // --- MOUVEMENT ---
        function setNetX(x) {
            if (!gameActive) return;
            let netX = x;
            if (netX < 0) netX = 0;
            if (netX > 220) netX = 220;
            net.style.left = netX + 'px';
        }

        // PC
        gameArea.onmousemove = (e) => {
            const rect = gameArea.getBoundingClientRect();
            setNetX((e.clientX - rect.left) - 50);
        };

        // MOBILE (Flèches)
        let moveInterval;
        function startMove(dir) {
            if(!gameActive) return;
            moveInterval = setInterval(() => {
                let currentX = parseInt(net.style.left) || 110;
                setNetX(currentX + (dir * 10));
            }, 30);
        }
        function stopMove() { clearInterval(moveInterval); }

        document.getElementById('left-btn').ontouchstart = () => startMove(-1);
        document.getElementById('right-btn').ontouchstart = () => startMove(1);
        document.getElementById('left-btn').ontouchend = stopMove;
        document.getElementById('right-btn').ontouchend = stopMove;

        // Gestion curseur
        gameArea.onmouseenter = () => gameActive && (gameArea.style.cursor = 'none');
        gameArea.onmouseleave = () => (gameArea.style.cursor = 'default');

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

        function copyCode() {
            const code = promoCodeEl.innerText;
            navigator.clipboard.writeText(code).then(() => {
                const btn = document.getElementById('copy-btn');
                btn.innerText = "Copié !";
                setTimeout(() => btn.innerText = "Copier le code", 2000);
            });
        }

        setInterval(createItem, 900);
