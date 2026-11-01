import test from 'node:test';
import assert from 'node:assert/strict';
import menu from '../src/data/menu.json' with { type: 'json' };
import { calculateTotal, createWhatsAppOrderUrl } from '../src/lib/cart.mjs';

test('el total usa precios del JSON y cantidades, no texto de IA', () => {
  const [first, second] = menu.items;
  assert.equal(calculateTotal(menu.items, { [first.id]: 2, [second.id]: 1 }), first.price * 2 + second.price);
});

test('rechaza cantidades negativas o fraccionarias', () => {
  const id = menu.items[0].id;
  assert.throws(() => calculateTotal(menu.items, { [id]: -1 }), RangeError);
  assert.throws(() => calculateTotal(menu.items, { [id]: 1.5 }), RangeError);
});

test('WhatsApp incluye platos y total, y requiere número válido', () => {
  const item = menu.items[0];
  const url = createWhatsAppOrderUrl(menu.items, { [item.id]: 2 }, '5493411234567', { type: 'takeaway', name: 'Alex' });
  assert.ok(url?.startsWith('https://wa.me/5493411234567?text='));
  const message = decodeURIComponent(new URL(url).searchParams.get('text'));
  assert.match(message, /2 x Provoleta al horno/);
  assert.match(message, /21\.000/);
  assert.match(message, /Para retirar/);
  assert.match(message, /Alex/);
  assert.equal(createWhatsAppOrderUrl(menu.items, { [item.id]: 1 }, ''), null);
  assert.equal(createWhatsAppOrderUrl(menu.items, {}, '5493411234567'), null);
});

test('pedido en el local identifica mesa y no permite modalidad incompleta', () => {
  const item = menu.items[0];
  const selected = { [item.id]: 1 };
  const url = createWhatsAppOrderUrl(menu.items, selected, '5493411234567', { type: 'table', table: '7' });
  const message = new URL(url).searchParams.get('text');
  assert.match(message, /En el local/);
  assert.match(message, /Mesa: 7/);
  assert.equal(createWhatsAppOrderUrl(menu.items, selected, '5493411234567', { type: 'table', table: '' }), null);
  assert.equal(createWhatsAppOrderUrl(menu.items, selected, '5493411234567', { type: 'takeaway', name: '' }), null);
});
