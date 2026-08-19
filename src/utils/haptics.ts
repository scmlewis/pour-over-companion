let hapticsEnabled = true;

export function setHapticsEnabled(enabled: boolean) {
  hapticsEnabled = enabled;
}

export function isHapticsEnabled(): boolean {
  return hapticsEnabled;
}

export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'finish' = 'medium') {
  if (!hapticsEnabled || typeof window === 'undefined' || !('vibrate' in navigator)) return;
  try {
    if (type === 'light') {
      navigator.vibrate(40);
    } else if (type === 'medium') {
      navigator.vibrate([70, 40, 70]);
    } else if (type === 'finish') {
      navigator.vibrate([120, 60, 120, 60, 250]);
    } else {
      navigator.vibrate(100);
    }
  } catch {
    // Graceful no-op
  }
}

export function triggerStepVibration() {
  triggerHaptic('medium');
}

export function triggerFinishVibration() {
  triggerHaptic('finish');
}
