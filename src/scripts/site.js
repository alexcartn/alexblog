/* Comportements du site : liste filtrable et sommaire des articles. */

const norm = (s) => String(s || '').toLowerCase().replace(/œ/g, 'oe').replace(/æ/g, 'ae').normalize('NFD').replace(/[̀-ͯ]/g, '');

/* ---------- Liste filtrable ----------
   Les filtres vivent dans l'URL (?theme=Santé&type=Article&q=mot&live=1) pour pouvoir être partagés. */
function initExplorer(root) {
  const items = [...root.querySelectorAll('.item')].map((el) => ({ el, text: norm(el.dataset.search) }));
  const input = root.querySelector('[data-f-q]');
  const count = root.querySelector('[data-count]');
  const empty = root.querySelector('[data-empty]');
  const state = { q: '', kind: '', topic: '', live: false };

  const params = new URLSearchParams(location.search);
  state.q = params.get('q') || '';
  state.kind = params.get('type') || '';
  state.topic = params.get('theme') || '';
  state.live = params.get('live') === '1';
  if (input) input.value = state.q;

  const plural = (n) => `${n} contenu${n > 1 ? 's' : ''}`;

  function apply(updateUrl) {
    const tokens = norm(state.q).split(/\s+/).filter(Boolean);
    let shown = 0;
    for (const { el, text } of items) {
      const ok =
        (!state.kind || el.dataset.kind === state.kind) &&
        (!state.topic || el.dataset.topic === state.topic) &&
        (!state.live || el.dataset.live === '1') &&
        tokens.every((t) => text.includes(t));
      el.hidden = !ok;
      if (ok) shown++;
    }
    root.querySelectorAll('[data-f-kind]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.fKind === state.kind)));
    root.querySelectorAll('[data-f-topic]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.fTopic === state.topic)));
    const live = root.querySelector('[data-f-live]');
    if (live) live.setAttribute('aria-pressed', String(state.live));
    if (count) count.textContent = shown === items.length ? plural(shown) : `${shown} sur ${items.length}`;
    if (empty) empty.hidden = shown !== 0;
    if (updateUrl) {
      const p = new URLSearchParams();
      if (state.q) p.set('q', state.q);
      if (state.kind) p.set('type', state.kind);
      if (state.topic) p.set('theme', state.topic);
      if (state.live) p.set('live', '1');
      const qs = p.toString();
      try { history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash); } catch (e) { /* sans importance */ }
    }
  }

  input?.addEventListener('input', () => { state.q = input.value; apply(true); });
  root.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b || !root.contains(b)) return;
    if (b.hasAttribute('data-f-kind')) state.kind = b.dataset.fKind;
    else if (b.hasAttribute('data-f-topic')) state.topic = b.dataset.fTopic;
    else if (b.hasAttribute('data-f-live')) state.live = !state.live;
    else if (b.hasAttribute('data-f-reset')) { state.q = ''; state.kind = ''; state.topic = ''; state.live = false; if (input) input.value = ''; }
    else return;
    apply(true);
  });
  apply(false);
}

/* ---------- Sommaire : met en avant la section lue ---------- */
function initToc() {
  const links = [...document.querySelectorAll('.toc-side [data-toc] a')];
  if (!links.length || !('IntersectionObserver' in window)) return;
  const byId = new Map(links.map((a) => [decodeURIComponent(a.hash.slice(1)), a]));
  const heads = [...byId.keys()].map((id) => document.getElementById(id)).filter(Boolean);
  const visible = new Set();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => (en.isIntersecting ? visible.add(en.target) : visible.delete(en.target)));
    const current = heads.find((h) => visible.has(h));
    if (current) {
      links.forEach((a) => a.classList.toggle('active', a === byId.get(current.id)));
    }
  }, { rootMargin: '-80px 0px -65% 0px' });
  heads.forEach((h) => io.observe(h));
}

document.querySelectorAll('[data-explorer]').forEach(initExplorer);
initToc();
