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
