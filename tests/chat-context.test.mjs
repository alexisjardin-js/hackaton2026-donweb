import test from 'node:test';
import assert from 'node:assert/strict';
import menu from '../src/data/menu.json' with { type: 'json' };
import { createChatContext } from '../src/lib/chat-context.mjs';

test('arma contexto del pedido solo con productos y precios de la carta', () => {
  const first = menu.items[0];
  const context = createChatContext(menu, [{ role: 'user', content: '¿Qué me recomendás?' }], {
    [first.id]: 2,
    inventado: 3,
  }, '¿Y algo para acompañar?');

  assert.deepEqual(context.input, [
    { role: 'user', content: '¿Qué me recomendás?' },
    { role: 'user', content: '¿Y algo para acompañar?' },
  ]);
  assert.deepEqual(context.cart, [{ id: first.id, name: first.name, quantity: 2, unitPrice: first.price }]);
  assert.equal(context.total, first.price * 2);
});
