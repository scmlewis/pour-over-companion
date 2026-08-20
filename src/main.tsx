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

  // Probe env() by measuring a fixed element's actual position.
  const probe = document.createElement('div');
  probe.style.cssText =
    'position:fixed;top:env(safe-area-inset-top);left:0;right:0;height:1px;opacity:0;pointer-events:none;';
  document.body.appendChild(probe);
  const sat = Math.round(probe.getBoundingClientRect().top);
  document.body.removeChild(probe);

  // env() works in Safari browser but returns 0 in PWA standalone mode.
  const isStandalone = window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches;
  const isNotched = window.screen.height >= 812;
  const finalSat = sat > 0 ? sat : (isNotched ? 54 : 20);

  // 1. Set on :root for all CSS var(--sat) consumers (ScreenHeader, cover bar, etc.)
  document.documentElement.style.setProperty('--sat', finalSat + 'px');
  document.documentElement.style.setProperty('--sab', '34px');
  // 2. Set body padding directly via inline style (guaranteed — overrides CSS)
  document.body.style.paddingTop = finalSat + 'px';
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
