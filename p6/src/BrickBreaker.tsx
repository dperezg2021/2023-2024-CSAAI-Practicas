import { useEffect, useRef, useState, useCallback, type MouseEvent } from 'react';
import './BrickBreaker.css';

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 480;
const PADDLE_WIDTH = 120;
const PADDLE_HEIGHT = 16;
const BALL_RADIUS = 10;
const BRICK_ROWS = 5;
const BRICK_COLS = 10;
const BRICK_PADDING = 8;
const BRICK_OFFSET_TOP = 54;
const BRICK_OFFSET_LEFT = 35;
const BRICK_HEIGHT = 24;
const BRICK_WIDTH =
  (CANVAS_WIDTH - BRICK_OFFSET_LEFT * 2 - BRICK_PADDING * (BRICK_COLS - 1)) /
  BRICK_COLS;

interface BrickTheme {
  color: string;
  border: string;
  points: number;
  hits: number;
}

interface Brick {
  x: number;
  y: number;
  hitsLeft: number;
  maxHits: number;
  color: string;
  border: string;
  points: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  color: string;
}

type GameStatus = 'ready' | 'playing' | 'won' | 'gameover';

const ROW_THEMES: BrickTheme[] = [
  { color: '#ef4444', border: '#991b1b', points: 50, hits: 2 },
  { color: '#f97316', border: '#9a3412', points: 40, hits: 2 },
  { color: '#eab308', border: '#854d0e', points: 30, hits: 1 },
  { color: '#22c55e', border: '#166534', points: 20, hits: 1 },
  { color: '#3b82f6', border: '#1e40af', points: 10, hits: 1 }
];

function createBricks(): Brick[][] {
  const grid: Brick[][] = [];

  for (let row = 0; row < BRICK_ROWS; row++) {
    grid[row] = [];
    const theme = ROW_THEMES[row % ROW_THEMES.length];

    for (let col = 0; col < BRICK_COLS; col++) {
      grid[row][col] = {
        x: BRICK_OFFSET_LEFT + col * (BRICK_WIDTH + BRICK_PADDING),
        y: BRICK_OFFSET_TOP + row * (BRICK_HEIGHT + BRICK_PADDING),
        hitsLeft: theme.hits,
        maxHits: theme.hits,
        color: theme.color,
        border: theme.border,
        points: theme.points
      };
    }
  }

  return grid;
}

export default function BrickBreaker() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [status, setStatus] = useState<GameStatus>('ready');

  const gameStateRef = useRef({
    paddleX: (CANVAS_WIDTH - PADDLE_WIDTH) / 2,
    ballX: CANVAS_WIDTH / 2,
    ballY: CANVAS_HEIGHT - 44,
    ballVx: 320,
    ballVy: -320,
    bricks: createBricks(),
    keys: { left: false, right: false },
    lastTime: 0,
    particles: [] as Particle[]
  });

  const resetBallAndPaddle = useCallback(() => {
    const state = gameStateRef.current;
    state.paddleX = (CANVAS_WIDTH - PADDLE_WIDTH) / 2;
    state.ballX = CANVAS_WIDTH / 2;
    state.ballY = CANVAS_HEIGHT - 44;
    const direction = Math.random() > 0.5 ? 1 : -1;
    state.ballVx = 310 * direction;
    state.ballVy = -330;
  }, []);

  const startNewGame = useCallback(() => {
    const state = gameStateRef.current;
    state.bricks = createBricks();
    state.particles = [];
    resetBallAndPaddle();
    setScore(0);
    setLives(3);
    setStatus('playing');
  }, [resetBallAndPaddle]);

  const launchBall = useCallback(() => {
    if (status === 'ready') {
      setStatus('playing');
    } else if (status === 'won' || status === 'gameover') {
      startNewGame();
    }
  }, [status, startNewGame]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') {
        gameStateRef.current.keys.left = true;
      }
      if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') {
        gameStateRef.current.keys.right = true;
      }
      if (event.key === ' ' && status === 'ready') {
        event.preventDefault();
        setStatus('playing');
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') {
        gameStateRef.current.keys.left = false;
      }
      if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') {
        gameStateRef.current.keys.right = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [status]);

  const handleMouseMove = (event: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const relativeX = (event.clientX - rect.left) * scaleX;
    const nextX = relativeX - PADDLE_WIDTH / 2;

    gameStateRef.current.paddleX = Math.max(
      0,
      Math.min(CANVAS_WIDTH - PADDLE_WIDTH, nextX)
    );
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const spawnParticles = (x: number, y: number, color: string) => {
      for (let i = 0; i < 14; i++) {
        gameStateRef.current.particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 260,
          vy: (Math.random() - 0.5) * 260,
          life: 0.45,
          size: Math.random() * 4 + 2,
          color
        });
      }
    };

    const update = (dt: number) => {
      const state = gameStateRef.current;
      const paddleSpeed = 580;

      if (state.keys.left) {
        state.paddleX = Math.max(0, state.paddleX - paddleSpeed * dt);
      }
      if (state.keys.right) {
        state.paddleX = Math.min(
          CANVAS_WIDTH - PADDLE_WIDTH,
          state.paddleX + paddleSpeed * dt
        );
      }

      state.particles = state.particles.filter(particle => {
        particle.life -= dt;
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        return particle.life > 0;
      });

      if (status !== 'playing') {
        if (status === 'ready') {
          state.ballX = state.paddleX + PADDLE_WIDTH / 2;
          state.ballY = CANVAS_HEIGHT - 44;
        }
        return;
      }

      state.ballX += state.ballVx * dt;
      state.ballY += state.ballVy * dt;

      if (state.ballX - BALL_RADIUS <= 0) {
        state.ballX = BALL_RADIUS;
        state.ballVx = Math.abs(state.ballVx);
      } else if (state.ballX + BALL_RADIUS >= CANVAS_WIDTH) {
        state.ballX = CANVAS_WIDTH - BALL_RADIUS;
        state.ballVx = -Math.abs(state.ballVx);
      }

      if (state.ballY - BALL_RADIUS <= 0) {
        state.ballY = BALL_RADIUS;
        state.ballVy = Math.abs(state.ballVy);
      }

      const paddleTop = CANVAS_HEIGHT - 28;
      if (
        state.ballVy > 0 &&
        state.ballY + BALL_RADIUS >= paddleTop &&
        state.ballY - BALL_RADIUS <= paddleTop + PADDLE_HEIGHT &&
        state.ballX >= state.paddleX - BALL_RADIUS &&
        state.ballX <= state.paddleX + PADDLE_WIDTH + BALL_RADIUS
      ) {
        const hitOffset =
          (state.ballX - (state.paddleX + PADDLE_WIDTH / 2)) /
          (PADDLE_WIDTH / 2);
        const maxBounceAngle = (65 * Math.PI) / 180;
        const bounceAngle = hitOffset * maxBounceAngle;
        const currentSpeed = Math.min(
          640,
          Math.hypot(state.ballVx, state.ballVy) * 1.02
        );

        state.ballY = paddleTop - BALL_RADIUS;
        state.ballVx = currentSpeed * Math.sin(bounceAngle);
        state.ballVy = -currentSpeed * Math.cos(bounceAngle);
      }

      let remainingBricks = 0;

      for (let row = 0; row < BRICK_ROWS; row++) {
        for (let col = 0; col < BRICK_COLS; col++) {
          const brick = state.bricks[row][col];
          if (brick.hitsLeft <= 0) continue;

          remainingBricks++;

          const closestX = Math.max(
            brick.x,
            Math.min(state.ballX, brick.x + BRICK_WIDTH)
          );
          const closestY = Math.max(
            brick.y,
            Math.min(state.ballY, brick.y + BRICK_HEIGHT)
          );

          const dx = state.ballX - closestX;
          const dy = state.ballY - closestY;

          if (dx * dx + dy * dy <= BALL_RADIUS * BALL_RADIUS) {
            brick.hitsLeft -= 1;
            remainingBricks -= brick.hitsLeft === 0 ? 1 : 0;

            if (Math.abs(dx) > Math.abs(dy)) {
              state.ballVx = -state.ballVx;
            } else {
              state.ballVy = -state.ballVy;
            }

            spawnParticles(
              brick.x + BRICK_WIDTH / 2,
              brick.y + BRICK_HEIGHT / 2,
              brick.color
            );

            if (brick.hitsLeft === 0) {
              setScore(prev => prev + brick.points);
            }
          }
        }
      }

      if (remainingBricks === 0) {
        setStatus('won');
        return;
      }

      if (state.ballY - BALL_RADIUS > CANVAS_HEIGHT) {
        setLives(prevLives => {
          const nextLives = prevLives - 1;
          if (nextLives <= 0) {
            setStatus('gameover');
          } else {
            resetBallAndPaddle();
            setStatus('ready');
          }
          return nextLives;
        });
      }
    };

    const draw = () => {
      const state = gameStateRef.current;

      const bgGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      bgGradient.addColorStop(0, '#0f172a');
      bgGradient.addColorStop(1, '#1e293b');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < CANVAS_WIDTH; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y < CANVAS_HEIGHT; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }

      for (let row = 0; row < BRICK_ROWS; row++) {
        for (let col = 0; col < BRICK_COLS; col++) {
          const brick = state.bricks[row][col];
          if (brick.hitsLeft <= 0) continue;

          ctx.save();
          ctx.globalAlpha = brick.hitsLeft < brick.maxHits ? 0.65 : 1;

          ctx.fillStyle = brick.color;
          ctx.beginPath();
          ctx.roundRect(brick.x, brick.y, BRICK_WIDTH, BRICK_HEIGHT, 5);
          ctx.fill();

          ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
          ctx.fillRect(brick.x + 3, brick.y + 2, BRICK_WIDTH - 6, 5);

          ctx.strokeStyle = brick.border;
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
        }
      }

      const paddleTop = CANVAS_HEIGHT - 28;
      const paddleGradient = ctx.createLinearGradient(
        state.paddleX,
        paddleTop,
        state.paddleX,
        paddleTop + PADDLE_HEIGHT
      );
      paddleGradient.addColorStop(0, '#f8fafc');
      paddleGradient.addColorStop(0.5, '#cbd5e1');
      paddleGradient.addColorStop(1, '#64748b');

      ctx.fillStyle = paddleGradient;
      ctx.beginPath();
      ctx.roundRect(
        state.paddleX,
        paddleTop,
        PADDLE_WIDTH,
        PADDLE_HEIGHT,
        8
      );
      ctx.fill();

      ctx.fillStyle = '#ef4444';
      ctx.fillRect(state.paddleX + 10, paddleTop + 4, 12, 8);
      ctx.fillRect(
        state.paddleX + PADDLE_WIDTH - 22,
        paddleTop + 4,
        12,
        8
      );

      for (const particle of state.particles) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, particle.life * 2);
        ctx.fillStyle = particle.color;
        ctx.fillRect(
          particle.x - particle.size / 2,
          particle.y - particle.size / 2,
          particle.size,
          particle.size
        );
        ctx.restore();
      }

      const ballGradient = ctx.createRadialGradient(
        state.ballX - 3,
        state.ballY - 3,
        2,
        state.ballX,
        state.ballY,
        BALL_RADIUS
      );
      ballGradient.addColorStop(0, '#fca5a5');
      ballGradient.addColorStop(0.35, '#ef4444');
      ballGradient.addColorStop(1, '#991b1b');

      ctx.beginPath();
      ctx.arc(state.ballX, state.ballY, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = ballGradient;
      ctx.fill();
      ctx.strokeStyle = '#7f1d1d';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 18px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Puntos: ${score}`, 20, 28);

      ctx.textAlign = 'right';
      ctx.fillText(`Vidas: ${'● '.repeat(lives).trim()}`, CANVAS_WIDTH - 20, 28);

      if (status !== 'playing') {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.font = 'bold 34px system-ui, sans-serif';

        const title =
          status === 'won'
            ? '¡NIVEL COMPLETADO!'
            : status === 'gameover'
            ? 'FIN DE LA PARTIDA'
            : 'BRICK BREAKER';

        const subtitle =
          status === 'ready'
            ? 'Pulsa Disparar o Espacio para lanzar la bola roja'
            : 'Pulsa Reiniciar para volver a jugar';

        ctx.fillText(title, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 12);
        ctx.font = '18px system-ui, sans-serif';
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText(subtitle, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 24);
      }
    };

    const loop = (now: number) => {
      const state = gameStateRef.current;
      if (!state.lastTime) state.lastTime = now;
      const dt = Math.min((now - state.lastTime) / 1000, 0.05);
      state.lastTime = now;

      update(dt);
      draw();

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [score, lives, status, resetBallAndPaddle]);

  return (
    <div className="breaker-wrapper">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="breaker-canvas"
        onMouseMove={handleMouseMove}
        onClick={launchBall}
      />

      <div className="breaker-controls">
        <div className="breaker-buttons">
          <button
            type="button"
            className="btn-launch"
            onClick={launchBall}
            disabled={status === 'playing'}
          >
            Disparar Bola
          </button>
          <button
            type="button"
            className="btn-reset"
            onClick={startNewGame}
          >
            Reiniciar
          </button>
        </div>
        <p className="breaker-hint">
          Mueve la barra con el ratón o con las flechas <strong>← / →</strong>
        </p>
      </div>
    </div>
  );
}