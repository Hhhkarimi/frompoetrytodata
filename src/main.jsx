import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

const rootElement = document.getElementById('root');
// Static HTML remains available to crawlers and no-JS visitors. Once the app loads,
// replace it cleanly instead of attempting to hydrate non-React markup.
rootElement.replaceChildren();

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
