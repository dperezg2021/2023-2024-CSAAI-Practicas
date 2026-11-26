import { useEffect, useRef, useState, useCallback } from 'react';
import './SnakeGame.css';

const GRID_COLS = 28;
const GRID_ROWS = 18;
const CELL_SIZE = 28;
const CANVAS_WIDTH = GRID_COLS * CELL_SIZE;
const CANVAS_HEIGHT = GRID_ROWS * CELL_SIZE;

interface Point {
  x: number;
  y: number;
}

interface BonusFood extends Point {
  expiresAt: number;
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

interface GrassTuft {
  x: number;
  y: number;
  height: number;
  lean: number;
  shade: string;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type GameStatus = 'ready' | 'playing' | 'paused' | 'gameover';

const INITIAL_SNAKE: Point[] = [
  { x: 8, y: 9 },
  { x: 7, y: 9 },
  { x: 6, y: 9 }
];

const OPPOSITE_DIRECTION: Record<Direction, Direction> = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT'
};

function createGrassTufts(): GrassTuft[] {
  const tufts: GrassTuft[] = [];
  const shades = ['#2d6a1e', '#3f8a29', '#52a336', '#255718'];

  for (let i = 0; i < 140; i++) {
    tufts.push({
      x: ((i * 73) % (CANVAS_WIDTH - 16)) + 8,
      y: ((i * 47 + 19) % (CANVAS_HEIGHT - 16)) + 10,
      height: 5 + (i % 5),
      lean: (i % 3) - 1,
      shade: shades[i % shades.length]
    });
  }

  return tufts;
}

const GRASS_TUFTS = createGrassTufts();

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem('snake_high_score');
    return saved ? Number.parseInt(saved, 10) : 0;
  });
  const [status, setStatus] = useState<GameStatus>('ready');
  const [wrapWalls, setWrapWalls] = useState<boolean>(false);

  const gameRef = useRef({
    snake: INITIAL_SNAKE.map(segment => ({ ...segment })),
    direction: 'RIGHT' as Direction,
    inputQueue: [] as Direction[],
    food: { x: 18, y: 9 } as Point,
    bonusFood: null as BonusFood | null,
    foodsEaten: 0,
    lastStepAt: 0,
    lastFrameAt: 0,
    particles: [] as Particle[]
  });

  const getRandomFreeCell = useCallback(
    (snake: Point[], extraBlocked?: Point | null): Point => {
      const occupied = new Set(snake.map(s => `${s.x},${s.y}`));
      if (extraBlocked) {
        occupied.add(`${extraBlocked.x},${extraBlocked.y}`);
      }

      const freeCells: Point[] = [];
      for (let y = 0; y < GRID_ROWS; y++) {
        for (let x = 0; x < GRID_COLS; x++) {
          if (!occupied.has(`${x},${y}`)) {
            freeCells.push({ x, y });
          }
        }
      }

      if (freeCells.length === 0) {
        return { x: 0, y: 0 };
      }

      return freeCells[Math.floor(Math.random() * freeCells.length)];
    },
    []
  );

  const queueDirection = useCallback((nextDir: Direction) => {
    const state = gameRef.current;
    const referenceDir =
      state.inputQueue.length > 0
        ? state.inputQueue[state.inputQueue.length - 1]
        : state.direction;

    if (
      nextDir !== referenceDir &&
      nextDir !== OPPOSITE_DIRECTION[referenceDir] &&
      state.inputQueue.length < 2
    ) {
      state.inputQueue.push(nextDir);
    }
  }, []);

  const startNewGame = useCallback(() => {
    const state = gameRef.current;
    const freshSnake = INITIAL_SNAKE.map(segment => ({ ...segment }));
    state.snake = freshSnake;
    state.direction = 'RIGHT';
    state.inputQueue = [];
    state.food = getRandomFreeCell(freshSnake);
    state.bonusFood = null;
    state.foodsEaten = 0;
    state.particles = [];
    state.lastStepAt = performance.now();

    setScore(0);
    setStatus('playing');
  }, [getRandomFreeCell]);

  const togglePause = useCallback(() => {
    if (status === 'playing') {
      setStatus('paused');
    } else if (status === 'paused') {
      gameRef.current.lastStepAt = performance.now();
      setStatus('playing');
    } else {
      startNewGame();
    }
  }, [status, startNewGame]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(
          event.key
        )
      ) {
        event.preventDefault();
      }

      if (event.key === 'ArrowUp' || event.key === 'w' || event.key === 'W') {
        queueDirection('UP');
      } else if (
        event.key === 'ArrowDown' ||
        event.key === 's' ||
        event.key === 'S'
      ) {
        queueDirection('DOWN');
      } else if (
        event.key === 'ArrowLeft' ||
        event.key === 'a' ||
        event.key === 'A'
      ) {
        queueDirection('LEFT');
      } else if (
        event.key === 'ArrowRight' ||
        event.key === 'd' ||
        event.key === 'D'
      ) {
        queueDirection('RIGHT');
      } else if (event.key === ' ' || event.key === 'Enter') {
        if (status === 'ready' || status === 'gameover') {
          startNewGame();
        } else {
          togglePause();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [queueDirection, status, startNewGame, togglePause]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const spawnParticles = (gridX: number, gridY: number, color: string) => {
      const centerX = gridX * CELL_SIZE + CELL_SIZE / 2;
      const centerY = gridY * CELL_SIZE + CELL_SIZE / 2;

      for (let i = 0; i < 14; i++) {
        gameRef.current.particles.push({
          x: centerX,
          y: centerY,
          vx: (Math.random() - 0.5) * 220,
          vy: (Math.random() - 0.5) * 220,
          life: 0.45,
          size: Math.random() * 4 + 2,
          color
        });
      }
    };

    const stepGame = (now: number) => {
      const state = gameRef.current;

      if (state.inputQueue.length > 0) {
        const nextDir = state.inputQueue.shift();
        if (nextDir) {
          state.direction = nextDir;
        }
      }

      const head = state.snake[0];
      let nextX = head.x;
      let nextY = head.y;

      if (state.direction === 'UP') nextY -= 1;
      if (state.direction === 'DOWN') nextY += 1;
      if (state.direction === 'LEFT') nextX -= 1;
      if (state.direction === 'RIGHT') nextX += 1;

      if (wrapWalls) {
        nextX = (nextX + GRID_COLS) % GRID_COLS;
        nextY = (nextY + GRID_ROWS) % GRID_ROWS;
      } else if (
        nextX < 0 ||
        nextX >= GRID_COLS ||
        nextY < 0 ||
        nextY >= GRID_ROWS
      ) {
        setStatus('gameover');
        return;
      }

      const willEatRegular =
        nextX === state.food.x && nextY === state.food.y;
      const willEatBonus =
        state.bonusFood !== null &&
        nextX === state.bonusFood.x &&
        nextY === state.bonusFood.y;

      const bodyToCheck =
        willEatRegular || willEatBonus
          ? state.snake
          : state.snake.slice(0, -1);

      if (bodyToCheck.some(seg => seg.x === nextX && seg.y === nextY)) {
        setStatus('gameover');
        return;
      }

      const newHead: Point = { x: nextX, y: nextY };
      state.snake.unshift(newHead);

      if (willEatRegular) {
        spawnParticles(nextX, nextY, '#dc2626');
        state.foodsEaten += 1;

        setScore(prev => {
          const updated = prev + 10;
          setHighScore(best => {
            const nextBest = Math.max(best, updated);
            localStorage.setItem('snake_high_score', String(nextBest));
            return nextBest;
          });
          return updated;
        });

        state.food = getRandomFreeCell(state.snake, state.bonusFood);

        if (state.foodsEaten % 5 === 0 && !state.bonusFood) {
          const bonusPos = getRandomFreeCell(state.snake, state.food);
          state.bonusFood = {
            x: bonusPos.x,
            y: bonusPos.y,
            expiresAt: now + 7000
          };
        }
      } else if (willEatBonus && state.bonusFood) {
        spawnParticles(nextX, nextY, '#facc15');
        state.bonusFood = null;

        setScore(prev => {
          const updated = prev + 50;
          setHighScore(best => {
            const nextBest = Math.max(best, updated);
            localStorage.setItem('snake_high_score', String(nextBest));
            return nextBest;
          });
          return updated;
        });
      } else {
        state.snake.pop();
      }

      if (state.bonusFood && now >= state.bonusFood.expiresAt) {
        state.bonusFood = null;
      }
    };

    const draw = (now: number) => {
      const state = gameRef.current;

      const grassGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      grassGradient.addColorStop(0, '#4ca638');
      grassGradient.addColorStop(1, '#3b8c2a');
      ctx.fillStyle = grassGradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
          ctx.fillStyle =
            (row + col) % 2 === 0
              ? 'rgba(255, 255, 255, 0.05)'
              : 'rgba(20, 60, 15, 0.08)';
          ctx.fillRect(
            col * CELL_SIZE,
            row * CELL_SIZE,
            CELL_SIZE,
            CELL_SIZE
          );
        }
      }

      ctx.lineWidth = 1.6;
      ctx.lineCap = 'round';
      for (const tuft of GRASS_TUFTS) {
        ctx.strokeStyle = tuft.shade;
        ctx.beginPath();
        ctx.moveTo(tuft.x, tuft.y);
        ctx.lineTo(tuft.x - 2 + tuft.lean, tuft.y - tuft.height);
        ctx.moveTo(tuft.x + 2, tuft.y);
        ctx.lineTo(tuft.x + 3 + tuft.lean, tuft.y - tuft.height + 1);
        ctx.stroke();
      }

      const foodCenterX = state.food.x * CELL_SIZE + CELL_SIZE / 2;
      const foodCenterY = state.food.y * CELL_SIZE + CELL_SIZE / 2;
      const pulse = Math.sin(now / 180) * 1.4;

      ctx.fillStyle = 'rgba(15, 45, 10, 0.35)';
      ctx.beginPath();
      ctx.ellipse(
        foodCenterX,
        foodCenterY + CELL_SIZE * 0.34,
        CELL_SIZE * 0.34,
        CELL_SIZE * 0.14,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      const appleGradient = ctx.createRadialGradient(
        foodCenterX - 3,
        foodCenterY - 4,
        2,
        foodCenterX,
        foodCenterY,
        CELL_SIZE * 0.42 + pulse
      );
      appleGradient.addColorStop(0, '#ff8a8a');
      appleGradient.addColorStop(0.35, '#e11d48');
      appleGradient.addColorStop(1, '#881337');

      ctx.beginPath();
      ctx.arc(
        foodCenterX,
        foodCenterY,
        CELL_SIZE * 0.4 + pulse,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = appleGradient;
      ctx.fill();
      ctx.strokeStyle = '#7f1d1d';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.strokeStyle = '#4a2c11';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(foodCenterX, foodCenterY - CELL_SIZE * 0.34);
      ctx.lineTo(foodCenterX + 1, foodCenterY - CELL_SIZE * 0.48);
      ctx.stroke();

      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.ellipse(
        foodCenterX + 4,
        foodCenterY - CELL_SIZE * 0.4,
        4.5,
        2.5,
        Math.PI / 5,
        0,
        Math.PI * 2
      );
      ctx.fill();

      if (state.bonusFood) {
        const bx = state.bonusFood.x * CELL_SIZE + CELL_SIZE / 2;
        const by = state.bonusFood.y * CELL_SIZE + CELL_SIZE / 2;
        const remainingRatio = Math.max(
          0,
          (state.bonusFood.expiresAt - now) / 7000
        );

        ctx.beginPath();
        ctx.arc(bx, by, CELL_SIZE * 0.44, 0, Math.PI * 2);
        ctx.fillStyle = '#facc15';
        ctx.fill();
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(
          bx,
          by,
          CELL_SIZE * 0.5,
          -Math.PI / 2,
          -Math.PI / 2 + Math.PI * 2 * remainingRatio
        );
        ctx.strokeStyle = '#fef9c3';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      state.snake.forEach((segment, index) => {
        const isHead = index === 0;
        const pad = isHead ? 1.5 : 2.5;
        const x = segment.x * CELL_SIZE + pad;
        const y = segment.y * CELL_SIZE + pad;
        const size = CELL_SIZE - pad * 2;

        ctx.fillStyle = 'rgba(15, 45, 10, 0.3)';
        ctx.beginPath();
        ctx.roundRect(x + 1.5, y + 2.5, size, size, isHead ? 8 : 6);
        ctx.fill();

        const segmentGradient = ctx.createLinearGradient(x, y, x, y + size);
        if (isHead) {
          segmentGradient.addColorStop(0, '#3e2723');
          segmentGradient.addColorStop(1, '#14110f');
        } else if (index % 2 === 0) {
          segmentGradient.addColorStop(0, '#4e342e');
          segmentGradient.addColorStop(1, '#261a15');
        } else {
          segmentGradient.addColorStop(0, '#29221f');
          segmentGradient.addColorStop(1, '#120f0e');
        }

        ctx.fillStyle = segmentGradient;
        ctx.beginPath();
        ctx.roundRect(x, y, size, size, isHead ? 8 : 6);
        ctx.fill();

        ctx.strokeStyle = '#0c0a09';
        ctx.lineWidth = 1.3;
        ctx.stroke();

        if (!isHead) {
          ctx.fillStyle = 'rgba(161, 136, 127, 0.25)';
          ctx.beginPath();
          ctx.arc(
            x + size / 2,
            y + size / 2,
            size * 0.2,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }

        if (isHead) {
          const eyeOffset = 5.5;
          let eye1X = x + size / 2;
          let eye1Y = y + size / 2;
          let eye2X = x + size / 2;
          let eye2Y = y + size / 2;

          if (state.direction === 'RIGHT') {
            eye1X = x + size - 6;
            eye1Y = y + eyeOffset;
            eye2X = x + size - 6;
            eye2Y = y + size - eyeOffset;
          } else if (state.direction === 'LEFT') {
            eye1X = x + 6;
            eye1Y = y + eyeOffset;
            eye2X = x + 6;
            eye2Y = y + size - eyeOffset;
          } else if (state.direction === 'UP') {
            eye1X = x + eyeOffset;
            eye1Y = y + 6;
            eye2X = x + size - eyeOffset;
            eye2Y = y + 6;
          } else {
            eye1X = x + eyeOffset;
            eye1Y = y + size - 6;
            eye2X = x + size - eyeOffset;
            eye2Y = y + size - 6;
          }

          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(eye1X, eye1Y, 2.8, 0, Math.PI * 2);
          ctx.arc(eye2X, eye2Y, 2.8, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#090d16';
          ctx.beginPath();
          ctx.arc(eye1X, eye1Y, 1.3, 0, Math.PI * 2);
          ctx.arc(eye2X, eye2Y, 1.3, 0, Math.PI * 2);
          ctx.fill();
        }
      });

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

      if (status !== 'playing') {
        ctx.fillStyle = 'rgba(15, 35, 12, 0.72)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.font = 'bold 34px system-ui, sans-serif';

        const title =
          status === 'gameover'
            ? 'FIN DE LA PARTIDA'
            : status === 'paused'
            ? 'JUEGO EN PAUSA'
            : 'SNAKE EN EL PRADO';

        const subtitle =
          status === 'paused'
            ? 'Pulsa Reanudar o Espacio para continuar'
            : 'Pulsa Jugar o Espacio para comenzar';

        ctx.fillText(title, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 12);
        ctx.font = '18px system-ui, sans-serif';
        ctx.fillStyle = '#dcfce7';
        ctx.fillText(subtitle, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 24);
      }
    };

    const loop = (now: number) => {
      const state = gameRef.current;
      if (!state.lastFrameAt) state.lastFrameAt = now;
      const dt = Math.min((now - state.lastFrameAt) / 1000, 0.05);
      state.lastFrameAt = now;

      state.particles = state.particles.filter(p => {
        p.life -= dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        return p.life > 0;
      });

      if (status === 'playing') {
        const stepInterval = Math.max(65, 145 - state.foodsEaten * 3);
        if (now - state.lastStepAt >= stepInterval) {
          state.lastStepAt = now;
          stepGame(now);
        }
      }

      draw(now);
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [status, wrapWalls, getRandomFreeCell]);

  return (
    <div className="snake-wrapper">
      <div className="snake-scoreboard">
        <div className="score-pill">
          <span>Puntos</span>
          <strong>{score}</strong>
        </div>
        <div className="score-pill">
          <span>Récord</span>
          <strong>{highScore}</strong>
        </div>
        <label className="wall-toggle">
          <input
            type="checkbox"
            checked={wrapWalls}
            onChange={e => setWrapWalls(e.target.checked)}
          />
          <span>Atravesar paredes</span>
        </label>
      </div>

      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="snake-canvas"
      />

      <div className="snake-controls">
        <div className="snake-buttons">
          <button
            type="button"
            className="btn-primary"
            onClick={togglePause}
          >
            {status === 'playing'
              ? 'Pausar'
              : status === 'paused'
              ? 'Reanudar'
              : 'Jugar'}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={startNewGame}
          >
            Reiniciar
          </button>
        </div>

        <div className="dpad">
          <button
            type="button"
            aria-label="Arriba"
            onClick={() => queueDirection('UP')}
          >
            ▲
          </button>
          <div className="dpad-middle">
            <button
              type="button"
              aria-label="Izquierda"
              onClick={() => queueDirection('LEFT')}
            >
              ◀
            </button>
            <button
              type="button"
              aria-label="Abajo"
              onClick={() => queueDirection('DOWN')}
            >
              ▼
            </button>
            <button
              type="button"
              aria-label="Derecha"
              onClick={() => queueDirection('RIGHT')}
            >
              ▶
            </button>
          </div>
        </div>

        <p className="snake-hint">
          Usa <strong>Flechas</strong> o <strong>WASD</strong> para girar
        </p>
      </div>
    </div>
  );
}
