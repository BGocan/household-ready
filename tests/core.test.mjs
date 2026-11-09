import test from 'node:test';import assert from 'node:assert/strict';import {initial,target,coverage,validate,activeItems} from '../public/core.mjs';
test('water scales by household and duration',()=>{const s={...initial(),people:3,days:3};assert.equal(target('water',s),27);s.quantities.water=18;assert.equal(coverage(s),2);});
test('unrelated supplies cannot increase drinking water coverage',()=>{const s=initial();s.quantities.bank=10000;assert.equal(coverage(s),0);});
test('family items only appear when selected',()=>{const s=initial();assert.equal(activeItems(s).length,8);s.children=true;s.pets=true;assert.equal(activeItems(s).length,10);});
test('restores household data and rejects unsafe quantities',()=>{const s=initial();s.people=3;s.plan.contacts='Test contact';assert.equal(validate(s).plan.contacts,'Test contact');for(const q of [-1,NaN,Infinity,'5']){s.quantities.water=q;assert.throws(()=>validate(s));}});
test('rejects unsupported versions and invalid household sizes',()=>{for(const v of [null,{}, {...initial(),people:0},{...initial(),people:1.5},{...initial(),days:15},{...initial(),version:2}])assert.throws(()=>validate(v));});
