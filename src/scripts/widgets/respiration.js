/* Guide de respiration pour la cohérence cardiaque (6 respirations par minute = 0,1 Hz).
   La courbe de fréquence cardiaque est illustrative : ce n'est pas une mesure. */
(() => {
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const mmss = (s) => { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  const W = 480, H = 150, ML = 40, MB = 20, WIN = 30, IDLE_R = 62;
  const AMP = { 6: 9, 12: 3.5 };

  // pic de fréquence cardiaque un peu après la fin de l'inspiration
  const hrAt = (t, T, A) => 68 + A * Math.sin(2 * Math.PI * ((t % T) / T - 0.30));
  const hy = (v) => (H - MB) - (v - 55) / 30 * (H - MB - 26);

  function mount(root) {
    const rate0 = Number(root.dataset.rythme) === 12 ? 12 : 6;
    const session = clamp(parseFloat(root.dataset.duree) || 5, 1, 30) * 60;
    root.innerHTML = `
      <div class="wgt-card">
        <div class="wgt-head"><span class="wgt-dot"></span><span class="wgt-name">Guide de respiration</span><span class="wgt-hint">Cohérence 365 : 3 fois par jour, 6 respirations par minute, 5 minutes</span></div>
        <div class="wgt-breath">
          <div class="wgt-pacer">
            <svg viewBox="0 0 200 200" aria-hidden="true">
              <circle class="ring" cx="100" cy="100" r="92"/>
              <circle class="prog" cx="100" cy="100" r="92" transform="rotate(-90 100 100)" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>
              <circle class="orb" cx="100" cy="100" r="${IDLE_R}"/>
            </svg>
            <div class="wgt-pacer-txt"><b data-r="word">Prêt</b><span data-r="sub"></span></div>
          </div>
          <div class="wgt-hr">
            <div class="wgt-hr-top">
              <button type="button" class="wgt-btn" data-r="go" aria-pressed="false">Démarrer</button>
              <div class="wgt-seg" role="group" aria-label="Rythme">
                <button type="button" data-rate="6" aria-pressed="false">6 / min</button>
                <button type="button" data-rate="12" aria-pressed="false">12 / min</button>
              </div>
              <div class="wgt-stat wgt-num"><div><b data-r="left"></b>restant</div><div><b data-r="cyc">0</b>cycles</div><div><b data-r="amp"></b>bpm</div></div>
            </div>
            <svg class="wgt-svg" data-r="trace" viewBox="0 0 ${W} ${H}" role="img" aria-label="Courbe illustrative de la fréquence cardiaque sur 30 secondes"></svg>
            <p class="wgt-fine">Courbe illustrative : ce n'est pas une mesure. Elle montre l'effet décrit dans l'article, le cœur accélère à l'inspiration et ralentit à l'expiration, avec une amplitude maximale autour de 6 respirations par minute.</p>
          </div>
        </div>
      </div>`;
    const $ = (k) => root.querySelector(`[data-r="${k}"]`);
    const orb = root.querySelector('.orb'), prog = root.querySelector('.prog'), go = $('go'), trace = $('trace');
    const B = { rate: rate0, running: false, t0: 0, elapsed: 0, raf: 0 };

    function drawTrace(now) {
      const T = 60 / B.rate, A = AMP[B.rate], tEnd = Math.max(now, WIN), tStart = tEnd - WIN;
      let d = '';
      for (let i = 0; i <= 150; i++) {
        const t = tStart + i / 150 * WIN, x = ML + i / 150 * (W - ML - 6);
        d += `${i ? 'L' : 'M'}${x.toFixed(1)},${hy(hrAt(t, T, A)).toFixed(1)}`;
      }
      let g = '';
      [60, 70, 80].forEach((v) => {
        g += `<line class="grid" x1="${ML}" x2="${W - 6}" y1="${hy(v)}" y2="${hy(v)}"/><text x="${ML - 6}" y="${hy(v) + 4}" text-anchor="end">${v}</text>`;
      });
      g += `<text x="${W - 6}" y="${H - 3}" text-anchor="end">30 dernières secondes</text><text x="${ML}" y="15">bpm</text>`;
      trace.innerHTML = g + `<path class="wgt-trace-line" d="${d}"/>`;
      $('amp').textContent = '±' + A;
    }

    function frame() {
      if (!B.running) return;
      const el = (performance.now() - B.t0) / 1000 + B.elapsed, T = 60 / B.rate;
      if (el >= session) { stop(true); return; }
      const ph = (el % T) / T, s = 0.5 - 0.5 * Math.cos(2 * Math.PI * ph);
      orb.setAttribute('r', reduce ? IDLE_R : 38 + s * 56);
      $('word').textContent = ph < 0.5 ? 'Inspire' : 'Expire';
      $('sub').textContent = Math.ceil((ph < 0.5 ? 0.5 - ph : 1 - ph) * T) + ' s';
      prog.setAttribute('stroke-dashoffset', 1 - (ph < 0.5 ? ph * 2 : (1 - ph) * 2));
      $('left').textContent = mmss(session - el);
      $('cyc').textContent = Math.floor(el / T);
      drawTrace(el);
      B.raf = requestAnimationFrame(frame);
    }
    function start() {
      B.running = true; B.t0 = performance.now();
      go.textContent = 'Pause'; go.setAttribute('aria-pressed', 'true');
      B.raf = requestAnimationFrame(frame);
    }
    function stop(done) {
      if (B.running) B.elapsed += (performance.now() - B.t0) / 1000;
      B.running = false; cancelAnimationFrame(B.raf);
      go.setAttribute('aria-pressed', 'false');
      go.textContent = done ? 'Recommencer' : 'Reprendre';
      if (done) {
        B.elapsed = 0; orb.setAttribute('r', IDLE_R); prog.setAttribute('stroke-dashoffset', 1);
        $('word').textContent = 'Bravo'; $('sub').textContent = 'séance terminée';
      }
    }
    function setRate(r) {
      B.rate = r; B.elapsed = 0; B.t0 = performance.now();
      root.querySelectorAll('[data-rate]').forEach((b) => b.setAttribute('aria-pressed', +b.dataset.rate === r));
      $('sub').textContent = B.running ? $('sub').textContent : r + ' par minute';
      if (!B.running) { $('left').textContent = mmss(session); $('cyc').textContent = '0'; drawTrace(0); }
    }
    go.addEventListener('click', () => (B.running ? stop(false) : start()));
    root.querySelectorAll('[data-rate]').forEach((b) => b.addEventListener('click', () => setRate(+b.dataset.rate)));
    setRate(rate0);
  }

  document.querySelectorAll('.wgt-respiration').forEach(mount);
})();
