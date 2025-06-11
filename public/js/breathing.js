document.addEventListener('DOMContentLoaded',()=>{
  const startBtn=document.getElementById('start-breath');
  const circle=document.getElementById('breathing-circle');
  const message=document.getElementById('breath-message');
  const timer=document.getElementById('breath-timer');
  let running=false;

  function updateTimer(sec){
    const m=Math.floor(sec/60).toString().padStart(2,'0');
    const s=(sec%60).toString().padStart(2,'0');
    if(timer)timer.textContent=`${m}:${s}`;
  }

  function start(){
    if(running)return;
    running=true;
    startBtn.disabled=true;
    let cycle=0,total=30,secondsLeft=300;
    updateTimer(secondsLeft);
    const interval=setInterval(()=>{
      secondsLeft--; 
      if(secondsLeft>=0)updateTimer(secondsLeft);
    },1000);

    function breathe(){
      if(cycle>=total){
        clearInterval(interval);
        running=false;
        startBtn.disabled=false;
        message.textContent='Terminé';
        return;
      }
      message.textContent='Inspirez...';
      circle.classList.add('grow');
      setTimeout(()=>{
        message.textContent='Expirez...';
        circle.classList.remove('grow');
        cycle++;
        if(running)setTimeout(breathe,5000);
      },5000);
    }
    breathe();
  }

  startBtn&&startBtn.addEventListener('click',start);
});

