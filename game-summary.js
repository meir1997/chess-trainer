(()=>{
  let lastKey=null,epoch=0;
  const panel=document.createElement('section');panel.id='gameEndSummary';panel.hidden=true;
  panel.style.cssText='position:fixed;z-index:20;left:16px;bottom:16px;width:min(390px,calc(100vw - 32px));padding:16px;border:1px solid #7fa44d;border-radius:12px;background:#262421;box-shadow:0 8px 30px #0008;direction:rtl';
  panel.innerHTML='<button aria-label="סגור סיכום" style="float:left;background:none;border:0;color:white;font-size:20px">×</button><h2 style="margin:0 0 10px">סיכום המשחק שלך</h2><p aria-live="polite" id="endSummaryText"></p><small style="color:#b6b3aa">סיווג מקומי לפי ניתוח Stockfish; אינו ציון Chess.com.</small>';
  document.body.append(panel);panel.querySelector('button').onclick=()=>panel.hidden=true;
  async function summarize(moves,color,key){
    const token=++epoch;panel.hidden=false;const text=panel.querySelector('p');
    const worker=new Worker('engines/stockfish-19-lite-single.js');let pending=null;
    worker.onmessage=e=>{const line=String(e.data);if(line==='uciok'&&pending){pending.resolve();pending=null}else if(pending){const match=line.match(/score (cp|mate) (-?\d+)/);if(match&&!/upperbound|lowerbound/.test(line))pending.score=match[1]==='cp'?+match[2]:Math.sign(+match[2])*100000;if(line.startsWith('bestmove ')){const p=pending;pending=null;p.resolve({score:p.score||0,best:line.split(' ')[1]})}}};
    function command(fen){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('timeout')),20000);pending={resolve:v=>{clearTimeout(timer);resolve(v)},score:0};if(fen){worker.postMessage('position fen '+fen);worker.postMessage('go depth 12')}else worker.postMessage('uci')})}
    try{
      text.textContent='מנתח את המהלכים שלך…';await command();worker.postMessage('setoption name Skill Level value 20');const cache=new Map(),counts={good:0,inaccuracy:0,mistake:0,blunder:0};
      const score=async fen=>{if(!cache.has(fen))cache.set(fen,await command(fen));return cache.get(fen)};
      const own=moves.filter(m=>m.color===color);
      for(let i=0;i<own.length;i++){
        if(token!==epoch||game.pgn()!==key)return;
        text.textContent=`מנתח מהלך ${i+1} מתוך ${own.length}…`;const m=own[i],before=await score(m.before),pos=new Chess(m.after);const after=pos.isCheckmate()?{score:-100000}:pos.isDraw()?{score:0}:await score(m.after);
        const best=before.best===m.from+m.to+(m.promotion||'');const loss=best?0:Math.max(0,before.score+after.score);counts[loss>=200?'blunder':loss>=100?'mistake':loss>=50?'inaccuracy':'good']++;
      }
      if(token===epoch&&game.pgn()===key)text.textContent=`מתוך ${own.length} מהלכים: ${counts.good} טובים או מצוינים, ${counts.inaccuracy} אי־דיוקים, ${counts.mistake} שגיאות ו־${counts.blunder} שגיאות חמורות.`;
    }catch{if(token===epoch)text.textContent='הסיכום לא הושלם. ניתן לנסות דרך ניתוח המשחק.'}finally{worker.terminate()}
  }
  function check(){if(!game.isGameOver()){if(lastKey!==null){lastKey=null;epoch++;panel.hidden=true}return}const key=game.pgn();if(key===lastKey)return;lastKey=key;summarize(game.history({verbose:true}),playerColor,key)}
  new MutationObserver(check).observe(board,{childList:true});check();
})();
