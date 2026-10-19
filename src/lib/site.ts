export const SITE = {
  title: 'Alexandre Carton',
  url: 'https://alexandrecarton.netlify.app',
  description:
    "Blog technique et coaching par Alexandre Carton, ingénieur chef de projet. Découvrez des articles sur le CrossFit, la data science, le management et l'innovation industrielle.",
  author: 'Alexandre Carton',
  linkedin: 'https://www.linkedin.com/in/alexandre-carton-741146175/',
  logo: '/img/logosite.png',
  locale: 'fr_FR',
  nav: [
    { label: 'À propos', href: '/about/' },
    { label: 'Blog', href: '/blog/' },
    { label: 'Projets', href: '/project/' },
    { label: 'Coaching', href: '/coaching/' },
    { label: 'Contact', href: '/contact/' },
  ],
  footerLinks: [
    { label: 'Mentions légales', href: '/legal/' },
    { label: 'Confidentialité', href: '/privacy/' },
    { label: 'RSS', href: '/index.xml' },
  ],
} as const;
