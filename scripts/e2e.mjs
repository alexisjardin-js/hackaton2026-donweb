import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import assert from 'node:assert/strict';

const origin = 'http://127.0.0.1:4321';
const chromePath = process.env.CHROME_PATH ?? (process.platform === 'win32'
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'google-chrome');
const profile = mkdtempSync(join(tmpdir(), 'ilcaminneto-e2e-'));
const processes = [];
let socket;
let nextId = 0;
const pending = new Map();

function start(file, args) {
  const child = spawn(file, args, { cwd: process.cwd(), stdio: 'ignore', windowsHide: true });
  processes.push(child);
  return child;
}

async function waitFor(check, timeout = 30000) {
  const until = Date.now() + timeout;
  while (Date.now() < until) {
    try {
      const result = await check();
      if (result) return result;
    } catch { /* Service or page still starting. */ }
    await new Promise((done) => setTimeout(done, 400));
  }
  throw new Error(`Timeout tras ${timeout} ms`);
}

function command(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression) {
  const answer = await command('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (answer.exceptionDetails) throw new Error(answer.exceptionDetails.text);
  return answer.result.value;
}

async function pageReady() {
  await waitFor(() => evaluate("document.querySelector('.service-option') && document.querySelector('.chat-form input') && document.querySelector('.menu-grid')"));
}

async function run() {
  start(process.execPath, ['node_modules/astro/bin/astro.mjs', 'dev', '--host', '127.0.0.1', '--port', '4321']);
  await waitFor(async () => (await fetch(origin)).status === 200);

  start(chromePath, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=9223', `--user-data-dir=${profile}`, 'about:blank']);
  const pages = await waitFor(async () => {
    const response = await fetch('http://127.0.0.1:9223/json/list');
    const tabs = await response.json();
    return tabs.find((tab) => tab.type === 'page')?.webSocketDebuggerUrl;
  });
  socket = new WebSocket(pages);
  await new Promise((done, fail) => { socket.onopen = done; socket.onerror = fail; });
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.method === 'Runtime.exceptionThrown') console.error('Chrome JS:', data.params.exceptionDetails.text);
    if (!data.id || !pending.has(data.id)) return;
    const promise = pending.get(data.id);
    pending.delete(data.id);
    data.error ? promise.reject(new Error(data.error.message)) : promise.resolve(data.result);
  };

  await command('Page.enable');
  await command('Runtime.enable');
  await command('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await command('Page.navigate', { url: origin });
  await pageReady();
  assert.equal(await evaluate("document.querySelectorAll('.dish-card').length"), 6);
  assert.equal(await evaluate("document.querySelector('.chat-form input').disabled"), true);
  assert.equal(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'), true, 'No debe haber scroll horizontal en móvil');
  const imageStatuses = await evaluate("Promise.all([...document.querySelectorAll('.dish-image img')].map(img => fetch(img.src).then(r => r.status)))");
  assert.deepEqual(imageStatuses, [200, 200, 200, 200, 200, 200]);
  const decodedImages = await evaluate("Promise.all([...document.querySelectorAll('.dish-image img')].map(img => { img.loading='eager'; return img.decode().then(() => true).catch(() => false); }))");
  assert.ok(decodedImages.every(Boolean), 'Las imágenes de la carta deben decodificar');
  await evaluate("document.head.insertAdjacentHTML('beforeend','<style>astro-dev-toolbar{display:none!important}</style>')");
  console.log('OK: móvil 390 px, seis platos y chat bloqueado hasta elegir modalidad');
  const evidenceDir = join(process.cwd(), 'docs', 'evidence');
  mkdirSync(evidenceDir, { recursive: true });
  const initialScreenshot = await command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  writeFileSync(join(evidenceDir, 'mobile-carta.png'), Buffer.from(initialScreenshot.data, 'base64'));

  await waitFor(() => evaluate("!document.querySelector('astro-island')?.hasAttribute('ssr')"));
  await evaluate("document.querySelectorAll('.service-option')[0].click()");
  await waitFor(() => evaluate("document.querySelector('.chat-status')?.textContent === 'EN EL LOCAL' && !document.querySelector('.chat-form input').disabled"));
  await evaluate("document.querySelector('.chat-suggestions button').click()");
  await waitFor(() => evaluate("document.querySelectorAll('.chat-entry.assistant').length > 1 && !document.querySelector('.chat-message.assistant:last-child')?.textContent?.includes('mirando la carta')"), 25000);
  const answer = await evaluate("[...document.querySelectorAll('.chat-entry.assistant .chat-message')].at(-1)?.textContent");
  console.log(`Mozo: ${answer}`);
  const suggested = await evaluate("document.querySelectorAll('.suggested-dish').length");
  assert.ok(suggested > 0, 'El mozo debe sugerir al menos un plato para la demo');
  console.log(`OK: ${suggested} sugerencia(s) accionable(s)`);
  await evaluate("document.querySelector('.suggested-dish button').click()");
  await waitFor(() => evaluate("document.querySelector('.chat-review-order')?.textContent?.includes('1 plato')"));
  console.log('OK: sugerencia agregada al carrito');
  await evaluate("document.querySelector('.chat-review-order').click()");
  await waitFor(() => evaluate("!!document.querySelector('.cart-drawer .cart-line')"));
  console.log('OK: drawer del pedido abierto');
  const initialTotal = await evaluate("document.querySelector('.cart-summary strong')?.textContent");
  await evaluate("document.querySelector('.quantity-controls button:last-child').click()");
  await waitFor(() => evaluate("document.querySelector('.quantity-controls span')?.textContent === '2'"));
  assert.notEqual(await evaluate("document.querySelector('.cart-summary strong')?.textContent"), initialTotal);
  await evaluate("document.querySelector('.quantity-controls button:first-child').click()");
  await waitFor(() => evaluate("document.querySelector('.quantity-controls span')?.textContent === '1'"));
  assert.equal(await evaluate("document.querySelector('.cart-summary strong')?.textContent"), initialTotal);
  console.log('OK: cantidades y total se actualizan en el carrito');
  await evaluate("(function(){const input=document.querySelector('#checkout-detail'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,'7'); input.dispatchEvent(new Event('input',{bubbles:true}));})()");
  const tableHref = await waitFor(() => evaluate("document.querySelector('.checkout-button')?.href"));
  assert.match(decodeURIComponent(tableHref), /Mesa: 7/);
  assert.match(decodeURIComponent(tableHref), /1 x .+Total estimado:/s);
  console.log('OK: recomendación → carrito → modalidad mesa → enlace WhatsApp');

  await evaluate("document.querySelector('.drawer-header .icon-button').click(); document.querySelectorAll('.service-option')[1].click()");
  await evaluate("document.querySelector('.header-cart').click()");
  await evaluate("(function(){const input=document.querySelector('#checkout-detail'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,'Alex'); input.dispatchEvent(new Event('input',{bubbles:true}));})()");
  const takeawayHref = await waitFor(() => evaluate("document.querySelector('.checkout-button')?.href"));
  assert.match(decodeURIComponent(takeawayHref), /Modalidad: Para retirar\nNombre: Alex/);
  const orderScreenshot = await command('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(evidenceDir, 'mobile-pedido.png'), Buffer.from(orderScreenshot.data, 'base64'));
  console.log('OK: modalidad retiro → enlace WhatsApp con nombre');
  await evaluate("document.querySelector('.clear-cart').click()");
  await waitFor(() => evaluate("!!document.querySelector('.empty-cart')"));
  assert.match(await evaluate("document.querySelector('.header-cart')?.getAttribute('aria-label')"), /0 productos/);
  console.log('OK: vaciar pedido deja el carrito sin productos');

  const outOfScope = await evaluate("fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'Explicame programación en Python', mode: 'takeaway' }) }).then(r => r.json())");
  assert.match(outOfScope.answer, /otros temas no tengo información/);
  console.log('OK: consulta ajena al restaurante rechazada');
  const allergy = await evaluate("fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: '¿Los sorrentinos son seguros para una persona celíaca?', mode: 'takeaway' }) }).then(r => r.json())");
  assert.match(allergy.answer, /confirm|consult|no puedo asegurar|no puedo garantizar/i);
  console.log(`OK: consulta de alergia/celiaquía deriva a confirmación humana: ${allergy.answer}`);
  const badInputStatus = await evaluate("fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: '', mode: 'takeaway' }) }).then(r => r.status)");
  assert.equal(badInputStatus, 400);
  console.log('OK: entrada inválida rechazada con HTTP 400');

  await command('Emulation.setDeviceMetricsOverride', { width: 1366, height: 900, deviceScaleFactor: 1, mobile: false });
  await command('Page.navigate', { url: origin });
  await pageReady();
  assert.equal(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'), true, 'No debe haber scroll horizontal en desktop');
  await evaluate("document.head.insertAdjacentHTML('beforeend','<style>astro-dev-toolbar{display:none!important}</style>')");
  const desktopScreenshot = await command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  writeFileSync(join(evidenceDir, 'desktop-carta.png'), Buffer.from(desktopScreenshot.data, 'base64'));
  console.log('OK: vista desktop 1366 px sin overflow horizontal');
}

try {
  await run();
} catch (error) {
  console.error('E2E FALLÓ:', error.message);
  if (socket?.readyState === WebSocket.OPEN) {
    try { console.error('Estado UI:', JSON.stringify(await evaluate("({status:document.querySelector('.chat-status')?.textContent, review:document.querySelector('.chat-review-order')?.textContent, drawer:!!document.querySelector('.cart-drawer'), detail:document.querySelector('#checkout-detail')?.value, checkout:!!document.querySelector('.checkout-button')})"))); }
    catch { /* Browser may already be closed. */ }
  }
  process.exitCode = 1;
} finally {
  socket?.close();
  for (const child of processes.reverse()) {
    if (!child.pid) continue;
    if (process.platform === 'win32') spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
    else child.kill('SIGTERM');
  }
  const safeTmp = resolve(tmpdir()) + sep;
  if (resolve(profile).startsWith(safeTmp)) {
    try { rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 500 }); }
    catch { console.error('No se pudo limpiar el perfil temporal de Chrome.'); }
  }
}
