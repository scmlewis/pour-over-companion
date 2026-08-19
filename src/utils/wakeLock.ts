// Screen Wake Lock API helper with automatic visibility handling

let wakeLockSentinel: WakeLockSentinel | null = null;
let isLockRequested = false;

export async function requestWakeLock(): Promise<boolean> {
  isLockRequested = true;
  if (typeof window === 'undefined' || !('wakeLock' in navigator)) {
    return false;
  }
  try {
    if (!wakeLockSentinel || wakeLockSentinel.released) {
      wakeLockSentinel = await navigator.wakeLock.request('screen');
      wakeLockSentinel.addEventListener('release', () => {
        wakeLockSentinel = null;
      });
    }
    return true;
  } catch (err) {
    console.warn('Wake Lock request failed:', err);
    return false;
  }
}

export async function releaseWakeLock(): Promise<void> {
  isLockRequested = false;
  if (wakeLockSentinel && !wakeLockSentinel.released) {
    try {
      await wakeLockSentinel.release();
    } catch {
      // ignore
    }
    wakeLockSentinel = null;
  }
}

// Re-acquire lock if tab becomes visible again during brew
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible' && isLockRequested) {
      await requestWakeLock();
    }
  });
}
