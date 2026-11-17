export function validateSharedData(data) {
 const validId=id=>typeof id==='string'&&/^[a-zA-Z0-9_-]+$/.test(id);
 if(!data||!Array.isArray(data.players)||!Array.isArray(data.games))throw Error('Shared scorebook data is invalid.');
 const ids=new Set();
 for(const p of data.players){if(!p||!validId(p.id)||ids.has(p.id)||typeof p.name!=='string')throw Error('Shared player data is invalid.');ids.add(p.id);}
 const games=new Set();
 for(const g of data.games){
  if(!g||!validId(g.id)||games.has(g.id)||typeof g.title!=='string'||!['active','finished'].includes(g.status)||!Number.isFinite(Date.parse(g.created))||!Array.isArray(g.players)||g.players.length<2||new Set(g.players).size!==g.players.length||!g.players.every(id=>ids.has(id))||!Array.isArray(g.rounds))throw Error('Shared session data is invalid.');
  games.add(g.id);const rounds=new Set();
  for(const r of g.rounds){if(!r||!validId(r.id)||rounds.has(r.id)||!r.scores||!g.players.every(id=>Number.isSafeInteger(r.scores[id])))throw Error('Shared round data is invalid.');rounds.add(r.id);
   if(r.scoring && (!['normal','blocked'].includes(r.scoring.mode)||!g.players.includes(r.scoring.winner)||!r.scoring.racks||!g.players.every(id=>{const rack=r.scoring.racks[id];return rack&&Number.isSafeInteger(rack.tiles)&&rack.tiles>=0&&rack.tiles<=9999&&Number.isInteger(rack.jokers)&&rack.jokers>=0&&rack.jokers<=2;})))throw Error('Shared rack data is invalid.');
  }
 }
 return data;
}
export async function loadScorebook(client, id) {
 const {data,error}=await client.from('scorebooks').select('id,name,invite_code,data,revision').eq('id',id).single();
 if(error) throw error;
 validateSharedData(data.data);
 return data;
}
export async function saveScorebook(client,book,data) {
 validateSharedData(data);
 const result=await client.from('scorebooks').update({data,revision:book.revision+1}).eq('id',book.id).eq('revision',book.revision).select('id,name,invite_code,data,revision').maybeSingle();
 if(result.error) throw result.error;
 if(!result.data) throw Error('Another device changed this scorebook. Your edit was not saved. Refresh the shared scorebook and try again.');
 return result.data;
}
