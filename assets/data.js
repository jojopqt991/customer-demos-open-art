// All page content lives here. Each entry in PAGES becomes one page (see `file`).
// Paths are relative to the project root (render.js adds "../" on pages/).
// Card fields: label, tag, file, kind (video|image|audio), poster, hint, result (accent border), wide (16:9), span2, alpha (checkerboard).

const SITE = {
  partner: "OpenArt",          // set to "" for a VEED-only header
  title: "AI Influencer Demo",
};

const DOCS = "https://api.veed.io/docs/api/";

const PAGES = [
  {
    id: "overview", file: "index.html", name: "Overview", cover: true,
  },

  // ───────────────────────────── Fabric 1.0
  {
    id: "fabric", file: "pages/fabric.html", name: "Fabric 1.0", badge: "VEED API",
    short: "Image + audio → talking video",
    tagline: "From one image to a talking video",
    summary: "Fabric 1.0 animates any image with a clear face so it speaks an audio track: photos, illustrations, mascots. No filming, no animation.",
    spec: { input: "Image + audio", output: "Talking, lip-synced video", limits: "480p or 720p · up to 5 min", price: "$0.08/s (480p) · $0.15/s (720p)", api: ["/v1/fabric-1.0", DOCS + "post-v1-fabric-1-0"] },
    usecases: [
      {
        title: "Make a character talk", note: "One character image plus a voice track becomes a talking video.",
        cards: [
          { label: "Character image", tag: "Input", kind: "image", file: "inputs/personas/maya-gym.jpg" },
          { label: "Voice track", tag: "Input", kind: "audio", file: "inputs/voices/maya-gym.mp3" },
          { label: "Talking video", tag: "Fabric 1.0", result: true, file: "outputs/fabric/maya-gym.mp4", poster: "inputs/personas/maya-gym.jpg" },
        ],
      },
      {
        title: "Same character, any look", note: "New outfit, new setting, same face and voice. Every image of a character can talk, so a persona stays recognisable across every post.",
        cards: [
          { label: "Maya · Gym", tag: "Fabric 1.0", result: true, file: "outputs/fabric/maya-gym.mp4", poster: "inputs/personas/maya-gym.jpg" },
          { label: "Maya · Café", tag: "Fabric 1.0", result: true, file: "outputs/fabric/maya-cafe.mp4", poster: "inputs/personas/maya-cafe.jpg" },
          { label: "Freya · Home", tag: "Fabric 1.0", result: true, file: "outputs/fabric/freya-home.mp4", poster: "inputs/personas/freya-home.jpg" },
          { label: "Freya · Café", tag: "Fabric 1.0", result: true, file: "outputs/fabric/freya-cafe.mp4", poster: "inputs/personas/freya-cafe.jpg" },
        ],
      },
    ],
  },

  // ───────────────────────────── Lipsync 2.0
  {
    id: "lipsync", file: "pages/lipsync.html", name: "Lipsync 2.0", badge: "VEED API",
    short: "Video + new audio → re-synced video",
    tagline: "Same video, new script",
    summary: "Lipsync 2.0 re-renders a video so the speaker's mouth matches a new audio track. Reuse one clip for every product, offer or call to action.",
    spec: { input: "Video + new audio", output: "Video with re-synced lips", limits: "One speaker · output keeps the source resolution", price: "$0.07/s, any resolution", api: ["/v1/lipsync-2.0", DOCS + "post-v1-lipsync-2-0"] },
    usecases: [
      {
        title: "Swap the script", note: "The talking video from Fabric gets a promo script instead. The lips follow the new audio.",
        cards: [
          { label: "Input video", tag: "From Fabric", file: "outputs/fabric/maya-gym.mp4", poster: "inputs/personas/maya-gym.jpg" },
          { label: "New voice track", tag: "Input", kind: "audio", file: "inputs/voices/maya-promo.mp3" },
          { label: "Lip-synced video", tag: "Lipsync 2.0", result: true, file: "outputs/lipsync/maya-promo.mp4", poster: "inputs/personas/maya-gym.jpg" },
        ],
      },
    ],
  },

  // ───────────────────────────── Dubbing
  {
    id: "dubbing", file: "pages/dubbing.html", name: "Dubbing", badge: "VEED API",
    short: "Any video → any language",
    tagline: "Speak every language",
    summary: "Dubbing translates the speech, clones the speaker's voice and lip-syncs the face. Shown here with Dubbing Pro; Standard is also available for high-volume work.",
    spec: { input: "Video", output: "Dubbed, lip-synced video", limits: "Up to 10 min · Standard 80+ languages · Pro 90+ plus dialects (es-MX, pt-BR, fr-CA…)", price: "Standard $0.11/s · Pro $0.18/s", api: ["/v1/dubbing-pro", DOCS + "post-v1-dubbing-pro"] },
    usecases: [
      {
        title: "One video, every market", note: "The same influencer in their own voice, with matching lips.",
        cards: [
          { label: "Original", tag: "English", file: "outputs/fabric/maya-gym.mp4", poster: "inputs/personas/maya-gym.jpg" },
          { label: "Spanish", tag: "Pro", result: true, file: "outputs/dubbing/maya-gym-es-pro.mp4", poster: "inputs/personas/maya-gym.jpg" },
          { label: "French", tag: "Pro", result: true, file: "outputs/dubbing/maya-gym-fr-pro.mp4", poster: "inputs/personas/maya-gym.jpg" },
          { label: "Japanese", tag: "Pro", result: true, file: "outputs/dubbing/maya-gym-ja-pro.mp4", poster: "inputs/personas/maya-gym.jpg" },
        ],
      },
    ],
  },

  // ───────────────────────────── Subtitles
  {
    id: "subtitles", file: "pages/subtitles.html", name: "Subtitles", badge: "On fal",
    short: "Video → styled captions",
    tagline: "Social-ready captions",
    summary: "Subtitles transcribes and burns in styled captions so videos work on mute in every feed, in the spoken language or translated.",
    spec: { input: "Video", output: "Video with burned-in captions", limits: "30 style presets · optional translation", price: "$0.10–$0.40/min", api: ["veed/subtitles on fal", "https://fal.ai/models/veed/subtitles"] },
    usecases: [
      {
        title: "Pick a style", note: "Clean captions for brand content, bold animated captions for TikTok and Reels.",
        cards: [
          { label: "Input video", tag: "From Fabric", file: "outputs/fabric/maya-gym.mp4", poster: "inputs/personas/maya-gym.jpg" },
          { label: "Clean style", tag: "glass", result: true, file: "outputs/subtitles/maya-gym-glass.mp4", poster: "inputs/personas/maya-gym.jpg" },
          { label: "Social style", tag: "slay", result: true, file: "outputs/subtitles/maya-gym-slay.mp4", poster: "inputs/personas/maya-gym.jpg" },
        ],
      },
      {
        title: "Translate the captions", note: "English audio, Spanish captions, in one call.",
        cards: [
          { label: "Translated", tag: "glass · es", result: true, file: "outputs/subtitles/maya-gym-glass-es.mp4", poster: "inputs/personas/maya-gym.jpg" },
        ],
      },
    ],
  },

  // ───────────────────────────── Background removal
  {
    id: "background", file: "pages/background-removal.html", name: "Background Removal", badge: "VEED API",
    short: "Video → transparent cutout",
    tagline: "Drop them into any scene",
    summary: "Cut the influencer out of any clip, or key out a green screen, then place them over a product shot, a game or a new location. Both return a transparent cutout.",
    spec: { input: "Video", output: "Transparent cutout (WebM alpha, or RGB + matte)", limits: "Source up to 4K · no length cap · person and object modes", price: "$0.0225 / 30 frames · green screen $0.025 / 30 frames", api: ["/v1/video-background-removal", DOCS + "post-v1-video-background-removal"] },
    usecases: [
      {
        title: "Any footage", note: "Segments the person out of a normal clip.",
        cards: [
          { label: "Input video", tag: "Fabric 1.0", file: "outputs/fabric/jordan-cafe.mp4", poster: "inputs/personas/jordan-cafe.jpg" },
          { label: "Cutout", tag: "Background removal", result: true, alpha: true, file: "outputs/background-removal/jordan-cafe-cutout.webm" },
          { label: "New scene", tag: "Composite", result: true, file: "outputs/background-removal/jordan-rooftop.mp4" },
        ],
      },
      {
        title: "Footage shot on green", note: "The green-screen variant keys out the backdrop: faster and cleaner when one is available.", api: ["/v1/video-background-removal-green-screen", DOCS + "post-v1-video-background-removal-green-screen"],
        cards: [
          { label: "Green-screen video", tag: "Fabric 1.0", file: "outputs/fabric/freya-greenscreen.mp4", poster: "inputs/personas/freya-greenscreen.jpg" },
          { label: "Keyed", tag: "Green screen", result: true, alpha: true, file: "outputs/background-removal/freya-greenscreen-keyed.webm" },
          { label: "New scene", tag: "Composite", result: true, file: "outputs/background-removal/freya-bookshop.mp4" },
        ],
      },
    ],
  },

  // ───────────────────────────── Clean Audio
  {
    id: "cleanaudio", file: "pages/clean-audio.html", name: "Clean Audio", badge: "VEED API",
    short: "Noisy speech → studio sound",
    tagline: "Studio sound from any recording",
    summary: "Clean Audio removes café chatter, traffic and echo from speech in any language, from a voice track or a finished video.",
    spec: { input: "Audio or video", output: "Cleaned audio, or the same video with clean sound", limits: "Up to 30 min per file", price: "$0.0125/min", api: ["/v1/clean-audio-video", DOCS + "post-v1-clean-audio-video"] },
    usecases: [
      {
        title: "Fix a noisy take", note: "A recording made in a busy café, cleaned without touching the picture.",
        cards: [
          { label: "Noisy recording", tag: "Input", file: "inputs/videos/jordan-cafe-noisy.mp4", poster: "inputs/personas/jordan-cafe.jpg" },
          { label: "Cleaned", tag: "Clean Audio", result: true, file: "outputs/clean-audio/jordan-cafe-clean.mp4", poster: "inputs/personas/jordan-cafe.jpg" },
        ],
      },
    ],
  },

  // ───────────────────────────── Reframe
  {
    id: "reframe", file: "pages/reframe.html", name: "Reframe", badge: "Coming to the API",
    short: "Landscape → vertical",
    tagline: "Landscape to vertical, automatically",
    summary: "Reframe turns widescreen footage into vertical clips for TikTok, Reels and Shorts. With two people on screen it keeps both in frame, stacking the speakers instead of cropping one out.",
    spec: { input: "Landscape video, one or more speakers", output: "Vertical 9:16 video", limits: "Not on the API yet", price: "To be announced", api: ["Reframe (coming soon)", ""] },
    chain: ["English original", "Dubbed to Spanish", "Reframed to 9:16 + captions"],
    usecases: [
      {
        title: "One interview, every format", note: "A two-person conversation recorded in English and landscape, dubbed into Spanish in both speakers' voices, then reframed to vertical with Spanish captions.",
        cards: [
          { label: "Original", tag: "English · 16:9", wide: true, span2: true, file: "inputs/videos/interview-en-16x9.mp4" },
          { label: "Dubbed", tag: "Spanish · 16:9", result: true, wide: true, span2: true, file: "outputs/dubbing/interview-es-16x9.mp4" },
          { label: "Reframed", tag: "Spanish · 9:16", result: true, file: "outputs/reframe/interview-es-9x16-captioned.mp4" },
        ],
      },
    ],
  },

  // ───────────────────────────── Pipeline
  {
    id: "pipeline", file: "pages/ready-to-post.html", name: "Ready to post", badge: "Pipeline",
    short: "Four models, one workflow",
    tagline: "Put it together: ready to post, everywhere",
    summary: "One character image becomes a captioned promo in every market. Up to four API calls per market.",
    chain: ["Fabric 1.0", "Lipsync 2.0", "Dubbing Pro", "Subtitles"],
    usecases: [
      {
        title: "One promo, four markets", note: "Fabric for the video, Lipsync for the script, Dubbing for the language, Subtitles for the feed.",
        cards: [
          { label: "English", tag: "Final", result: true, file: "outputs/ready-to-post/maya-promo-en.mp4", poster: "inputs/personas/maya-gym.jpg" },
          { label: "Spanish", tag: "Final", result: true, file: "outputs/ready-to-post/maya-promo-es.mp4", poster: "inputs/personas/maya-gym.jpg" },
          { label: "Portuguese (BR)", tag: "Final", result: true, file: "outputs/ready-to-post/maya-promo-pt-br.mp4", poster: "inputs/personas/maya-gym.jpg" },
          { label: "Japanese", tag: "Final", result: true, file: "outputs/ready-to-post/maya-promo-ja.mp4", poster: "inputs/personas/maya-gym.jpg" },
        ],
      },
    ],
  },

  // ───────────────────────────── Coming soon
  {
    id: "soon", file: "pages/coming-soon.html", name: "Coming soon", badge: "Early access",
    short: "Two new avatar models",
    tagline: "Two new avatar models",
    summary: "The next generation of VEED avatar models, with early access from late November 2026.",
    soon: [
      { title: "Prompt control", text: "Direct the performance with text, not just audio.", bullets: ["Steer expression, gestures and energy with a prompt", "Match each clip to the brand's tone of voice"] },
      { title: "2K and 4K generation", text: "High-resolution avatar video, ready for ads and big screens.", bullets: ["Output at 2K or 4K", "Sharp detail on faces, hair and skin"] },
    ],
    cta: "Want early access? Ask your VEED contact.",
  },
];
