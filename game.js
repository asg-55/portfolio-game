const player = document.getElementById('player');
const ground = document.getElementById('ground');
const gameArea = document.getElementById('game-area');
const header = document.getElementById('header-text');
const platforms = document.querySelectorAll('.platform');
const coins = document.querySelectorAll('.coin');
const goal = document.getElementById('goal');
const finalScreen = document.getElementById('final-screen');
const restartBtn = document.getElementById('restart-btn');

const GAME_W = 1024;
// Физика замедлена и облегчена
const GRAVITY = 0.38;
const JUMP_FORCE = -9.8;
const MOVE_SPEED = 1.4;
const PW = 48, PH = 48;

let px = 100, py = 0, vx = 0, vy = 0;
let isGrounded = false;
let gameFinished = false;

const keys = {};
window.addEventListener('keydown', e => {
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
  keys[e.code] = true;
});
window.addEventListener('keyup', e => { keys[e.code] = false; });

function update() {
  if (gameFinished) { requestAnimationFrame(update); return; }

  if (keys['ArrowLeft']) vx = -MOVE_SPEED;
  else if (keys['ArrowRight']) vx = MOVE_SPEED;
  else vx = 0;

  if ((keys['Space'] || keys['ArrowUp']) && isGrounded) {
    vy = JUMP_FORCE; isGrounded = false;
    player.style.transform = 'scaleY(0.75) scaleX(1.25)';
  } else { player.style.transform = 'scaleY(1) scaleX(1)'; }

  vy += GRAVITY; px += vx; py += vy;

  if (px < 0) px = 0;
  if (px > GAME_W - PW - 10) px = GAME_W - PW - 10;

  const gaRect = gameArea.getBoundingClientRect();
  const floorY = ground.getBoundingClientRect().top - gaRect.top;

  if (py + PH >= floorY) { py = floorY - PH; vy = 0; isGrounded = true; }

  platforms.forEach(plat => {
    const r = plat.getBoundingClientRect();
    const pL = r.left - gaRect.left, pR = r.right - gaRect.left, pT = r.top - gaRect.top;
    // Увеличен допуск под новый размер
    if (px + PW > pL && px < pR && py + PH >= pT && py + PH <= pT + 18 && vy >= 0) {
      py = pT - PH; vy = 0; isGrounded = true;
    }
  });

  player.style.left = `${px}px`; player.style.top = `${py}px`;

  checkCoins(); checkGoal();
  requestAnimationFrame(update);
}

function checkCoins() {
  const pCX = px + PW/2, pCY = py + PH/2;
  const gaRect = gameArea.getBoundingClientRect();

  coins.forEach(c => {
    if (c.classList.contains('collected')) return;
    const cr = c.getBoundingClientRect();
    const cCX = cr.left + cr.width/2 - gaRect.left;
    const cCY = cr.top + cr.height/2 - gaRect.top;
    
    if (Math.hypot(pCX - cCX, pCY - cCY) < 55) {
      c.classList.add('collected');
      header.innerHTML = c.dataset.text;
      header.style.borderColor = '#FFD700';
    }
  });
}

function checkGoal() {
  if (gameFinished) return;
  const gaRect = gameArea.getBoundingClientRect();
  const gr = goal.getBoundingClientRect();
  const gL = gr.left - gaRect.left, gR = gr.right - gaRect.left, gT = gr.top - gaRect.top;

  if (px + PW > gL && px < gR + 25 && py + PH > gT) triggerFinish();
}

function triggerFinish() {
  gameFinished = true;
  spawnConfetti();
  finalScreen.classList.add('visible');
}

function spawnConfetti() {
  const colors = ['#FFD700', '#FF4500', '#00FF00', '#00BFFF', '#FF00FF', '#FFF'];
  for (let i = 0; i < 70; i++) {
    const c = document.createElement('div'); c.className = 'confetti';
    c.style.left = Math.random() * GAME_W + 'px';
    c.style.top = '-10px';
    c.style.background = colors[Math.floor(Math.random() * colors.length)];
    c.style.animation = `fall ${1.5 + Math.random()*2}s linear forwards`;
    c.style.animationDelay = `${Math.random() * 0.8}s`;
    gameArea.appendChild(c);
    setTimeout(() => c.remove(), 4000);
  }
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div'); p.className = 'confetti';
    p.style.left = (GAME_W - 70) + 'px'; p.style.top = (window.innerHeight * 0.75 - 50) + 'px';
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.animation = `pop ${0.5 + Math.random()*0.4}s ease-out forwards`;
    gameArea.appendChild(p); setTimeout(() => p.remove(), 1200);
  }
}

restartBtn.addEventListener('click', () => {
  gameFinished = false;
  px = 100; py = ground.getBoundingClientRect().top - gameArea.getBoundingClientRect().top - PH - 1;
  vx = 0; vy = 0; isGrounded = false;
  finalScreen.classList.remove('visible');
  header.innerHTML = "Стрелки: движение | Пробел: прыжок<br>Собери монетки и доберись до флага.";
  header.style.borderColor = '#fff';
  coins.forEach(c => c.classList.remove('collected'));
});

py = ground.getBoundingClientRect().top - gameArea.getBoundingClientRect().top - PH - 1;
update();