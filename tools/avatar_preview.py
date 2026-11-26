"""Capture only an already-masked, visible avatar; never capture conversations."""
import base64
import json
from pathlib import Path
import urllib.request
import websocket

op = urllib.request.build_opener(urllib.request.ProxyHandler({}))
target = next(t for t in json.load(op.open('http://127.0.0.1:8315/json')) if '/pc-dist/index.html' in t.get('url', ''))
ws = websocket.create_connection(target['webSocketDebuggerUrl'], suppress_origin=True,
                                http_no_proxy=['127.0.0.1', 'localhost'], timeout=5)
seq = 0
def call(method, params):
    global seq
    seq += 1
    ws.send(json.dumps({'id': seq, 'method': method, 'params': params}))
    while True:
        response = json.loads(ws.recv())
        if response.get('id') == seq:
            return response['result']

result = call('Runtime.evaluate', {'expression': '''JSON.stringify((()=>{
  if (!window.__zaloDeskV2.settings.avatars) throw Error('Enable avatar masking first');
  const e=[...document.querySelectorAll('.zavatar')].find(e=>{
    const r=e.getBoundingClientRect();
    return r.x>70 && !e.matches(':hover') && document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('.zavatar')===e;
  });
  const r=e.getBoundingClientRect(); return{x:r.x,y:r.y,width:r.width,height:r.height,scale:1};
})())''', 'returnByValue': True})
clip = json.loads(result['result']['value'])
result = call('Page.captureScreenshot', {'format': 'png', 'clip': clip, 'captureBeyondViewport': False})
output = Path(__file__).resolve().parent.parent / 'avatar-preview.png'
output.write_bytes(base64.b64decode(result['data']))
print(output)
ws.close()
