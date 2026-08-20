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

  // Hardcode known iOS safe-area heights. env() is unreliable in Safari browser
  // mode (returns 0), so we set explicit values and apply body padding directly
  // via inline style (which always wins over the CSS var fallback).
  const isNotched = window.screen.height >= 812; // iPhone X and later
  const sat = isNotched ? 44 : 20; // status bar height
  const sab = 34; // home indicator

  document.documentElement.style.setProperty('--sat', sat + 'px');
  document.documentElement.style.setProperty('--sab', sab + 'px');
  document.body.style.paddingTop = sat + 'px';
  document.body.style.paddingBottom = '0px';
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
