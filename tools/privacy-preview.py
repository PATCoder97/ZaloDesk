"""Capture synthetic privacy samples in the actual Zalo renderer; no chat content."""
import base64
import json
from pathlib import Path
import time
import urllib.request
import websocket

opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
targets = json.load(opener.open('http://127.0.0.1:8315/json', timeout=3))
target = next(t for t in targets if '/pc-dist/index.html' in t.get('url', ''))
ws = websocket.create_connection(target['webSocketDebuggerUrl'], suppress_origin=True, http_no_proxy=['127.0.0.1', 'localhost'], timeout=8)
counter = 0
def call(method, params):
    global counter
    counter += 1
    ws.send(json.dumps({'id': counter, 'method': method, 'params': params}))
    while True:
        result = json.loads(ws.recv())
        if result.get('id') == counter:
            if 'error' in result:
                raise RuntimeError(result['error'])
            return result['result']

script = "window.__zaloDeskV2?.dispose();\n" + Path('Assets/menu.js').read_text(encoding='utf-8') + """
(() => {
  const root = document.createElement('div'); root.id = 'zd-synthetic-preview';
  root.style.cssText = 'position:fixed;left:0;top:0;width:640px;height:540px;background:white;z-index:2147483647;color:#18202b;padding:16px;box-sizing:border-box;font:14px Arial';
  for (const effect of ['soft','telegram','mosaic','lorem','solid']) {
    const label = document.createElement('div'); label.textContent = effect; label.style.margin = '8px 0'; root.append(label);
    const sample = document.createElement('div'); sample.textContent = 'Private message 123456 — Sample only';
    sample.style.cssText = 'height:64px;display:grid;place-content:center;font-size:20px;background:linear-gradient(110deg,#264653 0%,#2a9d8f 25%,#e9c46a 50%,#f4a261 75%,#e76f51 100%);filter:' + (effect === 'lorem' ? 'none' : effect === 'soft' ? 'blur(8px)' : 'url(#zalodesk-' + effect + ')' + (effect === 'mosaic' ? ' blur(2px)' : '')); if (effect === 'lorem') { sample.textContent = 'Lorem ipsum dolor sit amet'; sample.style.background = 'transparent'; } root.append(sample);
  }
  document.body.append(root);
})();
"""
try:
    result = call('Runtime.evaluate', {'expression': script})
    if 'exceptionDetails' in result:
        raise RuntimeError(result['exceptionDetails'])
    time.sleep(.4)
    shot = call('Page.captureScreenshot', {'format': 'png', 'clip': {'x': 0, 'y': 0, 'width': 640, 'height': 540, 'scale': 1}})
    Path('tools/privacy-preview.png').write_bytes(base64.b64decode(shot['data']))
finally:
    call('Runtime.evaluate', {'expression': "document.getElementById('zd-synthetic-preview')?.remove()"})
    ws.close()
