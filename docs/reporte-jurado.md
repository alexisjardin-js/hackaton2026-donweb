# Reporte para el jurado — Mozo digital para restaurante

**Estado:** borrador vivo; completar únicamente con funcionalidades verificadas.  
**Demo pública:** pendiente  
**Repositorio:** https://github.com/alexisjardin-js/hackaton2026-donweb.git
**Restaurante de la demo:** Il Caminneto, Pueblo Esther, Santa Fe.

> La carta, los precios y las fotografías son material creado para esta demostración; no se presentan como menú oficial ni precios vigentes del restaurante.

## Resumen del proyecto

Un asistente web para restaurantes que ayuda a los clientes a explorar la carta, resolver dudas relacionadas con el menú, elegir platos y preparar un pedido claro para su confirmación por WhatsApp. Busca reducir consultas repetitivas y oportunidades de venta perdidas por atención manual.

## Problema

La atención por teléfono y WhatsApp concentra preguntas frecuentes y pedidos en una persona. Cuando está ocupada, la respuesta puede demorarse y la venta puede perderse.

## Solución propuesta

- Carta digital basada en un archivo JSON versionado.
- Asistente de IA restringido a la información del restaurante y la carta.
- Recomendaciones relevantes para la decisión de compra, sin inventar datos.
- Carrito y total calculados de forma determinista.
- Pedido estructurado listo para enviar por WhatsApp y confirmar con una persona.

## Diferencial

La experiencia se presenta como un **mozo digital integrado a una carta con identidad gastronómica propia**, no como un chatbot genérico. La IA facilita el descubrimiento; los datos del menú y la lógica de precios mantienen el pedido verificable.

## Recorrido de demo (actualizar con evidencia)

1. Abrir la carta desde la URL pública. **Estado:** interfaz implementada; despliegue y prueba pública pendientes.
2. Consultar por una recomendación basada en el menú. **Estado:** pendiente.
3. Hacer una pregunta ajena al restaurante y observar el límite de respuesta. **Estado:** pendiente.
4. Agregar platos, cambiar cantidades y verificar el total. **Estado:** implementado; cálculo probado de forma unitaria, interacción en navegador pendiente de verificar.
5. Abrir WhatsApp con el resumen del pedido. **Estado:** enlace implementado y probado de forma unitaria; falta configurar el número y probar la apertura real.

## Decisiones técnicas

| Área | Decisión | Estado |
| --- | --- | --- |
| Framework | Astro SSR + componente React interactivo para carta y carrito | Implementado; despliegue pendiente |
| Estilos | Tailwind con paleta y diseño propios | Implementado; revisión visual pendiente |
| Estado de interfaz | Zustand para carrito | Implementado |
| Validación | Zod | Propuesto |
| Carta | `src/data/menu.json`: seis platos con precios de demo e imágenes generadas | Datos creados; interfaz pendiente |
| Base de datos | No incluida en el MVP; no se almacenan pedidos en un panel | Propuesto |
| Proveedor de IA | Por definir | Pendiente |
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
