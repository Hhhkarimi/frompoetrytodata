import { metaphorPath, poetPath, topicPath } from '../routes/entity-paths.js';

const TYPE_LABELS = Object.freeze({
  poet: 'شاعر',
  century: 'سدهٔ منتسب',
  theme: 'مضمون محاسباتی',
  metaphor: 'خانوادهٔ استعاری',
  research: 'پژوهش',
});

function normalize(value) {
  return String(value)
    .normalize('NFKC')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/\s/g, '')
    .toLocaleLowerCase('fa');
}

export function createExplorerItems({
  poets,
  centuries,
  topics,
  metaphors,
  metaphorRates,
  researchPages,
}) {
  const coveredCenturies = centuries.map((item) => item.century);
  return [
    ...poets.map((poet) => ({
      id: poet.name,
      type: 'poet',
      typeLabel: TYPE_LABELS.poet,
      title: poet.name,
      summary: `سده ${poet.century} هجری · ${poet.poems} متن در پیکره`,
      url: poetPath(poet.name),
      centuries: [poet.century],
    })),
    ...centuries.map((century) => ({
      id: String(century.century),
      type: 'century',
      typeLabel: TYPE_LABELS.century,
      title: `سده ${century.century} هجری`,
      summary: `${century.texts} متن از ${century.poets} شاعر در پیکره`,
      url: `/centuries/${century.century}/`,
      centuries: [century.century],
    })),
    ...topics.map((topic) => ({
      id: String(topic.id),
      type: 'theme',
      typeLabel: TYPE_LABELS.theme,
      title: topic.name,
      summary: topic.keywords.join('، '),
      url: topicPath(topic.id),
      centuries: topic.values.map((value) => value.century),
      topicId: topic.id,
    })),
    ...metaphors.map((metaphor) => ({
      id: metaphor.name,
      type: 'metaphor',
      typeLabel: TYPE_LABELS.metaphor,
      title: metaphor.name,
      summary: `میدان معنایی: ${metaphor.semanticField}`,
      url: metaphorPath(metaphor.name),
      centuries: metaphorRates
        .filter((row) => Number.isFinite(row[metaphor.name]))
        .map((row) => row.century),
      metaphorName: metaphor.name,
    })),
    ...researchPages.map((page) => ({
      id: page.id,
      type: 'research',
      typeLabel: TYPE_LABELS.research,
      title: page.title,
      summary: `${page.answer} ${page.qualification}`,
      url: page.path,
      centuries: coveredCenturies,
      studyId: page.id,
    })),
  ];
}

export function filterExplorerItems(items, state) {
  const query = normalize(state.query || '');
  const filtered = items.filter((item) => {
    if (state.entityType && item.type !== state.entityType) return false;
    if (state.century && !item.centuries.includes(Number(state.century))) return false;
    if (state.topic && item.topicId !== Number(state.topic)) return false;
    if (state.metaphor && item.metaphorName !== state.metaphor) return false;
    if (state.study && item.studyId !== state.study) return false;
    return !query || normalize(`${item.title} ${item.summary}`).includes(query);
  });

  return filtered.sort((left, right) => {
    if (state.sort === 'title') return left.title.localeCompare(right.title, 'fa');
    const leftStarts = normalize(left.title).startsWith(query) ? 0 : 1;
    const rightStarts = normalize(right.title).startsWith(query) ? 0 : 1;
    return leftStarts - rightStarts || left.title.localeCompare(right.title, 'fa');
  });
}
