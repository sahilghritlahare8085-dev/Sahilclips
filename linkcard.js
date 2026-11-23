// Link preview card: paste a link and see its thumbnail, title and channel before you start.
(() => {
  const mk = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; };
  ['url', 'live-url', 'ai-url'].forEach((id) => {
    const input = document.getElementById(id); if (!input) return;
    const card = mk('div', 'link-card'); card.hidden = true; (input.closest('.url-row') || input).after(card);
    let timer = null, last = '', seq = 0;
    const show = (j) => {
      card.className = 'link-card'; card.replaceChildren();
      const img = mk('div', 'lc-img');
      if (j.thumbnail) { const i = document.createElement('img'); i.src = j.thumbnail; i.alt = ''; i.referrerPolicy = 'no-referrer'; i.loading = 'lazy'; img.append(i); }
      if (j.live) img.append(mk('span', 'lc-live', '● LIVE')); else if (j.duration) img.append(mk('span', 'lc-dur', j.duration));
      const txt = mk('div', 'lc-t'); txt.append(mk('b', '', j.title), mk('small', '', [j.platform, j.channel].filter(Boolean).join(' • ')));
      if (id === 'live-url' && !j.live) txt.append(mk('em', 'lc-warn', '⚠ This link is not live right now. Live clipping needs a stream that is on air.'));
      if (j.live && id !== 'live-url') {
        const row = mk('div', 'lc-actions');
        const watch = mk('button', '', '▶ Watch here'); const clip = mk('button', 'go', '⚡ Clip this live');
        const player = mk('div', 'lc-player'); player.hidden = true;
        watch.onclick = () => { if (player.hidden) { window.sahilPlayer && window.sahilPlayer(player, input.value); } else { player.hidden = true; player.replaceChildren(); } };
        clip.onclick = () => {
          const lu = document.getElementById('live-url'); if (!lu) return;
          lu.value = input.value.trim(); lu.dispatchEvent(new Event('input', { bubbles: true }));
          const q = document.querySelector('#quick [data-quick="live"]'); if (q && q.offsetParent) q.click(); else lu.scrollIntoView({ behavior: 'smooth', block: 'center' });
        };
        row.append(watch, clip); txt.append(row); card.append(img, txt, player); return;
      }
      card.append(img, txt);
    };
    const run = async () => {
      const u = input.value.trim(); if (u === last) return; last = u;
      if (!/^https?:\/\/\S+$/i.test(u)) { card.hidden = true; return; }
      const my = ++seq; card.hidden = false; card.className = 'link-card loading'; card.replaceChildren(mk('div', 'lc-img'), (() => { const t = mk('div', 'lc-t'); t.append(mk('b', '', 'Fetching link details…')); return t; })());
      try {
        const r = await fetch('/link/preview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: u }) });
        const j = await r.json(); if (my !== seq) return; if (!r.ok) throw new Error(j.detail || 'failed'); show(j);
      } catch (e) { if (my !== seq) return; card.className = 'link-card err'; card.textContent = 'Could not read this link yet. You can still tap Make clips.'; }
    };
    ['input', 'paste', 'change'].forEach((ev) => input.addEventListener(ev, () => { clearTimeout(timer); timer = setTimeout(run, ev === 'paste' ? 200 : 700); }));
  });
})();
