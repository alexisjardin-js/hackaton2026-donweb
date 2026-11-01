import test from 'node:test';
import assert from 'node:assert/strict';
import menu from '../src/data/menu.json' with { type: 'json' };
import { isRestaurantQuestion } from '../src/lib/restaurant-scope.mjs';

test('admite consultas sobre la carta y recomendaciones generales', () => {
  assert.equal(isRestaurantQuestion('¿Cuánto salen los sorrentinos?', menu), true);
  assert.equal(isRestaurantQuestion('¿Qué me recomendás para cenar?', menu), true);
  assert.equal(isRestaurantQuestion('¿Puedo pasar a retirar?', menu), true);
  assert.equal(isRestaurantQuestion('¿Los sorrentinos son seguros para una persona celíaca?', menu), true);
});

test('rechaza temas ajenos al restaurante', () => {
  assert.equal(isRestaurantQuestion('Explicame programación en Python', menu), false);
  assert.equal(isRestaurantQuestion('¿Cómo estará el clima mañana?', menu), false);
});
