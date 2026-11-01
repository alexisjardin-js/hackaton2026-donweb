import { useState } from 'react';
import { ArrowRight, ChefHat, MapPin, Minus, Plus, ShoppingBag, Sparkles, Store, UtensilsCrossed, X } from 'lucide-react';
import { useCart } from '../store/cart';
import { calculateTotal, createWhatsAppOrderUrl, formatPrice } from '../lib/cart.mjs';
import ChatWidget from './ChatWidget';

type Category = { id: string; name: string };
type ServiceMode = 'table' | 'takeaway' | null;
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

export default function MenuApp({ items, categories, whatsappNumber }: { items: Item[]; categories: Category[]; whatsappNumber: string }) {
  const [activeCategory, setActiveCategory] = useState('todos');
  const [cartOpen, setCartOpen] = useState(false);
  const [serviceMode, setServiceMode] = useState<ServiceMode>(null);
  const [tableNumber, setTableNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const quantities = useCart((state) => state.quantities);
  const add = useCart((state) => state.add);
  const remove = useCart((state) => state.remove);
  const count = Object.values(quantities).reduce((sum, quantity) => sum + quantity, 0);
  const total = calculateTotal(items, quantities);
  const visibleItems = activeCategory === 'todos' ? items : items.filter((item) => item.categoryId === activeCategory);
  const selectedItems = items.filter((item) => quantities[item.id]);
  const checkoutUrl = createWhatsAppOrderUrl(items, quantities, whatsappNumber, { type: serviceMode, table: tableNumber, name: customerName });

  return <>
    <header className="site-header">
      <a className="brand" href="#inicio" aria-label="Il Caminneto, inicio"><span className="brand-mark">IC</span><span>IL CAMINNETO<small>CUCINA DI CASA</small></span></a>
      <nav className="desktop-nav" aria-label="Navegación principal"><a href="#carta">La carta</a><a href="#experiencia">Nuestra esencia</a></nav>
      <button className="header-cart" onClick={() => setCartOpen(true)} aria-label={`Abrir pedido, ${count} productos`}><ShoppingBag size={19}/><span>Mi pedido</span>{count > 0 && <b>{count}</b>}</button>
    </header>

    <main id="inicio">
      <section className="service-section" id="pedido" aria-labelledby="service-title"><div className="service-heading"><p className="eyebrow">A TU MANERA</p><h2 id="service-title">¿Dónde lo vas a <em>disfrutar?</em></h2><p>Elegí cómo querés pedir. El mozo digital te acompaña tanto en una mesa como si pasás a retirar.</p></div><div className="service-options"><button className={`service-option ${serviceMode === 'table' ? 'selected' : ''}`} onClick={() => setServiceMode('table')} aria-pressed={serviceMode === 'table'}><span className="service-icon"><UtensilsCrossed size={26}/></span><strong>Estoy en el local</strong><small>Elegí desde tu mesa y prepará tu pedido.</small></button><button className={`service-option ${serviceMode === 'takeaway' ? 'selected' : ''}`} onClick={() => setServiceMode('takeaway')} aria-pressed={serviceMode === 'takeaway'}><span className="service-icon"><Store size={26}/></span><strong>Paso a retirar</strong><small>Pedí para llevar y coordiná el retiro.</small></button></div></section>
      <ChatWidget mode={serviceMode} items={items} />
      <section className="hero">
        <div className="hero-copy"><p className="eyebrow"><span className="eyebrow-line"/> PUEBLO ESTHER · SANTA FE</p><h1>La mesa está <em>servida.</em></h1><p className="hero-lead">Sabores que invitan a quedarse. Explorá nuestra carta, elegí lo que más te guste y armá tu pedido a tu ritmo.</p><div className="hero-actions"><a className="primary-button" href="#carta">Explorar la carta <ArrowRight size={18}/></a><a className="text-link" href="#mozo">Hablá con el mozo digital</a></div><div className="hero-note"><span className="hero-note-icon"><Sparkles size={18}/></span><span>¿No sabés qué pedir? Nuestro mozo digital te ayuda a elegir de la carta.</span></div></div>
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

    {cartOpen && <div className="drawer-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setCartOpen(false); }}><aside className="cart-drawer" aria-label="Mi pedido"><div className="drawer-header"><div><p className="eyebrow">TU MESA, TU ELECCIÓN</p><h2>Mi pedido</h2></div><button className="icon-button" onClick={() => setCartOpen(false)} aria-label="Cerrar pedido"><X size={22}/></button></div>{selectedItems.length === 0 ? <div className="empty-cart"><ShoppingBag size={38}/><h3>Tu pedido está esperando</h3><p>Elegí algo rico de nuestra carta para empezar.</p><button className="primary-button" onClick={() => setCartOpen(false)}>Explorar la carta <ArrowRight size={17}/></button></div> : <><div className="cart-lines">{selectedItems.map((item) => <div className="cart-line" key={item.id}><img src={item.image} alt=""/><div><h3>{item.name}</h3><p>{formatPrice(item.price)}</p><div className="quantity-controls"><button onClick={() => remove(item.id)} aria-label={`Quitar uno de ${item.name}`}><Minus size={15}/></button><span>{quantities[item.id]}</span><button onClick={() => add(item.id)} aria-label={`Agregar uno de ${item.name}`}><Plus size={15}/></button></div></div><strong>{formatPrice(item.price * quantities[item.id])}</strong></div>)}</div><div className="cart-summary"><div><span>Total estimado</span><strong>{formatPrice(total)}</strong></div><p>Precios de demostración. Disponibilidad y precio final sujetos a confirmación.</p>{!serviceMode ? <button className="checkout-choose" onClick={() => { setCartOpen(false); document.getElementById('pedido')?.scrollIntoView({ behavior: 'smooth' }); }}>Elegir cómo pedir</button> : <div className="checkout-detail"><label htmlFor="checkout-detail">{serviceMode === 'table' ? 'Número de mesa' : 'Nombre para el pedido'}</label><input id="checkout-detail" value={serviceMode === 'table' ? tableNumber : customerName} onChange={(event) => serviceMode === 'table' ? setTableNumber(event.target.value) : setCustomerName(event.target.value)} placeholder={serviceMode === 'table' ? 'Ej.: 7' : 'Ej.: Alex'} maxLength={serviceMode === 'table' ? 10 : 60}/></div>}{checkoutUrl ? <a className="checkout-button" href={checkoutUrl} target="_blank" rel="noopener noreferrer">Consultar pedido por WhatsApp <ArrowRight size={18}/></a> : <p className="checkout-unavailable">{!whatsappNumber ? 'El envío por WhatsApp todavía no está configurado.' : !serviceMode ? 'Elegí cómo querés pedir para continuar.' : 'Completá el dato del pedido para continuar.'}</p>}</div></>}</aside></div>}
  </>;
}
