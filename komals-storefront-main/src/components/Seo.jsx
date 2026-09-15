import { useEffect } from 'react';

const SITE_NAME = "Komal's Sweet Palace";
const SITE_URL = 'https://komalssweetpalace.in';

function setMeta(name, content) {
  if (!content) return;
  let element = document.querySelector(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.name = name;
    document.head.appendChild(element);
  }
  element.content = content;
}

export default function Seo({ title, description, schema }) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    setMeta('description', description);
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = `${SITE_URL}${window.location.pathname}`;
    const id = 'page-structured-data';
    document.getElementById(id)?.remove();
    if (schema) {
      const script = document.createElement('script');
      script.id = id; script.type = 'application/ld+json'; script.text = JSON.stringify(schema);
      document.head.appendChild(script);
    }
    return () => document.getElementById(id)?.remove();
  }, [title, description, schema]);
  return null;
}

export const siteSchema = {
  '@context': 'https://schema.org', '@type': ['LocalBusiness', 'FoodEstablishment'],
  name: SITE_NAME, url: SITE_URL,
  description: 'Traditional Indian sweets, savouries, halwas and chakkuli from Mangaluru.',
  servesCuisine: 'Indian sweets and savouries', areaServed: ['Mangaluru', 'Mangalore', 'Karnataka'],
};
