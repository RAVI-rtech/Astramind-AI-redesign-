import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { LanguageProvider } from './i18n';

// Register Service Worker for PWA using configured base path (/Astramind-Ai/)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const baseUrl = (import.meta as any).env?.BASE_URL || '/Astramind-Ai/';
    const swUrl = `${baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`}sw.js`;
    navigator.serviceWorker.register(swUrl, { scope: baseUrl }).then((reg) => {
      console.log('AstraMind Service Worker registered with scope:', reg.scope);
    }).catch((err) => {
      console.warn('Service worker registration failed:', err);
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
);

