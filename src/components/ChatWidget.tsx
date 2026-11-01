import { useState, type FormEvent } from 'react';
import { ArrowUp, ChefHat, Plus, Sparkles } from 'lucide-react';
import { useCart } from '../store/cart';
import { formatPrice } from '../lib/cart.mjs';

type Item = { id: string; name: string; price: number; image: string };
type Message = { role: 'visitor' | 'assistant'; text: string; suggestedItemIds?: string[] };
const suggestions = ['¿Qué me recomendás para cenar?', '¿Qué puedo pedir para retirar?', '¿Qué lleva la pizza Margherita?'];

export default function ChatWidget({ mode, items }: { mode: 'table' | 'takeaway' | null; items: Item[] }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: '¡Bienvenido a Il Caminneto! Contame qué te gusta o cuánto querés gastar y te ayudo a armar un pedido con nuestra carta demo.' },
  ]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const add = useCart((state) => state.add);
  const quantities = useCart((state) => state.quantities);

  async function send(text: string) {
    const message = text.trim();
    if (busy || message.length < 2) return;
    setMessages((current) => [...current, { role: 'visitor', text: message }]);
    setDraft('');
    setBusy(true);
    try {
      const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, mode }) });
      const result = await response.json();
      const validIds = new Set(items.map((item) => item.id));
      const suggestedItemIds = Array.isArray(result.suggestedItemIds)
        ? result.suggestedItemIds.filter((id: unknown): id is string => typeof id === 'string' && validIds.has(id))
        : [];
      setMessages((current) => [...current, { role: 'assistant', text: result.answer ?? result.error ?? 'No pude responder ahora.', suggestedItemIds }]);
    } catch {
      setMessages((current) => [...current, { role: 'assistant', text: 'No pude conectarme. La carta y el carrito siguen disponibles.' }]);
    } finally { setBusy(false); }
  }

  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); void send(draft); }

  return <section className="mozo-section" id="mozo" aria-labelledby="mozo-title">
    <div className="mozo-copy"><p className="eyebrow"><Sparkles size={14}/> TU PEDIDO EMPIEZA ACÁ</p><h2 id="mozo-title">Contame qué te <em>tienta.</em></h2><p>El mozo digital te escucha, responde sobre la carta y te propone platos que podés sumar a tu pedido con un toque.</p><div className="mozo-signature"><span><ChefHat size={22}/></span><div><strong>El mozo digital</strong><small>Il Caminneto · siempre atento a la carta</small></div></div></div>
    <div className="chat-card"><div className="chat-top"><span className="chat-avatar"><ChefHat size={22}/></span><div><strong>Mozo digital</strong><small>Te ayudo a elegir y pedir</small></div><span className="chat-status">{mode === 'table' ? 'EN EL LOCAL' : mode === 'takeaway' ? 'PARA RETIRAR' : 'A TU SERVICIO'}</span></div><div className="chat-messages" aria-live="polite">{messages.map((message, index) => <div key={index} className={`chat-entry ${message.role}`}><div className={`chat-message ${message.role}`}>{message.text}</div>{message.suggestedItemIds?.map((id) => { const item = items.find((dish) => dish.id === id); return item ? <div className="suggested-dish" key={id}><img src={item.image} alt=""/><div><strong>{item.name}</strong><small>{formatPrice(item.price)}</small></div><button onClick={() => add(item.id)} aria-label={`Agregar ${item.name} al pedido`}><Plus size={15}/>{quantities[item.id] ? `Sumar otro (${quantities[item.id]})` : 'Agregar'}</button></div> : null; })}</div>)}{busy && <div className="chat-message assistant">Estoy mirando la carta…</div>}</div><div className="chat-suggestions">{suggestions.map((suggestion) => <button key={suggestion} onClick={() => void send(suggestion)} disabled={busy}>{suggestion}</button>)}</div><form className="chat-form" onSubmit={submit}><input aria-label="Tu consulta para el mozo digital" value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={500} placeholder="¿Qué te gustaría comer?"/><button aria-label="Enviar consulta" disabled={busy || draft.trim().length < 2}><ArrowUp size={19}/></button></form><p className="chat-disclaimer">Carta demo. Alergias, disponibilidad y precio final requieren confirmación humana.</p></div>
  </section>;
}
