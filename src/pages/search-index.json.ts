import { getEntry } from 'astro:content';
import { getAllItems, plainText } from '../lib/content';

// Index de recherche : t titre, u url, k type, s sous-titre, g mots-clés, x texte, d date.
export async function GET() {
  const out = (await getAllItems()).map((i) => ({
    t: i.title,
    u: i.url,
    k: i.kind,
    s: i.subtitle.length > 180 ? i.subtitle.slice(0, 177).trimEnd() + '…' : i.subtitle,
    g: [...i.categories, ...i.tags, i.topic],
    x: `${i.subtitle} ${plainText(i.entry.body ?? '')}`.slice(0, 40000),
    d: i.date.toISOString().slice(0, 10),
  }));
  for (const [id, url] of [['coaching', '/coaching/'], ['contact', '/contact/'], ['about', '/about/']] as const) {
    const p = await getEntry('pages', id);
    if (!p) continue;
    out.push({
      t: p.data.title,
      u: url,
      k: 'Page',
      s: p.data.description ?? '',
      g: [],
      x: `${p.data.description ?? ''} ${plainText(p.body ?? '')}`.slice(0, 40000),
      d: (p.data.date ?? new Date(0)).toISOString().slice(0, 10),
    });
  }
  return new Response(JSON.stringify(out), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
