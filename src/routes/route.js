const LEGACY_ATLAS_FRAGMENTS = new Set([
  '#overview',
  '#curiosity',
  '#topics',
  '#metaphors',
  '#intertext',
  '#century-ai',
  '#stylometry',
  '#attribution',
  '#forms',
  '#geography',
  '#lexical-life',
  '#poets',
  '#knowledge',
  '#about',
]);

export function resolveAppRoute({ pathname, hash }) {
  const route = pathname.startsWith('/atlas/') ? 'atlas' : 'home';
  const redirect = pathname === '/' && LEGACY_ATLAS_FRAGMENTS.has(hash)
    ? `/atlas/${hash}`
    : null;
  return { route, redirect };
}
