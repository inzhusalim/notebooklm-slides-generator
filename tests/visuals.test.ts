import test from 'node:test';
import assert from 'node:assert/strict';
import { compactDeck, TEXT_RATIO, VISUAL_RATIO, visualDomain, concise } from '../lib/visuals';
import { generateDeck } from '../lib/generator';
import { isDeck, isVisual } from '../lib/types';
test('visual layout contract and concise content', () => {
  assert.equal(VISUAL_RATIO, .6); assert.equal(TEXT_RATIO, .4);
  const deck=generateDeck('Искусственный интеллект в образовании');
  for(const s of deck.slides){ assert.ok(s.subtitle.length<=115); assert.ok(s.items.every(i=>i.title.length<=46&&i.body.length<=110)); assert.ok(s.notes); }
  assert.equal(concise('Короткое объяснение.',115),'Короткое объяснение.');
});
test('old saved decks get visual-first copy without losing their explanation', () => {
  const old=generateDeck('Космос');delete old.slides[0].notes;
  const long='Полное пояснение о наблюдениях и физических закономерностях. '.repeat(5);
  old.slides[0].subtitle=long;
  const migrated=compactDeck(old);
  assert.ok(migrated.slides[0].notes!.includes(long));
  assert.ok(migrated.slides[0].subtitle.length<=115);
  assert.equal(isDeck(migrated),true);
  assert.deepEqual(compactDeck(migrated),migrated);
});
test('atlas domains follow the topic', () => {
  assert.equal(visualDomain('Климат').id,'nature');assert.equal(visualDomain('Фотосинтез').id,'biology');
  assert.equal(visualDomain('Космос').id,'space');assert.equal(visualDomain('История').id,'history');
});
test('photos and quantitative charts are strictly validated', () => {
  assert.equal(isVisual({kind:'photo',image:'https://unknown.test/tracker.png'}),false);
  assert.equal(isVisual({kind:'photo',image:'data:image/jpeg;base64,YWJjZA=='}),true);
  assert.equal(isVisual({kind:'chart',chart:{labels:['A','B','C'],values:[0,0,0],source:'Измерения'}}),false);
  assert.equal(isVisual({kind:'chart',chart:{labels:['A','B','C'],values:[10,20,30],source:''}}),false);
  assert.equal(isVisual({kind:'chart',chart:{labels:['A','B','C'],values:[10,20,30],source:'Измерения, кг'}}),true);
  const deck=generateDeck('Климат');deck.slides[1].visual={kind:'chart',chart:{labels:['A','B','C'],values:[10,20,30],source:'Мои измерения, кг'}};
  assert.equal(isDeck(deck),true);assert.deepEqual(compactDeck(deck).slides[1].visual,deck.slides[1].visual);
});
