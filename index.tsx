import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Ensure light mode - remove dark class if present
if (document.documentElement.classList.contains('dark')) {
  document.documentElement.classList.remove('dark');
}

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