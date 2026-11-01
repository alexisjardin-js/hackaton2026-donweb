export function createChatContext(menu, history, quantities, message) {
  const cart = menu.items.flatMap((item) => {
    const quantity = quantities[item.id];
    return quantity ? [{ id: item.id, name: item.name, quantity, unitPrice: item.price }] : [];
  });

  return {
    input: [...history, { role: 'user', content: message }],
    cart,
    total: cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
  };
}
