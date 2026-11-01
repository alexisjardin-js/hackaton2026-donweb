# Plan de trabajo — Mozo digital para restaurante

**Estado:** MVP local verificado con E2E en Chrome; validación del entorno desplegado pendiente.
**Restricción:** entrega pública en Cloud Server de DonWeb antes de las 18:30 del evento.  
**Repositorio objetivo:** https://github.com/alexisjardin-js/hackaton2026-donweb.git  
**Nota:** código publicado en `origin/main`; el despliegue lo realiza el equipo por separado.
**Restaurante de la demo:** Il Caminneto, Pueblo Esther, Santa Fe. La carta y los precios generados para la demo no están verificados como oferta real.

## Problema y objetivo

El restaurante pierde oportunidades porque responde a mano consultas repetidas y toma pedidos por teléfono o WhatsApp. El MVP debe permitir que un cliente descubra la carta, haga una consulta pertinente, reciba una recomendación y prepare un pedido correcto para confirmación humana.

## Alcance acordado del MVP

- Carta de tamaño acotado en `src/data/menu.json`, fuente única de platos, descripciones, ingredientes informados y precios de demostración; seis fotografías generadas en `public/images/menu/`.
- Interfaz gastronómica personalizada, responsive y con paleta e iconografía consistentes.
- Asistente de IA centrado exclusivamente en el restaurante y la carta. Si falta un dato, reconoce el límite y deriva al personal.
- Carrito con cantidades y total calculado por código a partir del JSON; se conserva en `localStorage` entre recargas, admite vaciarlo y descarta datos obsoletos o inválidos al restaurar. La IA no fija precios ni confirma disponibilidad.
- Resumen de pedido y salida a WhatsApp para confirmación por el restaurante.
- Sin base de datos, pagos, integración directa con mensajes entrantes de WhatsApp ni automatización telefónica en esta primera entrega.

## Flujo demostrable

1. El visitante abre la carta, ve categorías, fotos, precios y acceso al asistente.
2. Elige al comenzar si está en una mesa del local o si pasará a retirar; hasta elegirlo, el chat indica el paso y no envía consultas. La mesa o el nombre se piden recién al cerrar el pedido.
3. Pregunta por un plato, una preferencia o un presupuesto.
4. El asistente contesta usando la carta JSON, la modalidad, hasta seis mensajes recientes y el carrito calculado desde el catálogo del servidor. Puede devolver IDs de hasta tres platos sugeridos; la aplicación valida esos IDs contra el JSON y muestra botones para agregarlos. Ante temas externos o datos ausentes, responde brevemente que no puede confirmarlos.
5. El visitante decide qué sugerencias agregar, puede revisar su pedido directamente desde el chat, modificar cantidades o vaciar el carrito; la IA nunca agrega por sí sola. El carrito se recupera al recargar la página.
6. La aplicación calcula el total desde el catálogo y muestra el resumen.
7. El visitante abre WhatsApp con modalidad, mesa o nombre y pedido precompletados; el restaurante lo confirma. No se presenta como pedido aceptado antes de esa confirmación.

## Arquitectura propuesta

| Responsabilidad | Elección |
| --- | --- |
| Páginas y renderizado | Astro SSR |
| Interacción | Islas React para asistente y carrito |
| Estilos | Tailwind + tokens visuales propios |
| Estado del cliente | Zustand con `localStorage` para el carrito; no sustituye persistencia del negocio |
| Validación | Zod, en especial para entrada al endpoint y esquema del menú |
| Datos de carta | JSON local versionado, sin secretos |
| IA | Endpoint del servidor; clave solo en variable de entorno del servidor |
| Pedidos | Mensaje precompletado de WhatsApp; confirmación humana |

**Modelo elegido:** GPT-6 Luna, configurado localmente junto con la clave en `.env` ignorado. El E2E local obtuvo respuestas reales del mozo. Pendiente: verificar las variables de entorno y el recorrido en el servidor desplegado.

## Verificación E2E local — 1 de noviembre

`node scripts/e2e.mjs` ejecutó Astro en modo desarrollo y Chrome headless, sin build. Resultado: **aprobado** en viewport móvil de 390 px y desktop de 1366 px. Se comprobaron favicon, seis platos e imágenes, ausencia de desborde horizontal, selección de modalidad, recomendación real del mozo con tarjetas para agregar, cambios de cantidad y total en el carrito, persistencia al recargar, vaciado del carrito y enlaces de WhatsApp para mesa y retiro. También se verificó rechazo de una consulta ajena, derivación de una pregunta sobre celiaquía al restaurante y HTTP 400 para entrada inválida. El enlace se inspeccionó, **no se envió un mensaje real**. Evidencia visual en `docs/evidence/`.

El E2E descubrió un rechazo incorrecto de consultas sobre celiaquía cuando se mencionaba un plato por su nombre corto; se corrigió el filtro y se agregó prueba de regresión. El usuario reportó luego un **HTTP 503 del chat en su entorno**; el origen exacto sigue pendiente de confirmar. En este código, `/api/chat` devuelve 503 si falta `OPENAI_API_KEY` o `OPENAI_MODEL` en el proceso SSR; un 503 generado por Nginx sería una causa distinta. No publicar una conclusión hasta ver el cuerpo de la respuesta.

## Plan por bloques (orientativo, no cronómetro rígido)

| Bloque | Trabajo | Criterio de salida |
| --- | --- | --- |
| 1. Fundaciones | Inicializar proyecto, Git remoto verificado, dependencias, menú JSON, variables de entorno de ejemplo y diseño visual. | La carta se muestra con datos del JSON. |
| 2. Recorrido de compra | Carrito, cálculo determinista de precios, resumen y enlace a WhatsApp. | Se puede completar un pedido sin IA. |
| 3. Asistente | Endpoint SSR, validación, contexto limitado a la carta, manejo de errores y desvíos fuera de alcance. | Responde sobre el menú sin inventar precios y rechaza temas ajenos. |
| 4. Despliegue y verificación | Publicar temprano, probar en móvil y otro dispositivo, revisar secretos y ensayar demo. | URL pública funcional y recorrido completo probado. |

## Criterios de aceptación

- [x] La carta visible toma los datos del JSON. (E2E local: seis platos e imágenes HTTP 200.)
- [x] La UI tiene identidad gastronómica propia, no apariencia genérica de chatbot. (Capturas móvil y desktop revisadas.)
- [x] El total no depende de texto generado por IA. (Prueba unitaria aprobada.)
- [x] El carrito sobrevive a una recarga y Vaciar pedido lo elimina también de `localStorage`. (E2E local aprobado.)
- [x] En los casos E2E probados, la IA recomendó platos de la carta y la consulta ajena fue rechazada. (No es garantía para todas las preguntas posibles.)
- [x] En el caso E2E probado, una pregunta sobre celiaquía derivó a confirmación humana.
- [x] El enlace de WhatsApp contiene modalidad, mesa o nombre, ítems, cantidades y total correcto. (E2E local verificó el URL; envío real pendiente.)
- [x] El flujo funciona en Chrome emulando un móvil de 390 px. (Dispositivo físico pendiente.)
- [ ] La clave de IA no aparece en el cliente, en el JSON, en los documentos ni en Git. (`.env` ignorado y no trackeado; revisar artefacto de producción.)
- [ ] La URL desplegada funciona desde otro dispositivo.
- [ ] Resolver el HTTP 503 del chat reportado en el entorno desplegado y repetir allí los casos críticos.

## Riesgos y medidas

- **Tiempo:** desplegar una versión mínima antes de pulir funciones secundarias.
- **Alucinaciones:** catálogo como fuente de verdad, respuesta acotada y precios calculados por código. El sesgo del prompt no es garantía absoluta; probar casos fuera de dominio.
- **Secretos:** `.env` ignorado, `.env.example` sin valores y revisión de archivos staged antes de cada commit.
- **Dependencia de IA:** la carta y el armado del pedido deben seguir funcionando si el proveedor falla.
- **WhatsApp:** el enlace prepara el mensaje, pero no implica recepción ni aceptación automática.

## Próxima actualización

Marcar cada criterio solo cuando esté verificado y registrar la URL de despliegue y evidencia en `INFORME_JURADO.md`.
