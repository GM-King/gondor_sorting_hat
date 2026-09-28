// Optional browser smoke check. Start Edge with remote debugging on port 9223 first.
import assert from 'node:assert/strict';

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
let target;
for (let attempt = 0; attempt < 30; attempt++) {
  try {
    const pages = await (await fetch('http://127.0.0.1:9223/json/list')).json();
    target = pages.find(page => page.type === 'page');
    if (target) break;
  } catch {}
  await wait(100);
}
if (!target) throw new Error('Edge debugging target unavailable');

const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
let id = 0;
const pending = new Map();
const exceptions = [];
const failedRequests = [];
const consoleErrors = [];
socket.onmessage = ({ data }) => {
  const message = JSON.parse(data);
  if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails.text);
  if (message.method === 'Network.loadingFailed') failedRequests.push(message.params.errorText);
  if (message.method === 'Network.responseReceived' && message.params.response.status >= 400) failedRequests.push(message.params.response.url);
  if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') consoleErrors.push(message.params.args);
  if (message.id && pending.has(message.id)) {
    const [resolve, reject] = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  }
};
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const next = ++id;
    pending.set(next, [resolve, reject]);
    socket.send(JSON.stringify({ id: next, method, params }));
  });
}
async function evaluate(expression) {
  const response = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.text);
  return response.result.value;
}

await send('Page.enable');
await send('Runtime.enable');
await send('Network.enable');
await send('Page.navigate', { url: 'http://127.0.0.1:4173' });
await wait(900);
assert.equal(await evaluate('document.title'), 'Gondor Sorting Hat');
assert.equal(await evaluate('Promise.all([...document.images].map(img => img.decode())).then(() => [...document.images].every(img => img.naturalWidth > 0))'), true);
for (const width of [320, 390, 768, 1024, 1440]) {
  await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 600 });
  assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, `initial page overflows at ${width}px`);
}
const hoverPoint = await evaluate(`(() => { const button=document.querySelector('#sort-button'); button.scrollIntoView({block:'center',behavior:'instant'}); const box=button.getBoundingClientRect(); return {x:box.left+box.width/2,y:box.top+box.height/2}; })()`);
await send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...hoverPoint });
await wait(250);
assert.ok(await evaluate(`new DOMMatrixReadOnly(getComputedStyle(document.querySelector('#sort-button')).transform).b < -.01`));
await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 1, y: 1 });
await evaluate('document.querySelector("#sort-form").requestSubmit()');
assert.match(await evaluate('document.querySelector("#form-error").textContent'), /first name/);
await evaluate(`document.querySelector('#first-name').value='Sam'; document.querySelector('#sort-form').requestSubmit();`);
assert.match(await evaluate('document.querySelector("#form-error").textContent'), /last name/);

await evaluate(`document.querySelector('#first-name').value='Émilie'; document.querySelector('#last-name').value='O’Neill'; document.querySelector('#last-name').focus();`);
await send('Page.bringToFront');
await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
assert.equal(await evaluate('document.querySelector("#sort-button").disabled'), true);
await wait(3150);
const firstResult = await evaluate('document.querySelector("#result-heading").textContent');
assert.ok(firstResult && firstResult !== 'Leather Ball');
assert.equal(await evaluate('document.querySelector("#result").hidden'), false);
assert.equal(await evaluate('Boolean(document.querySelector("#result-art svg"))'), true);
assert.equal(await evaluate(`document.querySelector('#result-art svg').textContent.includes('Émilie O’Neill')`), true);
assert.equal(await evaluate(`document.querySelector('#result-art svg').textContent.includes('<Gondor Calls For Raid>')`), true);
assert.equal(await evaluate(`document.querySelector('#stat-body-type').textContent === '1' || document.querySelector('#stat-body-type').textContent === '2'`), true);
assert.equal(await evaluate(`document.querySelector('#sort-again') === null`), true);

await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
const originalArt = await evaluate('document.querySelector("#result-art").innerHTML');
await evaluate('document.querySelector("#sort-form").requestSubmit(); document.querySelector("#sort-form").requestSubmit();');
await wait(450);
assert.equal(await evaluate('document.querySelector("#result-art").innerHTML'), originalArt);
for (const width of [320, 390, 768, 1024, 1440]) {
  await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 600 });
  assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, `result page overflows at ${width}px`);
}
await evaluate(`document.querySelector('#first-name').value='Pineapple'; document.querySelector('#last-name').value='Took'; document.querySelector('#sort-form').requestSubmit();`);
await wait(400);
assert.equal(await evaluate('document.querySelector("#sort-button").disabled'), true);
assert.equal(await evaluate('document.querySelector("#result").hidden'), true);
await wait(10000);
assert.equal(await evaluate('document.querySelector("#result-heading").textContent'), 'Leather Ball');
assert.equal(await evaluate(`document.querySelector('#result-art svg').textContent.includes('Pineapple Took')`), true);
assert.equal(await evaluate('document.querySelector("#result-stats").hidden'), true);
assert.equal(await evaluate('document.querySelector("#sort-button").disabled'), false);
assert.equal(await evaluate('matchMedia("(prefers-reduced-motion: reduce)").matches'), true);
await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
const mobile = await evaluate('({width:innerWidth,scrollWidth:document.documentElement.scrollWidth})');
assert.equal(mobile.width, 390);
assert.ok(mobile.scrollWidth <= mobile.width, `mobile page overflows: ${JSON.stringify(mobile)}`);
assert.deepEqual(exceptions, []);
assert.deepEqual(failedRequests, []);
assert.deepEqual(consoleErrors, []);
console.log(JSON.stringify({ hoverRightEdgeLift: true, blankFieldError: true, keyboardSort: firstResult, easterEggDelay: true, easterEgg: 'Leather Ball', reducedMotion: true, mobileNoOverflow: true, browserErrors: exceptions.length }));
await send('Browser.close').catch(() => {});
socket.close();
