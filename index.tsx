import React from 'react';
import ReactDOM from 'react-dom/client';
// import { initSentry } from './src/config/sentry';
import App from './App.tsx'; // Explicitly include .tsx extension

// Initialize Sentry BEFORE React (desabilitado temporariamente)
// initSentry(); // desabilitado temporariamente

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);