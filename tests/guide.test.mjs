import test from 'node:test';import assert from 'node:assert/strict';import {initial} from '../public/core.mjs';import {assess,reply} from '../public/guide.mjs';
test('guide identifies missing plan and supplies',()=>{const s=initial();assert.equal(assess(s).planMissing.length,4);s.plan.contacts='Written down';assert.equal(assess(s).planMissing.length,3);});
test('bottle calculation proposes change without mutating inventory',()=>{const s=initial();s.quantities.water=18;const r=reply('I bought 6 bottles of 2 litres',s);assert.equal(r.proposal.amount,12);assert.equal(s.quantities.water,18);assert.match(r.text,/30 litres/);});
test('guide updates assessment from saved quantities',()=>{const s=initial();s.people=3;s.quantities.water=18;assert.match(reply('water coverage',s).text,/2.0 days/);});

test('have sets a total while bought adds stock',()=>{const s=initial();s.quantities.protein=6;const r=reply('I have 9 tins of protein',s);assert.equal(r.proposal.mode,'set');assert.equal(r.proposal.total,9);assert.equal(reply('I bought 3 tins of protein',s).proposal.total,9);assert.equal(s.quantities.protein,6);});
test('unknown questions do not pretend to be understood',()=>{assert.match(reply('Explain astrophysics',initial()).text,/haven’t understood/);});
