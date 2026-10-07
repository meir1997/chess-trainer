(()=>{
  const values={p:1,n:3,b:3,r:5,q:9,k:0},names={p:'רגלי',n:'פרש',b:'רץ',r:'צריח',q:'מלכה'};
  const section=document.createElement('section');section.id='capturedMaterial';section.setAttribute('aria-label','כלים שנאכלו ויתרון חומרי');
  section.innerHTML='<div class="captured-row"><span>לבן איבד</span><span id="capturedWhite" class="captured-pieces"></span></div><div class="captured-row"><span>שחור איבד</span><span id="capturedBlack" class="captured-pieces"></span></div><strong id="materialBalance" aria-live="polite"></strong>';
  board.after(section);
  const style=document.createElement('style');style.textContent=`#capturedMaterial{direction:rtl;background:#262421;border-radius:6px;padding:3px 7px;margin-top:3px;font-size:11px;min-height:55px}#capturedMaterial .captured-row{display:flex;align-items:center;gap:7px;min-height:18px}#capturedMaterial .captured-row>span:first-child{width:64px;flex-shrink:0}#capturedMaterial .captured-pieces{display:flex;flex-wrap:wrap;gap:1px;align-items:center}#capturedMaterial img{width:17px;height:17px;background:#eeeed2;border-radius:2px}#materialBalance{display:block;font-size:11px;color:#c7e39e}body main .game{width:min(100%,calc(100svh - 238px))}`;document.head.append(style);
  function capturesFor(pos){
    const history=game.history({verbose:true});if(pos===game)return history;
    const branch=pos.history({verbose:true}),base=branch[0]?.before||pos.fen();
    if(history[0]?.before===base)return branch;
    const i=history.findIndex(m=>m.after===base);if(i>=0)return history.slice(0,i+1).concat(branch);
    return branch;
  }
  function update(){const pos=reviewPosition||game,captured={w:[],b:[]};
    for(const move of capturesFor(pos))if(move.captured)captured[move.color==='w'?'b':'w'].push(move.captured);
    for(const color of ['w','b']){const target=document.getElementById(color==='w'?'capturedWhite':'capturedBlack');target.replaceChildren();captured[color].sort((a,b)=>values[b]-values[a]);for(const type of captured[color]){const img=document.createElement('img');img.src='pieces/'+color+type.toUpperCase()+'.svg';img.alt=names[type]+' '+(color==='w'?'לבן':'שחור');img.title=img.alt+' · '+values[type];target.append(img)}if(!captured[color].length)target.textContent='—'}
    let white=0,black=0;for(const piece of pos.board().flat().filter(Boolean)){if(piece.color==='w')white+=values[piece.type];else black+=values[piece.type]}
    const difference=white-black;document.getElementById('materialBalance').textContent=difference===0?'חומר שווה · 0':(difference>0?'לבן':'שחור')+' בפלוס '+Math.abs(difference)+' · יתרון חומרי';
    section.title='רגלי 1 · פרש 3 · רץ 3 · צריח 5 · מלכה 9. היתרון לפי הכלים שנותרו על הלוח, כולל הכתרות.';
  }
  const previous=render;render=()=>{previous();update()};update();
})();
