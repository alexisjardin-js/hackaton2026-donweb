# Il Caminneto — informe para el jurado

- **Proyecto:** mozo digital para un restaurante de Pueblo Esther, Santa Fe.
- **Desafío:** reducir ventas perdidas por consultas y pedidos atendidos manualmente por WhatsApp o teléfono.
- **Repositorio:** https://github.com/alexisjardin-js/hackaton2026-donweb
- **Demo pública:** http://dwday-79759057.online/ (apertura HTTP 200 verificada; recorrido completo en producción aún no verificado).

## El problema

Cuando una persona del restaurante debe responder preguntas repetidas y tomar pedidos mientras atiende el local, cada conversación puede demorarse o quedar sin respuesta. El cliente necesita saber qué hay en la carta, elegir y dejar un pedido claro; el equipo necesita recibir menos consultas dispersas e incompletas.

## Nuestra solución

Construimos una sola web responsive con dos recorridos explícitos: **consumir en una mesa** o **pasar a retirar**. El cliente elige la modalidad al comienzo, consulta al mozo digital, suma platos sugeridos o explora la carta por su cuenta, revisa cantidades y total, y prepara un mensaje de WhatsApp con el pedido estructurado. El restaurante confirma el pedido, la disponibilidad y el precio final.

El mozo no es un chat decorativo: responde sobre la carta, recuerda el tramo reciente de la conversación, conoce los platos ya elegidos y propone complementos. Cada sugerencia aparece como una tarjeta que el cliente puede agregar al carrito con un toque. **La IA nunca agrega productos ni confirma un pedido por sí sola.**

## Cómo funciona

1. **Modalidad:** «Estoy en el local» o «Paso a retirar». La mesa o el nombre se solicitan recién al cerrar el pedido.
2. **Consulta:** el mozo responde preguntas sobre platos, ingredientes informados y recomendaciones. Si falta información —por ejemplo, seguridad para una persona celíaca— pide confirmación al restaurante.
3. **Elección:** las recomendaciones se vinculan a IDs reales de la carta JSON. El servidor descarta IDs inexistentes; el cliente decide qué agregar.
4. **Pedido:** el carrito permite cambiar cantidades, vaciarlo y recuperar los platos tras recargar la página. El total se calcula con código a partir de los precios del JSON, no con texto generado por IA.
5. **Salida:** un enlace `wa.me` abre un mensaje con modalidad, mesa o nombre, platos, cantidades y total estimado. El carrito se conserva al abrir WhatsApp; si el cliente confirma que envió el mensaje, puede iniciar otro pedido y vaciarlo. **Esto no equivale a un pedido recibido o aceptado automáticamente.**

## Decisiones técnicas

| Necesidad | Implementación |
| --- | --- |
| Web SSR y endpoint del mozo | Astro con adaptador Node standalone |
| Interacción | Componentes React y Zustand; carrito persistido en `localStorage` |
| Identidad visual | Diseño gastronómico propio con Tailwind, paleta crema/terracota/verde, Lucide e imágenes de platos |
| Validación | Zod para entradas; IDs de sugerencias contrastados contra la carta |
| Fuente de verdad | `src/data/menu.json` para platos y precios |
| IA | OpenAI Responses API desde el servidor, con respuestas estructuradas y contexto limitado al restaurante |
| Pedidos | Mensaje precompletado de WhatsApp y confirmación humana |

No agregamos base de datos, pagos ni una API de WhatsApp: no eran necesarios para demostrar el recorrido central en el tiempo de la hackatón.

## Qué verificamos

Un E2E local con Astro y Chrome comprobó el recorrido en viewport móvil de 390 px y desktop de 1366 px: carta e imágenes, favicon, respuesta real del mozo, sugerencias agregables, cantidades y total, recuperación y vaciado del carrito, enlaces de WhatsApp para ambas modalidades, rechazo de una pregunta ajena y derivación prudente de una consulta sobre celiaquía. También pasaron **10 pruebas unitarias**.

- [Carta móvil](docs/evidence/mobile-carta.png)
- [Carta desktop](docs/evidence/desktop-carta.png)
- [Pedido en móvil](docs/evidence/mobile-pedido.png)

**Alcance de la evidencia:** el E2E fue local y emuló un móvil; no prueba por sí solo el recorrido completo en producción, la recepción real del mensaje por WhatsApp ni resultados comerciales. La URL pública respondió HTTP 200, pero la interacción posterior al enlace de WhatsApp y la IA en producción no forman parte de ese E2E.

## Guion breve de demostración

1. Elegir «Paso a retirar» y pedirle al mozo una recomendación.
2. Agregar una sugerencia, revisar el carrito y mostrar que el total proviene de la carta.
3. Recargar para demostrar persistencia; completar el nombre y mostrar el mensaje listo para WhatsApp, sin enviarlo.
4. Preguntar por un tema ajeno y por celiaquía para mostrar los límites de la IA.

> **Aclaración:** carta, precios e imágenes fueron creados para esta demostración. No representan una oferta oficial ni precios vigentes de un restaurante real. Ingredientes, alérgenos, disponibilidad y precio final requieren confirmación humana.
