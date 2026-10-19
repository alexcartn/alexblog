/* Journée de bureau de 9 h à 17 h : périodes assises et pauses de mouvement. */
(() => {
  const DAY = 480, ROW = 120;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const read = (el, key, def, min, max) => {
    const v = parseFloat(el.dataset[key]);
    return Number.isFinite(v) ? clamp(v, min, max) : def;
  };

  function mount(root) {
    const move = read(root, 'pause', 2, 1, 10);
    const start = read(root, 'intervalle', 60, 20, 120);
    root.innerHTML = `
      <div class="wgt-card">
        <div class="wgt-head"><span class="wgt-dot"></span><span class="wgt-name">Ta journée de 9 h à 17 h</span><span class="wgt-hint">${move} min de mouvement à chaque pause</span></div>
        <div class="wgt-body">
          <div class="wgt-sit">
            <div class="wgt-sit-rows"></div>
            <div class="wgt-legend"><span>Assis</span><span class="mv">Mouvement (${move} min)</span></div>
          </div>
          <div class="wgt-panel">
            <label class="wgt-ctl"><span class="wgt-ctl-row"><span>Une pause toutes les</span><output class="wgt-num"></output></span>
              <input type="range" min="20" max="120" step="10"></label>
            <div class="wgt-result" aria-live="polite"><strong></strong><span></span></div>
          </div>
        </div>
      </div>`;
    const rows = root.querySelector('.wgt-sit-rows'), inp = root.querySelector('input'), out = root.querySelector('output');
    const box = root.querySelector('.wgt-result');
    inp.value = start;

    function draw() {
      const every = +inp.value, segs = [];
      let t = 0;
      while (t < DAY) {
        const e = Math.min(t + every, DAY); segs.push([t, e, false]); t = e;
        if (t >= DAY) break;
        const b = Math.min(t + move, DAY); segs.push([t, b, true]); t = b;
      }
      let html = '';
      for (let r = 0; r < DAY / ROW; r++) {
        const a = r * ROW, z = a + ROW;
        const inner = segs.filter((g) => g[2]).map((g) => {
          const s0 = Math.max(g[0], a), s1 = Math.min(g[1], z);
          return s1 > s0 ? `<i style="left:${(s0 - a) / ROW * 100}%;width:${(s1 - s0) / ROW * 100}%"></i>` : '';
        }).join('');
        html += `<div class="wgt-sit-row"><span class="wgt-num">${9 + r * 2} h</span><div class="wgt-sit-track">${inner}</div></div>`;
      }
      rows.innerHTML = html;
      const moves = segs.filter((g) => g[2]);
      const total = moves.reduce((n, g) => n + g[1] - g[0], 0);
      const longest = Math.max(...segs.filter((g) => !g[2]).map((g) => g[1] - g[0]));
      const ok = every <= 30;
      box.querySelector('strong').textContent = (ok ? '✓ ' : '! ') + 'Plus long bloc assis : ' + longest + ' min';
      box.querySelector('span').textContent = moves.length + ' pauses, ' + total + ' min de mouvement. '
        + (ok ? 'Dans la règle citée dans l\'article.' : 'La règle de l\'article : 2 min toutes les 30 min.');
      box.className = 'wgt-result ' + (ok ? '' : 'is-warn');
      out.textContent = every + ' min';
    }
    inp.addEventListener('input', draw);
    draw();
  }

  document.querySelectorAll('.wgt-pauses').forEach(mount);
})();
