/* NFL postseason data: actual matchups are separate from regular-season seeds. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./core.js'));
  else root.DolphinsPostseason = factory(root.DolphinsCore);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (C) {
  'use strict';
  const ROUNDS = [{ week: 1, name: 'Wild Card' }, { week: 2, name: 'Divisional Round' }, { week: 3, name: 'Conference Finals' }, { week: 5, name: 'Super Bowl' }];
  const AFC = new Set(['BAL', 'BUF', 'CIN', 'CLE', 'DEN', 'HOU', 'IND', 'JAX', 'KC', 'LV', 'OAK', 'SD', 'LAC', 'MIA', 'NE', 'NYJ', 'PIT', 'TEN']);
  const NFC = new Set(['ARI', 'ATL', 'CAR', 'CHI', 'DAL', 'DET', 'GB', 'LAR', 'MIN', 'NO', 'NYG', 'PHI', 'SF', 'SEA', 'TB', 'WSH', 'WAS']);
  function conference(team) {
    const abbreviation = team?.abbreviation;
    return AFC.has(abbreviation) ? 'AFC' : NFC.has(abbreviation) ? 'NFC' : '';
  }
  function normalize(event, season, fallbackWeek) {
    if (event?.season?.year && Number(event.season.year) !== Number(season)) return null;
    if (event?.season?.type && Number(event.season.type) !== 3) return null;
    const c = event?.competitions?.[0];
    if (!c) return null;
    const rawTeams = c.competitors || [];
    // Do not mistake the AFC/NFC Pro Bowl teams for NFL playoff clubs.
    if (rawTeams.some(t => ['AFC', 'NFC'].includes(t.team?.abbreviation))) return null;
    const teams = [...rawTeams].sort((a, b) => (a.homeAway === 'away' ? 0 : 1) - (b.homeAway === 'away' ? 0 : 1));
    if (teams.length !== 2) return null;
    // The feed publishes "TBD at TBD" placeholders months ahead of time.
    // They are not confirmed matchups and often carry artificial kickoff times.
    if (teams.some(t => !conference(t.team))) return null;
    const headline = (c.notes || []).map(n => n.headline || '').join(' ');
    const explicitRound = /super bowl/i.test(headline) ? 5 : /wild.?card/i.test(headline) ? 1 : /divisional/i.test(headline) ? 2 : /championship/i.test(headline) ? 3 : null;
    const week = explicitRound || Number(event.week?.number) || fallbackWeek;
    if (!ROUNDS.some(r => r.week === week)) return null;
    const status = c.status || event.status || {}, type = status.type || {};
    const cancelled = /CANCEL/i.test(type.name || ''), postponed = /POSTPON/i.test(type.name || ''), suspended = /SUSPEND|DELAY/i.test(type.name || '');
    const complete = !cancelled && !postponed && (type.completed === true || type.state === 'post');
    const scores = teams.map(t => C.scoreNumber(t.score));
    const hasScores = scores.every(s => s !== null);
    let winner = null;
    if (complete && hasScores && scores[0] !== scores[1]) winner = teams[scores[0] > scores[1] ? 0 : 1];
    else if (complete && teams.filter(t => t.winner === true).length === 1) winner = teams.find(t => t.winner === true);
    const confs = teams.map(t => conference(t.team));
    const conf = week === 5 ? 'AFC × NFC' : confs[0] && confs[0] === confs[1] ? confs[0] : /^AFC\b/.test(headline) ? 'AFC' : /^NFC\b/.test(headline) ? 'NFC' : 'NFL';
    return { id: String(event.id || c.id), year: Number(season), week, teams, scores, hasScores, winner, complete, live: type.state === 'in' && !complete && !cancelled && !postponed && !suspended, cancelled, postponed, suspended, conference: conf, headline, date: event.date || c.date, timed: event.timeValid !== false && c.timeValid !== false && !status.isTBDFlex, venue: c.venue?.fullName || 'Stadion noch offen', city: c.venue?.address?.city || '', neutral: !!c.neutralSite, period: status.period || 0, clock: status.displayClock || '' };
  }
  function parse(data, season, week) {
    if (!data || !Array.isArray(data.events)) throw new Error('Ungültige Playoff-Daten');
    if (data.season?.year && Number(data.season.year) !== Number(season)) throw new Error('Falsche Playoff-Saison');
    return data.events.map(event => normalize(event, season, week)).filter(g => g && g.week === week);
  }
  function combine(games) {
    return [...new Map(games.map(g => [g.id, g])).values()].sort((a, b) => a.week - b.week || (Date.parse(a.date) || Infinity) - (Date.parse(b.date) || Infinity));
  }
  return { ROUNDS, parse, combine, conference };
});
