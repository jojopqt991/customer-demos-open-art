"""Small helpers for the demo asset pipeline (paths are relative to the project root, ROOT): upload to fal storage, run VEED API jobs.

Keys come from customer-demos/.env (VEED_API_KEY, FAL_KEY).
"""
import json, mimetypes, os, pathlib, time, urllib.request, urllib.error

ROOT = pathlib.Path(__file__).resolve().parent.parent
for line in (ROOT / ".env").read_text().splitlines():
    if "=" in line:
        k, v = line.split("=", 1); os.environ.setdefault(k.strip(), v.strip())
VEED = os.environ["VEED_API_KEY"]
FAL = os.environ["FAL_KEY"]
CACHE = ROOT / "tools" / ".cache"
TMP = CACHE / "tmp"; TMP.mkdir(parents=True, exist_ok=True)
_CACHE = CACHE / "upload-cache.json"


def _req(url, data=None, headers=None, method=None, timeout=120):
    headers = {"User-Agent": "veed-demo-tools/1.0", **(headers or {})}  # default urllib UA is blocked (CF 1010)
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            body = r.read()
            return json.loads(body) if body else {}
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"{method or ('POST' if data else 'GET')} {url} -> {e.code}: {e.read().decode()[:500]}")


def upload(path):
    """Upload a local file to fal storage and return its public URL (cached by path+mtime)."""
    path = pathlib.Path(path)
    cache = json.loads(_CACHE.read_text()) if _CACHE.exists() else {}
    key = f"{path}:{path.stat().st_mtime_ns}"
    if key in cache:
        return cache[key]
    ctype = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
    init = _req("https://rest.alpha.fal.ai/storage/upload/initiate?storage_type=fal-cdn-v3",
                data=json.dumps({"content_type": ctype, "file_name": path.name}).encode(),
                headers={"Authorization": f"Key {FAL}", "Content-Type": "application/json"})
    _req(init["upload_url"], data=path.read_bytes(), headers={"Content-Type": ctype}, method="PUT", timeout=600)
    cache[key] = init["file_url"]
    _CACHE.write_text(json.dumps(cache, indent=1))
    return init["file_url"]


def submit(model, payload):
    r = _req(f"https://api.veed.io/v1/{model}", data=json.dumps(payload).encode(),
             headers={"Authorization": f"Bearer {VEED}", "Content-Type": "application/json"})
    return r["data"]["job_id"]


def wait(model, job_id, every=10, limit=3600):
    t0 = time.time()
    while time.time() - t0 < limit:
        d = _req(f"https://api.veed.io/v1/{model}/{job_id}", headers={"Authorization": f"Bearer {VEED}"})["data"]
        if d["status"] != "PROCESSING":
            if d["status"] != "COMPLETED":
                raise RuntimeError(f"{model} {job_id} {d['status']}: {json.dumps(d.get('error'))}")
            return d
        time.sleep(every)
    raise TimeoutError(f"{model} {job_id} still processing")


def fal(model, payload, every=5, limit=3600):
    """Run a fal model through the queue API and return its output JSON."""
    h = {"Authorization": f"Key {FAL}", "Content-Type": "application/json"}
    q = _req(f"https://queue.fal.run/{model}", data=json.dumps(payload).encode(), headers=h)
    t0 = time.time()
    while time.time() - t0 < limit:
        s = _req(q["status_url"], headers=h)
        if s["status"] == "COMPLETED":
            return _req(q["response_url"], headers=h)
        if s["status"] not in ("IN_QUEUE", "IN_PROGRESS"):
            raise RuntimeError(f"{model}: {s}")
        time.sleep(every)
    raise TimeoutError(model)


def download(url, out):
    req = urllib.request.Request(url, headers={"User-Agent": "veed-demo-tools/1.0"})
    with urllib.request.urlopen(req, timeout=600) as r, open(out, "wb") as f:
        f.write(r.read())
    return out
