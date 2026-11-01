import test from 'node:test';
import assert from 'node:assert/strict';
import menu from '../src/data/menu.json' with { type: 'json' };
import { normalizeMenuReply } from '../src/lib/menu-reply.mjs';

test('solo devuelve IDs de platos existentes y elimina duplicados', () => {
  const id = menu.items[0].id;
  assert.deepEqual(normalizeMenuReply(JSON.stringify({ answer: 'Probá la provoleta.', suggestedItemIds: [id, 'plato-inventado', id] }), menu), {
    answer: 'Probá la provoleta.',
    suggestedItemIds: [id],
  });
});

test('rechaza respuestas sin texto o estructura válida', () => {
  assert.equal(normalizeMenuReply('{"suggestedItemIds":[]}', menu), null);
  assert.equal(normalizeMenuReply('no es JSON', menu), null);
});
