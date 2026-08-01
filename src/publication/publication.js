import { persianDigits } from './persian-format.js';

export const OFFICIAL_ORIGIN = 'https://frompoetrytodata.vercel.app';

export const PUBLICATION = Object.freeze({
  title: 'از شعر تا داده: اطلس تعاملی تحلیل داده‌های شعر فارسی',
  creator: 'حسین کریمی',
  creatorFamilyName: 'کریمی',
  creatorGivenName: 'حسین',
  version: '7.0.0',
  publishedDate: '2026-07-27',
  modifiedDate: '2026-08-01',
  license: 'MIT',
});

export function publicationUrl(pathname = '/', origin = OFFICIAL_ORIGIN) {
  const normalizedOrigin = origin.replace(/\/$/, '');
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${normalizedOrigin}${normalizedPath}`;
}

export function buildPersianCitation(title = PUBLICATION.title, pathname = '/', origin = OFFICIAL_ORIGIN) {
  const year = PUBLICATION.publishedDate.slice(0, 4);
  return `${PUBLICATION.creatorFamilyName}، ${PUBLICATION.creatorGivenName}. (${persianDigits(year)}). «${title}». ${PUBLICATION.title}. ${publicationUrl(pathname, origin)}`;
}
