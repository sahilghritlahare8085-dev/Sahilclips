// Live panel extras: auto-clip settings and the live stream playing right inside the page.
(() => {
  const $ = (id) => document.getElementById(id);
  const input = $('live-url'), box = $('live-box'); if (!input || !box) return;

  // shared by the link card too
  window.sahilEmbed = (url) => {
    url = String(url || '');
    if (/youtu/i.test(url)) { const m = url.match(/(?:v=|\/live\/|youtu\.be\/|\/embed\/)([A-Za-z0-9_-]{11})/); if (m) return { src: 'https://www.youtube.com/embed/' + m[1] + '?autoplay=1&mute=1&playsinline=1&rel=0', open: 'https://www.youtube.com/watch?v=' + m[1] }; }
    const t = url.match(/twitch\.tv\/([A-Za-z0-9_]{3,25})(?:[/?#]|$)/i);
    if (t && !/^(videos|directory|downloads)$/i.test(t[1])) return { src: 'https://player.twitch.tv/?channel=' + t[1] + '&parent=' + encodeURIComponent(location.hostname) + '&muted=true&autoplay=true', open: 'https://twitch.tv/' + t[1] };
    return null;
  };
  window.sahilPlayer = (host, url) => {           // fills `host` with the embedded player (or clears it)
    const e = window.sahilEmbed(url); host.replaceChildren();
    if (!e) { host.hidden = true; return false; }
    const f = document.createElement('iframe'); f.src = e.src; f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; f.allowFullscreen = true;
    f.referrerPolicy = 'strict-origin-when-cross-origin'; f.title = 'Live stream';
    const a = document.createElement('a'); a.href = e.open; a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'Not playing? Open it on ' + (/twitch/.test(e.open) ? 'Twitch' : 'YouTube') + ' ↗';
    host.append(f, a); host.hidden = false; return true;
  };

  const tools = document.createElement('div'); tools.className = 'live-tools';
  tools.innerHTML = '<label>Auto-clip sensitivity<select id="live-sens"><option value="normal">Normal · only big chat spikes</option><option value="high" selected>High · more clips</option><option value="max">Max · almost every burst</option></select></label>' +
    '<label>Also clip on a timer<select id="live-every"><option value="0">Off</option><option value="2">Every 2 min</option><option value="3" selected>Every 3 min</option><option value="5">Every 5 min</option><option value="10">Every 10 min</option></select></label>' +
    '<p class="muted">Quiet chat? The timer still saves the latest moment so you are never left with 0 clips.</p>';
  const player = document.createElement('div'); player.id = 'live-player'; player.hidden = true;
  box.before(tools, player);

  let timer = null, last = '';
  const sync = () => { const u = input.value.trim(); if (u === last) return; last = u; window.sahilPlayer(player, u); };
  ['input', 'paste', 'change'].forEach((ev) => input.addEventListener(ev, () => { clearTimeout(timer); timer = setTimeout(sync, 400); }));
  const start = $('live-start'); if (start) start.addEventListener('click', () => { last = ''; sync(); });
  sync();
})();
