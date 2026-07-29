import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import RouteLoader from './RouteLoader.jsx';
import { resolveAppRoute } from './routes/route.js';
import { installAnalyticsLinkTracking } from './analytics/events.js';

const rootElement = document.getElementById('root');
const summaryElement = document.getElementById('publication-summary');
const summary = summaryElement ? JSON.parse(summaryElement.textContent) : null;
const routeState = resolveAppRoute(window.location);
installAnalyticsLinkTracking();

if (routeState.redirect) {
  window.location.replace(routeState.redirect);
} else {
  // Static HTML remains available to crawlers and no-JS visitors. Once the app loads,
  // replace it cleanly instead of attempting to hydrate non-React markup.
  rootElement.replaceChildren();
  const loadPage = routeState.route === 'atlas'
    ? () => import('./App.jsx')
    : () => import('./NarrativeHome.jsx');

  ReactDOM.createRoot(rootElement).render(<React.StrictMode><RouteLoader loadPage={loadPage} summary={summary} /></React.StrictMode>);
}
