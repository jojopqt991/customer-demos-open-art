// Builds every page from assets/data.js. Each HTML file is a shell: <body data-page="<id>">.
// Load order: data.js, render.js, site.js (site.js turns .slot elements into media).

(function () {
  const id = document.body.dataset.page;
  const base = document.body.dataset.base || '';   // "../" on pages/*.html
  const u = path => base + path;
  const idx = PAGES.findIndex(p => p.id === id);
  const page = PAGES[idx];
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const num = i => String(i).padStart(2, '0');
  const models = PAGES.filter(p => !p.cover);
  const arrowR = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10h12m-5-5 5 5-5 5"/></svg>';
  const arrowL = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 10H4m5-5-5 5 5 5"/></svg>';
  const groupOf = p => p.cover ? 'Start' : (p.id === 'pipeline' || p.id === 'soon') ? 'Workflow' : 'Models';
  const badgeClass = b => /api/i.test(b) && !/coming/i.test(b) ? 'live' : /fal/i.test(b) ? 'fal' : /coming|early/i.test(b) ? 'later' : 'flow';

  document.title = page.cover ? `${SITE.title}${SITE.partner ? ' · VEED × ' + SITE.partner : ''}` : `${page.name} · ${SITE.title}`;

  // ── Top bar
  const top = `
    <div class="progress" style="width:${(idx / (PAGES.length - 1)) * 100}%"></div>
    <header class="topbar">
      <a class="brand" href="${u('index.html')}"><img src="${u('assets/brand/veed-logo-black.svg')}" alt="VEED">${SITE.partner ? `<span class="x">×</span><span>${esc(SITE.partner)}</span>` : ''}</a>
      <div class="rail">
        <button type="button" class="rail-arrow back" aria-label="Scroll pages back">${arrowL}</button>
        <nav class="chapters" aria-label="Pages">${PAGES.map(p =>
          `<a href="${u(p.file)}"${p.id === id ? ' aria-current="page"' : ''}>${esc(p.name)}</a>`).join('')}</nav>
        <button type="button" class="rail-arrow fwd" aria-label="Scroll pages forward">${arrowR}</button>
      </div>
      <details class="menu">
        <summary><span class="menu-label"><small>${page.cover ? 'Pages' : esc(groupOf(page))}</small>${esc(page.name)}</span>
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 8 5 5 5-5"/></svg></summary>
        <div class="menu-list">${['Start', 'Models', 'Workflow'].map(g => `
          <p class="menu-group">${g}</p>${PAGES.filter(p => groupOf(p) === g).map(p => `
          <a href="${u(p.file)}"${p.id === id ? ' aria-current="page"' : ''}>${g === 'Models' ? `<span class="n">${num(models.indexOf(p) + 1)}</span>` : ''}${esc(p.name)}${p.badge ? `<span class="badge ${badgeClass(p.badge)}">${esc(p.badge)}</span>` : ''}</a>`).join('')}`).join('')}
        </div>
      </details>
      <span class="count"><b>${num(idx + 1)}</b> / ${num(PAGES.length)}</span>
    </header>`;

  // ── Cards
  const card = c => {
    const kind = c.kind || 'video';
    return `
      <div class="card${c.result ? ' result' : ''}${c.span2 ? ' span2' : ''}">
        <div class="head"><h4>${esc(c.label)}</h4>${c.tag ? `<span class="tag">${esc(c.tag)}</span>` : ''}</div>
        <div class="slot${kind === 'audio' ? ' audio' : ''}${c.wide ? ' wide' : ''}${c.alpha ? ' alpha' : ''}" data-file="${u(c.file)}" data-kind="${kind}"${c.poster ? ` data-poster="${u(c.poster)}"` : ''} data-hint="${esc(c.hint || c.label)}"></div>
      </div>`;
  };

  // ── Page body
  let body = '';
  if (page.cover) {
    body = `
      <section class="cover">
        <p class="eyebrow">${esc(SITE.title)}</p>
        <h1>Bring your AI influencers to life</h1>
        <p class="subtitle">Start from a generated character image. VEED's models make them talk, change the script, speak every language, add captions, drop them into any scene, clean up the sound and reframe for vertical, all through one API.</p>
        <div class="cover-actions"><a class="primary" href="${u(models[0].file)}">Start with ${esc(models[0].name)} ${arrowR}</a><span class="hint">Use the arrows or ← → keys to move between models</span></div>
      </section>
      <section class="overview">
        <p class="eyebrow">Models in this demo</p>
        <div class="overview-grid">${models.map((p, i) => `
          <a class="overview-link" href="${u(p.file)}">
            <span class="number">${num(i + 1)}</span>
            <span class="ov-text"><strong>${esc(p.name)}</strong><small>${esc(p.short)}</small></span>
            <span class="badge ${badgeClass(p.badge)}">${esc(p.badge)}</span>
          </a>`).join('')}</div>
      </section>`;
  } else {
    const s = page.spec;
    const api = s && (s.api[1] ? `<a href="${s.api[1]}" target="_blank" rel="noopener">${esc(s.api[0])}</a>` : esc(s.api[0]));
    body = `
      <header class="slide-head">
        <p class="eyebrow">${num(idx)} · ${esc(page.name)} <span class="badge ${badgeClass(page.badge)}">${esc(page.badge)}</span></p>
        <h1>${esc(page.tagline)}</h1>
        <p class="subtitle">${esc(page.summary)}</p>
      </header>
      ${s ? `<dl class="spec">
        <div><dt>Input → Output</dt><dd>${esc(s.input)} → ${esc(s.output)}</dd></div>
        <div><dt>Limits</dt><dd>${esc(s.limits)}</dd></div>
        <div><dt>Price</dt><dd>${esc(s.price)}</dd></div>
        <div><dt>Endpoint</dt><dd class="mono">${api}</dd></div>
      </dl>` : ''}
      ${page.chain ? `<div class="chain">${page.chain.map(c => `<span>${esc(c)}</span>`).join(arrowR)}</div>` : ''}
      ${(page.usecases || []).map(u => `
        <section class="usecase">
          <div class="section-head"><h3>${esc(u.title)}</h3>${u.api ? `<span class="api"><a href="${u.api[1]}" target="_blank" rel="noopener">${esc(u.api[0])}</a></span>` : ''}</div>
          <p class="note">${esc(u.note)}</p>
          <div class="grid">${u.cards.map(card).join('')}</div>
        </section>`).join('')}
      ${page.soon ? `<div class="soon-grid">${page.soon.map(x => `
        <div class="soon-card"><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p>
          <ul>${x.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul></div>`).join('')}</div>
        <p class="soon-cta">${esc(page.cta)}</p>` : ''}
`;
  }

  // ── Prev / next
  const prev = PAGES[idx - 1], next = PAGES[idx + 1];
  const nav = `
    <nav class="pager" aria-label="Previous and next">
      ${prev ? `<a class="prev" href="${u(prev.file)}">${arrowL}<span><small>Previous</small>${esc(prev.name)}</span></a>` : '<span></span>'}
      ${next ? `<a class="next" href="${u(next.file)}"><span><small>Next</small>${esc(next.name)}</span>${arrowR}</a>` : `<a class="next" href="${u(PAGES[0].file)}"><span><small>Back to</small>${esc(PAGES[0].name)}</span>${arrowR}</a>`}
    </nav>`;

  document.body.insertAdjacentHTML('afterbegin', `${top}<main class="page">${body}${nav}</main>
    <footer>All examples generated with the <a href="https://api.veed.io/" target="_blank" rel="noopener">VEED API</a>.</footer>`);

  // Keyboard ← →, unless typing or using a media control
  document.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey || /INPUT|TEXTAREA|SELECT|VIDEO|AUDIO/.test(document.activeElement?.tagName)) return;
    if (e.key === 'ArrowRight') location.href = u((next || PAGES[0]).file);
    if (e.key === 'ArrowLeft' && prev) location.href = u(prev.file);
  });

  // Rail: centre the current page, show arrows + fade edges only when it overflows
  const rail = document.querySelector('.rail'), chapters = rail.querySelector('.chapters');
  const cur = chapters.querySelector('[aria-current]');
  const update = () => {
    const max = chapters.scrollWidth - chapters.clientWidth;
    rail.classList.toggle('overflow', max > 2);
    rail.classList.toggle('at-start', chapters.scrollLeft <= 2);
    rail.classList.toggle('at-end', chapters.scrollLeft >= max - 2);
  };
  const centre = () => {
    update(); // apply overflow layout (arrows, margins) before measuring
    if (cur) {
      const c = chapters.getBoundingClientRect(), r = cur.getBoundingClientRect();
      chapters.scrollTo({ left: chapters.scrollLeft + (r.left - c.left) - (c.width - r.width) / 2, behavior: 'instant' });
    }
    update();
  };
  rail.querySelector('.back').addEventListener('click', () => chapters.scrollBy({ left: -chapters.clientWidth * 0.7, behavior: 'smooth' }));
  rail.querySelector('.fwd').addEventListener('click', () => chapters.scrollBy({ left: chapters.clientWidth * 0.7, behavior: 'smooth' }));
  chapters.addEventListener('scroll', update, { passive: true });
  addEventListener('resize', centre);
  centre();

  // Menu: close on outside click or Escape
  const menu = document.querySelector('.menu');
  document.addEventListener('click', e => { if (menu.open && !menu.contains(e.target)) menu.open = false; });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') menu.open = false; });
})();
