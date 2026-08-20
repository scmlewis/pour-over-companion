import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

function applySafeAreaInsets() {
  const ua = navigator.userAgent;
  // Modern iOS Safari (13+) reports a desktop UA, so also check platform.
  // iPhone → platform "iPhone", iPad (iPadOS 13+) → platform "MacIntel" with touch.
  const isIOS = /iPad|iPhone|iPod/.test(ua) ||
    navigator.platform === 'iPhone' ||
    (navigator.platform === 'MacIntel' && (navigator as any).maxTouchPoints > 1);
  const isStandalone = window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches;

  if (isIOS || isStandalone) {
    // Apply safe-area insets via inline style (highest specificity, can't be
    // overridden by CSS layers) AND CSS custom properties for sticky headers
    // and the floating nav.
    const SAT = '59px';  // Dynamic Island / notch
    const SAB = '34px';  // Home indicator
    document.body.style.paddingTop = SAT;
    document.body.style.paddingBottom = SAB;
    document.documentElement.style.setProperty('--sat', SAT);
    document.documentElement.style.setProperty('--sab', SAB);
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
