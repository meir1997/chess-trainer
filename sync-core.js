/* Merge completed puzzles without losing achievements from another device.
   Historical error/reveal counters use maxima, not sums across devices. */
(function(root){
 function mergeProgress(a={},b={}){
  const result={tier:0,streak:0,errorStreak:0,...(a.updatedAt>b.updatedAt?a:b),records:{}};
  for(const id of new Set([...Object.keys(a.records||{}),...Object.keys(b.records||{})])){
   const x=a.records?.[id]||{},y=b.records?.[id]||{};
   result.records[id]={...x,...y};
   for(const key of ['attempted','solved','clean'])if(x[key]!==undefined||y[key]!==undefined)result.records[id][key]=!!(x[key]||y[key]);
   if(x.firstClean!==undefined||y.firstClean!==undefined)result.records[id].firstClean=x.firstClean!==false&&y.firstClean!==false;
   for(const key of ['wrong','revealed','lastSolved'])result.records[id][key]=Math.max(x[key]||0,y[key]||0);
  }
  result.updatedAt=Math.max(a.updatedAt||0,b.updatedAt||0);return result;
 }
 const api={mergeProgress};if(typeof module!=='undefined')module.exports=api;else root.ChessSyncCore=api;
})(typeof window==='undefined'?{}:window);
