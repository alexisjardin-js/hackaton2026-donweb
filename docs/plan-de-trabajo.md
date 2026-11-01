# Plan de trabajo — Mozo digital para restaurante

**Estado:** implementación en curso (mozo con sugerencias accionables; recorrido en navegador y despliegue pendientes)  
**Restricción:** entrega pública en Cloud Server de DonWeb antes de las 18:30 del evento.  
**Repositorio objetivo:** https://github.com/alexisjardin-js/hackaton2026-donweb.git  
**Nota:** repositorio local vinculado a `origin`; todavía no se publicó ni desplegó.
**Restaurante de la demo:** Il Caminneto, Pueblo Esther, Santa Fe. La carta y los precios generados para la demo no están verificados como oferta real.

## Problema y objetivo

El restaurante pierde oportunidades porque responde a mano consultas repetidas y toma pedidos por teléfono o WhatsApp. El MVP debe permitir que un cliente descubra la carta, haga una consulta pertinente, reciba una recomendación y prepare un pedido correcto para confirmación humana.

## Alcance acordado del MVP

- Carta de tamaño acotado en `src/data/menu.json`, fuente única de platos, descripciones, ingredientes informados y precios de demostración; seis fotografías generadas en `public/images/menu/`.
- Interfaz gastronómica personalizada, responsive y con paleta e iconografía consistentes.
- Asistente de IA centrado exclusivamente en el restaurante y la carta. Si falta un dato, reconoce el límite y deriva al personal.
- Carrito con cantidades y total calculado por código a partir del JSON; la IA no fija precios ni confirma disponibilidad.
- Resumen de pedido y salida a WhatsApp para confirmación por el restaurante.
- Sin base de datos, pagos, integración directa con mensajes entrantes de WhatsApp ni automatización telefónica en esta primera entrega.

## Flujo demostrable

1. El visitante abre la carta, ve categorías, fotos, precios y acceso al asistente.
2. Elige al comenzar si está en una mesa del local o si pasará a retirar. La mesa o el nombre se piden recién al cerrar el pedido.
3. Pregunta por un plato, una preferencia o un presupuesto.
4. El asistente contesta usando la carta JSON y conoce la modalidad elegida. Puede devolver IDs de hasta tres platos sugeridos; la aplicación valida esos IDs contra el JSON y muestra botones para agregarlos. Ante temas externos o datos ausentes, responde brevemente que no puede confirmarlos.
5. El visitante decide qué sugerencias agregar y modifica cantidades en el carrito; la IA nunca agrega por sí sola.
6. La aplicación calcula el total desde el catálogo y muestra el resumen.
7. El visitante abre WhatsApp con modalidad, mesa o nombre y pedido precompletados; el restaurante lo confirma. No se presenta como pedido aceptado antes de esa confirmación.

## Arquitectura propuesta

| Responsabilidad | Elección |
| --- | --- |
| Páginas y renderizado | Astro SSR |
| Interacción | Islas React para asistente y carrito |
| Estilos | Tailwind + tokens visuales propios |
| Estado temporal del cliente | Zustand; no sustituye persistencia del negocio |
| Validación | Zod, en especial para entrada al endpoint y esquema del menú |
| Datos de carta | JSON local versionado, sin secretos |
| IA | Endpoint del servidor; clave solo en variable de entorno del servidor |
| Pedidos | Mensaje precompletado de WhatsApp; confirmación humana |

**Modelo elegido:** GPT-6 Luna, configurado localmente junto con la clave en `.env` ignorado. La API respondió en una prueba mínima y una prueba de salida estructurada. Pendiente: verificar el recorrido completo y el servidor de despliegue.

## Plan por bloques (orientativo, no cronómetro rígido)

| Bloque | Trabajo | Criterio de salida |
| --- | --- | --- |
| 1. Fundaciones | Inicializar proyecto, Git remoto verificado, dependencias, menú JSON, variables de entorno de ejemplo y diseño visual. | La carta se muestra con datos del JSON. |
| 2. Recorrido de compra | Carrito, cálculo determinista de precios, resumen y enlace a WhatsApp. | Se puede completar un pedido sin IA. |
| 3. Asistente | Endpoint SSR, validación, contexto limitado a la carta, manejo de errores y desvíos fuera de alcance. | Responde sobre el menú sin inventar precios y rechaza temas ajenos. |
| 4. Despliegue y verificación | Publicar temprano, probar en móvil y otro dispositivo, revisar secretos y ensayar demo. | URL pública funcional y recorrido completo probado. |

## Criterios de aceptación

- [x] La carta visible toma los datos del JSON. (Verificado con revisión de código; prueba HTTP pendiente.)
- [x] La UI tiene identidad gastronómica propia, no apariencia genérica de chatbot. (Implementada; revisión visual pendiente.)
- [x] El total no depende de texto generado por IA. (Prueba unitaria aprobada.)
- [ ] La IA no da datos inexistentes ni responde consultas ajenas al restaurante. (Guardia local y salida estructurada probadas; recorrido completo pendiente.)
- [ ] Una pregunta sobre alergias/ingredientes no documentados deriva a confirmación humana. (Instrucción implementada; modelo real pendiente de verificar.)
- [x] El enlace de WhatsApp contiene modalidad, mesa o nombre, ítems, cantidades y total correcto. (Prueba unitaria aprobada; apertura real pendiente.)
- [ ] El flujo funciona en móvil.
- [ ] La clave de IA no aparece en el cliente, en el JSON, en los documentos ni en Git.
- [ ] La URL desplegada funciona desde otro dispositivo.

## Riesgos y medidas

- **Tiempo:** desplegar una versión mínima antes de pulir funciones secundarias.
- **Alucinaciones:** catálogo como fuente de verdad, respuesta acotada y precios calculados por código. El sesgo del prompt no es garantía absoluta; probar casos fuera de dominio.
- **Secretos:** `.env` ignorado, `.env.example` sin valores y revisión de archivos staged antes de cada commit.
- **Dependencia de IA:** la carta y el armado del pedido deben seguir funcionando si el proveedor falla.
- **WhatsApp:** el enlace prepara el mensaje, pero no implica recepción ni aceptación automática.

## Próxima actualización

Marcar cada criterio solo cuando esté verificado y registrar la URL de despliegue y evidencia en `docs/reporte-jurado.md`.
