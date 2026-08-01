export const TOPIC_SLUGS = Object.freeze({
  1: 'ethics-wisdom',
  2: 'epic-kingship-war',
  3: 'religion-sufism-praise',
  4: 'soul-heart-romantic-bond',
  5: 'sensory-existential-images',
  6: 'beloved-beauty-feast',
  7: 'nature-flower-spring',
  8: 'night-time-life',
  9: 'mystical-romantic-love',
  10: 'cosmos-power-fortune',
  11: 'grief-separation',
});

export const METAPHOR_SLUGS = Object.freeze({
  'راه، سفر و منزل': 'journey-road-destination',
  'گل و بلبل': 'flower-nightingale',
  'نور، شمع و تاریکی': 'light-candle-darkness',
  'خون، زخم و خنجر': 'blood-wound-dagger',
  'باده، شراب و ساقی': 'wine-cupbearer',
  'آتش، شعله و شرر': 'fire-flame-spark',
  'دریا، موج و ساحل': 'sea-wave-shore',
  'آینه و بازتاب': 'mirror-reflection',
  'قفس و زندان': 'cage-prison',
  'زنجیر و اسارت': 'chain-captivity',
});

import { poetSlug } from '../entities/poet-identity.js';

export function poetPath(name) {
  const slug = poetSlug(name);
  return slug ? `/poets/${slug}/` : '/poets/';
}

export function topicPath(id) {
  return TOPIC_SLUGS[id] ? `/themes/${TOPIC_SLUGS[id]}/` : '/themes/';
}

export function metaphorPath(name) {
  return METAPHOR_SLUGS[name] ? `/metaphors/${METAPHOR_SLUGS[name]}/` : '/metaphors/';
}
