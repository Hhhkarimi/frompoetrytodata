import { OFFICIAL_ORIGIN } from '../../src/publication/publication.js';

export { OFFICIAL_ORIGIN };

export function resolvePublicationOrigin(environment = process.env) {
  const configured = environment.SITE_URL
    || environment.VITE_SITE_URL
    || environment.VITE_VERCEL_PROJECT_PRODUCTION_URL
    || environment.VERCEL_PROJECT_PRODUCTION_URL
    || 'localhost:4173';

  const normalized = /^https?:\/\//.test(configured)
    ? configured.replace(/\/$/, '')
    : `${configured.startsWith('localhost') ? 'http' : 'https'}://${configured.replace(/\/$/, '')}`;

  return normalized.includes('localhost') ? normalized : OFFICIAL_ORIGIN;
}
