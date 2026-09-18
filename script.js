const canvas = document.getElementById('particle-canvas');
const stage = document.querySelector('.particle-stage');
const context = canvas.getContext('2d');
const pointer = { x: -1000, y: -1000, active: false };
let particles = [];
let animationFrame;
let width = 0;
let height = 0;

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = stage.clientWidth;
  height = stage.clientHeight;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  createTextParticles();
}

function createTextParticles() {
  const sample = document.createElement('canvas');
  const sampleContext = sample.getContext('2d');
  sample.width = width;
  sample.height = height;
  const fontSize = Math.max(44, Math.min(width / 6.8, 112));
  sampleContext.font = `800 ${fontSize}px Syne, sans-serif`;
  sampleContext.textAlign = 'center';
  sampleContext.textBaseline = 'middle';
  sampleContext.fillStyle = '#11110f';
  sampleContext.fillText('SUVI', width / 2, height * .43);
  sampleContext.fillText('TIWARI', width / 2, height * .57);
  const pixels = sampleContext.getImageData(0, 0, width, height).data;
  const targets = [];
  const gap = width < 600 ? 4 : 5;
  for (let y = 0; y < height; y += gap) {
    for (let x = 0; x < width; x += gap) {
      if (pixels[(y * width + x) * 4 + 3] > 100) targets.push({ x, y });
    }
  }
  particles = targets.map((target, index) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    targetX: target.x,
    targetY: target.y,
    size: Math.random() * 2.1 + 1,
    color: index % 23 === 0 ? '#d95743' : '#11110f',
    speed: Math.random() * .035 + .09,
    phase: Math.random() * Math.PI * 2
  }));
}

function drawParticles(time) {
  context.clearRect(0, 0, width, height);
  const radius = width < 600 ? 75 : 110;
  particles.forEach((particle) => {
    const distanceX = pointer.x - particle.x;
    const distanceY = pointer.y - particle.y;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    let repelX = 0;
    let repelY = 0;
    if (pointer.active && distance < radius) {
      const force = (radius - distance) / radius;
      repelX = -(distanceX / (distance || 1)) * force * 25;
      repelY = -(distanceY / (distance || 1)) * force * 25;
    }
    particle.x += (particle.targetX + repelX - particle.x) * particle.speed;
    particle.y += (particle.targetY + repelY - particle.y) * particle.speed;
    const shimmer = Math.sin(time * .0028 + particle.phase) * .18;
    context.globalAlpha = .88 + shimmer;
    context.shadowBlur = 0;
    context.fillStyle = particle.color;
    context.beginPath();
    context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    context.fill();
  });
  context.globalAlpha = 1;
  context.shadowBlur = 0;
  animationFrame = requestAnimationFrame(drawParticles);
}

function updatePointer(event) {
  const bounds = canvas.getBoundingClientRect();
  pointer.x = event.clientX - bounds.left;
  pointer.y = event.clientY - bounds.top;
  pointer.active = true;
}

stage.addEventListener('pointermove', updatePointer);
stage.addEventListener('pointerleave', () => { pointer.active = false; });
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
drawParticles(0);

const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');
menuButton.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});
nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
}));

window.addEventListener('pagehide', () => cancelAnimationFrame(animationFrame));
