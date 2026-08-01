import { PUBLICATION } from '../publication/publication.js';

const EVENT_PROPERTIES = Object.freeze({
  homepage_primary_action: ['destination', 'audience_path'],
  audience_path_selected: ['audience', 'destination'],
  atlas_search_committed: ['query_length_bucket', 'result_count', 'entity_type'],
  atlas_filters_changed: ['filter_keys', 'active_filter_count', 'result_count'],
  atlas_share_activated: ['active_filter_count'],
  entity_result_opened: ['entity_type', 'source_view'],
  evidence_table_opened: ['metric_id', 'page_type'],
  methodology_opened: ['claim_type', 'page_type'],
  citation_copied: ['resource_type', 'citation_format'],
  dataset_download_started: ['dataset_id', 'format', 'version'],
  recoverable_error_shown: ['surface', 'error_category'],
  research_study_viewed: ['study_id'],
  research_explorer_changed: ['study_id', 'filter_keys', 'query_length_bucket', 'result_count'],
  research_poet_section_viewed: ['study_id', 'poet_slug'],
});

export function createAnalyticsEvent(name, properties = {}) {
  const allowedProperties = EVENT_PROPERTIES[name];
  if (!allowedProperties) throw new Error(`Unknown analytics event: ${name}`);
  return {
    name,
    properties: Object.fromEntries(
      allowedProperties
        .filter((property) => properties[property] !== undefined)
        .map((property) => [property, properties[property]]),
    ),
  };
}

export function emitAnalyticsEvent(name, properties) {
  const event = createAnalyticsEvent(name, properties);
  if (typeof globalThis.CustomEvent === 'function' && typeof globalThis.dispatchEvent === 'function') {
    globalThis.dispatchEvent(new CustomEvent('from-poetry-to-data:analytics', { detail: event }));
  }
  return event;
}

export function searchLengthBucket(query) {
  const length = query.trim().length;
  if (length === 0) return '0';
  if (length <= 10) return '1-10';
  if (length <= 30) return '11-30';
  return '31+';
}

export function installAnalyticsLinkTracking(documentObject = document) {
  const handleClick = (event) => {
    const link = event.target.closest?.('a[href]');
    if (!link) return;
    const url = new URL(link.href, globalThis.location?.origin || 'https://frompoetrytodata.vercel.app');
    if (url.pathname.startsWith('/downloads/')) {
      const filename = url.pathname.split('/').at(-1) || '';
      const extension = filename.includes('.') ? (filename.split('.').at(-1) || '').toLowerCase() : 'unknown';
      emitAnalyticsEvent('dataset_download_started', {
        dataset_id: url.pathname.slice('/downloads/'.length),
        format: extension,
        version: PUBLICATION.version,
      });
    } else if (url.pathname === '/methodology/') {
      emitAnalyticsEvent('methodology_opened', {
        claim_type: 'publication',
        page_type: globalThis.location?.pathname.startsWith('/atlas/') ? 'atlas' : 'page',
      });
    }
  };
  documentObject.addEventListener('click', handleClick);
  return () => documentObject.removeEventListener('click', handleClick);
}
