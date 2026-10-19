import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getArticles } from '../../lib/content';
import { SITE } from '../../lib/site';

export async function GET(context: APIContext) {
  const items = await getArticles();
  return rss({
    title: `Blog | ${SITE.title}`,
    description: 'Une collection de mes articles sur divers sujets.',
    site: context.site!,
    trailingSlash: true,
    items: items.map((i) => ({ title: i.title, description: i.subtitle, pubDate: i.date, link: i.url, categories: [i.topic] })),
    customData: '<language>fr-FR</language>',
  });
}
