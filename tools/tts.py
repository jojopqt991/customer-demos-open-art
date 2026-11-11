"""Generate the demo voice tracks with ElevenLabs v4 on fal → inputs/voices/<name>.mp3.

Usage: python3 -I tools/tts.py [name ...]   (reads FAL_KEY from .env at the project root)
Scripts and voice choices are documented in inputs/voices/SCRIPTS.md.
"""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import veed

OUT = veed.ROOT / "inputs" / "voices"

TRACKS = {  # file name: (ElevenLabs voice, script)
    "maya-gym": ("Jessica", "Okay, real talk. You don't need two hours in the gym. Twenty minutes, three moves: squats, push-ups, and a plank you actually hold. Do that four times a week and watch what happens. Save this for tomorrow, and tell me how it goes."),
    "maya-promo": ("Jessica", "Quick one before you go. My new twenty-minute program just dropped, and it's everything I do, every single week. No equipment, no excuses. The link's in my bio, and the first week is completely free. I'll see you in there."),
    "maya-cafe": ("Jessica", "Slow morning, iced matcha, and a to-do list I'm definitely ignoring. Honestly, rest days are part of the plan too. Your muscles grow when you recover, not when you grind. So if you needed permission to take today off, this is it."),
    "freya-home": ("Lily", "Hi, it's me. Cozy season is officially here, so here are the three things that make my evenings feel like a reset. A warm shower, my phone in another room, and one chapter of a good book. Try it tonight, and thank me tomorrow."),
    "freya-cafe": ("Lily", "Coffee date with myself, which I highly recommend, by the way. Every Sunday I sit somewhere new and plan my week on paper. No apps, no notifications. It sounds simple, but it's the one habit that's actually stuck with me."),
    "jordan-cafe": ("Chris", "Here's something nobody tells you about starting a podcast. Your first ten episodes are practice, and that's fine. Don't wait for the perfect mic or the perfect guest. Hit record, learn in public, and get a little better every week."),
    "jordan-podcast": ("Chris", "Welcome back to the show. Today we're talking about how creators are building entire audiences with AI characters: what's working, what isn't, and where it's all going next. Grab a coffee, because this one's a good one."),
}


def tts(name):
    out = OUT / f"{name}.mp3"
    if out.exists():
        return print(f"skip {out.name}")
    voice, text = TRACKS[name]
    r = veed.fal("fal-ai/elevenlabs/tts/eleven-v4", {"text": text, "voice": voice, "stability": 0.45,
                                                    "similarity_boost": 0.75, "seed": 42, "output_format": "mp3_44100_192"})
    OUT.mkdir(parents=True, exist_ok=True)
    veed.download(r["audio"]["url"], out)
    print(f"{name}: {voice} -> {out.relative_to(veed.ROOT)}")


if __name__ == "__main__":
    for n in (sys.argv[1:] or TRACKS):
        tts(n)
