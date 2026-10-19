import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Listes de mots-clés : le YAML peut contenir null, des entrées vides ou rien du tout.
const list = z
  .array(z.string().nullable())
  .nullish()
  .transform((v) => (v ?? []).filter((x): x is string => !!x && x.trim() !== '').map((x) => x.trim()));

// L'id d'une entrée est le nom de son dossier : blog/cp_model/index.md devient « cp_model ».
const generateId = ({ entry }: { entry: string }) => entry.replace(/\/index\.md$/, '').replace(/\.md$/, '');

const article = ({ image }: { image: () => any }) =>
  z.object({
    title: z.string(),
    subtitle: z.string().nullish(),
    excerpt: z.string().nullish(),
    description: z.string().nullish(),
    date: z.coerce.date(),
    draft: z.boolean().nullish(),
    featured: z.boolean().nullish(),
    topic: z.string(),
    cover: image().optional(),
    tags: list,
    categories: list,
    links: z
      .array(z.object({ name: z.string(), url: z.string(), icon: z.string().nullish(), icon_pack: z.string().nullish() }))
      .nullish(),
  });

export const collections = {
  blog: defineCollection({ loader: glob({ pattern: '*/index.md', base: './src/content/blog', generateId }), schema: article }),
  project: defineCollection({ loader: glob({ pattern: '*/index.md', base: './src/content/project', generateId }), schema: article }),
  pages: defineCollection({
    loader: glob({ pattern: ['*.md', '*/index.md'], base: './src/content/pages', generateId }),
    schema: ({ image }) =>
      z.object({
        title: z.string(),
        subtitle: z.string().nullish(),
        description: z.string().nullish(),
        heading: z.string().nullish(),
        date: z.coerce.date().nullish(),
        author: z.string().nullish(),
        role: z.string().nullish(),
        avatar: image().optional(),
        interests: list,
      }),
  }),
};
