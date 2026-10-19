import { getCollection, type CollectionEntry } from 'astro:content';

export type Kind = 'Article' | 'Projet';

export interface Item {
  id: string;
  kind: Kind;
  section: 'blog' | 'project';
  url: string;
  title: string;
  subtitle: string;
  topic: string;
  date: Date;
  readingTime: number;
  cover?: ImageMetadata;
  interactive: boolean;
  featured: boolean;
  categories: string[];
  tags: string[];
  entry: CollectionEntry<'blog'> | CollectionEntry<'project'>;
}

const WORDS_PER_MINUTE = 213;
const WIDGET = /wgt-(wprime|respiration|pauses)/;

const fmtLong = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
const fmtShort = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
export const formatDate = (d: Date, short = false) => (short ? fmtShort : fmtLong).format(d);

export function readingTime(body: string | undefined): number {
  const words = (body ?? '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

// Même règle que le « urlize » de Hugo : minuscules, espaces en tirets, accents conservés.
export const urlize = (term: string) => term.trim().toLowerCase().replace(/\s+/g, '-');

export function toItem(entry: CollectionEntry<'blog'> | CollectionEntry<'project'>, section: 'blog' | 'project'): Item {
  const d = entry.data;
  return {
    id: entry.id,
    kind: section === 'blog' ? 'Article' : 'Projet',
    section,
    url: `/${section}/${entry.id}/`,
    title: d.title,
    subtitle: (d.subtitle ?? d.excerpt ?? d.description ?? '').trim(),
    topic: d.topic,
    date: d.date,
    readingTime: readingTime(entry.body),
    cover: d.cover,
    interactive: WIDGET.test(entry.body ?? ''),
    featured: !!d.featured,
    categories: d.categories,
    tags: d.tags,
    entry,
  };
}

const byDateDesc = (a: Item, b: Item) => b.date.valueOf() - a.date.valueOf();
const published = (e: { data: { draft?: boolean | null } }) => import.meta.env.DEV || !e.data.draft;

export async function getArticles(): Promise<Item[]> {
  return (await getCollection('blog', published)).map((e) => toItem(e, 'blog')).sort(byDateDesc);
}

export async function getProjects(): Promise<Item[]> {
  return (await getCollection('project', published)).map((e) => toItem(e, 'project')).sort(byDateDesc);
}

export async function getAllItems(): Promise<Item[]> {
  return [...(await getArticles()), ...(await getProjects())].sort(byDateDesc);
}

/** Texte brut d'un contenu Markdown, pour l'index de recherche. */
export function plainText(md: string): string {
  return md
    .replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*-{3,}\s*$/gm, ' ')
    .replace(/[|*_`~]/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    // Blocs de newsletter et de confidentialité répétés dans les articles
    .replace(/Ne ratez plus aucune nouveauté\S*/g, '')
    .replace(/Abonnez-vous à la newsletter[^.]*\./g, '')
    .replace(/Pour en savoir plus sur nos pratiques[^.]*\./g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface Term {
  name: string;
  slug: string;
  items: Item[];
}

/** Regroupe les contenus par catégorie ou par mot-clé. */
export function groupTerms(items: Item[], field: 'categories' | 'tags'): Term[] {
  const map = new Map<string, Term>();
  for (const it of items) {
    for (const name of new Set(it[field])) {
      const slug = urlize(name);
      const t = map.get(slug) ?? { name, slug, items: [] };
      t.items.push(it);
      map.set(slug, t);
    }
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
}
