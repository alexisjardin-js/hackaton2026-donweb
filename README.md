# Il Caminneto · mozo digital

Web de autogestión de consultas y pedidos para un restaurante de Pueblo Esther, Santa Fe. Es una respuesta al problema de ventas perdidas por atender manualmente preguntas y pedidos que llegan por WhatsApp o teléfono. El cliente puede elegir **mesa** o **retiro**, conversar con un mozo digital sobre la carta, armar su pedido y abrir un mensaje estructurado de WhatsApp para confirmación humana.

**[Informe para el jurado](INFORME_JURADO.md)** · **[Plan de trabajo](docs/plan-de-trabajo.md)**

## Qué incluye

- Carta demostrativa en `src/data/menu.json` con seis platos, precios e imágenes propios.
- Mozo digital acotado al restaurante y la carta: responde preguntas, recomienda platos reales y muestra acciones para agregarlos al carrito.
- Modalidades «Estoy en el local» y «Paso a retirar» en una sola web.
- Carrito con cantidades, total determinista, persistencia en `localStorage` y opción de vaciarlo.
- Enlace `wa.me` con pedido precompletado. **No hay integración bidireccional con WhatsApp ni confirmación automática.**
- Diseño responsive con identidad gastronómica, Tailwind y Lucide.

La carta, sus precios y fotografías son **datos de demostración**, no información oficial ni vigente de un restaurante real.

## Stack

Astro SSR (`output: 'server'`) con adaptador Node en modo `standalone`; React para la interfaz interactiva; Tailwind CSS; Zustand para el carrito; Zod para validaciones; OpenAI Responses API desde un endpoint del servidor. No se usa base de datos en este MVP.

## Ejecutar en desarrollo

Requiere Node.js 24 y npm. Desde la raíz del repositorio:

```bash
npm ci
cp .env.example .env
npm run dev
```

Completá `.env` con:

| Variable | Uso |
| --- | --- |
| `OPENAI_API_KEY` | Clave privada de OpenAI; solo en el servidor |
| `OPENAI_MODEL` | Modelo habilitado para la clave, por ejemplo `gpt-6-luna` |
| `RESTAURANT_WHATSAPP_NUMBER` | Número de destino en formato internacional, solo dígitos, sin `+` |

En PowerShell, copiá la plantilla con `Copy-Item .env.example .env`. **No subas `.env` a Git**: está ignorado. Si modificás sus valores con el servidor en marcha, reiniciá `npm run dev`.

## Ejecutar en producción

Astro genera el servidor standalone en `dist/server/entry.mjs`:

```bash
npm ci
npm run build
node --env-file=.env ./dist/server/entry.mjs
```

El build debe hacerse con `RESTAURANT_WHATSAPP_NUMBER` configurado. En producción, el proceso Node también necesita `OPENAI_API_KEY` y `OPENAI_MODEL` en su entorno; `npm run start` por sí solo **no carga `.env`**. En el Cloud Server se usa un proceso Node detrás de Nginx. No publiques el puerto interno directamente ni expongas la clave al navegador.

## Pruebas

```bash
npm test
```

El E2E local se ejecuta con `node scripts/e2e.mjs`. Requiere Chrome/Chromium (podés indicar su ejecutable con `CHROME_PATH`), un `.env` válido y acceso a la API de OpenAI. **Hace consultas reales y regenera las capturas de `docs/evidence/`**; no envía mensajes de WhatsApp.

## Estructura

```text
src/data/menu.json          Carta y precios demostrativos
src/pages/api/chat.ts       Endpoint SSR del mozo digital
src/components/            Interfaz de carta, chat y pedido
src/store/cart.ts           Estado y persistencia del carrito
src/lib/                  Cálculo, validación y contexto
public/images/menu/        Imágenes de platos
scripts/e2e.mjs            Recorrido E2E local
docs/evidence/             Capturas de la demo local
```

## Límites del MVP

La IA usa la carta JSON como fuente de verdad y la aplicación valida sus sugerencias, pero una respuesta generada no reemplaza la revisión humana. No se garantizan alérgenos, ausencia de contaminación cruzada, disponibilidad, horarios ni precio final. El enlace de WhatsApp prepara una consulta: el restaurante debe confirmar el pedido. No se automatizan llamadas ni mensajes entrantes de WhatsApp.
