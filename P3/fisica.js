(() => {
  'use strict';

  const canvas = document.getElementById('canvas');

  if (!canvas) {
    console.error('No se encontró el canvas.');
    return;
  }

  const ctx = canvas.getContext('2d');

  if (!ctx) {
    console.error('No se pudo crear el contexto 2D.');
    return;
  }

  const $ = id => document.getElementById(id);

  const timerDisplay = $('timer');
  const resultDisplay = $('result');
  const angleInput = $('angle');
  const velocityInput = $('velocity');
  const fireButton = $('fire');
  const resetButton = $('reset');

  const angleValue = $('valorangulo');
  const velocityValue = $('valorvelocidad');

  if (!angleInput || !velocityInput || !fireButton || !resetButton) {
    console.error('Faltan elementos HTML necesarios.');
    return;
  }

  canvas.width = 900;
  canvas.height = 400;

  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;

  const GROUND_Y = HEIGHT - 33;
  const GRAVITY = 1080;
  const ARROW_LENGTH = 60;
  const TARGET_RADIUS = 32;

  const ARROW_COLOR = '#654321';

  const audio = {
    shot: new Audio('flecha.mp3'),
    hit: new Audio('impacto1.mp3'),
    success: new Audio('acierto1.mp3')
  };

  Object.values(audio).forEach(sound => {
    sound.preload = 'auto';
  });

  const state = {
    x: 20,
    y: HEIGHT - 50,
    vx: 0,
    vy: 0,
    hits: 0,
    targetX: randomTargetX(),
    phase: 'ready',
    shotStartedAt: 0,
    elapsed: 0,
    lastFrameAt: 0,
    confetti: []
  };

  function randomTargetX() {
    const margin = TARGET_RADIUS + 10;

    return Math.round(
      margin + Math.random() * (WIDTH - margin * 2)
    );
  }

  function playSound(sound) {
    if (!sound) return;

    try {
      sound.currentTime = 0;

      const promise = sound.play();

      if (promise && promise.catch) {
        promise.catch(() => {});
      }
    } catch (error) {
      console.warn('Error reproduciendo sonido:', error);
    }
  }

  function updateLabels() {
    if (angleValue) {
      angleValue.textContent = angleInput.value;
    }

    if (velocityValue) {
      velocityValue.textContent = velocityInput.value;
    }
  }

  angleInput.addEventListener('input', updateLabels);
  velocityInput.addEventListener('input', updateLabels);

  updateLabels();

  function updateTimer() {
    if (timerDisplay) {
      timerDisplay.textContent = Math.floor(state.elapsed);
    }
  }

  function resetShot() {
    state.x = 20;
    state.y = HEIGHT - 50;
    state.vx = 0;
    state.vy = 0;
    state.elapsed = 0;
    state.shotStartedAt = 0;
    state.phase = 'ready';
    state.confetti.length = 0;

    updateTimer();
  }

  function resetGame() {
    resetShot();
    state.targetX = randomTargetX();

    if (resultDisplay) {
      resultDisplay.textContent = '';
    }
  }

  function fire() {
    if (state.phase === 'flying') {
      return;
    }

    const angle = Number.parseFloat(angleInput.value);
    const velocity = Number.parseFloat(velocityInput.value);

    if (
      !Number.isFinite(angle) ||
      !Number.isFinite(velocity) ||
      velocity <= 0
    ) {
      if (resultDisplay) {
        resultDisplay.textContent =
          'Introduce un ángulo y una velocidad válidos.';
      }

      return;
    }

    const radians = angle * Math.PI / 180;
    const speed = velocity * 60;

    state.vx = speed * Math.cos(radians);
    state.vy = speed * Math.sin(radians);
    state.elapsed = 0;
    state.shotStartedAt = performance.now();
    state.phase = 'flying';

    if (resultDisplay) {
      resultDisplay.textContent = '';
    }

    playSound(audio.shot);
  }

  function checkCollision() {
    const tipX = state.x + ARROW_LENGTH;
    const tipY = state.y + 20;

    const dx = tipX - state.targetX;
    const dy = tipY - GROUND_Y;

    const distanceSquared = dx * dx + dy * dy;

    return distanceSquared <= TARGET_RADIUS * TARGET_RADIUS;
  }

  function finishShot(wasHit) {
    if (state.phase !== 'flying') {
      return;
    }

    state.phase = wasHit ? 'hit' : 'miss';

    if (wasHit) {
      state.hits++;

      if (resultDisplay) {
        resultDisplay.textContent = '¡Acertaste la diana!';
      }

      createConfetti(state.targetX, GROUND_Y);

      playSound(audio.hit);
      playSound(audio.success);
    } else {
      if (resultDisplay) {
        resultDisplay.textContent = '¡Fallaste!';
      }
    }
  }

  function createConfetti(x, y) {
    const count = 65;

    for (let i = 0; i < count; i++) {
      state.confetti.push({
        x: x + (Math.random() - 0.5) * 24,
        y: y + (Math.random() - 0.5) * 18,
        vx: (Math.random() - 0.5) * 260,
        vy: -Math.random() * 260 - 40,
        gravity: 520,
        radius: Math.random() * 4 + 2,
        rotation: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 8,
        life: 2.8,
        color: `hsl(${Math.floor(Math.random() * 360)} 90% 55%)`
      });
    }
  }

  function updateConfetti(dt) {
    state.confetti = state.confetti.filter(piece => {
      piece.life -= dt;
      piece.vy += piece.gravity * dt;
      piece.x += piece.vx * dt;
      piece.y += piece.vy * dt;
      piece.rotation += piece.spin * dt;

      return piece.life > 0 && piece.y < HEIGHT + 20;
    });
  }

  function updatePhysics(dt, now) {
    if (state.phase !== 'flying') {
      return;
    }

    state.elapsed = Math.max(
      0,
      (now - state.shotStartedAt) / 1000
    );

    updateTimer();

    const steps = Math.max(
      1,
      Math.ceil(dt / (1 / 120))
    );

    const step = dt / steps;

    for (let i = 0; i < steps && state.phase === 'flying'; i++) {
      state.x += state.vx * step;
      state.y -= state.vy * step;
      state.vy -= GRAVITY * step;

      if (checkCollision()) {
        finishShot(true);
        break;
      }

      if (
        state.x > WIDTH ||
        state.x + ARROW_LENGTH < 0 ||
        state.y + 30 >= HEIGHT - 4
      ) {
        finishShot(false);
      }
    }
  }

  function drawBackground() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    const skyGradient = ctx.createLinearGradient(0, 0, 0, HEIGHT - 28);
    skyGradient.addColorStop(0, '#72bce8');
    skyGradient.addColorStop(1, '#bce3fa');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    drawCloud(190, 100, 30, 6);
    drawCloud(550, 150, 40, 4);

    ctx.beginPath();
    ctx.arc(48, 48, 34, 0, Math.PI * 2);
    ctx.fillStyle = '#ffdf45';
    ctx.fill();
    ctx.strokeStyle = '#f5c928';
    ctx.lineWidth = 3;
    ctx.stroke();

    drawTree(135, 1.0);
    drawTree(290, 0.78);
    drawTree(455, 1.12);
    drawTree(645, 0.85);
    drawTree(795, 1.05);

    ctx.fillStyle = '#65a84f';
    ctx.fillRect(0, HEIGHT - 28, WIDTH, 28);

    ctx.strokeStyle = '#347b36';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, HEIGHT - 28);
    ctx.lineTo(WIDTH, HEIGHT - 28);
    ctx.stroke();
  }

  function drawCloud(x, y, radius, count) {
    ctx.beginPath();

    for (let i = 0; i < count; i++) {
      ctx.moveTo(x + i * radius, y);
      ctx.arc(
        x + i * radius,
        y,
        radius,
        0,
        Math.PI * 2
      );
    }

    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.fill();
  }

  function drawTree(x, scale) {
    const baseY = HEIGHT - 28;
    const trunkWidth = 18 * scale;
    const trunkHeight = 62 * scale;
    const crownRadius = 32 * scale;

    ctx.save();

    ctx.fillStyle = '#7c5334';
    ctx.fillRect(
      x - trunkWidth / 2,
      baseY - trunkHeight,
      trunkWidth,
      trunkHeight
    );

    ctx.fillStyle = '#5e3d24';
    ctx.fillRect(
      x,
      baseY - trunkHeight,
      trunkWidth / 2,
      trunkHeight
    );

    const crownY = baseY - trunkHeight;

    ctx.beginPath();
    ctx.arc(x - crownRadius * 0.55, crownY + crownRadius * 0.25, crownRadius * 0.75, 0, Math.PI * 2);
    ctx.arc(x + crownRadius * 0.55, crownY + crownRadius * 0.25, crownRadius * 0.75, 0, Math.PI * 2);
    ctx.arc(x, crownY - crownRadius * 0.25, crownRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#3d8b40';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x - crownRadius * 0.25, crownY - crownRadius * 0.35, crownRadius * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = '#4ea352';
    ctx.fill();

    ctx.restore();
  }

  function drawTarget() {
    const rings = [
      { radius: 32, color: '#e53935' },
      { radius: 26, color: '#ffffff' },
      { radius: 20, color: '#e53935' },
      { radius: 14, color: '#ffffff' },
      { radius: 8, color: '#e53935' }
    ];

    for (const ring of rings) {
      ctx.beginPath();
      ctx.arc(
        state.targetX,
        GROUND_Y,
        ring.radius,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = ring.color;
      ctx.fill();
    }
  }

  function drawArrow() {
    ctx.save();
    ctx.translate(state.x, state.y);

    ctx.beginPath();
    ctx.moveTo(5, 10);
    ctx.lineTo(15, 20);
    ctx.lineTo(5, 30);
    ctx.closePath();

    ctx.fillStyle = ARROW_COLOR;
    ctx.fill();
    ctx.fillRect(-3, 10, 8, 20);

    ctx.beginPath();
    ctx.moveTo(3, 20);
    ctx.lineTo(40, 20);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(40, 10);
    ctx.lineTo(60, 20);
    ctx.lineTo(40, 30);
    ctx.closePath();

    ctx.fillStyle = '#222222';
    ctx.fill();

    ctx.restore();
  }

  function drawScore() {
    ctx.save();
    ctx.font = 'bold 30px KG Happy, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#222222';

    ctx.fillText(
      `Aciertos: ${state.hits}`,
      WIDTH - 18,
      16
    );

    ctx.restore();
  }

  function drawConfetti() {
    for (const piece of state.confetti) {
      ctx.save();
      ctx.translate(piece.x, piece.y);
      ctx.rotate(piece.rotation);
      ctx.fillStyle = piece.color;
      ctx.fillRect(
        -piece.radius,
        -piece.radius / 2,
        piece.radius * 2,
        piece.radius
      );
      ctx.restore();
    }
  }

  function render() {
    drawBackground();
    drawTarget();
    drawArrow();
    drawScore();
    drawConfetti();
  }

  function animationFrame(now) {
    if (!state.lastFrameAt) {
      state.lastFrameAt = now;
    }

    const dt = Math.min(
      (now - state.lastFrameAt) / 1000,
      0.05
    );

    state.lastFrameAt = now;

    updatePhysics(dt, now);
    updateConfetti(dt);
    render();

    requestAnimationFrame(animationFrame);
  }

  fireButton.addEventListener('click', fire);
  resetButton.addEventListener('click', resetGame);

  resetGame();
  render();
  requestAnimationFrame(animationFrame);
})();
