/* Shared RFC 5545 calendar export for one game or a complete season. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.DolphinsCalendar = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const escapeText = value => String(value ?? '').replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
  const utc = stamp => new Date(stamp).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  function fold(line) {
    const encoder = new TextEncoder();
    let output = '', bytes = 0;
    for (const char of line) {
      const size = encoder.encode(char).length;
      if (bytes + size > 75) { output += '\r\n '; bytes = 1; }
      output += char; bytes += size;
    }
    return output;
  }
  function eligible(games, season) {
    return [...new Map(games.filter(game => game && game.id && (!game.year || game.year === Number(season)) && game.timed && Number.isFinite(game.stamp) && !game.cancelled && !game.postponed && !game.suspended).map(game => [game.id, game])).values()].sort((a, b) => a.stamp - b.stamp);
  }
  function build(games, season, now = Date.now()) {
    const selected = eligible(games, season);
    if (!selected.length) throw new Error('Keine bestätigten Spieltermine verfügbar.');
    const name = `Miami Dolphins · Saison ${season}`;
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Dolphins Hub//DE', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', `X-WR-CALNAME:${escapeText(name)}`, 'X-WR-TIMEZONE:Europe/Berlin'];
    for (const game of selected) {
      const phase = { 1: 'Preseason', 2: 'Regular Season', 3: 'Playoffs' }[game.phase] || 'NFL';
      const opponent = game.opponent?.team?.displayName || 'Gegner noch offen';
      const description = [`${phase}${game.week ? ' · Week ' + game.week : ''} · Saison ${season}.`, game.neutral ? 'Neutraler Spielort.' : game.home ? 'Heimspiel der Miami Dolphins.' : 'Auswärtsspiel der Miami Dolphins.', 'Anstoßzeit laut ESPN. Die Endzeit ist auf 3,5 Stunden geschätzt.', 'Einmaliger Import: spätere Terminänderungen werden nicht automatisch übernommen.'].join('\n');
      lines.push('BEGIN:VEVENT', `UID:dolphins-${escapeText(game.id)}@private-season-hub`, `DTSTAMP:${utc(now)}`, `DTSTART:${utc(game.stamp)}`, `DTEND:${utc(game.stamp + 3.5 * 3600000)}`, `SUMMARY:${escapeText('Miami Dolphins vs. ' + opponent)}`, `LOCATION:${escapeText(game.venue + (game.city ? ', ' + game.city : ''))}`, `DESCRIPTION:${escapeText(description)}`, 'STATUS:CONFIRMED', 'END:VEVENT');
    }
    lines.push('END:VCALENDAR');
    return lines.map(fold).join('\r\n') + '\r\n';
  }
  return { eligible, build };
});
