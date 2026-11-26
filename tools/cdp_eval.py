"""Development helper: pip install websocket-client. Evaluate stdin on Zalo's local renderer."""
import json
import sys
from pathlib import Path
import urllib.request
import websocket

sys.stdout.reconfigure(encoding="utf-8")
opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
targets = json.load(opener.open("http://127.0.0.1:8315/json", timeout=3))
target = next(t for t in targets if "/pc-dist/index.html" in t.get("url", ""))
ws = websocket.create_connection(target["webSocketDebuggerUrl"], suppress_origin=True,
                                http_no_proxy=["127.0.0.1", "localhost"], timeout=8)
ws.send(json.dumps({"id": 1, "method": "Runtime.evaluate", "params": {
    "expression": Path(sys.argv[1]).read_text(encoding="utf-8") if len(sys.argv) > 1 else sys.stdin.read(),
    "returnByValue": True, "awaitPromise": True}}))
while True:
    response = json.loads(ws.recv())
    if response.get("id") == 1:
        print(json.dumps(response.get("result", response), ensure_ascii=False))
        break
ws.close()
