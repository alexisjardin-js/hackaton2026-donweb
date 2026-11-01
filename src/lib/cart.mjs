export const MAX_ITEM_QUANTITY = 20;

export function sanitizeCartQuantities(quantities, items) {
  if (!quantities || typeof quantities !== 'object' || Array.isArray(quantities)) return {};
  return Object.fromEntries(items.flatMap((item) => {
    const quantity = Object.hasOwn(quantities, item.id) ? quantities[item.id] : undefined;
    return Number.isInteger(quantity) && quantity >= 1 && quantity <= MAX_ITEM_QUANTITY
      ? [[item.id, quantity]]
      : [];
  }));
}

export function calculateTotal(items, quantities) {
  return items.reduce((total, item) => {
    const quantity = quantities[item.id] ?? 0;
    if (!Number.isInteger(quantity) || quantity < 0) {
      throw new RangeError(`Cantidad inválida para ${item.id}`);
    }
    return total + item.price * quantity;
  }, 0);
}

export function formatPrice(amount) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function createWhatsAppOrderUrl(items, quantities, phone, fulfillment) {
  if (!/^\d{8,15}$/.test(phone)) return null;
  const selected = items.filter((item) => (quantities[item.id] ?? 0) > 0);
  if (selected.length === 0) return null;
  let destination;
  if (fulfillment?.type === 'table' && /^[a-zA-Z0-9-]{1,10}$/.test(fulfillment.table?.trim() ?? '')) {
    destination = ['Modalidad: En el local', `Mesa: ${fulfillment.table.trim()}`];
  } else if (fulfillment?.type === 'takeaway' && /^[\p{L}\p{M} .'-]{2,60}$/u.test(fulfillment.name?.trim() ?? '')) {
    destination = ['Modalidad: Para retirar', `Nombre: ${fulfillment.name.trim()}`];
  } else return null;
  const lines = selected.map((item) => `${quantities[item.id]} x ${item.name} — ${formatPrice(item.price * quantities[item.id])}`);
  const message = [
    'Hola, quisiera consultar por este pedido de la carta demo de Il Caminneto:',
    '',
    ...destination,
    '',
    ...lines,
    '',
    `Total estimado: ${formatPrice(calculateTotal(items, quantities))}`,
    'Entiendo que los precios y la disponibilidad deben ser confirmados por el restaurante.',
  ].join('\n');
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
