import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Fix: The original content was placeholder text, causing syntax errors. It has been replaced with a standard React entry point.
const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error('Failed to find the root element');
}
