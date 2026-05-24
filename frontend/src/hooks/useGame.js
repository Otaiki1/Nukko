import { useState, useRef, useCallback, useEffect } from 'react';
import Matter from 'matter-js';
import { FRUITS, randFruitIdx, drawFruitOnCtx } from '../game/fruits.js';

const { Engine, Bodies, Events, Composite, World } = Matter;

const W        = 320;
const H        = 480;
const WALL     = 60;
const DANGER_Y = 80;

export function useGame(onScorePts, onToast) {
  const canvasRef = useRef(null);

  // Matter.js internals — never trigger re-renders
  const engineRef      = useRef(null);
  const worldRef       = useRef(null);
  const bodiesRef      = useRef([]);
  const mergeQueueRef  = useRef(new Set());
  const gameLoopRef    = useRef(null);

  // Visual FX refs — stable random data + live burst list
  const vacuumStarsRef = useRef(null);
  const mergeBurstsRef = useRef([]);

  // Sync refs to avoid stale closures inside the RAF loop
  const currentIdxRef  = useRef(0);
  const nextIdxRef     = useRef(0);
  const dropXRef       = useRef(W / 2);
  const canDropRef     = useRef(true);
  const gameOverRef    = useRef(false);
  const onScoreRef     = useRef(onScorePts);
  const onToastRef     = useRef(onToast);

  useEffect(() => { onScoreRef.current  = onScorePts; }, [onScorePts]);
  useEffect(() => { onToastRef.current  = onToast;    }, [onToast]);

  // React state for UI — only what components need to render
  const [currentIdx, setCurrentIdx] = useState(() => randFruitIdx());
  const [nextIdx,    setNextIdx]     = useState(() => randFruitIdx());
  const [gameOver,   setGameOver]    = useState(false);

  // ── Fruit body creation ────────────────────────────────────────────────────

  const addFruitBody = useCallback((x, y, idx) => {
    const f    = FRUITS[idx];
    const body = Bodies.circle(x, y, f.r, {
      restitution: 0.2,
      friction:    0.5,
      frictionAir: 0,
      label:       'fruit',
      density:     0.002 * (idx + 1),
    });
    body.fruitIdx = idx;
    World.add(worldRef.current, body);
    bodiesRef.current.push(body);
    return body;
  }, []);

  // ── Canvas render loop ─────────────────────────────────────────────────────

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const now = Date.now();

    ctx.clearRect(0, 0, W, H);

    // ── Background: deep void
    ctx.fillStyle = '#050009';
    ctx.fillRect(0, 0, W, H);

    // Purple suction glow at the bottom
    const bottomGlow = ctx.createRadialGradient(W/2, H, 0, W/2, H, W * 0.9);
    bottomGlow.addColorStop(0, 'rgba(123,47,255,0.2)');
    bottomGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = bottomGlow; ctx.fillRect(0, 0, W, H);

    // Inner vignette — darkens corners so play area reads as a window into space
    const cornerDark = ctx.createRadialGradient(W/2, H/2, H*0.28, W/2, H/2, H*0.75);
    cornerDark.addColorStop(0, 'rgba(0,0,0,0)');
    cornerDark.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = cornerDark; ctx.fillRect(0, 0, W, H);

    // ── Vacuum stars — twinkling background
    if (vacuumStarsRef.current) {
      vacuumStarsRef.current.forEach((s) => {
        const flicker = 0.35 + 0.65 * Math.abs(Math.sin(now / 1000 * s.speed + s.phase));
        ctx.globalAlpha = s.o * flicker;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;
    }

    // ── Compute danger state for this frame
    const bodies = bodiesRef.current;
    let minBodyTop = H;
    for (const b of bodies) {
      const top = b.position.y - FRUITS[b.fruitIdx].r;
      if (top < minBodyTop) minBodyTop = top;
    }
    const isInDanger = minBodyTop < DANGER_Y && bodies.some(
      b => b.speed < 0.8 && b.position.y - FRUITS[b.fruitIdx].r < DANGER_Y
    );
    const stackFill = Math.max(0, Math.min(1, (H - minBodyTop) / (H - DANGER_Y)));

    // ── Danger line + badge
    const dangerAlpha = isInDanger ? 0.95 : 0.55;
    ctx.save();
    ctx.setLineDash([6, 8]);
    ctx.strokeStyle = `rgba(255,59,59,${dangerAlpha})`;
    ctx.lineWidth = isInDanger ? 1.5 : 1;
    if (isInDanger) { ctx.shadowBlur = 10; ctx.shadowColor = '#ff3b3b'; }
    ctx.beginPath(); ctx.moveTo(8, DANGER_Y); ctx.lineTo(W - 8, DANGER_Y); ctx.stroke();
    ctx.shadowBlur = 0; ctx.restore();

    // Danger badge — centred on the line
    ctx.save();
    ctx.font = 'bold 8px "Space Mono", monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const badgeLabel = '⚠ DANGER ZONE';
    const bw = ctx.measureText(badgeLabel).width;
    const bx = W / 2, by = DANGER_Y - 11;
    const px = 6, py = 3;
    ctx.fillStyle = isInDanger ? '#ff3b3b' : 'rgba(255,59,59,0.18)';
    if (isInDanger) { ctx.shadowBlur = 14; ctx.shadowColor = 'rgba(255,59,59,0.7)'; }
    ctx.beginPath();
    ctx.roundRect(bx - bw/2 - px, by - py - 2, bw + px*2, (py+2)*2, 8);
    ctx.fill(); ctx.shadowBlur = 0;
    ctx.setLineDash([]);
    ctx.strokeStyle = isInDanger ? 'rgba(255,59,59,0.9)' : 'rgba(255,59,59,0.45)';
    ctx.lineWidth = 0.75; ctx.stroke();
    ctx.fillStyle = isInDanger ? '#fff' : 'rgba(255,175,175,0.85)';
    ctx.fillText(badgeLabel, bx, by);
    ctx.restore();

    // ── Drop indicator (ghost planet + chevron + gradient line)
    if (canDropRef.current && !gameOverRef.current) {
      const idx = currentIdxRef.current;
      const x   = dropXRef.current;
      const r   = FRUITS[idx].r;
      const bob = Math.sin(now / 600) * 3;

      // Gradient guide line — solid gold fading out
      ctx.save();
      const lineG = ctx.createLinearGradient(x, 0, x, H);
      lineG.addColorStop(0, 'rgba(255,215,0,0.72)');
      lineG.addColorStop(0.55, 'rgba(255,215,0,0.18)');
      lineG.addColorStop(1, 'rgba(255,215,0,0)');
      ctx.strokeStyle = lineG; ctx.lineWidth = 1; ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      ctx.restore();

      // Gold chevron at the very top
      ctx.save();
      ctx.fillStyle = 'rgba(255,215,0,0.88)';
      ctx.beginPath(); ctx.moveTo(x - 9, 1); ctx.lineTo(x + 9, 1); ctx.lineTo(x, 12); ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Bobbing ghost planet below chevron
      drawFruitOnCtx(ctx, x, r + 20 + bob, r, idx, 0.42);
    }

    // ── All live fruit bodies
    bodies.forEach((b) => {
      ctx.save();
      ctx.translate(b.position.x, b.position.y);
      ctx.rotate(b.angle);
      drawFruitOnCtx(ctx, 0, 0, FRUITS[b.fruitIdx].r, b.fruitIdx);
      ctx.restore();
    });

    // ── Merge burst FX (glow pop when two planets combine)
    mergeBurstsRef.current = mergeBurstsRef.current.filter(b => now - b.startedAt < 650);
    mergeBurstsRef.current.forEach((burst) => {
      const age    = (now - burst.startedAt) / 650;
      const eased  = 1 - Math.pow(1 - age, 3);          // ease-out cubic
      const burstR = burst.r * (1 + eased * 2.8);
      ctx.save();
      ctx.globalAlpha = (1 - age) * 0.72;
      const bg = ctx.createRadialGradient(burst.x, burst.y, 0, burst.x, burst.y, burstR);
      bg.addColorStop(0,   burst.color + 'ee');
      bg.addColorStop(0.4, burst.color + '88');
      bg.addColorStop(1,   burst.color + '00');
      ctx.fillStyle = bg;
      ctx.beginPath(); ctx.arc(burst.x, burst.y, burstR, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });

    // ── Danger red vignette (pulsing edge glow)
    if (isInDanger) {
      const pulse = 0.22 + 0.14 * Math.sin(now / 340);
      const dv = ctx.createRadialGradient(W/2, H/2, H*0.26, W/2, H/2, H*0.76);
      dv.addColorStop(0, 'rgba(0,0,0,0)');
      dv.addColorStop(1, `rgba(255,59,59,${pulse})`);
      ctx.fillStyle = dv; ctx.fillRect(0, 0, W, H);
    }

    // ── Stack-fill gauge (right edge bar)
    const gx = W - 7, gtop = 16, gbot = H - 16, gh = gbot - gtop;
    ctx.save(); ctx.globalAlpha = 0.72;
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath(); ctx.roundRect(gx - 2, gtop, 4, gh, 2); ctx.fill();
    if (stackFill > 0.02) {
      const fh = gh * stackFill;
      const gg = ctx.createLinearGradient(0, gbot, 0, gbot - fh);
      if (isInDanger)       { gg.addColorStop(0,'#ff3b3b'); gg.addColorStop(1,'#ff8a8a'); }
      else if (stackFill > 0.6) { gg.addColorStop(0,'#ffd700'); gg.addColorStop(1,'#ff8a4a'); }
      else                  { gg.addColorStop(0,'#00d4ff'); gg.addColorStop(1,'#7b2fff'); }
      ctx.fillStyle = gg;
      ctx.beginPath(); ctx.roundRect(gx - 2, gbot - fh, 4, fh, 2); ctx.fill();
    }
    ctx.restore();
  }, []);

  // ── Game-over detection ────────────────────────────────────────────────────

  const checkGameOver = useCallback(() => {
    if (gameOverRef.current) return;
    for (const b of bodiesRef.current) {
      if (b.position.y - FRUITS[b.fruitIdx].r < DANGER_Y && b.speed < 0.5) {
        gameOverRef.current = true;
        setGameOver(true);
        cancelAnimationFrame(gameLoopRef.current);
        return;
      }
    }
  }, []);

  // ── Merge collision handler ────────────────────────────────────────────────

  const handleCollision = useCallback((event) => {
    const toMerge = [];

    event.pairs.forEach(({ bodyA, bodyB }) => {
      if (bodyA.label === 'wall' || bodyB.label === 'wall') return;
      if (bodyA.fruitIdx !== bodyB.fruitIdx) return;
      if (bodyA.fruitIdx >= FRUITS.length - 1) return;

      const key = [bodyA.id, bodyB.id].sort().join('-');
      if (mergeQueueRef.current.has(key)) return;
      mergeQueueRef.current.add(key);
      toMerge.push({ a: bodyA, b: bodyB, idx: bodyA.fruitIdx });
    });

    toMerge.forEach(({ a, b, idx }) => {
      setTimeout(() => {
        if (
          !Composite.get(worldRef.current, a.id, 'body') ||
          !Composite.get(worldRef.current, b.id, 'body')
        ) return;

        const mx = (a.position.x + b.position.x) / 2;
        const my = (a.position.y + b.position.y) / 2;
        World.remove(worldRef.current, a);
        World.remove(worldRef.current, b);
        bodiesRef.current = bodiesRef.current.filter((x) => x !== a && x !== b);

        const newIdx = idx + 1;
        addFruitBody(mx, my, newIdx);
        onScoreRef.current?.(FRUITS[newIdx].pts);
        onToastRef.current?.(`${FRUITS[newIdx].emoji} +${FRUITS[newIdx].pts}`);

        // Queue a visual burst at the merge point
        mergeBurstsRef.current.push({ x: mx, y: my, color: FRUITS[newIdx].color, r: FRUITS[newIdx].r, startedAt: Date.now() });

        mergeQueueRef.current.delete([a.id, b.id].sort().join('-'));
      }, 50);
    });
  }, [addFruitBody]);

  // ── Physics initialisation ─────────────────────────────────────────────────

  const initPhysics = useCallback(() => {
    const engine = Engine.create({ gravity: { y: 28 } });
    const world  = engine.world;
    engineRef.current = engine;
    worldRef.current  = world;

    World.add(world, [
      Bodies.rectangle(W / 2,     H + WALL / 2, W,    WALL, { isStatic: true, label: 'wall', friction: 0.5,  restitution: 0.1 }),
      Bodies.rectangle(-WALL / 2, H / 2,        WALL, H * 2, { isStatic: true, label: 'wall' }),
      Bodies.rectangle(W + WALL / 2, H / 2,     WALL, H * 2, { isStatic: true, label: 'wall' }),
    ]);
    Events.on(engine, 'collisionStart', handleCollision);
  }, [handleCollision]);

  // ── RAF game loop ──────────────────────────────────────────────────────────

  const startLoop = useCallback(() => {
    cancelAnimationFrame(gameLoopRef.current);
    const SUB = 6;
    const tick = () => {
      for (let i = 0; i < SUB; i++) Engine.update(engineRef.current, 1000 / 60 / SUB);
      render();
      checkGameOver();
      gameLoopRef.current = requestAnimationFrame(tick);
    };
    tick();
  }, [render, checkGameOver]);

  // ── Public API ─────────────────────────────────────────────────────────────

  const startEngine = useCallback(() => {
    // Teardown any previous session
    if (engineRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
      World.clear(worldRef.current);
      Engine.clear(engineRef.current);
    }

    bodiesRef.current     = [];
    mergeQueueRef.current.clear();
    mergeBurstsRef.current = [];
    gameOverRef.current   = false;
    canDropRef.current    = true;
    dropXRef.current      = W / 2;

    // Generate stable twinkling star field for the canvas vacuum
    vacuumStarsRef.current = Array.from({ length: 38 }, () => ({
      x:     Math.random() * W,
      y:     Math.random() * H,
      r:     Math.random() * 1.1 + 0.25,
      o:     Math.random() * 0.5 + 0.15,
      speed: 0.7 + Math.random() * 2.8,
      phase: Math.random() * Math.PI * 2,
    }));

    const ci = randFruitIdx();
    const ni = randFruitIdx();
    currentIdxRef.current = ci;
    nextIdxRef.current    = ni;
    setCurrentIdx(ci);
    setNextIdx(ni);
    setGameOver(false);

    initPhysics();
    startLoop();
  }, [initPhysics, startLoop]);

  const dropFruit = useCallback(() => {
    if (!canDropRef.current || gameOverRef.current) return;
    canDropRef.current = false;

    addFruitBody(
      dropXRef.current,
      FRUITS[currentIdxRef.current].r + 5,
      currentIdxRef.current,
    );

    const next    = nextIdxRef.current;
    const newNext = randFruitIdx();
    currentIdxRef.current = next;
    nextIdxRef.current    = newNext;
    setCurrentIdx(next);
    setNextIdx(newNext);

    setTimeout(() => { canDropRef.current = true; }, 400);
  }, [addFruitBody]);

  const movePointer = useCallback((rawX) => {
    if (gameOverRef.current) return;
    const r = FRUITS[currentIdxRef.current].r;
    dropXRef.current = Math.max(r, Math.min(W - r, rawX));
  }, []);

  const stopEngine = useCallback(() => {
    cancelAnimationFrame(gameLoopRef.current);
    if (engineRef.current) {
      World.clear(worldRef.current);
      Engine.clear(engineRef.current);
    }
  }, []);

  // Cleanup on App unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(gameLoopRef.current);
      if (engineRef.current) {
        World.clear(worldRef.current);
        Engine.clear(engineRef.current);
      }
    };
  }, []);

  return {
    canvasRef,
    currentIdx,
    nextIdx,
    gameOver,
    startEngine,
    dropFruit,
    movePointer,
    stopEngine,
  };
}
