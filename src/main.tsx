import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

function applySafeAreaInsets() {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) ||
    navigator.platform === 'iPhone' ||
    (navigator.platform === 'MacIntel' && (navigator as any).maxTouchPoints > 1);

  if (isIOS) {
    document.documentElement.style.setProperty('--sat', '59px');
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
