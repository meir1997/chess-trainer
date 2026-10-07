(()=>{
  let cursor=null;
  const bar=document.createElement('div');
  bar.id='historyNavigation';
  bar.style.cssText='display:flex;gap:6px;align-items:center;margin:7px 0;direction:ltr';
  bar.innerHTML='<button type="button" aria-label="צפייה במהלך קודם">←</button><span style="flex:1;text-align:center;font-size:11px" aria-live="polite"></span><button type="button" aria-label="צפייה במהלך הבא">→</button><button type="button" aria-label="חזרה לעמדה הנוכחית">⏵</button>';
  document.getElementById('history').before(bar);
  const [prev,next,live]=bar.querySelectorAll('button'),label=bar.querySelector('span');
  for(const button of [prev,next,live])button.style.cssText='border:0;border-radius:5px;background:#46433d;color:white;min-height:30px;min-width:30px;cursor:pointer';
  function update(){const moves=game.history({verbose:true});prev.disabled=reviewBusy||cursor===0||!moves.length;next.disabled=reviewBusy||cursor===null;live.disabled=reviewBusy||cursor===null;label.textContent=cursor===null?'עמדה נוכחית':cursor===0?'תחילת המשחק':`${cursor} / ${moves.length} · ${moves[cursor-1].san}`;if(cursor!==null){document.getElementById('status').textContent='צפייה בהיסטוריה · חזור לעמדה הנוכחית כדי לשחק';document.getElementById('hint').disabled=true;document.getElementById('reviewButton').disabled=true;board.querySelectorAll('.last,.hint-from,.hint-to,.selected,.possible').forEach(b=>b.classList.remove('last','hint-from','hint-to','selected','possible'));const move=moves[cursor-1];if(move)for(const b of board.children)if([move.from,move.to].some(s=>b.getAttribute('aria-label')?.startsWith(s)))b.classList.add('last')}}
  function view(index){if(reviewBusy)return;const moves=game.history({verbose:true});if(index>=moves.length){cursor=null;reviewPosition=null;selected=null;render();schedule();return}clearTimeout(timer);cursor=Math.max(0,index);reviewPosition=new Chess(cursor===0?moves[0].before:moves[cursor-1].after);selected=null;render()}
  prev.onclick=()=>view((cursor??game.history().length)-1);
  next.onclick=()=>view((cursor??game.history().length)+1);
  live.onclick=()=>view(game.history().length);
  const originalRender=render;render=()=>{if(cursor!==null){const moves=game.history({verbose:true});if(cursor>moves.length){cursor=null;reviewPosition=null}}originalRender();update()};
  for(const id of ['reset','undo','mode'])document.getElementById(id).addEventListener(id==='mode'?'change':'click',()=>{cursor=null;reviewPosition=null;render();schedule()});
  document.addEventListener('keydown',event=>{if(event.target.closest('input,select,textarea')||reviewBusy)return;if(event.key==='ArrowLeft'){event.preventDefault();prev.click()}else if(event.key==='ArrowRight'){event.preventDefault();next.click()}});
  update();
})();
