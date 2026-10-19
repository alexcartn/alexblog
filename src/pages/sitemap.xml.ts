import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { getAllItems, groupTerms } from '../lib/content';

export async function GET(context: APIContext) {
  const site = context.site!;
  const items = await getAllItems();
  const pages = (await getCollection('pages')).filter((p) => !['home', 'about'].includes(p.id));
  const urls: { loc: string; lastmod?: string }[] = [
    { loc: '/' }, { loc: '/blog/' }, { loc: '/project/' }, { loc: '/about/' },
    ...pages.map((p) => ({ loc: `/${p.id}/` })),
    ...items.map((i) => ({ loc: i.url, lastmod: i.date.toISOString().slice(0, 10) })),
    { loc: '/categories/' }, { loc: '/tags/' },
    ...groupTerms(items, 'categories').map((t) => ({ loc: `/categories/${t.slug}/` })),
    ...groupTerms(items, 'tags').map((t) => ({ loc: `/tags/${t.slug}/` })),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${new URL(encodeURI(u.loc), site).href}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}<changefreq>weekly</changefreq></url>`).join('\n') +
    `\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
