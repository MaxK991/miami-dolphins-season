/* Dolphins Hub v8 — shared, deterministic data rules. No dependencies. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.DolphinsCore = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const TZ = 'Europe/Berlin';
  const isMiami = c => String(c?.team?.id) === '15' || c?.team?.abbreviation === 'MIA';
  function scoreNumber(value) {
    if (value && typeof value === 'object') {
      for (const key of ['value', 'displayValue', 'alternateDisplayValue', 'score']) {
        const n = scoreNumber(value[key]);
        if (n !== null) return n;
      }
      return null;
    }
    if (typeof value === 'number') return Number.isFinite(value) && value >= 0 ? value : null;
    return typeof value === 'string' && /^\d+(?:\.\d+)?$/.test(value.trim()) ? Number(value) : null;
  }
  function currentSeason(now = new Date()) {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: 'numeric' }).formatToParts(now);
    const year = Number(parts.find(p => p.type === 'year').value);
    const month = Number(parts.find(p => p.type === 'month').value);
    // January/February still belong to the NFL season that began last year.
    return month <= 2 ? year - 1 : year;
  }
  function normalizeEvent(event, fallbackPhase = 2) {
    const competition = event?.competitions?.[0];
    const teams = competition?.competitors || [];
    const mia = teams.find(isMiami);
    const opponent = teams.find(t => !isMiami(t));
    if (!mia || !opponent) return null;
    const status = competition.status || event.status || {};
    const type = status.type || {};
    const name = type.name || '';
    const cancelled = /CANCEL/i.test(name);
    const postponed = /POSTPON/i.test(name);
    const suspended = /SUSPEND|DELAY/i.test(name);
    const complete = !cancelled && !postponed && (type.completed === true || type.state === 'post');
    const live = !complete && !cancelled && !postponed && !suspended && type.state === 'in';
    const scores = [scoreNumber(mia.score), scoreNumber(opponent.score)];
    const hasScores = scores.every(s => s !== null);
    const result = complete && hasScores ? (scores[0] > scores[1] ? 'win' : scores[0] < scores[1] ? 'loss' : 'tie') : null;
    const stamp = Date.parse(event.date || competition.date);
    const phase = Number(event.seasonType?.type || event.seasonType?.id || (typeof event.season?.type === 'number' ? event.season.type : null) || fallbackPhase);
    const timed = event.timeValid !== false && competition.timeValid !== false && !status.isTBDFlex;
    return {
      id: String(event.id || competition.id), date: event.date || competition.date,
      stamp: Number.isFinite(stamp) ? stamp : null, timed,
      year: Number(event.season?.year) || null, phase,
      week: event.week?.number || null, weekText: event.week?.text || '',
      mia, opponent, scores, hasScores, result, complete, live, cancelled, postponed, suspended,
      state: type.state || 'pre', statusName: name,
      detail: type.shortDetail || type.detail || '',
      clock: status.displayClock || '', period: status.period || 0,
      home: mia.homeAway === 'home', neutral: !!competition.neutralSite,
      venue: competition.venue?.fullName || 'Stadion noch offen',
      city: competition.venue?.address?.city || competition.venue?.city || ''
    };
  }
  function normalizeSchedule(data, year, phase) {
    if (!data || !Array.isArray(data.events)) throw new Error('Ungültige Spielplandaten');
    return data.events.map(e => normalizeEvent(e, phase)).filter(g => g && (!g.year || g.year === year) && g.phase === phase);
  }
  function sortGames(games) {
    return [...new Map(games.map(g => [g.id, g])).values()].sort((a, b) => (a.stamp ?? Infinity) - (b.stamp ?? Infinity));
  }
  function focusGame(games, now = Date.now()) {
    const sorted = sortGames(games);
    const playable = sorted.filter(g => !g.cancelled && !g.postponed);
    const live = playable.find(g => g.live || g.suspended);
    if (live) return live;
    // A kickoff that just passed must remain selected while the feed catches up.
    const active = playable.find(g => !g.complete && g.stamp !== null && g.stamp <= now && now - g.stamp < 8 * 3600000);
    if (active) return active;
    const upcoming = playable.find(g => !g.complete && (g.stamp === null || g.stamp > now));
    if (upcoming) return upcoming;
    return [...sorted].reverse().find(g => g.complete) || sorted.at(-1) || null;
  }
  function record(games) {
    const counted = games.filter(g => g.phase === 2 && g.complete && g.result);
    const w = counted.filter(g => g.result === 'win').length;
    const l = counted.filter(g => g.result === 'loss').length;
    const t = counted.filter(g => g.result === 'tie').length;
    return { w, l, t, played: w + l + t, pct: (w + t / 2) / (w + l + t || 1) };
  }
  function dateParts(iso, timed = true) {
    const d = new Date(iso);
    if (!iso || !Number.isFinite(d.getTime())) return { date: 'Termin offen', day: '', time: 'Offen' };
    const fmt = options => new Intl.DateTimeFormat('de-DE', { timeZone: TZ, ...options }).format(d);
    return { date: fmt({ day: '2-digit', month: '2-digit', year: 'numeric' }), day: fmt({ weekday: 'short' }), time: timed ? fmt({ hour: '2-digit', minute: '2-digit', hour12: false }) : 'Offen' };
  }
  function parseStandings(data, year) {
    if (data?.season?.year && Number(data.season.year) !== year) throw new Error('Tabelle gehört zu einer anderen Saison');
    const rows = [];
    function visit(node, conference = '', division = '') {
      if (['AFC', 'NFC'].includes(node.abbreviation)) conference = node.abbreviation;
      if (node.name && /^(AFC|NFC) (East|North|South|West)$/.test(node.name)) division = node.name;
      if (node.standings?.season && Number(node.standings.season) !== year) return;
      if (node.standings?.seasonType && Number(node.standings.seasonType) !== 2) return;
      for (const entry of node.standings?.entries || []) {
        const get = name => entry.stats?.find(s => s.name === name || s.type === name);
        const num = name => scoreNumber(get(name)?.value);
        const w = num('wins'), l = num('losses'), t = num('ties');
        if (w === null || l === null || t === null || !entry.team) continue;
        rows.push({ team: entry.team, conference, division, w, l, t,
          pct: num('winPercent') ?? (w + t / 2) / (w + l + t || 1),
          seed: num('playoffSeed'), clinch: get('clincher')?.displayValue || '',
          differential: get('differential')?.displayValue || '–' });
      }
      for (const child of node.children || []) visit(child, conference, division);
    }
    if (data) visit(data);
    const unique = [...new Map(rows.map(r => [r.team.id, r])).values()];
    if (!unique.length) throw new Error('Noch keine Tabelle verfügbar');
    return unique;
  }
  function validSeeds(rows) {
    return rows.length === 16 && rows.every(r => Number.isInteger(r.seed) && r.seed >= 1 && r.seed <= 16) && new Set(rows.map(r => r.seed)).size === 16;
  }
  function rankRows(rows) {
    const seeded = rows.every(r => Number.isInteger(r.seed) && r.seed > 0) && new Set(rows.map(r => r.seed)).size === rows.length;
    return [...rows].sort((a, b) => (seeded ? a.seed - b.seed : b.pct - a.pct) || b.w - a.w || a.team.displayName.localeCompare(b.team.displayName));
  }
  return { TZ, scoreNumber, currentSeason, normalizeEvent, normalizeSchedule, sortGames, focusGame, record, dateParts, parseStandings, validSeeds, rankRows };
});
