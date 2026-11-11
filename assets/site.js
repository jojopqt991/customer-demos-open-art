// Turns every .slot (created by render.js) into an <img>, <video> or <audio>.
// A missing file shows a placeholder with its source image (data-poster) and expected file name.
(function () {
  const wave = '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M4 10v4M8 7v10M12 4v16M16 8v8M20 11v2"/></svg>';

  function placeholder(slot) {
    const p = document.createElement('div');
    p.className = 'placeholder';
    if (slot.dataset.poster) { p.classList.add('has-poster'); p.style.backgroundImage = 'url("' + slot.dataset.poster + '")'; }
    const hint = document.createElement('span'); hint.textContent = slot.dataset.hint || 'Missing asset'; p.appendChild(hint);
    const c = document.createElement('code'); c.textContent = slot.dataset.file; p.appendChild(c);
    return p;
  }

  document.querySelectorAll('.slot').forEach(slot => {
    const kind = slot.dataset.kind, file = slot.dataset.file;
    const el = document.createElement(kind === 'image' ? 'img' : kind);
    if (kind !== 'image') { el.controls = true; el.preload = 'metadata'; el.playsInline = true; }
    else { el.alt = slot.dataset.hint || ''; el.loading = 'lazy'; }
    if (kind === 'video' && slot.dataset.poster) el.poster = slot.dataset.poster;
    if (kind === 'audio') slot.insertAdjacentHTML('beforeend', wave);
    el.addEventListener('error', () => { el.remove(); slot.querySelector('svg')?.remove(); slot.appendChild(placeholder(slot)); });
    el.src = file;
    slot.appendChild(el);
  });

  // Starting one video or audio pauses the others.
  document.addEventListener('play', e => {
    document.querySelectorAll('video, audio').forEach(o => { if (o !== e.target) o.pause(); });
  }, true);
})();
