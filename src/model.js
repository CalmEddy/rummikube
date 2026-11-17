export const uid = () => crypto.randomUUID();
export const total = (game, id) => game.rounds.reduce((sum, r) => sum + (Number(r.scores[id]) || 0), 0);
export function statistics(state, id) {
 const games = state.games.filter(g => g.status === 'finished' && g.players.includes(id));
 const points = games.reduce((s,g) => s + total(g,id),0);
 const wins = games.filter(g => g.rounds.length && total(g,id) === Math.max(...g.players.map(p => total(g,p)))).length;
 return {played:games.length, wins, points, average:games.length ? Math.round(points/games.length) : 0, best:games.length ? Math.max(...games.map(g=>total(g,id))) : 0};
}

// Standard Rummikub: rack jokers are worth 30; all round scores sum to zero.
export function calculateRound(players, racks, winner, blocked = false) {
 if (players.length < 2 || new Set(players).size !== players.length) throw Error('Choose at least two distinct players.');
 const values = Object.fromEntries(players.map(id => {
  const rack = racks[id];
  if (!rack || !Number.isSafeInteger(rack.tiles) || rack.tiles < 0 || rack.tiles > 9999 || !Number.isInteger(rack.jokers) || rack.jokers < 0 || rack.jokers > 2) throw Error('Enter nonnegative whole tile totals and 0–2 jokers.');
  return [id, rack.tiles + 30 * rack.jokers];
 }));
 if (players.reduce((s,id)=>s+racks[id].jokers,0)>2) throw Error('A standard set has only two jokers.');
 if (blocked) {
  const low = Math.min(...Object.values(values));
  const leaders = players.filter(id => values[id] === low);
  if (leaders.length !== 1) throw Error('Blocked game has tied lowest racks. Resolve the tie using your house rules and use manual scores.');
  winner = leaders[0];
 } else if (!players.includes(winner)) throw Error('Select the player who went out.');
 if (!blocked && values[winner] !== 0) throw Error('The player who went out must have an empty rack.');
 const baseline = blocked ? values[winner] : 0;
 const scores = Object.fromEntries(players.map(id => [id, id === winner ? 0 : -(values[id] - baseline)]));
 scores[winner] = -Object.values(scores).reduce((s,n)=>s+n,0);
 return {scores, winner};
}
