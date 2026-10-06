(()=>{
 const config={apiKey:'AIzaSyB2lHRJy8k6t3m1zSLry7Y96jQ5GgPpXLU',authDomain:'retzef-habit-tracker.firebaseapp.com',projectId:'retzef-habit-tracker',appId:'1:537414766473:web:901e4c3e3af34ac9bedb58'};
 const bar=document.createElement('div');bar.dir='rtl';bar.style.cssText='max-width:1152px;margin:0 auto 8px;padding:8px 24px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;font:14px system-ui;color:#eee';
 const status=document.createElement('span'),login=document.createElement('button'),restore=document.createElement('button');
 login.textContent='כניסה עם Google';restore.textContent='טעינת המשחק מהענן';restore.hidden=true;
 for(const button of [login,restore])button.style.cssText='background:#58753d;color:white;border:0;border-radius:7px;padding:8px 12px;cursor:pointer;min-height:36px';
 status.setAttribute('aria-live','polite');bar.append(login,status,restore);const header=document.querySelector('header');if(header)header.after(bar);else if(document.querySelector('aside')){document.querySelector('aside').prepend(bar);bar.style.padding='0';bar.style.marginBottom='16px'}else (document.querySelector('main')||document.body).prepend(bar);
 let auth,db,ref,stop,timer,cloud={},ready=false,applying=false,dirty=false,session=0,revision=0;
 const key='personal-puzzles-v1',gameKey='chess-cloud-game-v1';
 function read(k,fallback={}){try{return JSON.parse(localStorage.getItem(k))||fallback}catch{return fallback}}
 function local(){return {version:1,puzzles:read(key),game:read(gameKey)}}
 function message(t){status.textContent=t}
 function apply(data){applying=true;try{
  const p=ChessSyncCore.mergeProgress(read(key),data.puzzles);localStorage.setItem(key,JSON.stringify(p));window.chessApplyPuzzles?.(p);
  restore.hidden=true;if(data.game?.updatedAt>(read(gameKey).updatedAt||0)){cloud.game=data.game;restore.hidden=!window.chessRestoreGame;}
 }finally{applying=false}}
 function merge(a,b){return {version:1,puzzles:ChessSyncCore.mergeProgress(a.puzzles,b.puzzles),game:(a.game?.updatedAt||0)>(b.game?.updatedAt||0)?a.game||{}:b.game||{}}}
 async function push(){if(!ref||!ready||applying)return;const currentRef=ref,epoch=session,snapshot=local(),savedRevision=revision;message('שומר בענן…');try{
  const merged=await db.runTransaction(async tx=>{const doc=await tx.get(currentRef);const data=merge(doc.exists?doc.data():{},snapshot);tx.set(currentRef,data);return data});
  if(epoch!==session)return;dirty=revision!==savedRevision;apply(merged);message(dirty?'שומר שינויים נוספים…':'נשמר בענן ✓');if(dirty){clearTimeout(timer);timer=setTimeout(push,900)}
 }catch(e){dirty=true;message('השמירה בענן נכשלה; ההתקדמות שמורה במכשיר. '+e.code)}}
 window.chessSyncChanged=()=>{if(applying)return;dirty=true;revision++;clearTimeout(timer);timer=setTimeout(push,900)};
 restore.onclick=()=>{if(cloud.game){window.chessRestoreGame?.(cloud.game);localStorage.setItem(gameKey,JSON.stringify(cloud.game));restore.hidden=true;message('המשחק מהענן נטען')}};
 login.onclick=async()=>{if(!auth)return;try{if(auth.currentUser){if(dirty){await push();if(dirty)return}await auth.signOut()}else{await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())}}catch(e){message('הכניסה לא הושלמה: '+e.code)}};
 window.addEventListener('online',()=>{if(dirty)push()});window.addEventListener('offline',()=>message('אין חיבור — נשמר במכשיר ויסונכרן כשהחיבור יחזור'));
 async function boot(){message('טוען שירות סנכרון…');login.disabled=true;try{
  for(const part of ['app','auth','firestore'])await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://www.gstatic.com/firebasejs/10.12.0/firebase-'+part+'-compat.js';s.onload=resolve;s.onerror=reject;document.head.append(s)});
  const app=firebase.initializeApp(config,'chess-trainer');auth=app.auth();db=app.firestore();
  auth.onAuthStateChanged(async user=>{session++;const epoch=session;ready=false;stop?.();ref=null;restore.hidden=true;login.disabled=false;
   if(!user){login.textContent='כניסה עם Google';message('ההתקדמות נשמרת במכשיר. התחבר לסנכרון.');return}
   login.textContent='התנתק';message('מחבר את ההתקדמות של '+(user.displayName||'החשבון')+'…');
   const prior=localStorage.getItem('chess-sync-owner');
   if(prior&&prior!==user.uid){localStorage.setItem('chess-sync-cache-'+prior,JSON.stringify(local()));const cached=read('chess-sync-cache-'+user.uid);localStorage.setItem(key,JSON.stringify(cached.puzzles||{records:{},tier:0,streak:0}));localStorage.setItem(gameKey,JSON.stringify(cached.game||{}));window.chessApplyPuzzles?.(read(key));window.chessRestoreGame?.(cached.game||{pgn:'',color:'w',level:5});}
   localStorage.setItem('chess-sync-owner',user.uid);
   ref=db.doc('users/'+user.uid+'/data/chessTrainer');
   try{const doc=await ref.get({source:'server'});if(epoch!==session)return;cloud=doc.exists?doc.data():{};apply(cloud);ready=true;await push();
    stop=ref.onSnapshot({includeMetadataChanges:true},doc=>{if(epoch!==session||!doc.exists)return;cloud=doc.data();apply(cloud);if(!doc.metadata.hasPendingWrites&&!doc.metadata.fromCache&&!dirty)message('מסונכרן ✓ · '+(user.displayName||'Google'))},e=>message('סנכרון נכשל: '+e.code));
   }catch(e){message('לא ניתן לקרוא את הענן; ההתקדמות שמורה במכשיר. '+e.code)}
  });
 }catch{login.disabled=true;message('שירות הסנכרון לא נטען; ההתקדמות שמורה במכשיר')}}
 boot();
})();
