(()=>{const c=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches,u=(e,t,n)=>Math.max(t,Math.min(n,e)),r=e=>(e=Math.max(0,Math.round(e)),Math.floor(e/60)+":"+String(e%60).padStart(2,"0")),n=480,s=150,e=40,a=20,o=30,i=62,l={6:9,12:3.5},d=(e,t,n)=>68+n*Math.sin(2*Math.PI*(e%t/t-.3)),t=e=>s-a-(e-55)/30*(s-a-26);function h(a){const y=Number(a.dataset.rythme)===12?12:6,p=u(parseFloat(a.dataset.duree)||5,1,30)*60;a.innerHTML=`
      <div class="wgt-card">
        <div class="wgt-head"><span class="wgt-dot"></span><span class="wgt-name">Guide de respiration</span><span class="wgt-hint">Cohérence 365 : 3 fois par jour, 6 respirations par minute, 5 minutes</span></div>
        <div class="wgt-breath">
          <div class="wgt-pacer">
            <svg viewBox="0 0 200 200" aria-hidden="true">
              <circle class="ring" cx="100" cy="100" r="92"/>
              <circle class="prog" cx="100" cy="100" r="92" transform="rotate(-90 100 100)" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>
              <circle class="orb" cx="100" cy="100" r="${i}"/>
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
            <svg class="wgt-svg" data-r="trace" viewBox="0 0 ${n} ${s}" role="img" aria-label="Courbe illustrative de la fréquence cardiaque sur 30 secondes"></svg>
            <p class="wgt-fine">Courbe illustrative : ce n'est pas une mesure. Elle montre l'effet décrit dans l'article, le cœur accélère à l'inspiration et ralentit à l'expiration, avec une amplitude maximale autour de 6 respirations par minute.</p>
          </div>
        </div>
      </div>`;const m=e=>a.querySelector(`[data-r="${e}"]`),b=a.querySelector(".orb"),v=a.querySelector(".prog"),f=m("go"),O=m("trace"),h={rate:y,running:!1,t0:0,elapsed:0,raf:0};function j(i){const u=60/h.rate,r=l[h.rate],f=Math.max(i,o),p=f-o;let c="";for(let s=0;s<=150;s++){const i=p+s/150*o,a=e+s/150*(n-e-6);c+=`${s?"L":"M"}${a.toFixed(1)},${t(d(i,u,r)).toFixed(1)}`}let a="";[60,70,80].forEach(s=>{a+=`<line class="grid" x1="${e}" x2="${n-6}" y1="${t(s)}" y2="${t(s)}"/><text x="${e-6}" y="${t(s)+4}" text-anchor="end">${s}</text>`}),a+=`<text x="${n-6}" y="${s-3}" text-anchor="end">30 dernières secondes</text><text x="${e}" y="15">bpm</text>`,O.innerHTML=a+`<path class="wgt-trace-line" d="${c}"/>`,m("amp").textContent="±"+r}function g(){if(!h.running)return;const t=(performance.now()-h.t0)/1e3+h.elapsed,n=60/h.rate;if(t>=p){_(!0);return}const e=t%n/n,s=.5-.5*Math.cos(2*Math.PI*e);b.setAttribute("r",c?i:38+s*56),m("word").textContent=e<.5?"Inspire":"Expire",m("sub").textContent=Math.ceil((e<.5?.5-e:1-e)*n)+" s",v.setAttribute("stroke-dashoffset",1-(e<.5?e*2:(1-e)*2)),m("left").textContent=r(p-t),m("cyc").textContent=Math.floor(t/n),j(t),h.raf=requestAnimationFrame(g)}function x(){h.running=!0,h.t0=performance.now(),f.textContent="Pause",f.setAttribute("aria-pressed","true"),h.raf=requestAnimationFrame(g)}function _(e){h.running&&(h.elapsed+=(performance.now()-h.t0)/1e3),h.running=!1,cancelAnimationFrame(h.raf),f.setAttribute("aria-pressed","false"),f.textContent=e?"Recommencer":"Reprendre",e&&(h.elapsed=0,b.setAttribute("r",i),v.setAttribute("stroke-dashoffset",1),m("word").textContent="Bravo",m("sub").textContent="séance terminée")}function w(e){h.rate=e,h.elapsed=0,h.t0=performance.now(),a.querySelectorAll("[data-rate]").forEach(t=>t.setAttribute("aria-pressed",+t.dataset.rate===e)),m("sub").textContent=h.running?m("sub").textContent:e+" par minute",h.running||(m("left").textContent=r(p),m("cyc").textContent="0",j(0))}f.addEventListener("click",()=>h.running?_(!1):x()),a.querySelectorAll("[data-rate]").forEach(e=>e.addEventListener("click",()=>w(+e.dataset.rate))),w(y)}document.querySelectorAll(".wgt-respiration").forEach(h)})()