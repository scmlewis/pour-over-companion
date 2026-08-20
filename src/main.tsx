import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

function applySafeAreaInsets() {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) ||
    navigator.platform === 'iPhone' ||
    (navigator.platform === 'MacIntel' && (navigator as any).maxTouchPoints > 1);
  const isStandalone = window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches;

  if (!isIOS) return;

  // In Safari BROWSER mode, env(safe-area-inset-*) returns the correct device
  // value (e.g. ~54px on a Dynamic Island iPhone), so we leave --sat unset and
  // let the CSS fall back to env().
  // In PWA STANDALONE mode, env() returns 0, so we must set explicit values.
  if (isStandalone) {
    const isNotched = window.screen.height >= 812;
    const sat = isNotched ? 54 : 20; // Dynamic Island ~54px; older devices ~20px
    document.documentElement.style.setProperty('--sat', sat + 'px');
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
