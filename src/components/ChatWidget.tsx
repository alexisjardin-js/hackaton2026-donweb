import { useState, type FormEvent } from 'react';
import { ArrowUp, ChefHat, Sparkles } from 'lucide-react';

type Message = { role: 'visitor' | 'assistant'; text: string };
const suggestions = ['¿Qué me recomendás para cenar?', '¿Cuánto salen los sorrentinos?', '¿Qué lleva la pizza Margherita?'];

export default function ChatWidget({ mode }: { mode: 'table' | 'takeaway' | null }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: '¡Bienvenido a la mesa! Soy el mozo digital de Il Caminneto. Contame qué tenés ganas de comer y te ayudo a elegir de nuestra carta demo.' },
  ]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);

  async function send(text: string) {
    const message = text.trim();
    if (busy || message.length < 2) return;
    setMessages((current) => [...current, { role: 'visitor', text: message }]);
    setDraft('');
    setBusy(true);
    try {
      const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, mode }) });
      const result = await response.json();
      setMessages((current) => [...current, { role: 'assistant', text: result.answer ?? result.error ?? 'No pude responder ahora.' }]);
    } catch {
      setMessages((current) => [...current, { role: 'assistant', text: 'No pude conectarme. La carta y el carrito siguen disponibles.' }]);
    } finally { setBusy(false); }
  }

  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); void send(draft); }

  return <section className="mozo-section" id="mozo" aria-labelledby="mozo-title">
    <div className="mozo-copy"><p className="eyebrow"><Sparkles size={14}/> UNA AYUDA EN LA MESA</p><h2 id="mozo-title">¿No sabés <em>qué pedir?</em></h2><p>Preguntale a nuestro mozo digital por los platos de la carta. Te ayuda a encontrar algo rico, sin apurarte.</p><div className="mozo-signature"><span><ChefHat size={22}/></span><div><strong>El mozo digital</strong><small>Il Caminneto · siempre atento a la carta</small></div></div></div>
    <div className="chat-card"><div className="chat-top"><span className="chat-avatar"><ChefHat size={22}/></span><div><strong>Mozo digital</strong><small>Preguntame por la carta</small></div><span className="chat-status">EN LA MESA</span></div><div className="chat-messages" aria-live="polite">{messages.map((message, index) => <div key={index} className={`chat-message ${message.role}`}>{message.text}</div>)}{busy && <div className="chat-message assistant">Estoy mirando la carta…</div>}</div><div className="chat-suggestions">{suggestions.map((suggestion) => <button key={suggestion} onClick={() => void send(suggestion)} disabled={busy}>{suggestion}</button>)}</div><form className="chat-form" onSubmit={submit}><input aria-label="Tu consulta para el mozo digital" value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={500} placeholder="Preguntame por un plato…"/><button aria-label="Enviar consulta" disabled={busy || draft.trim().length < 2}><ArrowUp size={19}/></button></form><p className="chat-disclaimer">Carta demo. Alergias, disponibilidad y precio final requieren confirmación humana.</p></div>
  </section>;
}
