/* Réservoir W′ : simulateur du modèle Critical Power sur 12 minutes d'effort.
   Dépense au-dessus de CP (P - CP) en J/s, récupération en dessous de CP
   proportionnelle à (CP - P) * (W′ - W′bal) / W′ (forme différentielle de Skiba). */
(() => {
  const VW = 640, VH = 330, X0 = 48, X1 = VW - 14;
  const PY0 = 20, PY1 = 124, WY0 = 172, WY1 = 296, PMIN = 140, PMAX = 360, DUR = 720;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const fr = (n, d = 1) => n.toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });
  const mmss = (s) => { s = Math.round(s); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  const read = (el, key, def, min, max) => {
    const v = parseFloat(el.dataset[key]);
    return Number.isFinite(v) ? clamp(v, min, max) : def;
  };
  const px = (t) => X0 + t / DUR * (X1 - X0);
  const py = (p) => PY1 - (p - PMIN) / (PMAX - PMIN) * (PY1 - PY0);
  const wy = (v) => WY1 - v * (WY1 - WY0);

  function simulate(cp, wpKJ, p, d) {
    const Wp = wpKJ * 1000, pw = new Float32Array(DUR), bal = new Float32Array(DUR + 1);
    let w = Wp, empty = null;
    bal[0] = Wp;
    for (let t = 0; t < DUR; t++) {
      const pp = d === 0 ? p : (Math.floor(t / 60) % 2 === 0 ? p + d : p - d);
      pw[t] = pp;
      if (pp > cp) w -= pp - cp; else w += (cp - pp) * (Wp - w) / Wp;
      if (w <= 0) { w = 0; if (empty === null) empty = t + 1; }
      bal[t + 1] = w;
    }
    return { pw, bal, empty, Wp };
  }

  function mount(root) {
    const base = read(root, 'p', 255, 200, 290);
    const S = {
      cp: read(root, 'cp', 220, 180, 280),
      w: read(root, 'w', 27, 10, 40),
      p: base,
      d: read(root, 'd', 0, 0, 60),
    };
    root.innerHTML = `
      <div class="wgt-card">
        <div class="wgt-head"><span class="wgt-dot"></span><span class="wgt-name">Ton réservoir W′</span><span class="wgt-hint">12 minutes d'effort : bouge les curseurs</span></div>
        <div class="wgt-body">
          <div class="wgt-chart">
            <svg class="wgt-svg" viewBox="0 0 ${VW} ${VH}" role="img" tabindex="0"
                 aria-label="Courbes de puissance et de réservoir W prime sur 12 minutes. Flèches gauche et droite pour parcourir."></svg>
            <div class="wgt-tip" hidden></div>
          </div>
          <div class="wgt-panel">
            <label class="wgt-ctl"><span class="wgt-ctl-row"><span>CP</span><output class="wgt-num" data-o="cp"></output></span>
              <input type="range" min="180" max="280" step="5" data-k="cp"></label>
            <label class="wgt-ctl"><span class="wgt-ctl-row"><span>W′</span><output class="wgt-num" data-o="w"></output></span>
              <input type="range" min="10" max="40" step="0.5" data-k="w"></label>
            <label class="wgt-ctl"><span class="wgt-ctl-row"><span>Puissance moyenne visée</span><output class="wgt-num" data-o="p"></output></span>
              <input type="range" min="200" max="290" step="1" data-k="p"></label>
            <label class="wgt-ctl"><span class="wgt-ctl-row"><span>Alternance toutes les minutes</span><output class="wgt-num" data-o="d"></output></span>
              <input type="range" min="0" max="60" step="5" data-k="d"></label>
            <div class="wgt-chips" role="group" aria-label="Scénarios">
              <button type="button" class="wgt-chip" data-p="${base}" data-d="0" aria-pressed="false">Régulier</button>
              <button type="button" class="wgt-chip" data-p="${base}" data-d="40" aria-pressed="false">Alterné ±40 W</button>
              <button type="button" class="wgt-chip" data-p="${base + 10}" data-d="0" aria-pressed="false">Trop ambitieux</button>
            </div>
            <div class="wgt-result" aria-live="polite"><strong></strong><span></span><div class="wgt-tank"><i></i></div></div>
          </div>
        </div>
        <p class="wgt-note">Modèle W′bal de Skiba, version différentielle. Courbe indicative, pas une prédiction individuelle.</p>
      </div>`;

    const svg = root.querySelector('.wgt-svg'), tip = root.querySelector('.wgt-tip');
    const box = root.querySelector('.wgt-result');
    let R = null, cur = null;

    function hover(t) {
      t = clamp(Math.round(t), 0, DUR); cur = t;
      const g = svg.querySelector('.hov'); if (!g) return;
      g.removeAttribute('hidden');
      const x = px(t), p = R.pw[Math.min(t, DUR - 1)], b = R.bal[t];
      const line = g.querySelector('.cross'), dp = g.querySelector('.dp'), dw = g.querySelector('.dw');
      line.setAttribute('x1', x); line.setAttribute('x2', x);
      dp.setAttribute('cx', x); dp.setAttribute('cy', py(p));
      dw.setAttribute('cx', x); dw.setAttribute('cy', wy(b / R.Wp));
      tip.hidden = false;
      tip.innerHTML = `<b>${mmss(t)}</b> · ${Math.round(p)} W · reste <b>${fr(b / 1000)} kJ</b>`;
      const pct = x / VW * 100;
      if (pct > 62) { tip.style.left = 'auto'; tip.style.right = `calc(${100 - pct}% + 1rem)`; }
      else { tip.style.right = 'auto'; tip.style.left = `calc(${pct}% + 1.4rem)`; }
    }
    function clearHover() {
      cur = null; tip.hidden = true;
      const g = svg.querySelector('.hov'); if (g) g.setAttribute('hidden', '');
    }

    function draw() {
      R = simulate(S.cp, S.w, S.p, S.d);
      let s = '';
      [160, 240, 320].forEach((v) => {
        s += `<line class="grid" x1="${X0}" x2="${X1}" y1="${py(v)}" y2="${py(v)}"/><text x="${X0 - 8}" y="${py(v) + 4}" text-anchor="end">${v}</text>`;
      });
      s += `<text x="${X0}" y="12">Puissance (W)</text>`;
      s += `<line class="cp" x1="${X0}" x2="${X1}" y1="${py(S.cp)}" y2="${py(S.cp)}"/><text x="${X1 - 2}" y="${py(S.cp) + 15}" text-anchor="end">CP ${S.cp} W</text>`;
      // puissance : segments à valeur constante
      const segs = []; let t0 = 0;
      for (let t = 1; t <= DUR; t++) if (t === DUR || R.pw[t] !== R.pw[t0]) { segs.push([t0, t, R.pw[t0]]); t0 = t; }
      const pd = segs.map((g, i) => `${i ? 'L' : 'M'}${px(g[0])},${py(g[2])} L${px(g[1])},${py(g[2])}`).join(' ');
      s += `<path class="pline" d="${pd}"/>`;
      // réservoir
      s += `<text x="${X0}" y="${WY0 - 8}">Réservoir W′ (kJ)</text>`;
      [0, 0.5, 1].forEach((v) => {
        const val = S.w * v;
        s += `<line class="grid" x1="${X0}" x2="${X1}" y1="${wy(v)}" y2="${wy(v)}"/><text x="${X0 - 8}" y="${wy(v) + 4}" text-anchor="end">${Number.isInteger(val) ? val : fr(val, 1)}</text>`;
      });
      s += `<line class="redline" x1="${X0}" x2="${X1}" y1="${wy(0.2)}" y2="${wy(0.2)}"/><text class="redlbl" x="${X0 + 6}" y="${wy(0.2) - 5}">zone rouge sous 20 %</text>`;
      let line = '';
      for (let i = 0; i <= DUR; i += 2) line += `${i ? 'L' : 'M'}${px(i)},${wy(R.bal[i] / R.Wp)} `;
      s += `<path class="warea" d="${line}L${px(DUR)},${WY1} L${px(0)},${WY1} Z"/><path class="wline" d="${line}"/>`;
      for (let m = 0; m <= 12; m += 2) s += `<text x="${px(m * 60)}" y="${WY1 + 18}" text-anchor="middle">${m}</text>`;
      s += `<text x="${X1}" y="${WY1 + 32}" text-anchor="end">minutes</text>`;
      if (R.empty !== null) {
        const ex = px(R.empty), left = ex > 480;
        s += `<line class="empty" x1="${ex}" x2="${ex}" y1="${PY0}" y2="${WY1}"/><text class="emptylbl" x="${ex + (left ? -6 : 6)}" y="${WY0 + 16}" text-anchor="${left ? 'end' : 'start'}">vide à ${mmss(R.empty)}</text>`;
      }
      s += `<g class="hov" hidden><line class="cross" y1="${PY0}" y2="${WY1}"/><circle class="mark dp" r="5" fill="var(--wg-power)"/><circle class="mark dw" r="5" fill="var(--wg-accent)"/></g>`;
      s += `<rect class="hit" x="${X0}" y="0" width="${X1 - X0}" height="${WY1 + 4}" fill="transparent"/>`;
      svg.innerHTML = s;
      const hit = svg.querySelector('.hit');
      hit.addEventListener('pointermove', (e) => {
        const r = svg.getBoundingClientRect(), xv = (e.clientX - r.left) / r.width * VW;
        hover((xv - X0) / (X1 - X0) * DUR);
      });
      hit.addEventListener('pointerleave', clearHover);
      if (cur != null) hover(cur);
      result();
    }

    function result() {
      const strong = box.querySelector('strong'), sub = box.querySelector('span'), tank = box.querySelector('.wgt-tank i');
      let cls = '', pct;
      if (R.empty !== null) {
        cls = 'is-bad'; pct = 0;
        strong.textContent = '✕ Réservoir vide à ' + mmss(R.empty);
        sub.textContent = 'Il manque ' + mmss(DUR - R.empty) + ' pour finir les 12 minutes.';
      } else {
        const left = R.bal[DUR] / 1000; pct = left / S.w * 100;
        if (pct < 20) cls = 'is-warn';
        strong.textContent = (pct < 20 ? '! ' : '✓ ') + 'Tu finis avec ' + fr(left) + ' kJ';
        sub.textContent = fr(pct, 0) + ' % du réservoir à 12:00' + (S.d ? ', pour la même puissance moyenne.' : '.');
      }
      box.className = 'wgt-result ' + cls;
      tank.style.width = pct + '%';
      const out = (k, v) => { root.querySelector(`[data-o="${k}"]`).textContent = v; };
      out('cp', S.cp + ' W'); out('w', fr(S.w) + ' kJ'); out('p', S.p + ' W'); out('d', S.d ? '± ' + S.d + ' W' : 'aucune');
      root.querySelectorAll('.wgt-chip').forEach((c) => c.setAttribute('aria-pressed', +c.dataset.p === S.p && +c.dataset.d === S.d));
    }

    root.querySelectorAll('input[type=range]').forEach((inp) => {
      inp.value = S[inp.dataset.k];
      inp.addEventListener('input', () => { S[inp.dataset.k] = parseFloat(inp.value); draw(); });
    });
    root.querySelectorAll('.wgt-chip').forEach((c) => c.addEventListener('click', () => {
      S.p = +c.dataset.p; S.d = +c.dataset.d;
      root.querySelector('[data-k=p]').value = S.p; root.querySelector('[data-k=d]').value = S.d;
      draw();
    }));
    svg.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); hover((cur == null ? DUR / 2 : cur) + (e.key === 'ArrowRight' ? 15 : -15)); }
      else if (e.key === 'Escape') clearHover();
    });
    draw();
  }

  document.querySelectorAll('.wgt-wprime').forEach(mount);
})();
