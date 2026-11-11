"""Generate the AI influencer demo assets (inputs/ → outputs/<model>/) (everything after the Fabric clips).

Usage: python3 -I tools/pipeline.py [task ...]   (no args = all tasks)
Each task skips if its output already exists.
"""
import subprocess, sys, pathlib, threading
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import veed

TMP = veed.TMP
PRESET = "glass"  # veed/subtitles caption style, same everywhere
lock = threading.Lock()


def log(*a):
    with lock: print(*a, flush=True)


def ffmpeg(*args):
    subprocess.run(["ffmpeg", "-v", "error", "-y", *args], check=True)


def veed_video(model, payload, out, key="video"):
    if out.exists(): return log(f"skip {out.name}")
    job = veed.submit(model, payload); log(f"{out.name}: {model} job {job}")
    d = veed.wait(model, job)
    url = d["result"][key]["url"] if key != "files" else d["result"]["files"][0]["url"]
    veed.download(url, out); log(f"{out.name}: done ({d.get('credits_charged')} credits)")


def dub(src, lang, out):
    veed_video("dubbing-pro", {"video_url": veed.upload(src), "target_language": lang}, out)


def subtitles(src, lang, out, translate=None):
    if out.exists(): return log(f"skip {out.name}")
    p = {"video_url": veed.upload(src), "preset": PRESET, "language": lang}
    if translate: p["translation_language"] = translate
    log(f"{out.name}: veed/subtitles")
    r = veed.fal("veed/subtitles", p)
    veed.download(r["video"]["url"], out); log(f"{out.name}: done")


# ---- tasks ----
def lipsync():
    veed_video("lipsync-2.0", {"video_url": veed.upload(veed.ROOT / "outputs/fabric/maya-gym.mp4"),
                               "audio_url": veed.upload(veed.ROOT / "inputs/voices/maya-promo.mp3")}, veed.ROOT / "outputs/lipsync/maya-promo.mp4")


def dubs():
    src = veed.ROOT / "outputs/fabric/maya-gym.mp4"
    with ThreadPoolExecutor(3) as ex:
        list(ex.map(lambda a: dub(src, *a), [("es", veed.ROOT / "outputs/dubbing/maya-gym-es-pro.mp4"),
                                              ("fr", veed.ROOT / "outputs/dubbing/maya-gym-fr-pro.mp4"),
                                              ("ja", veed.ROOT / "outputs/dubbing/maya-gym-ja-pro.mp4")]))


def captions():
    src = veed.ROOT / "outputs/fabric/maya-gym.mp4"
    subtitles(src, "en-US", veed.ROOT / "outputs/subtitles/maya-gym-glass.mp4")
    subtitles(src, "en-US", veed.ROOT / "outputs/subtitles/maya-gym-glass-es.mp4", translate="es-ES")


def background():
    cut = veed.ROOT / "outputs/background-removal/jordan-cafe-cutout.webm"
    veed_video("video-background-removal", {"video_url": veed.upload(veed.ROOT / "outputs/fabric/jordan-cafe.mp4"), "output_codec": "vp9"},
               cut, key="files")
    bg = veed.ROOT / "inputs/backgrounds/rooftop.jpg"
    if not bg.exists():
        r = veed.fal("fal-ai/flux-2-pro", {
            "prompt": "Sunny rooftop terrace café overlooking a city skyline at golden hour, potted plants, "
                      "string lights, soft shallow depth of field, eye-level view from a seated person, "
                      "photorealistic, no people", "image_size": {"width": 736, "height": 1312}, "seed": 7})
        veed.download(r["images"][0]["url"], bg); log("rooftop background: done")
    out = veed.ROOT / "outputs/background-removal/jordan-rooftop.mp4"
    if not out.exists():
        # libvpx-vp9 decoder keeps the alpha channel
        ffmpeg("-loop", "1", "-i", str(bg), "-c:v", "libvpx-vp9", "-i", str(cut), "-i", str(veed.ROOT / "outputs/fabric/jordan-cafe.mp4"),
               "-filter_complex", "[0:v]scale=736:1312,setsar=1[b];[1:v]scale=736:1312[f];[b][f]overlay=shortest=1,format=yuv420p[v]",
               "-map", "[v]", "-map", "2:a", "-c:v", "libx264", "-crf", "18", "-c:a", "aac", "-shortest", str(out))
        log(f"{out.name}: done")


def greenscreen():
    pers = veed.ROOT / "inputs/personas"
    still = pers / "freya-greenscreen.jpg"
    if not still.exists():
        r = veed.fal("fal-ai/nano-banana-pro/edit", {
            "prompt": "Replace the background with a flat, evenly lit chroma-key green screen studio backdrop "
                      "(pure #00B140 green, no shadows, no wrinkles). Keep the woman, her pose, face, hair, "
                      "clothing and lighting exactly the same.",
            "image_urls": [veed.upload(pers / "Emma_56bWURjYFHyYyVf490Dp_Outfit1_Wide_Front_P.png")],
            "aspect_ratio": "9:16", "output_format": "jpeg"})
        veed.download(r["images"][0]["url"], still); log("green-screen still: done")
    talk = veed.ROOT / "outputs/fabric/freya-greenscreen.mp4"
    if not talk.exists():
        job = veed.submit("fabric-1.0", {"image_url": veed.upload(still),
                                         "audio_url": veed.upload(veed.ROOT / "inputs/voices/freya-home.mp3"), "resolution": "720p"})
        log(f"{talk.name}: fabric-1.0 job {job}")
        d = veed.wait("fabric-1.0", job); veed.download(d["result"]["video"]["url"], talk)
        log(f"{talk.name}: done ({d.get('credits_charged')} credits)")
    cut = veed.ROOT / "outputs/background-removal/freya-greenscreen-keyed.webm"
    veed_video("video-background-removal-green-screen", {"video_url": veed.upload(talk), "output_codec": "vp9"},
               cut, key="files")
    bg = veed.ROOT / "inputs/backgrounds/bookshop.jpg"
    if not bg.exists():
        r = veed.fal("fal-ai/flux-2-pro", {
            "prompt": "Cozy independent bookshop interior, warm lamps, wooden shelves full of books, armchair, "
                      "soft shallow depth of field, eye-level view, photorealistic, no people",
            "image_size": {"width": 736, "height": 1312}, "seed": 11})
        veed.download(r["images"][0]["url"], bg); log("bookshop background: done")
    out = veed.ROOT / "outputs/background-removal/freya-bookshop.mp4"
    if not out.exists():
        ffmpeg("-loop", "1", "-i", str(bg), "-c:v", "libvpx-vp9", "-i", str(cut), "-i", str(talk),
               "-filter_complex", "[0:v]scale=736:1312,setsar=1[b];[1:v]scale=736:1312[f];[b][f]overlay=shortest=1,format=yuv420p[v]",
               "-map", "[v]", "-map", "2:a", "-c:v", "libx264", "-crf", "18", "-c:a", "aac", "-shortest", str(out))
        log(f"{out.name}: done")


def podcast():
    """Two-person split-screen podcast (16:9) for the Reframe step.
    Each speaker's Fabric track holds their line plus silence while the other talks, so the
    non-speaker listens on screen and the active speaker changes halfway through."""
    pers = veed.ROOT / "inputs/personas"
    lines = {"jordan": ("Chris", "Welcome back to the show. Today I've got someone who built her whole audience "
                                 "in under a year. So tell me, what actually worked?"),
             "freya": ("Lily", "Honestly? Showing up every single day and not overthinking it. "
                               "People follow a person, not a perfect post.")}
    for who, (voice, text) in lines.items():
        out = TMP / f"pod-{who}-line.mp3"
        if not out.exists():
            r = veed.fal("fal-ai/elevenlabs/tts/eleven-v4", {"text": text, "voice": voice, "stability": 0.45,
                                                            "similarity_boost": 0.75, "seed": 42})
            veed.download(r["audio"]["url"], out); log(f"{out.name}: done")
    dur = lambda f: float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0",
                                          str(f)], capture_output=True, text=True).stdout)
    a, b, gap = dur(TMP / "pod-jordan-line.mp3"), dur(TMP / "pod-freya-line.mp3"), 0.4
    tracks = {"jordan": TMP / "pod-jordan-track.wav", "freya": TMP / "pod-freya-track.wav"}
    # jordan: line, then silence; freya: silence, then line (same total length)
    ffmpeg("-i", str(TMP / "pod-jordan-line.mp3"), "-af", f"apad=pad_dur={gap + b}", "-ar", "44100", "-ac", "1", str(tracks["jordan"]))
    ffmpeg("-i", str(TMP / "pod-freya-line.mp3"), "-af", f"adelay={int((a + gap) * 1000)}", "-ar", "44100", "-ac", "1", str(tracks["freya"]))
    imgs = {"jordan": pers / "jordan-podcast-16x9.jpg", "freya": pers / "Emma_56bWURjYFHyYyVf490Dp_Outfit1_CloseUp_Front_L.png"}

    def fab(who):
        out = TMP / f"pod-{who}.mp4"
        if out.exists(): return
        job = veed.submit("fabric-1.0", {"image_url": veed.upload(imgs[who]), "audio_url": veed.upload(tracks[who]),
                                         "resolution": "720p"})
        log(f"{out.name}: fabric-1.0 job {job}")
        d = veed.wait("fabric-1.0", job); veed.download(d["result"]["video"]["url"], out)
        log(f"{out.name}: done ({d.get('credits_charged')} credits)")
    with ThreadPoolExecutor(2) as ex: list(ex.map(fab, ["jordan", "freya"]))

    out = veed.ROOT / "inputs/videos/podcast-16x9.mp4"
    # Each 16:9 clip is centre-cropped to half width and placed side by side: 1920x1080.
    ffmpeg("-i", str(TMP / "pod-jordan.mp4"), "-i", str(TMP / "pod-freya.mp4"),
           "-filter_complex", "[0:v]scale=-2:1080,crop=960:1080,setsar=1,fps=25[l];"
                              "[1:v]scale=-2:1080,crop=960:1080,setsar=1,fps=25[r];"
                              "[l][r]hstack=inputs=2,format=yuv420p[v];[0:a][1:a]amix=inputs=2:normalize=0[a]",
           "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-crf", "16", "-c:a", "aac", "-b:a", "192k", "-shortest", str(out))
    log(f"{out.name}: done")


def podcast_h3():
    """One-character landscape podcast with a moving camera: MiniMax H3 Max image-to-video on fal,
    Jordan's podcast image as first frame, his voice pinned as the soundtrack."""
    line = veed.ROOT / "inputs/voices/jordan-podcast.mp3"
    if not line.exists():
        r = veed.fal("fal-ai/elevenlabs/tts/eleven-v4", {
            "voice": "Chris", "stability": 0.45, "similarity_boost": 0.75, "seed": 42,
            "text": "Welcome back to the show. Today we're talking about how creators are building entire audiences "
                    "with AI characters: what's working, what isn't, and where it's all going next. "
                    "Grab a coffee, because this one's a good one."})
        veed.download(r["audio"]["url"], line); log(f"{line.name}: done")
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(line)],
                               capture_output=True, text=True).stdout)
    out = veed.ROOT / "inputs/videos/podcast-16x9.mp4"
    log(f"voice {dur:.1f}s -> minimax/h3-max/image-to-video")
    r = veed.fal("minimax/h3-max/image-to-video", {
        "image_url": veed.upload(veed.ROOT / "inputs/personas/jordan-podcast-16x9.jpg"),
        "target_audio_url": veed.upload(line),
        "duration": min(15, round(dur + 0.3, 1)), "resolution": "1080P", "prompt_expansion_mode": "balanced", "seed": 3,
        "prompt": "A podcast host in a cozy home studio speaks to camera into his microphone, relaxed and friendly, "
                  "natural head movement and small hand gestures, lips moving in sync with his speech. "
                  "Slow cinematic camera move: a gentle dolly-in with a subtle arc to the right, warm lamp light, "
                  "shallow depth of field. Same person, same room, no text, no cuts."})
    veed.download(r["video"]["url"], out); log(f"{out.name}: done")


def clean_audio():
    noise = veed.ROOT / "inputs/sounds/cafe-noise.mp3"
    if not noise.exists():
        r = veed.fal("fal-ai/elevenlabs/sound-effects/v2", {
            "text": "Busy coffee shop ambience: loud chatter, espresso machine steaming, cups and plates clinking",
            "duration_seconds": 15, "prompt_influence": 0.5})
        veed.download(r["audio"]["url"], noise); log("cafe noise: done")
    noisy = veed.ROOT / "inputs/videos/jordan-cafe-noisy.mp4"
    if not noisy.exists():
        ffmpeg("-i", str(veed.ROOT / "outputs/fabric/jordan-cafe.mp4"), "-stream_loop", "-1", "-i", str(noise),
               "-filter_complex", "[1:a]volume=0.55[n];[0:a][n]amix=inputs=2:duration=first:normalize=0[a]",
               "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", str(noisy))
        log(f"{noisy.name}: done")
    veed_video("clean-audio-video", {"video_url": veed.upload(noisy)}, veed.ROOT / "outputs/clean-audio/jordan-cafe-clean.mp4")


def final_ads():
    promo = veed.ROOT / "outputs/lipsync/maya-promo.mp4"
    subtitles(promo, "en-US", veed.ROOT / "outputs/ready-to-post/maya-promo-en.mp4")
    out_dir = veed.ROOT / "outputs/ready-to-post"; (out_dir / "steps").mkdir(parents=True, exist_ok=True)
    def one(lang, sub_lang, slug):
        dubbed = out_dir / "steps" / f"maya-promo-{slug}-dubbed.mp4"
        dub(promo, lang, dubbed)
        subtitles(dubbed, sub_lang, out_dir / f"maya-promo-{slug}.mp4")
    with ThreadPoolExecutor(3) as ex:
        list(ex.map(lambda a: one(*a), [("es", "es-ES", "es"), ("pt-BR", "pt-BR", "pt-br"), ("ja", "ja-JP", "ja")]))


def all_tasks():
    def promo_chain():
        lipsync(); final_ads()
    with ThreadPoolExecutor(5) as ex:
        futs = {n: ex.submit(f) for n, f in [("promo", promo_chain), ("dubs", dubs), ("captions", captions),
                                              ("background", background), ("clean_audio", clean_audio)]}
        for n, f in futs.items():
            try: f.result()
            except Exception as e: log(f"ERROR in {n}: {e}")


if __name__ == "__main__":
    tasks = sys.argv[1:]
    if not tasks: all_tasks()
    for t in tasks:
        try: globals()[t]()
        except Exception as e: log(f"ERROR in {t}: {e}")
