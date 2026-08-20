import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

function applySafeAreaInsets() {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) ||
    navigator.platform === 'iPhone' ||
    (navigator.platform === 'MacIntel' && (navigator as any).maxTouchPoints > 1);

  if (!isIOS) return;

  // Probe whether env(safe-area-inset-*) actually returns a value in this context.
  const probe = document.createElement('div');
  probe.style.cssText =
    'position:fixed;top:env(safe-area-inset-top);bottom:env(safe-area-inset-bottom);left:0;right:0;height:1px;opacity:0;pointer-events:none;';
  document.body.appendChild(probe);
  const rect = probe.getBoundingClientRect();
  document.body.removeChild(probe);

  const top = Math.round(rect.top);
  const bottom = Math.round(window.innerHeight - rect.bottom);

  if (top > 0 || bottom > 0) {
    // env() works — use the real values
    document.documentElement.style.setProperty('--sat', top + 'px');
    document.documentElement.style.setProperty('--sab', bottom + 'px');
  } else {
    // env() unsupported / returns 0 — fall back to device heuristic
    const isNotched = window.screen.height >= 812; // iPhone X and later
    document.documentElement.style.setProperty('--sat', (isNotched ? 59 : 20) + 'px');
    document.documentElement.style.setProperty('--sab', '34px');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applySafeAreaInsets);
} else {
  applySafeAreaInsets();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
