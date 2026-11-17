import {test} from 'node:test';
import assert from 'node:assert/strict';
import {total,statistics} from '../src/model.js';
const game=(scores,status='finished')=>({players:['a','b'],status,rounds:scores.map(([a,b])=>({scores:{a,b}}))});
test('signed rounds sum correctly and edits update totals',()=>{const g=game([[40,-40],[-15,15]]);assert.equal(total(g,'a'),25);g.rounds[0].scores.a=30;assert.equal(total(g,'a'),15);});
test('statistics aggregate completed sessions and exclude active sessions',()=>{const s={games:[game([[40,-40]]),game([[-10,10]]),game([[100,-100]],'active')]};assert.deepEqual(statistics(s,'a'),{played:2,wins:1,points:30,average:15,best:40});s.games[0].rounds[0].scores.a=-50;assert.equal(statistics(s,'a').wins,0);assert.equal(statistics(s,'a').points,-60);});
test('ties earn shared wins; players with no sessions have zero statistics',()=>{assert.equal(statistics({games:[game([[0,0]])]},'a').wins,1);assert.deepEqual(statistics({games:[]},'a'),{played:0,wins:0,points:0,average:0,best:0});});

import {calculateRound} from '../src/model.js';
const ids=['a','b','c'];
const racks=(a,b,c)=>Object.fromEntries(ids.map((id,i)=>[id,{tiles:[a,b,c][i],jokers:0}]));
test('winner receives all opponents rack points including 30 per joker',()=>{const r=racks(0,12,8);r.c.jokers=1;assert.deepEqual(calculateRound(ids,r,'a').scores,{a:50,b:-12,c:-38});});
test('blocked game awards differences from the lowest rack',()=>{assert.deepEqual(calculateRound(ids,racks(5,12,20),null,true),{winner:'a',scores:{a:22,b:-7,c:-15}});});
test('invalid racks, nonempty winner and tied blocked racks are rejected',()=>{assert.throws(()=>calculateRound(ids,racks(1,2,3),'a'),/empty rack/);assert.throws(()=>calculateRound(ids,racks(0,-1,4),'a'),/nonnegative/);assert.throws(()=>calculateRound(ids,racks(5,5,10),null,true),/tied/);assert.throws(()=>calculateRound(ids,racks(0,2.5,3),'a'),/whole/);});
test('editing recalculates winner and downstream lifetime statistics',()=>{const g={players:ids,status:'finished',rounds:[calculateRound(ids,racks(0,12,8),'a')]};g.rounds[0]=calculateRound(ids,racks(0,2,3),'a');assert.equal(total(g,'a'),5);assert.equal(statistics({games:[g]},'a').points,5);assert.equal(Object.values(g.rounds[0].scores).reduce((a,b)=>a+b),0);});
