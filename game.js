const player = document.getElementById('player');
const infoPanel = document.getElementById('info-panel');
const zones = document.querySelectorAll('.zone');

let x = 50, y = window.innerHeight / 2 - 20;
const speed = 5;

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') x -= speed;
  if (e.key === 'ArrowRight') x += speed;
  if (e.key === 'ArrowUp') y -= speed;
  if (e.key === 'ArrowDown') y += speed;

  player.style.left = x + 'px';
  player.style.top = y + 'px';

  checkZones();
});

function checkZones() {
  zones.forEach(zone => {
    const rect = zone.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();
    const overlap = !(playerRect.right < rect.left || 
                      playerRect.left > rect.right || 
                      playerRect.bottom < rect.top || 
                      playerRect.top > rect.bottom);
    if (overlap) {
      infoPanel.textContent = zone.dataset.info;
    }
  });
}