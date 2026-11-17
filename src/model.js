export const uid = () => crypto.randomUUID();
export const total = (game, id) => game.rounds.reduce((sum, r) => sum + (Number(r.scores[id]) || 0), 0);
export function statistics(state, id) {
 const games = state.games.filter(g => g.status === 'finished' && g.players.includes(id));
 const points = games.reduce((s,g) => s + total(g,id),0);
 const wins = games.filter(g => g.rounds.length && total(g,id) === Math.max(...g.players.map(p => total(g,p)))).length;
 return {played:games.length, wins, points, average:games.length ? Math.round(points/games.length) : 0, best:games.length ? Math.max(...games.map(g=>total(g,id))) : 0};
}
