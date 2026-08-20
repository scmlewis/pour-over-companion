import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

function applySafeAreaInsets() {
  const root = document.documentElement;

  const test = document.createElement('div');
  test.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;padding-top:env(safe-area-inset-top);pointer-events:none;opacity:0;overflow:hidden';
  document.body.appendChild(test);
  const topValue = getComputedStyle(test).paddingTop;
  document.body.removeChild(test);

  if (topValue === '0px' || topValue === '0') {
    const isStandalone = window.navigator.standalone === true ||
                         window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      root.style.setProperty('--sat', '59px');
      root.style.setProperty('--sab', '34px');
    }
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
