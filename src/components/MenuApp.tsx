import { useState } from 'react';
import { ArrowRight, ChefHat, MapPin, Minus, Plus, ShoppingBag, Sparkles, X } from 'lucide-react';
import { useCart } from '../store/cart';
import { calculateTotal, formatPrice } from '../lib/cart.mjs';

type Category = { id: string; name: string };
type Item = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  ingredients: string[];
  price: number;
  image: string;
  featured: boolean;
};

export default function MenuApp({ items, categories }: { items: Item[]; categories: Category[] }) {
  const [activeCategory, setActiveCategory] = useState('todos');
  const [cartOpen, setCartOpen] = useState(false);
  const quantities = useCart((state) => state.quantities);
  const add = useCart((state) => state.add);
  const remove = useCart((state) => state.remove);
  const count = Object.values(quantities).reduce((sum, quantity) => sum + quantity, 0);
  const total = calculateTotal(items, quantities);
  const visibleItems = activeCategory === 'todos' ? items : items.filter((item) => item.categoryId === activeCategory);
  const selectedItems = items.filter((item) => quantities[item.id]);

  return <>
    <header className="site-header">
      <a className="brand" href="#inicio" aria-label="Il Caminneto, inicio"><span className="brand-mark">IC</span><span>IL CAMINNETO<small>CUCINA DI CASA</small></span></a>
      <nav className="desktop-nav" aria-label="Navegación principal"><a href="#carta">La carta</a><a href="#experiencia">Nuestra esencia</a></nav>
      <button className="header-cart" onClick={() => setCartOpen(true)} aria-label={`Abrir pedido, ${count} productos`}><ShoppingBag size={19}/><span>Mi pedido</span>{count > 0 && <b>{count}</b>}</button>
    </header>

    <main id="inicio">
      <section className="hero">
        <div className="hero-copy"><p className="eyebrow"><span className="eyebrow-line"/> PUEBLO ESTHER · SANTA FE</p><h1>La mesa está <em>servida.</em></h1><p className="hero-lead">Sabores que invitan a quedarse. Explorá nuestra carta, elegí lo que más te guste y armá tu pedido a tu ritmo.</p><div className="hero-actions"><a className="primary-button" href="#carta">Explorar la carta <ArrowRight size={18}/></a><a className="text-link" href="#experiencia">Conocé nuestra esencia</a></div><div className="hero-note"><span className="hero-note-icon"><Sparkles size={18}/></span><span>Pronto vas a poder pedir recomendaciones a nuestro mozo digital.</span></div></div>
        <div className="hero-visual"><img src="/images/menu/sorrentinos.png" alt="Sorrentinos de ricota y espinaca de la carta demostrativa"/><div className="hero-stamp"><ChefHat size={21}/><span>HECHO PARA<br/>DISFRUTAR</span></div><div className="hero-visual-caption">Un buen plato siempre cuenta una historia.</div></div>
      </section>

      <section className="intro-strip" id="experiencia"><span className="asterisk">✳</span><p>Un rincón para compartir, disfrutar y volver.</p><span className="intro-location"><MapPin size={15}/> Pueblo Esther, Santa Fe</span></section>

      <section className="menu-section" id="carta"><div className="section-heading"><div><p className="eyebrow">ELEGÍ TU PRÓXIMO FAVORITO</p><h2>Nuestra <em>carta</em></h2></div><p>De la cocina a tu mesa. Encontrá ese plato que hoy te está esperando.</p></div>
        <div className="category-list" role="group" aria-label="Filtrar por categoría"><button className={activeCategory === 'todos' ? 'active' : ''} onClick={() => setActiveCategory('todos')}>Todos</button>{categories.map((category) => <button key={category.id} className={activeCategory === category.id ? 'active' : ''} onClick={() => setActiveCategory(category.id)}>{category.name}</button>)}</div>
        <div className="menu-grid">{visibleItems.map((item) => <article className="dish-card" key={item.id}><div className="dish-image"><img src={item.image} alt={item.name} loading="lazy"/>{item.featured && <span className="dish-badge">Favorito de la casa</span>}</div><div className="dish-content"><div className="dish-title-row"><h3>{item.name}</h3><span>{formatPrice(item.price)}</span></div><p>{item.description}</p><button className="add-button" onClick={() => add(item.id)} aria-label={`Agregar ${item.name} al pedido`}><Plus size={17}/> Agregar al pedido</button></div></article>)}</div>
        <p className="demo-notice">Carta, imágenes y precios creados para esta demostración. Ingredientes, disponibilidad y precio final sujetos a confirmación del restaurante.</p>
      </section>
    </main>

    <footer className="site-footer"><span className="footer-brand">Il Caminneto</span><span>Hecho para compartir · Pueblo Esther, Santa Fe</span><a href="#inicio">Volver arriba ↑</a></footer>

    {count > 0 && !cartOpen && <button className="floating-cart" onClick={() => setCartOpen(true)}><ShoppingBag size={19}/><span>Ver mi pedido · {count} {count === 1 ? 'producto' : 'productos'}</span><strong>{formatPrice(total)}</strong></button>}

    {cartOpen && <div className="drawer-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setCartOpen(false); }}><aside className="cart-drawer" aria-label="Mi pedido"><div className="drawer-header"><div><p className="eyebrow">TU MESA, TU ELECCIÓN</p><h2>Mi pedido</h2></div><button className="icon-button" onClick={() => setCartOpen(false)} aria-label="Cerrar pedido"><X size={22}/></button></div>{selectedItems.length === 0 ? <div className="empty-cart"><ShoppingBag size={38}/><h3>Tu pedido está esperando</h3><p>Elegí algo rico de nuestra carta para empezar.</p><button className="primary-button" onClick={() => setCartOpen(false)}>Explorar la carta <ArrowRight size={17}/></button></div> : <><div className="cart-lines">{selectedItems.map((item) => <div className="cart-line" key={item.id}><img src={item.image} alt=""/><div><h3>{item.name}</h3><p>{formatPrice(item.price)}</p><div className="quantity-controls"><button onClick={() => remove(item.id)} aria-label={`Quitar uno de ${item.name}`}><Minus size={15}/></button><span>{quantities[item.id]}</span><button onClick={() => add(item.id)} aria-label={`Agregar uno de ${item.name}`}><Plus size={15}/></button></div></div><strong>{formatPrice(item.price * quantities[item.id])}</strong></div>)}</div><div className="cart-summary"><div><span>Total estimado</span><strong>{formatPrice(total)}</strong></div><p>Precios de demostración. La confirmación del pedido estará disponible próximamente.</p></div></>}</aside></div>}
  </>;
}
