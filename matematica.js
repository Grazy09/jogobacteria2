document.addEventListener('DOMContentLoaded', () => {
    // Configurações do canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    document.body.appendChild(canvas);

    // Configurações do jogo
    const WIDTH = window.innerWidth;
    const HEIGHT = window.innerHeight;
    const SCIENTIST_SIZE = 100; // Tamanho do cientista
    const BACTERIA_SIZE = 50;  // Tamanho das bactérias
    const CURE_SIZE = 100;      // Tamanho do ponto de cura
    const NUM_BACTERIA = 5;
    const CURE_POINTS = 10;
    const BACTERIA_SPEED = 5; // Velocidade das bactérias

    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    let initialScientistX = WIDTH / 2;
    let initialScientistY = HEIGHT / 2;
    let initialBacteriaPositions = Array.from({ length: NUM_BACTERIA }, () => ({
        x: Math.random() * (WIDTH - BACTERIA_SIZE),
        y: Math.random() * (HEIGHT - BACTERIA_SIZE)
    }));

    let scientistX = initialScientistX;
    let scientistY = initialScientistY;
    let cureX = Math.random() * (WIDTH - CURE_SIZE);
    let cureY = Math.random() * (HEIGHT - CURE_SIZE);
    let score = 0;

    const bacteria = initialBacteriaPositions.map(pos => ({
        ...pos,
        dx: (Math.random() - 0.5) * BACTERIA_SPEED, // Direção horizontal
        dy: (Math.random() - 0.5) * BACTERIA_SPEED  // Direção vertical
    }));

    // Função para carregar imagens
    function loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    // Atualiza a posição das bactérias
    function updateBacteria() {
        bacteria.forEach(bacteriaRect => {
            bacteriaRect.x += bacteriaRect.dx;
            bacteriaRect.y += bacteriaRect.dy;

            // Verifica se a bactéria bateu nas bordas da tela e muda a direção
            if (bacteriaRect.x <= 0 || bacteriaRect.x >= WIDTH - BACTERIA_SIZE) {
                bacteriaRect.dx = -bacteriaRect.dx;
            }
            if (bacteriaRect.y <= 0 || bacteriaRect.y >= HEIGHT - BACTERIA_SIZE) {
                bacteriaRect.dy = -bacteriaRect.dy;
            }
        });
    }

    // Função para desenhar o jogo
    async function draw() {
        ctx.clearRect(0, 0, WIDTH, HEIGHT);

        // Desenha o cientista
        if (scientistImg) {
            ctx.drawImage(scientistImg, scientistX, scientistY, SCIENTIST_SIZE, SCIENTIST_SIZE);
        }

        // Desenha o ponto de cura
        if (cureImg) {
            ctx.drawImage(cureImg, cureX, cureY, CURE_SIZE, CURE_SIZE);
        }

        // Desenha as bactérias
        if (bacteriaImg) {
            bacteria.forEach(bacteriaRect => {
                ctx.drawImage(bacteriaImg, bacteriaRect.x, bacteriaRect.y, BACTERIA_SIZE, BACTERIA_SIZE);
            });
        }

        // Desenha a pontuação
        ctx.fillStyle = 'yellow';
        ctx.font = '20px Arial';
        ctx.fillText(`Pontuação: ${score}`, 10, 20);
    }

    // Verifica se dois retângulos se interceptam
    function rectsIntersect(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }

    // Gera uma nova posição para o ponto de cura
    function generateCure() {
        cureX = Math.random() * (WIDTH - CURE_SIZE);
        cureY = Math.random() * (HEIGHT - CURE_SIZE);
    }

    // Reseta a posição dos elementos do jogo
    function resetGame() {
        scientistX = initialScientistX;
        scientistY = initialScientistY;
        cureX = Math.random() * (WIDTH - CURE_SIZE);
        cureY = Math.random() * (HEIGHT - CURE_SIZE);
        score = 0;
        bacteria.forEach((bacteriaRect, index) => {
            bacteriaRect.x = initialBacteriaPositions[index].x;
            bacteriaRect.y = initialBacteriaPositions[index].y;
            bacteriaRect.dx = (Math.random() - 0.5) * BACTERIA_SPEED; // Direção horizontal
            bacteriaRect.dy = (Math.random() - 0.5) * BACTERIA_SPEED; // Direção vertical
        });
    }

    // Verifica colisões com o ponto de cura e bactérias
    function checkCollisions() {
        const scientistRect = { x: scientistX, y: scientistY, width: SCIENTIST_SIZE, height: SCIENTIST_SIZE };
        const cureRect = { x: cureX, y: cureY, width: CURE_SIZE, height: CURE_SIZE };

        // Verifica colisão com o ponto de cura
        if (rectsIntersect(scientistRect, cureRect)) {
            score += CURE_POINTS;
            generateCure();
        }

        // Verifica colisões com as bactérias
        for (const bacteriaRect of bacteria) {
            if (rectsIntersect(scientistRect, { x: bacteriaRect.x, y: bacteriaRect.y, width: BACTERIA_SIZE, height: BACTERIA_SIZE })) {
                alert(`Perdeu! Sua pontuação: ${score}`);
                resetGame(); // Reseta o jogo
                return; // Para evitar continuar com o loop de jogo enquanto o jogo está reiniciando
            }
        }
    }

    // Controla o movimento do cientista
    function moveScientist(e) {
        const step = 10;
        switch (e.key) {
            case 'ArrowUp':
                scientistY = Math.max(0, scientistY - step);
                break;
            case 'ArrowDown':
                scientistY = Math.min(HEIGHT - SCIENTIST_SIZE, scientistY + step);
                break;
            case 'ArrowLeft':
                scientistX = Math.max(0, scientistX - step);
                break;
            case 'ArrowRight':
                scientistX = Math.min(WIDTH - SCIENTIST_SIZE, scientistX + step);
                break;
        }
        checkCollisions();
        draw();
    }

    // Adiciona o evento para o teclado
    document.addEventListener('keydown', moveScientist);

    // Função principal do jogo
    function gameLoop() {
        updateBacteria();
        checkCollisions();
        draw();
        requestAnimationFrame(gameLoop);
    }

    // Inicializa o jogo
    async function setup() {
        try {
            scientistImg = await loadImage("cientista.png");
            bacteriaImg = await loadImage("bacteria.png");
            cureImg = await loadImage("cura.png");
            gameLoop(); // Começa o loop do jogo
        } catch (error) {
            console.error("Erro ao carregar imagens:", error);
        }
    }

    setup();

    // Configura o fundo
    const body = document.querySelector('body');
    const imageUrl = 'https://s2.glbimg.com/B_oUXmAWt4gb5rsbAwJ9X_RhIOE=/smart/e.glbimg.com/og/ed/f/original/2013/12/11/fotografia_escritorios_menno_aden_07.jpg';

    body.style.backgroundImage = `url(${imageUrl})`;
    body.style.backgroundSize = 'cover'; // Ajusta a imagem para cobrir todo o fundo
    body.style.backgroundPosition = 'center'; // Centraliza a imagem
    body.style.backgroundRepeat = 'no-repeat'; // Evita repetição da imagem
});
