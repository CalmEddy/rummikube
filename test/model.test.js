import {test} from 'node:test';
import assert from 'node:assert/strict';
import {total,statistics} from '../src/model.js';
const game=(scores,status='finished')=>({players:['a','b'],status,rounds:scores.map(([a,b])=>({scores:{a,b}}))});
test('signed rounds sum correctly and edits update totals',()=>{const g=game([[40,-40],[-15,15]]);assert.equal(total(g,'a'),25);g.rounds[0].scores.a=30;assert.equal(total(g,'a'),15);});
test('statistics aggregate completed sessions and exclude active sessions',()=>{const s={games:[game([[40,-40]]),game([[-10,10]]),game([[100,-100]],'active')]};assert.deepEqual(statistics(s,'a'),{played:2,wins:1,points:30,average:15,best:40});s.games[0].rounds[0].scores.a=-50;assert.equal(statistics(s,'a').wins,0);assert.equal(statistics(s,'a').points,-60);});
test('ties earn shared wins; players with no sessions have zero statistics',()=>{assert.equal(statistics({games:[game([[0,0]])]},'a').wins,1);assert.deepEqual(statistics({games:[]},'a'),{played:0,wins:0,points:0,average:0,best:0});});
