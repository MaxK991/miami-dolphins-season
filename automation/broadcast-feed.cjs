'use strict';
const B = require('../broadcasts.js');
const HUB = 'https://www.rtl.de/sport/nfl/';
const SKY = 'https://www.sky.de/sport/nfl/sendeplan';
const MONTHS = ['januar','februar','märz','april','mai','juni','juli','august','september','oktober','november','dezember'];
const berlin = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Berlin', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', weekday: 'short', hourCycle: 'h23' });
function parts(game) { return Object.fromEntries(berlin.formatToParts(game.stamp).map(p => [p.type, p.value])); }
function text(html) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<[^>]*>/g, ' ')
    .replace(/&#(x[0-9a-f]+|\d+);/gi, (_, n) => { const v = n[0].toLowerCase() === 'x' ? parseInt(n.slice(1),16) : Number(n); return v > 0 && v <= 0x10ffff ? String.fromCodePoint(v) : ''; })
    .replace(/&(?:nbsp|amp|quot|apos|lt|gt);/g, s => ({'&nbsp;':' ','&amp;':'&','&quot;':'"','&apos;':"'",'&lt;':'<','&gt;':'>'}[s])).replace(/\s+/g,' ').trim();
}
function articleInfo(html) {
  for (const m of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { const data = JSON.parse(m[1]); for (const x of [data, ...(data['@graph'] || [])]) if (x['@type'] === 'NewsArticle') return x; } catch { /* Unknown markup remains unconfirmed. */ }
  }
  return null;
}
function articleLinks(html) {
  const urls = [];
  for (const m of html.matchAll(/href=["']([^"']+)["']/gi)) {
    try {
      const u = new URL(m[1], HUB);
      if (u.origin === new URL(HUB).origin && /^\/sport\/nfl\//.test(u.pathname) && /(?:woche|week|spiele)/i.test(u.pathname) && /(?:live|uebertrag|zeigen)/i.test(u.pathname) && u.pathname.endsWith('.html')) urls.push(u.href);
    } catch { /* Ignore malformed links. */ }
  }
  return [...new Set(urls)].slice(0, 6);
}
function namedTeam(label, team) {
  const clean = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  return [team.displayName, team.shortDisplayName, team.nickname, team.abbreviation].some(n => n && clean(n) === clean(label));
}
function matchup(pair, game) {
  const teams = pair.split(/\s*(?:@|\bat\b)\s*/i);
  if (teams.length !== 2) return false;
  const away = game.home ? game.opponent.team : game.mia.team, home = game.home ? game.mia.team : game.opponent.team;
  return namedTeam(teams[0], away) && namedTeam(teams[1], home);
}
function dateMatch(date, time, game) {
  if (!game.timed || !game.stamp) return false;
  const d = date.match(/(\d{1,2})\.?\s+(Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)(?:\s+(20\d{2}))?/i);
  const t = time.match(/(\d{1,2})(?:[.:](\d{2}))?\s*Uhr/i);
  if (!d || !t) return false;
  const p = parts(game);
  // Broadcaster listings can start with a short pre-game show. Never match a different calendar day.
  return Number(p.day) === Number(d[1]) && Number(p.month) === MONTHS.indexOf(d[2].toLowerCase()) + 1 && (!d[3] || Number(p.year) === Number(d[3])) && Math.abs(Number(p.hour) * 60 + Number(p.minute) - Number(t[1]) * 60 - Number(t[2] || 0)) <= 45;
}
function providers(label) {
  const s = label.trim();
  // RTL+ must never be classified as free RTL.
  const ids = [];
  if (/\bRTL\+/.test(s)) ids.push('rtlplus');
  if (/\bRTL(?![+\w])/.test(s)) ids.push('rtl');
  if (/\bNITRO\b/i.test(s)) ids.push('nitro');
  if (/\bSky\s+Sport\b/i.test(s)) ids.push('sky');
  return ids;
}
function listing(game, provider, mode, source, now) {
  return { id: game.id, year: game.year, stamp: game.stamp, provider, mode, source, checkedAt: new Date(now).toISOString() };
}
function parseRTL(html, source, games, now) {
  const info = articleInfo(html), published = Date.parse(info?.datePublished), modified = Date.parse(info?.dateModified || info?.datePublished);
  if (!B.sourceURL(source) || !Number.isFinite(published) || published > now + 86400000 || !Number.isFinite(modified)) throw Error('RTL-Artikel ohne verlässliches Datum');
  const rows = [...html.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map(m => text(m[1]).split('|').map(s => s.trim())).filter(a => a.length === 4 && a[3].includes('@'));
  if (!rows.length) throw Error('RTL-Sendeliste hat ein unbekanntes Format');
  const listings = [], windowGames = games.filter(g => g.stamp && Math.abs(g.stamp - published) < 15 * 86400000);
  for (const [date, time, channel, pair] of rows) for (const game of windowGames) {
    if (!matchup(pair, game) || !dateMatch(date, time, game)) continue;
    for (const id of providers(channel)) listings.push(listing(game, id, 'full', source, now));
  }
  const week = Number(String(info.headline).match(/(?:Week|Woche)\s+(\d+)/i)?.[1]);
  // Conference confirmation is scoped to this article's week and dated Sunday list, never all games.
  const hasNitro = /Konferenz.{0,160}NITRO.{0,40}Free-TV/i.test(info.articleBody || '');
  if (hasNitro && week) for (const game of windowGames) {
    const p = parts(game);
    if (game.phase !== 2 || game.week !== week || p.weekday !== 'Sun' || !rows.some(r => dateMatch(r[0], `${p.hour}:${p.minute} Uhr`, game)) || Number(p.hour) < 18 || Number(p.hour) > 23) continue;
    listings.push(listing(game, 'nitro', 'conference', source, now));
  }
  return listings;
}
function parseSky(html, source, games, now) {
  const rows = [...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map(m => [...m[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(c => text(c[1]))).filter(r => r.length >= 3 && /Uhr/.test(r[0]));
  if (!rows.length) throw Error('Sky-Sendeplan hat ein unbekanntes Format');
  const listings = [];
  // Rolling TV schedule has no year in its rows: only match near today's date.
  for (const game of games.filter(g => g.stamp && Math.abs(g.stamp - now) < 21 * 86400000)) for (const row of rows) {
    if (!/Sky Sport/.test(row[2])) continue;
    if (matchup(row[1], game) && dateMatch(row[0], row[0], game)) listings.push(listing(game, 'sky', 'full', source, now));
    if (/Konferenz|RedZone/.test(row[1]) && game.phase === 2) {
      const p = parts(game);
      if (p.weekday === 'Sun' && Number(p.hour) >= 18 && Number(p.hour) <= 23 && dateMatch(row[0], `${p.hour}:${p.minute} Uhr`, game)) listings.push(listing(game, 'sky', 'conference', source, now));
    }
  }
  return listings;
}
async function fetchText(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(18000), headers: { accept: 'text/html' } });
  if (!res.ok) throw Error(`HTTP ${res.status}`);
  return res.text();
}
async function refresh({games, previous, now = Date.now(), fetchHTML = fetchText}) {
  let old; try { old = B.validate(previous); } catch { old = { games: {} }; }
  const feed = { schema: 1, country: 'DE', checkedAt: new Date(now).toISOString(), refreshHours: 6, sources: {}, games: JSON.parse(JSON.stringify(old.games)) };
  // Remove old assignments when a kickoff changes; a later broadcast confirmation must match it again.
  for (const game of games) if (feed.games[game.id]?.stamp !== game.stamp) delete feed.games[game.id];
  function apply(source, listings) {
    const matched = new Set(listings.map(r => r.id));
    // Keep historical broadcasts when a rolling program moves on to the next week.
    // Future withdrawals and corrections for games in the reread list replace older values.
    for (const [id, entry] of Object.entries(feed.games)) {
      if (entry.stamp < now && !matched.has(id)) continue;
      entry.listings = (entry.listings || []).filter(r => r.source !== source);
      if (!entry.listings.length) delete feed.games[id];
    }
    for (const row of listings) {
      const entry = feed.games[row.id] ||= { year: row.year, stamp: row.stamp, listings: [] };
      const { id, year, stamp, ...value } = row;
      if (!entry.listings.some(r => r.provider === value.provider && r.mode === value.mode && r.source === value.source)) entry.listings.push(value);
    }
  }
  await Promise.all([
    (async () => {
      try {
        const links = articleLinks(await fetchHTML(HUB));
        if (!links.length) throw Error('Keine RTL-Sendeliste gefunden');
        const results = await Promise.allSettled(links.map(async url => { const rows = parseRTL(await fetchHTML(url), url, games, now); return {url, rows}; }));
        for (const result of results) if (result.status === 'fulfilled') apply(result.value.url, result.value.rows);
        feed.sources.rtl = results.every(r => r.status === 'fulfilled') ? 'ok' : 'partial';
        if (results.every(r => r.status === 'rejected')) feed.sources.rtl = 'unavailable';
      } catch { feed.sources.rtl = 'unavailable'; }
    })(),
    (async () => {
      try { apply(SKY, parseSky(await fetchHTML(SKY), SKY, games, now)); feed.sources.sky = 'ok'; }
      catch { feed.sources.sky = 'unavailable'; }
    })()
  ]);
  return feed;
}
module.exports = { HUB, SKY, text, articleLinks, articleInfo, matchup, dateMatch, providers, parseRTL, parseSky, refresh };
