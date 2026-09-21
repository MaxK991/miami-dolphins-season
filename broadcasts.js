/* German broadcasts only. ESPN's US channels are deliberately not used here. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.DolphinsBroadcasts = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const PROVIDERS = {
    rtl: { name: 'RTL', free: true, url: 'https://www.rtl.de/sport/nfl/' },
    nitro: { name: 'NITRO', free: true, url: 'https://www.rtl.de/sport/nfl/' },
    rtlplus: { name: 'RTL+', free: false, url: 'https://plus.rtl.de/' },
    sky: { name: 'Sky Sport', free: false, url: 'https://www.sky.de/sport/nfl/sendeplan' },
    gamepass: { name: 'NFL Game Pass · DAZN', free: false, url: 'https://www.dazn.com/de-DE/welcome/nfl' }
  };
  // Rights checked for this season only; never project today's providers into old/future seasons.
  const GAME_PASS_SEASON = 2026;
  const GAME_PASS_SOURCE = 'https://www.dazn.com/en-GB/help/articles/16310468908957-dazn-and-nfl-game-pass-the-ultimate-football-experience';
  function sourceURL(value) {
    try {
      const u = new URL(value);
      return u.protocol === 'https:' && ['www.rtl.de', 'www.sky.de'].includes(u.hostname) ? u.href : null;
    } catch { return null; }
  }
  function validate(feed) {
    if (!feed || feed.schema !== 1 || feed.country !== 'DE' || !feed.games || typeof feed.games !== 'object' || Array.isArray(feed.games) || !Number.isFinite(Date.parse(feed.checkedAt))) throw Error('Ungültige deutsche Senderdaten');
    for (const entry of Object.values(feed.games)) {
      if (!entry || !Number.isInteger(entry.year) || !Number.isFinite(entry.stamp) || !Array.isArray(entry.listings) || entry.listings.some(row => !row || typeof row !== 'object')) throw Error('Ungültige Senderzuordnung');
    }
    return feed;
  }
  function resolve(game, feed, now = Date.now(), cached = false) {
    const full = [], conference = [], sources = [];
    if (game.cancelled || game.postponed) return { hidden: true };
    let entry = feed?.games?.[game.id], oldest = Infinity;
    if (!entry || entry.year !== game.year || entry.stamp !== game.stamp || !game.timed) entry = null;
    for (const row of entry?.listings || []) {
      const provider = PROVIDERS[row.provider], source = sourceURL(row.source), checkedAt = Date.parse(row.checkedAt);
      if (!provider || row.provider === 'gamepass' || !source || !Number.isFinite(checkedAt) || !['full', 'conference'].includes(row.mode)) continue;
      const list = row.mode === 'full' ? full : conference;
      if (!list.some(x => x.id === row.provider)) list.push({ ...provider, id: row.provider });
      if (!sources.some(x => x.url === source)) sources.push({ url: source, name: new URL(source).hostname === 'www.rtl.de' ? 'RTL' : 'Sky' });
      oldest = Math.min(oldest, checkedAt);
    }
    if (game.year === GAME_PASS_SEASON && game.timed) full.push({ ...PROVIDERS.gamepass, id: 'gamepass' });
    const free = full.filter(p => p.free), paid = full.filter(p => !p.free);
    const historic = game.complete || (game.stamp && game.stamp < now - 12 * 3600000);
    return { full, free, paid, conference, sources, historic, checkedAt: Number.isFinite(oldest) ? oldest : null,
      stale: Number.isFinite(oldest) && !historic && (cached || now - oldest > 72 * 3600000),
      freeNote: free.length ? '' : historic ? 'Keine Free-TV-Angabe gespeichert' : 'Free-TV noch nicht bestätigt',
      gamepass: paid.some(p => p.id === 'gamepass') };
  }
  return { PROVIDERS, GAME_PASS_SEASON, GAME_PASS_SOURCE, sourceURL, validate, resolve };
});
