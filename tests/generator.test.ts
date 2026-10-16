import test from 'node:test';
import assert from 'node:assert/strict';
import { generateDeck } from '../lib/generator';
import { isDeck, templates } from '../lib/types';
const topics = ['Искусственный интеллект', 'Искусственный интеллект в образовании', 'Изменение климата', 'Исследование космоса', 'Стартап: проверка спроса', 'Фотосинтез', 'Методы обучения', 'История цивилизаций', 'Архитектура: свет и пространство'];
for (const template of templates) {
  test(`${template.name}: valid, deterministic decks for 5–12 slides`, () => {
    for (const topic of topics) for (let count = 5; count <= 12; count++) {
      const deck = generateDeck(topic, template.id, count);
      assert.equal(isDeck(deck), true);
      assert.equal(deck.slides.length, count);
      assert.equal(deck.slides[0].title, topic);
      assert.deepEqual(deck.slides, generateDeck(topic, template.id, count).slides);
      assert.equal(new Set(deck.slides.map(s => s.id)).size, count);
      if (count === 5) assert.equal(new Set(deck.slides.map(s => s.type)).size, 5);
    }
  });
}
test('topic profiles remain isolated across requests', () => {
  const before = generateDeck('Искусственный интеллект').slides;
  generateDeck('Искусственный интеллект в образовании');
  assert.deepEqual(before, generateDeck('Искусственный интеллект').slides);
  assert.notDeepEqual(before, generateDeck('Изменение климата').slides);
});
test('invalid inputs rejected', () => {
  assert.throws(() => generateDeck('  '));
  assert.throws(() => generateDeck('Биология', 'research', 99));
  assert.equal(isDeck({}), false);
});
