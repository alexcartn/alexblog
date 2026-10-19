(()=>{const e=480,t=120,s=(e,t,n)=>Math.max(t,Math.min(n,e)),n=(e,t,n,o,i)=>{const a=parseFloat(e.dataset[t]);return Number.isFinite(a)?s(a,o,i):n};function o(s){const o=n(s,"pause",2,1,10),c=n(s,"intervalle",60,20,120);s.innerHTML=`
      <div class="wgt-card">
        <div class="wgt-head"><span class="wgt-dot"></span><span class="wgt-name">Ta journée de 9 h à 17 h</span><span class="wgt-hint">${o} min de mouvement à chaque pause</span></div>
        <div class="wgt-body">
          <div class="wgt-sit">
            <div class="wgt-sit-rows"></div>
            <div class="wgt-legend"><span>Assis</span><span class="mv">Mouvement (${o} min)</span></div>
          </div>
          <div class="wgt-panel">
            <label class="wgt-ctl"><span class="wgt-ctl-row"><span>Une pause toutes les</span><output class="wgt-num"></output></span>
              <input type="range" min="20" max="120" step="10"></label>
            <div class="wgt-result" aria-live="polite"><strong></strong><span></span></div>
          </div>
        </div>
      </div>`;const l=s.querySelector(".wgt-sit-rows"),i=s.querySelector("input"),d=s.querySelector("output"),a=s.querySelector(".wgt-result");i.value=c;function r(){const r=+i.value,s=[];let n=0;for(;n<e;){const t=Math.min(n+r,e);if(s.push([n,t,!1]),n=t,n>=e)break;const i=Math.min(n+o,e);s.push([n,i,!0]),n=i}let u="";for(let n=0;n<e/t;n++){const o=n*t,i=o+t,a=s.filter(e=>e[2]).map(e=>{const n=Math.max(e[0],o),s=Math.min(e[1],i);return s>n?`<i style="left:${(n-o)/t*100}%;width:${(s-n)/t*100}%"></i>`:""}).join("");u+=`<div class="wgt-sit-row"><span class="wgt-num">${9+n*2} h</span><div class="wgt-sit-track">${a}</div></div>`}l.innerHTML=u;const h=s.filter(e=>e[2]),m=h.reduce((e,t)=>e+t[1]-t[0],0),f=Math.max(...s.filter(e=>!e[2]).map(e=>e[1]-e[0])),c=r<=30;a.querySelector("strong").textContent=(c?"✓ ":"! ")+"Plus long bloc assis : "+f+" min",a.querySelector("span").textContent=h.length+" pauses, "+m+" min de mouvement. "+(c?"Dans la règle citée dans l'article.":"La règle de l'article : 2 min toutes les 30 min."),a.className="wgt-result "+(c?"":"is-warn"),d.textContent=r+" min"}i.addEventListener("input",r),r()}document.querySelectorAll(".wgt-pauses").forEach(o)})()