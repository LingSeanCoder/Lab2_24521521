# AI_FAILURE_AUDIT.md

An audit of common critical failures AI models make when generating code for High-Concurrency Flash-Sale systems, and the mandated architectural fixes.

---

## 1. Drift Timer (Time Desynchronization)

**Cause:** 
AI frequently defaults to `setInterval` for countdown timers. However, `setInterval` is prone to cumulative drift because it relies on the browser's execution queue. If the main thread is busy (e.g., processing heavy DOM updates), the callback is delayed. Furthermore, browsers aggressively throttle `setInterval` in background tabs (down to once per second or less), causing the timer to fall out of sync with real-world time.

**Fix:** 
Never use `setInterval` for accurate timing. Use a `requestAnimationFrame` (rAF) loop combined with a target timestamp. Calculate the remaining time by subtracting the current `Date.now()` from the target time. 

```javascript
// Correct Approach
const targetTime = Date.now() + durationMs;
function tick() {
  const remaining = targetTime - Date.now();
  if (remaining > 0) {
    updateUI(remaining);
    requestAnimationFrame(tick);
  }
}
requestAnimationFrame(tick);
```

---

## 2. Race Condition (Overselling / Negative Inventory)

**Cause:** 
When handling rapid clicks, AI often writes naive validation logic like `if (stock > 0) { stock -= 1; }`. In a high-concurrency scenario (multiple rapid clicks or async API calls), the JavaScript event loop might allow multiple requests to pass the `stock > 0` check before the first request finishes updating the state. This results in overselling and negative inventory.

**Fix:** 
Implement a strict Finite State Machine. Use a synchronous flag (e.g., `isLocked` or `isProcessing`) to block concurrent executions. Once a purchase is initiated, immediately lock the state before performing any async operations or mutations.

```javascript
// Correct Approach
if (item.state === 'AVAILABLE') {
  item.state = 'LOCKED'; // Lock synchronously
  processPurchase(item); 
} else {
  return; // Reject 2nd request
}
```

---

## 3. Lock Memory Leak (Abandoned Cart Deadlock)

**Cause:** 
AI will often implement a lock (reserving an item for a user to check out) but forget to handle the "abandonment" scenario. If the user closes the tab or navigates away, the item remains in the `LOCKED` state forever. This causes a memory leak in the state manager and permanently removes the item from the available inventory, causing a deadlock.

**Fix:** 
Every lock must have an expiration mechanism. Use `setTimeout` to automatically revert the state back to `AVAILABLE` if the checkout is not confirmed within a specific timeframe (e.g., 15 seconds). Crucially, you must call `clearTimeout` if the user successfully checks out or manually cancels to prevent the timer from firing erroneously.

```javascript
// Correct Approach
item.state = 'LOCKED';
const lockTimer = setTimeout(() => {
  if (item.state === 'LOCKED') {
    item.state = 'AVAILABLE'; // Auto-release
  }
}, 15000);

// On successful checkout:
clearTimeout(lockTimer);
item.state = 'SOLD_OUT';
```