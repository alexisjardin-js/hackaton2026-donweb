function normalize(text) {
  return text.toLocaleLowerCase('es-AR').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function isRestaurantQuestion(question, menu) {
  const value = normalize(question);
  const terms = [
    'hola', 'buenas', 'recomend', 'suger', 'comer', 'cenar', 'almorz',
    'pedir', 'pedido', 'carta', 'menu', 'plato', 'comida', 'restaurant',
    'precio', 'cuanto sale', 'cuanto cuesta', 'ingrediente', 'alergen',
    'sin gluten', 'vegetarian', 'vegano', 'bebida', 'postre', 'entrada',
    'disponib', 'horario', 'delivery', 'retiro', 'mesa', 'reserva',
    normalize(menu.restaurant.name),
    ...menu.categories.map((category) => normalize(category.name)),
    ...menu.items.flatMap((item) => [normalize(item.name), ...item.ingredients.map(normalize)]),
  ];
  return terms.some((term) => value.includes(term));
}
