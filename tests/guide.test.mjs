import test from 'node:test';import assert from 'node:assert/strict';import {initial} from '../public/core.mjs';import {assess,reply} from '../public/guide.mjs';
test('guide identifies missing plan and supplies',()=>{const s=initial();assert.equal(assess(s).planMissing.length,4);s.plan.contacts='Written down';assert.equal(assess(s).planMissing.length,3);});
test('bottle calculation proposes change without mutating inventory',()=>{const s=initial();s.quantities.water=18;const r=reply('I bought 6 bottles of 2 litres',s);assert.equal(r.addWater,12);assert.equal(s.quantities.water,18);assert.match(r.text,/30 litres/);});
test('guide updates assessment from saved quantities',()=>{const s=initial();s.people=3;s.quantities.water=18;assert.match(reply('water coverage',s).text,/2.0 days/);});
