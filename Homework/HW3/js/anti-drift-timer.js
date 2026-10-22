export function createAntiDriftTimer(durationMs, onTick) {
  const targetTime = Date.now() + durationMs;
  let rafId = null;

  function tick() {
    const remaining = Math.max(0, targetTime - Date.now());
    onTick(remaining);

    if (remaining > 0) {
      rafId = requestAnimationFrame(tick);
    }
  }

  rafId = requestAnimationFrame(tick);

  return function cancel() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };
}