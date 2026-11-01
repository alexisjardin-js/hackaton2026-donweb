# Reporte para el jurado — Mozo digital para restaurante

**Estado:** E2E local aprobado; entorno público pendiente de verificación.
**Demo pública:** pendiente  
**Repositorio:** https://github.com/alexisjardin-js/hackaton2026-donweb.git
**Restaurante de la demo:** Il Caminneto, Pueblo Esther, Santa Fe.

> La carta, los precios y las fotografías son material creado para esta demostración; no se presentan como menú oficial ni precios vigentes del restaurante.

## Resumen del proyecto

Un asistente web para restaurantes que ayuda tanto a quienes están sentados en una mesa como a quienes piden para retirar. Permite explorar la carta, resolver dudas relacionadas con el menú, elegir platos y preparar un pedido claro para su confirmación por WhatsApp. Busca reducir consultas repetitivas y oportunidades de venta perdidas por atención manual.

## Problema

La atención por teléfono y WhatsApp concentra preguntas frecuentes y pedidos en una persona. Cuando está ocupada, la respuesta puede demorarse y la venta puede perderse.

## Solución propuesta

- Carta digital basada en un archivo JSON versionado.
- Asistente de IA restringido a la información del restaurante y la carta.
- Recomendaciones relevantes para la decisión de compra, con contexto reciente de la charla y del carrito, sin inventar datos.
- Carrito persistente entre recargas, con opción de vaciarlo y total calculado de forma determinista.
- Modalidad explícita: mesa del local con número, o takeaway con nombre para el retiro.
- Pedido estructurado listo para enviar por WhatsApp y confirmar con una persona.

## Diferencial

La experiencia se presenta como un **mozo digital integrado a una carta con identidad gastronómica propia**, no como un chatbot genérico. El mozo recuerda el tramo reciente de la conversación y ve qué platos ya eligió el cliente para sugerir complementos; los nombres y precios salen del JSON del servidor. La IA facilita el descubrimiento; los datos del menú y la lógica de precios mantienen el pedido verificable.

## Recorrido de demo (actualizar con evidencia)

1. Abrir la carta desde la URL pública. **Estado:** interfaz implementada; despliegue y prueba pública pendientes.
2. Elegir modalidad y consultar por una recomendación basada en el menú. **Estado:** recorrido E2E local aprobado con respuesta real de OpenAI y sugerencias accionables.
3. Hacer una pregunta ajena al restaurante y observar el límite de respuesta. **Estado:** rechazo comprobado en E2E local.
4. Agregar un plato recomendado por el mozo, abrir el pedido desde el chat, cambiar cantidades, recargar, verificar que persiste y poder vaciarlo. **Estado:** recorrido E2E local aprobado en viewport móvil.
5. Preparar WhatsApp con el resumen del pedido. **Estado:** URL comprobada para mesa y retiro; no se envió un mensaje real.

## Decisiones técnicas

| Área | Decisión | Estado |
| --- | --- | --- |
| Framework | Astro SSR + componente React interactivo para carta y carrito | E2E local aprobado; despliegue pendiente de verificar |
| Estilos | Tailwind con paleta y diseño propios | Capturas móvil y desktop revisadas |
| Estado de interfaz | Zustand + `localStorage` para carrito; datos inválidos filtrados al restaurar | E2E local aprobado |
| Validación | Zod para consulta y salida estructurada, con IDs contrastados contra JSON | Implementado; pruebas unitarias aprobadas |
| Carta | `src/data/menu.json`: seis platos con precios de demo e imágenes generadas | Seis imágenes verificadas por HTTP y decodificación |
| Base de datos | No incluida en el MVP; no se almacenan pedidos en un panel | Propuesto |
| Proveedor de IA | OpenAI Responses API desde endpoint SSR; modelo GPT-6 Luna | Flujo local real aprobado; usuario reportó HTTP 503 en su entorno, pendiente diagnosticar |
| Despliegue | Servidor cloud de Donweb; configuración por verificar | Pendiente |

## Seguridad y límites explícitos

- Las claves se configuran como variables de entorno del servidor, nunca en el cliente ni en Git.
- El asistente no confirma disponibilidad, ingredientes o alérgenos que no estén documentados.
- Los precios de demostración deben identificarse como tales; no son precios reales verificados.
- El enlace de WhatsApp no equivale a una integración bidireccional ni a un pedido aceptado.
- El sistema no reemplaza la confirmación humana del restaurante.

## Resultados y evidencia

| Métrica o evidencia | Resultado |
| --- | --- |
| URL pública | Pendiente |
| Captura de carta | `docs/evidence/mobile-carta.png` y `docs/evidence/desktop-carta.png` |
| Consulta respondida con datos del menú | Aprobada en E2E local con respuesta real del modelo |
| Consulta fuera de alcance rechazada | Aprobada en E2E local |
| Consulta de celiaquía | El mozo no garantizó aptitud y derivó a confirmación humana |
| Pedido completo probado en móvil | Aprobado en Chrome headless emulando 390 px; `docs/evidence/mobile-pedido.png` |
| Tiempo de respuesta observado | Pendiente de medir |

**Advertencia de entrega:** el usuario reportó HTTP 503 del chat en su entorno. No presentar la IA como verificada en producción hasta identificar la respuesta de `/api/chat` y repetir allí la prueba. Un 503 emitido por el endpoint indica ausencia de `OPENAI_API_KEY` o `OPENAI_MODEL` en el proceso SSR; un 503 de Nginx requiere otro diagnóstico.

## Próximos pasos después de la hackatón

Si se valida el uso, evaluar panel de pedidos, persistencia, actualización de disponibilidad y una integración oficial de WhatsApp. Cada ampliación requeriría definir procesos operativos y responsabilidades del restaurante.
