import { useEffect, useCallback, useRef } from 'react';
import CosmicBackground from '../ui/CosmicBackground.jsx';
import TimerPackages    from '../ui/TimerPackages.jsx';
import Toast            from '../ui/Toast.jsx';
import { FRUITS, drawFruitOnCtx } from '../../game/fruits.js';

const W = 320;

function fmt(s) {
  return [Math.floor(s / 60), s % 60]
    .map((n) => String(n).padStart(2, '0'))
    .join(':');
}

export default function Playing({
  canvasRef,
  nextIdx,
  score,
  personalBest,
  remaining,
  packages,
  onPurchase,
  purchaseLoading,
  selectedToken,
  onSelectToken,
  toast,
  movePointer,
  dropFruit,
  gameOver,
}) {
  const pointerActiveRef = useRef(false);

  // Draw the "next planet" preview canvas
  useEffect(() => {
    const canvas = document.getElementById('next-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 56, 56);
    // dark bg
    ctx.fillStyle = '#050009';
    ctx.fillRect(0, 0, 56, 56);
    const r = Math.min(FRUITS[nextIdx].r, 20);
    drawFruitOnCtx(ctx, 28, 28, r, nextIdx, 1);
  }, [nextIdx]);

  const getX = useCallback((e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return W / 2;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    return clientX - rect.left;
  }, [canvasRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onPointerMove = (e) => { if (!gameOver) movePointer(getX(e)); };
    const onPointerDown = (e) => {
      if (!gameOver) { movePointer(getX(e)); pointerActiveRef.current = true; }
    };
    const onPointerUp = () => {
      if (!pointerActiveRef.current || gameOver) return;
      pointerActiveRef.current = false;
      dropFruit();
    };
    const onTouchMove = (e) => { e.preventDefault(); if (!gameOver) movePointer(getX(e)); };
    const onTouchEnd  = (e) => { e.preventDefault(); if (!gameOver) dropFruit(); };

    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointerup',   onPointerUp);
    canvas.addEventListener('touchmove',   onTouchMove, { passive: false });
    canvas.addEventListener('touchend',    onTouchEnd,  { passive: false });

    return () => {
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup',   onPointerUp);
      canvas.removeEventListener('touchmove',   onTouchMove);
      canvas.removeEventListener('touchend',    onTouchEnd);
    };
  }, [canvasRef, gameOver, movePointer, dropFruit, getX]);

  const urgent = remaining <= 10;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0015' }}>
      <CosmicBackground intensity="medium">
        {/* slight darkening so canvas pops */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)', pointerEvents: 'none' }} />

        <div style={{
          position: 'relative', height: '100%',
          display: 'flex', flexDirection: 'column',
          padding: '12px 16px 14px', boxSizing: 'border-box',
        }}>
          {/* Top HUD */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 10,
          }}>
            {/* Timer */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 14px', borderRadius: 99,
              background: urgent ? 'rgba(255,59,59,0.18)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${urgent ? 'rgba(255,59,59,0.5)' : 'rgba(255,255,255,0.1)'}`,
              animation: urgent ? 'nukko-pulse-bg 0.8s ease-in-out infinite' : 'none',
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: 99,
                background: urgent ? '#ff3b3b' : '#00d4ff',
              }} />
              <div style={{
                fontFamily: '"Space Mono", monospace', fontWeight: 700, fontSize: 22,
                color: urgent ? '#ff3b3b' : '#fff', letterSpacing: '-0.02em',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {fmt(remaining)}
              </div>
            </div>

            {/* Score + next preview */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Next planet */}
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              }}>
                <div style={{
                  fontFamily: '"Nunito", system-ui', fontSize: 9,
                  color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em',
                }}>Next</div>
                <div style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10, padding: 4,
                }}>
                  <canvas id="next-canvas" width={56} height={56}
                    style={{ display: 'block', borderRadius: 6 }} />
                </div>
              </div>

              {/* Score */}
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontFamily: '"Nunito", system-ui', fontSize: 10,
                  color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.2em',
                }}>Score</div>
                <div style={{
                  fontFamily: '"Space Mono", monospace', fontWeight: 700, fontSize: 24,
                  color: '#ffd700', letterSpacing: '-0.02em', lineHeight: 1,
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {Number(score).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Game canvas */}
          <div style={{
            display: 'flex', justifyContent: 'center',
            flex: 1,
          }}>
            <div style={{
              position: 'relative',
              borderRadius: 22, overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: 'inset 0 2px 22px rgba(0,0,0,0.85), inset 0 0 60px rgba(123,47,255,0.08)',
            }}>
              <canvas
                ref={canvasRef}
                id="game-canvas"
                width={W}
                height={480}
                style={{ display: 'block', cursor: 'none', touchAction: 'none' }}
              />
              {/* score pop toast */}
              <Toast message={toast.message} visible={toast.visible} />
            </div>
          </div>

          {/* Bottom — time boosts */}
          <div style={{ paddingTop: 10 }}>
            <div style={{
              fontFamily: '"Nunito", system-ui', fontSize: 10,
              color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase',
              letterSpacing: '0.2em', textAlign: 'center', marginBottom: 8,
            }}>
              Need more time?
            </div>
            <TimerPackages
              packages={packages}
              onPurchase={onPurchase}
              loading={purchaseLoading}
              selectedToken={selectedToken}
              onSelectToken={onSelectToken}
            />
          </div>
        </div>
      </CosmicBackground>
    </div>
  );
}
