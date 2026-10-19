/* Recherche Ctrl K (ou / ou le bouton de l'en-tête).
   L'index /search-index.json est chargé à la première ouverture, tout se passe dans le navigateur. */
(() => {
  const openers = document.querySelectorAll('[data-search-open]');
  if (!openers.length) return;
  const indexURL = openers[0].dataset.index;
  const MAX = 8;
  const norm = (s) => String(s || '').toLowerCase().replace(/œ/g, 'oe').replace(/æ/g, 'ae').normalize('NFD').replace(/[̀-ͯ]/g, '');

  let items = null, loading = null, failed = false;
  let root, input, list, sel = 0, shown = [], lastFocus = null;

  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || '');
  if (isMac) document.querySelectorAll('.site-search-kbd').forEach((k) => { k.textContent = '⌘ K'; });

  function load() {
    if (items) return Promise.resolve(items);
    if (!loading) {
      loading = fetch(indexURL)
        .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then((raw) => {
          items = raw.map((it) => ({ ...it, nt: norm(it.t), ns: norm(it.s), ng: norm(it.g.join(' ')), nx: norm(it.x) }));
          return items;
        })
        .catch((e) => { loading = null; throw e; });
    }
    return loading;
  }

  function recent() {
    return items.filter((it) => it.k !== 'Page').sort((a, b) => (a.d < b.d ? 1 : -1)).slice(0, 6).map((it) => ({ it }));
  }

  function search(q) {
    const toks = norm(q).split(/\s+/).filter(Boolean);
    if (!toks.length) return null;
    const out = [];
    for (const it of items) {
      let score = 0, onlyText = true, ok = true;
      for (const t of toks) {
        if (it.nt.includes(t)) { score += (' ' + it.nt).includes(' ' + t) ? 12 : 8; onlyText = false; }
        else if (it.ng.includes(t)) { score += 6; onlyText = false; }
        else if (it.ns.includes(t)) { score += 4; onlyText = false; }
        else if (it.nx.includes(t)) score += 1;
        else { ok = false; break; }
      }
      if (ok) out.push({ it, score: score + (it.nt.startsWith(toks[0]) ? 3 : 0), onlyText });
    }
    out.sort((a, b) => b.score - a.score || (a.it.d < b.it.d ? 1 : -1));
    return out.slice(0, MAX);
  }

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function mark() {
    const opts = list.querySelectorAll('.srch-opt');
    opts.forEach((o, i) => o.setAttribute('aria-selected', i === sel));
    const cur = opts[sel];
    if (cur) { input.setAttribute('aria-activedescendant', cur.id); cur.scrollIntoView({ block: 'nearest' }); }
    else input.removeAttribute('aria-activedescendant');
  }

  function render() {
    list.textContent = '';
    sel = 0;
    if (failed) { list.appendChild(el('li', 'srch-msg', 'La recherche est indisponible pour le moment. Réessaie plus tard.')).setAttribute('role', 'presentation'); shown = []; mark(); return; }
    if (!items) { list.appendChild(el('li', 'srch-msg', 'Chargement…')).setAttribute('role', 'presentation'); shown = []; mark(); return; }
    const q = input.value.trim();
    let res = search(q), head = '';
    if (res === null) { res = recent(); head = 'Articles et projets récents'; }
    shown = res;
    if (head) { const h = el('li', 'srch-head', head); h.setAttribute('role', 'presentation'); list.appendChild(h); }
    if (!res.length) {
      const m = el('li', 'srch-msg', 'Aucun résultat pour « ' + q + ' ». Essaie un mot plus court, par exemple « pacing », « cœur » ou « chaise ».');
      m.setAttribute('role', 'presentation'); list.appendChild(m); mark(); return;
    }
    res.forEach((r, i) => {
      const li = el('li', 'srch-opt'); li.id = 'srch-opt-' + i; li.setAttribute('role', 'option');
      const a = el('a'); a.href = r.it.u; a.tabIndex = -1;
      const main = el('span', 'srch-main');
      main.appendChild(el('span', 'srch-title', r.it.t));
      if (r.it.s) main.appendChild(el('span', 'srch-sub', r.it.s));
      if (r.onlyText) main.appendChild(el('span', 'srch-hint', 'trouvé dans le texte'));
      a.appendChild(el('span', 'srch-kind', r.it.k)); a.appendChild(main); li.appendChild(a);
      li.addEventListener('mousemove', () => { if (sel !== i) { sel = i; mark(); } });
      list.appendChild(li);
    });
    mark();
  }

  function ensure() {
    if (root) return;
    root = el('div', 'srch'); root.hidden = true; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'Recherche sur le site');
    const box = el('div', 'srch-box');
    const bar = el('div', 'srch-bar');
    bar.innerHTML = '<svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M11 11l3.5 3.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';
    input = el('input', 'srch-input');
    input.type = 'search'; input.placeholder = 'Rechercher un article, un projet…'; input.autocomplete = 'off'; input.spellcheck = false;
    input.setAttribute('role', 'combobox'); input.setAttribute('aria-expanded', 'true'); input.setAttribute('aria-controls', 'srch-list'); input.setAttribute('aria-autocomplete', 'list'); input.setAttribute('aria-label', 'Rechercher');
    const close = el('button', 'srch-close', 'Échap'); close.type = 'button'; close.setAttribute('aria-label', 'Fermer la recherche');
    bar.appendChild(input); bar.appendChild(close);
    list = el('ul', 'srch-list'); list.id = 'srch-list'; list.setAttribute('role', 'listbox'); list.setAttribute('aria-label', 'Résultats');
    const foot = el('p', 'srch-foot', '↑ ↓ pour naviguer · Entrée pour ouvrir · Échap pour fermer');
    box.appendChild(bar); box.appendChild(list); box.appendChild(foot); root.appendChild(box); document.body.appendChild(root);

    input.addEventListener('input', render);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); if (shown.length) { sel = (sel + 1) % shown.length; mark(); } }
      else if (e.key === 'ArrowUp') { e.preventDefault(); if (shown.length) { sel = (sel - 1 + shown.length) % shown.length; mark(); } }
      else if (e.key === 'Enter' && shown[sel]) { e.preventDefault(); window.location.assign(shown[sel].it.u); }
    });
    close.addEventListener('click', closeSearch);
    root.addEventListener('mousedown', (e) => { if (e.target === root) closeSearch(); });
    root.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const first = input, last = close;           // la tabulation reste dans la boîte
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  const isOpen = () => root && !root.hidden;
  function openSearch() {
    ensure();
    if (isOpen()) return;
    lastFocus = document.activeElement;
    root.hidden = false; document.documentElement.classList.add('srch-lock');
    input.value = ''; render(); input.focus();
    load().then(() => { failed = false; }, () => { failed = true; }).then(() => { if (isOpen()) render(); });
  }
  function closeSearch() {
    if (!isOpen()) return;
    root.hidden = true; document.documentElement.classList.remove('srch-lock');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  openers.forEach((b) => {
    b.addEventListener('click', openSearch);
    const warm = () => { load().catch(() => {}); };
    b.addEventListener('pointerenter', warm, { once: true });
    b.addEventListener('focus', warm, { once: true });
  });

  const typing = (t) => t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable);
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); isOpen() ? closeSearch() : openSearch(); }
    else if (e.key === 'Escape' && isOpen()) { e.preventDefault(); closeSearch(); }
    else if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey && !isOpen() && !typing(e.target)) { e.preventDefault(); openSearch(); }
  });
})();
