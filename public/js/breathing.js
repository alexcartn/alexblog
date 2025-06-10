document.addEventListener('DOMContentLoaded',function(){
  const startBtn=document.getElementById('start-breath');
  const soundToggle=document.getElementById('toggle-sound');
  const circle=document.getElementById('breathing-circle');
  const message=document.getElementById('breath-message');
  let running=false,ctx;
  function beep(freq){
    if(!soundToggle||!soundToggle.checked)return;
    if(!ctx)ctx=new(window.AudioContext||window.webkitAudioContext)();
    const osc=ctx.createOscillator();
    const gain=ctx.createGain();
    osc.frequency.value=freq;
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.2,ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime+0.15);
  }
  function start(){
    if(running)return;
    running=true;
    startBtn.disabled=true;
    let cycle=0,total=30;
    beep(330); // gong like tone
    function breathe(){
      if(cycle>=total){
        running=false;
        startBtn.disabled=false;
        message.textContent='Terminé';
        return;
      }
      message.textContent='Inspirez...';
      circle.classList.add('grow');
      beep(440);
      setTimeout(()=>{
        message.textContent='Expirez...';
        circle.classList.remove('grow');
        beep(440);
        cycle++;
        if(running)setTimeout(breathe,5000);
      },5000);
    }
    breathe();
  }
  startBtn&&startBtn.addEventListener('click',start);
});

