// Adresa sajta za canonical, Open Graph, sitemap i robots.
// Redoslijed: NEXT_PUBLIC_SITE_URL (npr. tvoja domena) -> Vercel produkcijska adresa -> localhost.
const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL
  || (vercelUrl ? `https://${vercelUrl}` : 'http://localhost:3000')
).replace(/\/+$/, '');
