"""Run Fabric 1.0 jobs in parallel: inputs/personas + inputs/voices → outputs/fabric/<name>.mp4.

Usage: python3 -I tools/fabric.py [name ...]   (existing outputs are skipped)
"""
import sys, pathlib
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import veed

PERS = veed.ROOT / "inputs" / "personas"
VOICES = veed.ROOT / "inputs" / "voices"
OUT = veed.ROOT / "outputs" / "fabric"

JOBS = {  # output name: (persona image in inputs/personas, voice in inputs/voices)
    "maya-gym": ("maya-gym.jpg", "maya-gym"),
    "maya-cafe": ("maya-cafe.jpg", "maya-cafe"),
    "freya-home": ("freya-home.jpg", "freya-home"),
    "freya-cafe": ("freya-cafe.jpg", "freya-cafe"),
    "jordan-cafe": ("jordan-cafe.jpg", "jordan-cafe"),
}
# freya-greenscreen.mp4 is made by `tools/pipeline.py greenscreen` (it first edits the image onto green).


def run(name):
    out = OUT / f"{name}.mp4"
    if out.exists():
        return print(f"skip {out.name}", flush=True)
    img, voice = JOBS[name]
    job = veed.submit("fabric-1.0", {"image_url": veed.upload(PERS / img),
                                     "audio_url": veed.upload(VOICES / f"{voice}.mp3"),
                                     "resolution": "720p"})
    print(f"{name}: submitted {job}", flush=True)
    d = veed.wait("fabric-1.0", job)
    OUT.mkdir(parents=True, exist_ok=True)
    veed.download(d["result"]["video"]["url"], out)
    print(f"{name}: done, {d.get('credits_charged')} credits", flush=True)


if __name__ == "__main__":
    names = sys.argv[1:] or list(JOBS)
    with ThreadPoolExecutor(len(names)) as ex:
        for f in [ex.submit(run, n) for n in names]:
            try: f.result()
            except Exception as e: print("ERROR", e, flush=True)
