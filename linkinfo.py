"""Lightweight link preview (title, channel, thumbnail) for the card shown under the link box."""
import re, time

_CACHE = {}
NAMES = {'youtube': 'YouTube', 'twitch': 'Twitch', 'kick': 'Kick', 'twitter': 'X', 'instagram': 'Instagram', 'tiktok': 'TikTok', 'facebook': 'Facebook'}


def _fmt(sec):
    sec = int(sec)
    h, m, s = sec // 3600, sec % 3600 // 60, sec % 60
    return f'{h}:{m:02d}:{s:02d}' if h else f'{m}:{s:02d}'


def preview(url, ydl_factory):
    url = (url or '').strip()
    if not re.match(r'^https?://\S+$', url) or len(url) > 500:
        raise ValueError('Paste a full link that starts with https://')
    hit = _CACHE.get(url)
    if hit and time.time() - hit[0] < 600:
        return hit[1]
    opts = {'quiet': True, 'no_warnings': True, 'skip_download': True, 'noplaylist': True, 'socket_timeout': 15, 'retries': 1}
    with ydl_factory(opts) as y:
        info = y.extract_info(url, download=False)
    if info and info.get('entries'):
        info = next((e for e in info['entries'] if e), info)
    if not info:
        raise RuntimeError('No details found')
    thumb = info.get('thumbnail') or ((info.get('thumbnails') or [{}])[-1].get('url'))
    if not (isinstance(thumb, str) and thumb.startswith('https://')):
        thumb = ''
    key = str(info.get('extractor_key') or info.get('extractor') or '').lower().split(':')[0]
    out = {'title': str(info.get('title') or 'Untitled')[:200],
           'channel': str(info.get('channel') or info.get('uploader') or '')[:80],
           'platform': NAMES.get(key, key.title() or 'Link'),
           'thumbnail': thumb,
           'live': bool(info.get('is_live')),
           'duration': _fmt(info['duration']) if isinstance(info.get('duration'), (int, float)) and info['duration'] > 0 else ''}
    _CACHE[url] = (time.time(), out)
    if len(_CACHE) > 64:
        _CACHE.pop(next(iter(_CACHE)))
    return out
