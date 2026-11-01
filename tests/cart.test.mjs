import test from 'node:test';
import assert from 'node:assert/strict';
import menu from '../src/data/menu.json' with { type: 'json' };
import { calculateTotal } from '../src/lib/cart.mjs';

test('el total usa precios del JSON y cantidades, no texto de IA', () => {
  const [first, second] = menu.items;
  assert.equal(calculateTotal(menu.items, { [first.id]: 2, [second.id]: 1 }), first.price * 2 + second.price);
});

test('rechaza cantidades negativas o fraccionarias', () => {
  const id = menu.items[0].id;
  assert.throws(() => calculateTotal(menu.items, { [id]: -1 }), RangeError);
  assert.throws(() => calculateTotal(menu.items, { [id]: 1.5 }), RangeError);
});
