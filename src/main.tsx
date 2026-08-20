import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

function applySafeAreaInsets() {
  const root = document.documentElement;

  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && (navigator as any).maxTouchPoints > 1);
  const isStandalone = window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches;

  // iOS PWA / Safari frequently reports env(safe-area-inset-*) as 0, so we
  // apply explicit insets via a class. 59px top / 34px bottom covers modern
  // iPhones (Dynamic Island + home indicator); slightly generous on notched
  // devices but always clears the system chrome.
  if (isIOS || isStandalone) {
    root.classList.add('pwa-standalone');
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
