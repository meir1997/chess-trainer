/* Progressive Stockfish hints for the live game. */
(()=>{
  let hintMove=null,hintStep=0,hintBusy=false;
  const hintButton=document.createElement('button');
  hintButton.id='hint';
  hintButton.type='button';
  hintButton.textContent='רמז';
  document.getElementById('undo').after(hintButton);

  const clearHint=()=>{hintMove=null;hintStep=0};
  const syncHintButton=()=>{hintButton.disabled=hintBusy||reviewBusy||game.isGameOver()||(mode.value==='computer'&&game.turn()!==playerColor)};
  const normalRender=render;
  render=()=>{
    normalRender();
    syncHintButton();
    if(!hintMove)return;
    const from=hintMove.slice(0,2),to=hintMove.slice(2,4);
    const fromButton=[...board.children].find(b=>b.getAttribute('aria-label')?.startsWith(from));
    const toButton=[...board.children].find(b=>b.getAttribute('aria-label')?.startsWith(to));
    fromButton?.classList.add('hint-from');
    if(hintStep>1)toButton?.classList.add('hint-to');
  };
  const normalClickSquare=clickSquare;
  clickSquare=sq=>{if(hintMove){clearHint()}normalClickSquare(sq)};
  for(const id of ['reset','undo','flip'])document.getElementById(id).addEventListener('click',()=>{clearHint();render()});
  mode.addEventListener('change',()=>{clearHint();render()});

  async function bestMove(fen){
    await bootPlayer();
    if(playerPending)throw Error('busy');
    return new Promise((resolve,reject)=>{
      const timeout=setTimeout(()=>{if(playerPending){playerPending=null;reject(Error('timeout'))}},15000);
      playerPending={resolve:result=>{clearTimeout(timeout);resolve(result)}};
      playerWorker.postMessage('setoption name Skill Level value 20');
      playerWorker.postMessage('position fen '+fen);
      playerWorker.postMessage('go depth 16');
    });
  }

  hintButton.onclick=async()=>{
    if(hintBusy||reviewBusy||game.isGameOver()||(mode.value==='computer'&&game.turn()!==playerColor)){document.getElementById('status').textContent='הרמז זמין כשהתור שלך.';return}
    if(hintMove&&hintStep===1){hintStep=2;render();document.getElementById('status').textContent='רמז מלא: הכלי והמשבצת המסומנים יוצרים את המהלך המומלץ.';return}
    hintBusy=true;render();document.getElementById('status').textContent='Stockfish מחשב את המהלך הטוב ביותר…';let message='';
    try{
      const result=await bestMove(game.fen());
      if(!result.best||result.best==='(none)')throw Error('no move');
      hintMove=result.best;hintStep=1;selected=null;message='רמז: הכלי המסומן הוא הכלי שכדאי להזיז. לחץ שוב כדי לראות לאן.';
    }catch{
      message='לא הצלחתי לחשב רמז כרגע. נסה שוב בעוד רגע.';
    }finally{hintBusy=false;render();document.getElementById('status').textContent=message}
  };
  new MutationObserver(syncHintButton).observe(board,{childList:true});
  syncHintButton();
})();
