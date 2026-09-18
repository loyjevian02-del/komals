import { useEffect } from 'react';

export const SITE_NAME = "Komal's Sweet Palace";
export const SITE_URL = 'https://komalssweetpalace.in';
const DEFAULT_IMAGE = `${SITE_URL}/favicon.png`;

function setMetaByName(name, content) {
  if (!content) return;
  let element = document.querySelector(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.name = name;
    document.head.appendChild(element);
  }
  element.content = content;
}

function setMetaByProperty(property, content) {
  if (!content) return;
  let element = document.querySelector(`meta[property="${property}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('property', property);
    document.head.appendChild(element);
  }
  element.content = content;
}

export default function Seo({ title, description, image, schema }) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    const canonicalHref = `${SITE_URL}${window.location.pathname}`;
    const ogImage = image || DEFAULT_IMAGE;

    document.title = fullTitle;
    setMetaByName('description', description);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = canonicalHref;

    setMetaByProperty('og:title', fullTitle);
    setMetaByProperty('og:description', description);
    setMetaByProperty('og:type', 'website');
    setMetaByProperty('og:url', canonicalHref);
    setMetaByProperty('og:site_name', SITE_NAME);
    setMetaByProperty('og:image', ogImage);

    setMetaByName('twitter:card', 'summary_large_image');
    setMetaByName('twitter:title', fullTitle);
    setMetaByName('twitter:description', description);
    setMetaByName('twitter:image', ogImage);

    const id = 'page-structured-data';
    document.getElementById(id)?.remove();
    if (schema) {
      const script = document.createElement('script');
      script.id = id; script.type = 'application/ld+json'; script.text = JSON.stringify(schema);
      document.head.appendChild(script);
    }
    return () => document.getElementById(id)?.remove();
  }, [title, description, image, schema]);
  return null;
}

export const siteSchema = {
  '@context': 'https://schema.org', '@type': ['LocalBusiness', 'FoodEstablishment'],
  name: SITE_NAME, url: SITE_URL,
  description: 'Traditional Indian sweets, savouries, halwas and chakkuli from Mangaluru.',
  servesCuisine: 'Indian sweets and savouries', areaServed: ['Mangaluru', 'Mangalore', 'Karnataka'],
};
