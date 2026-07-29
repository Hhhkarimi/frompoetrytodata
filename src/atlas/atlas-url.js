const PARAMETER_ORDER = [
  'q',
  'century',
  'topic',
  'metaphor',
  'period',
  'threshold',
  'layout',
  'poet',
  'metric',
  'case',
  'question',
  'audience',
];

const METRICS = ['poems', 'couplets', 'words'];
const LAYOUTS = ['force', 'circular'];
const AUDIENCES = ['general', 'research'];

function allowedValue(parameters, name, allowed, invalidParameters, transform = (value) => value) {
  const raw = parameters.get(name);
  if (raw === null || raw === '') return null;
  const value = transform(raw);
  if (allowed.includes(value)) return value;
  invalidParameters.push(name);
  return null;
}

export function parseAtlasUrl(input, options) {
  const url = input instanceof URL ? input : new URL(input, 'https://frompoetrytodata.vercel.app');
  const parameters = url.searchParams;
  const invalidParameters = [];
  const query = parameters.get('q')?.trim() || '';
  const thresholdRaw = parameters.get('threshold');
  let threshold = null;

  if (thresholdRaw !== null && thresholdRaw !== '') {
    const candidate = Number(thresholdRaw);
    if (Number.isFinite(candidate) && candidate >= 0 && candidate <= 1) threshold = candidate;
    else invalidParameters.push('threshold');
  }

  const state = {
    query,
    century: allowedValue(parameters, 'century', options.centuries, invalidParameters, Number),
    topic: allowedValue(parameters, 'topic', options.topics, invalidParameters, Number),
    metaphor: allowedValue(parameters, 'metaphor', options.metaphors, invalidParameters),
    period: allowedValue(parameters, 'period', options.periods, invalidParameters),
    threshold,
    layout: allowedValue(parameters, 'layout', LAYOUTS, invalidParameters),
    poet: allowedValue(parameters, 'poet', options.poets, invalidParameters),
    metric: allowedValue(parameters, 'metric', METRICS, invalidParameters),
    caseId: allowedValue(parameters, 'case', options.cases, invalidParameters),
    question: allowedValue(parameters, 'question', options.questions, invalidParameters),
    audience: allowedValue(parameters, 'audience', AUDIENCES, invalidParameters),
  };

  return { state, invalidParameters };
}

export function serializeAtlasState(state) {
  /** @type {Record<string, unknown>} */
  const values = {
    q: state.query?.trim() || null,
    century: state.century,
    topic: state.topic,
    metaphor: state.metaphor,
    period: state.period,
    threshold: state.threshold,
    layout: state.layout,
    poet: state.poet,
    metric: state.metric,
    case: state.caseId,
    question: state.question,
    audience: state.audience,
  };
  const parameters = new URLSearchParams();

  for (const name of PARAMETER_ORDER) {
    const value = values[name];
    if (value !== null && value !== undefined && value !== '') parameters.set(name, String(value));
  }

  return parameters.toString();
}

export function normalizeAtlasUrl(input, options) {
  const url = input instanceof URL ? new URL(input) : new URL(input, 'https://frompoetrytodata.vercel.app');
  const { state } = parseAtlasUrl(url, options);
  const query = serializeAtlasState(state);
  url.search = query ? `?${query}` : '';
  return url.toString();
}
