import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global capture for PWA install prompt at very first load
declare global {
  interface Window {
    _deferredPwaPrompt: any;
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window._deferredPwaPrompt = e;
    window.dispatchEvent(new CustomEvent('pwa-prompt-ready'));
  });

  // Register Service Worker for offline field capability & WebAPK installation
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('FloraMedica Service Worker registered:', reg.scope);
        })
        .catch((err) => {
          console.log('SW registration note:', err);
        });
    });
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
