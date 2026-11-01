# Reporte para el jurado — Mozo digital para restaurante

**Estado:** borrador vivo; completar únicamente con funcionalidades verificadas.  
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
- Carrito y total calculados de forma determinista.
- Modalidad explícita: mesa del local con número, o takeaway con nombre para el retiro.
- Pedido estructurado listo para enviar por WhatsApp y confirmar con una persona.

## Diferencial

La experiencia se presenta como un **mozo digital integrado a una carta con identidad gastronómica propia**, no como un chatbot genérico. El mozo recuerda el tramo reciente de la conversación y ve qué platos ya eligió el cliente para sugerir complementos; los nombres y precios salen del JSON del servidor. La IA facilita el descubrimiento; los datos del menú y la lógica de precios mantienen el pedido verificable.

## Recorrido de demo (actualizar con evidencia)

1. Abrir la carta desde la URL pública. **Estado:** interfaz implementada; despliegue y prueba pública pendientes.
2. Elegir modalidad y consultar por una recomendación basada en el menú. **Estado:** selector al inicio, chat habilitado después de elegir, preguntas rápidas adaptadas a la modalidad y sugerencias accionables implementadas; recorrido en navegador pendiente.
3. Hacer una pregunta ajena al restaurante y observar el límite de respuesta. **Estado:** guardia local probada; comportamiento del modelo real pendiente.
4. Agregar un plato recomendado por el mozo, abrir el pedido desde el chat, cambiar cantidades y verificar el total. **Estado:** validación de IDs y cálculo probados de forma unitaria; interacción en navegador pendiente.
5. Abrir WhatsApp con el resumen del pedido. **Estado:** enlace implementado y probado de forma unitaria; número local configurado, apertura real pendiente.

## Decisiones técnicas

| Área | Decisión | Estado |
| --- | --- | --- |
| Framework | Astro SSR + componente React interactivo para carta y carrito | Implementado; despliegue pendiente |
| Estilos | Tailwind con paleta y diseño propios | Implementado; revisión visual pendiente |
| Estado de interfaz | Zustand para carrito | Implementado |
| Validación | Zod para consulta y salida estructurada, con IDs contrastados contra JSON | Implementado; pruebas unitarias aprobadas |
| Carta | `src/data/menu.json`: seis platos con precios de demo e imágenes generadas | Interfaz implementada; revisión visual pendiente |
| Base de datos | No incluida en el MVP; no se almacenan pedidos en un panel | Propuesto |
| Proveedor de IA | OpenAI Responses API desde endpoint SSR; modelo GPT-6 Luna | Clave/modelo locales configurados; prueba mínima de API aprobada; flujo completo pendiente |
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
| Captura de carta | Pendiente |
| Consulta respondida con datos del menú | Pendiente |
| Consulta fuera de alcance rechazada | Pendiente |
| Pedido completo probado en móvil | Pendiente |
| Tiempo de respuesta observado | Pendiente de medir |

## Próximos pasos después de la hackatón

Si se valida el uso, evaluar panel de pedidos, persistencia, actualización de disponibilidad y una integración oficial de WhatsApp. Cada ampliación requeriría definir procesos operativos y responsabilidades del restaurante.
