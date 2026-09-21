/* Dolphins Hub v8.5.1 — optional TV data must never prevent the schedule from starting. */
(function () {
  'use strict';
  const C = DolphinsCore;
  const Calendar = DolphinsCalendar;
  const Postseason = DolphinsPostseason;
  const Broadcasts = typeof DolphinsBroadcasts === 'undefined' ? null : DolphinsBroadcasts;
  const API = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl';
  const TABLE_API = 'https://site.api.espn.com/apis/v2/sports/football/nfl/standings';
  const pages = { schedule: ['index.html', 'Spielplan'], table: ['tabelle.html', 'Tabelle'], playoffs: ['playoffs.html', 'Playoffs'] };
  const phaseNames = { 1: 'Preseason', 2: 'Regular Season', 3: 'Playoffs' };
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${{ pin: '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2"/>', calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M16 3v4M8 3v4M3 11h18m9 3v4m-2-2h4"/>', update: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>' }[name]}</svg>`;
  function logo(team) {
    const abbr = String(team?.abbreviation || 'MIA').toLowerCase().replace(/[^a-z0-9]/g, '');
    return `https://a.espncdn.com/i/teamlogos/nfl/500/${abbr}.png`;
  }
  function image(team, cls = 'team-logo') {
    return `<img class="${cls}" src="${logo(team)}" alt="" width="40" height="40" loading="lazy">`;
  }
  // Every fresh load starts at the current game, including table/playoff URLs.
  let season = C.currentSeason(), page = 'schedule';
  let games = [], focus = null, pending = 0, timer = null, countdownTimer = null;
  let lastHidden = 0, userMoved = false, toastTimer;
  let loadedSeasonYear = C.currentSeason();
  let calendarLinks = null, calendarRequest = 0, returnCalendarFocus = null, postseasonLive = false;
  let broadcastPacket = null;
  const memory = new Map();
  const inFlight = new Map();
  const hasStorage = (() => { try { localStorage.setItem('dh-probe', '1'); localStorage.removeItem('dh-probe'); return true; } catch { return false; } })();
  function stored(key) {
    try { return memory.get(key) || (hasStorage ? JSON.parse(localStorage.getItem(key)) : null); } catch { return null; }
  }
  function save(key, value) {
    memory.set(key, value);
    try { if (hasStorage) localStorage.setItem(key, JSON.stringify(value)); } catch { /* Full/disabled cache does not block fresh data. */ }
  }
  async function resource(key, url, validate) {
    const cacheKey = 'dolphins-v8:' + key;
    if (inFlight.has(cacheKey)) return inFlight.get(cacheKey);
    const task = (async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      try {
        const res = await fetch(url, { cache: 'no-store', signal: controller.signal });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        validate(data);
        const packet = { data, timestamp: Date.now() };
        save(cacheKey, packet);
        return { ...packet, stale: false };
      } catch (error) {
        const cache = stored(cacheKey);
        if (cache?.data && Number.isFinite(cache.timestamp)) {
          validate(cache.data);
          return { ...cache, stale: true };
        }
        throw error;
      } finally { clearTimeout(timeout); }
    })();
    inFlight.set(cacheKey, task);
    try { return await task; } finally { inFlight.delete(cacheKey); }
  }
  function seasonOptions() {
    $('seasonSelect').innerHTML = C.seasonYears().map(year => `<option value="${year}">${year}</option>`).join('');
    $('seasonSelect').value = String(season);
    $('footerYear').textContent = new Date().getFullYear();
  }
  function updateChrome() {
    $('seasonSelect').value = String(season);
    $('toolbarTitle').textContent = `${pages[page][1]} · ${season}`;
    document.title = `${pages[page][1]} ${season} · Dolphins Hub`;
    document.body.dataset.page = page;
    document.querySelectorAll('[data-page]').forEach(a => {
      if (a.tagName !== 'A') return;
      const active = a.dataset.page === page;
      a.classList.toggle('active', active);
      if (active) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    $('jumpButton').hidden = page !== 'schedule' || !focus;
    $('seasonCalendarButton').hidden = page !== 'schedule';
    $('seasonCalendarButton').disabled = false;
    $('seasonCalendarButton').setAttribute('aria-label', 'Dolphins-Kalender abonnieren');
    $('seasonCalendarCount').textContent = 'ABO';
  }
  function notice(text) {
    clearTimeout(toastTimer);
    $('toast').textContent = text; $('toast').hidden = false;
    toastTimer = setTimeout(() => { $('toast').hidden = true; }, 3200);
  }
  function status(packets, missing = []) {
    const oldest = Math.min(...packets.map(p => p.timestamp));
    const stale = packets.some(p => p.stale) || missing.length > 0;
    $('dataStatus').classList.toggle('stale', stale);
    const time = Number.isFinite(oldest) ? new Intl.DateTimeFormat('de-DE', { timeZone: C.TZ, day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(oldest) : '';
    let text = stale ? `Gespeicherter oder unvollständiger Stand${time ? ' · ' + time : ''}.` : `Aktualisiert ${time} · automatische Aktualisierung aktiv.`;
    if (missing.length) text += ` ${missing.join(', ')} derzeit nicht verfügbar.`;
    if (packets.some(p => p.stale)) text += ' Erneuter Abruf folgt automatisch.';
    $('dataStatus').innerHTML = icon('update') + `<span>${esc(text)}</span>`;
    return stale;
  }
  function gameStatus(game, selected, stale) {
    if (game.cancelled) return '<span class="badge">ABGESAGT</span>';
    if (game.postponed) return '<span class="badge">VERSCHOBEN</span>';
    if (game.suspended) return '<span class="badge">UNTERBROCHEN</span>';
    if (game.live) return `<span class="badge ${stale ? '' : 'live'}"><span class="dot"></span>${stale ? 'GESPEICHERTER SPIELSTAND' : 'LIVE'}</span>`;
    if (game.complete) return `<span class="badge ${game.result || ''}">${{ win: 'SIEG', loss: 'NIEDERLAGE', tie: 'UNENTSCHIEDEN' }[game.result] || 'BEENDET · ERGEBNIS OFFEN'}</span>`;
    return `<span class="badge ${selected ? 'current-label' : ''}">${selected ? '<span class="dot"></span>NÄCHSTES SPIEL' : 'ANSTEHEND'}</span>`;
  }
  function teamRow(game, competitor, index) {
    const show = game.hasScores && (game.complete || game.live || game.suspended);
    const winner = game.complete && show && game.scores[index] > game.scores[1 - index];
    const location = game.neutral ? 'Neutraler Spielort' : competitor.homeAway === 'home' ? 'Heim' : 'Auswärts';
    return `<div class="team-row ${index === 0 ? 'miami' : ''}" data-team="${esc(competitor.team.abbreviation)}">${image(competitor.team)}<div class="team-copy"><strong>${esc(competitor.team.displayName)}</strong><small>${esc(competitor.team.abbreviation)} · ${location}</small></div><span class="score ${!show ? 'pending' : ''} ${winner ? 'winner' : ''}" aria-label="${esc(competitor.team.displayName)}: ${show ? game.scores[index] + ' Punkte' : 'noch kein Spielstand'}">${show ? game.scores[index] : '–'}</span></div>`;
  }
  function countdownText(game) {
    if (game.live && /HALFTIME/i.test(game.statusName)) return 'Halbzeit';
    if (game.live) return `${game.period > 4 ? 'Overtime' : `${game.period}. Viertel`}${game.clock ? ' · ' + game.clock : ''}`;
    if (game.suspended) return 'Spiel unterbrochen';
    if (game.complete) return 'Letztes Spiel dieser Saison';
    if (!game.timed || !game.stamp) return 'Anstoßzeit folgt';
    const delta = game.stamp - Date.now();
    if (delta <= 0) return 'Warte auf aktuellen Spielstatus';
    const mins = Math.ceil(delta / 60000), hours = Math.floor(mins / 60), days = Math.floor(hours / 24);
    return days ? `Kickoff in ${days} T ${hours % 24} Std` : hours ? `Kickoff in ${hours} Std ${mins % 60} Min` : `Kickoff in ${mins} Min`;
  }
  function broadcasts(game) {
    if (!Broadcasts) return '<section class="game-tv" aria-label="Übertragung in Deutschland"><div class="tv-title"><span>Übertragung</span><small>DEUTSCHLAND</small></div><p class="tv-note">Senderangaben derzeit nicht verfügbar.</p></section>';
    const info = Broadcasts.resolve(game, broadcastPacket?.data, Date.now(), !!broadcastPacket?.stale);
    if (info.hidden) return '';
    const link = (provider, mode = '') => `<a class="tv-provider ${provider.free ? 'tv-free' : 'tv-paid'}" href="${esc(provider.url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(provider.name + (mode ? ' · ' + mode : '') + ' · ' + (provider.free ? 'Free-TV' : 'kostenpflichtig') + ' · Anbieter öffnen')}">${esc(provider.name)}<span aria-hidden="true">↗</span></a>`;
    const free = info.free.length ? info.free.map(p => link(p)).join('') : `<span class="tv-unknown">${esc(info.freeNote)}</span>`;
    const paid = info.paid.length ? `<div class="tv-row"><span class="tv-kind">PAY-TV / ABO</span><div class="tv-links">${info.paid.map(p => link(p)).join('')}</div></div>` : '';
    const conference = info.conference.length ? `<div class="tv-conference"><span>In der Konferenz · Ausschnitte aus mehreren Spielen</span><div class="tv-links">${info.conference.map(p => `<div>${link(p, 'Konferenz')}<small>${p.free ? 'Free-TV' : 'Pay-TV'}</small></div>`).join('')}</div></div>` : '';
    const stamp = info.checkedAt ? new Intl.DateTimeFormat('de-DE', { timeZone: C.TZ, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(info.checkedAt) : '';
    const sources = info.sources.map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.name)}-Programm</a>`).join(' · ');
    return `<section class="game-tv" aria-label="Übertragung in Deutschland"><div class="tv-title"><span>${info.historic ? 'Übertragung' : 'Hier läuft das Spiel'}</span><small>DEUTSCHLAND</small></div><div class="tv-row"><span class="tv-kind">FREE-TV</span><div class="tv-links">${free}</div></div>${paid}${info.gamepass ? '<p class="tv-note">Game Pass: separates Abo bei DAZN · US-Originalkommentar.</p>' : ''}${conference}${stamp ? `<p class="tv-source ${info.stale ? 'tv-stale' : ''}">${info.stale ? 'Ältere Senderangabe · bitte beim Anbieter prüfen. ' : ''}Programm geprüft: ${esc(stamp)} Uhr · ${sources}</p>` : ''}</section>`;
  }
  function card(game, selected, stale) {
    const dt = C.dateParts(game.date, game.timed);
    const week = game.weekText || (game.week ? 'Week ' + game.week : phaseNames[game.phase]);
    return `<article class="game ${selected ? 'current' : ''}" id="game-${esc(game.id)}" ${selected ? 'aria-current="true"' : ''} aria-label="${esc(week)}, Miami Dolphins gegen ${esc(game.opponent.team.displayName)}"><div class="game-top"><span class="week">${esc(week.toUpperCase())}</span>${gameStatus(game, selected, stale)}</div>${teamRow(game, game.mia, 0)}${teamRow(game, game.opponent, 1)}<div class="game-bottom"><div><span class="date">${esc(dt.day)}${dt.day ? ', ' : ''}${esc(dt.date)}</span><small>${game.neutral ? 'Neutraler Spielort' : game.home ? 'Heimspiel in Miami' : 'Auswärtsspiel'}</small></div><div style="text-align:right"><span class="time">${esc(dt.time)}${dt.time !== 'Offen' ? ' Uhr' : ''}</span><small>Deutsche Zeit</small></div></div><div class="venue">${icon('pin')}<span>${esc(game.venue)}${game.city ? ' · ' + esc(game.city) : ''}</span></div>${broadcasts(game)}${selected ? `<div class="focus-extra"><span class="countdown">${stale && game.live ? 'Gespeicherter Live-Stand' : esc(countdownText(game))}</span></div>` : ''}</article>`;
  }
  function scrollToFocus(smooth = false) {
    if (page !== 'schedule' || !focus) return;
    const el = $('game-' + focus.id);
    if (!el) return;
    const top = window.scrollY + el.getBoundingClientRect().top - document.querySelector('.app-header').getBoundingClientRect().height - 14;
    window.scrollTo({ top: Math.max(0, top), behavior: smooth && !matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'auto' });
  }
  function renderSchedule(data, stale, missing, livePacket = null) {
    const previousId = focus?.id;
    games = C.mergeScoreboard(data.flatMap(d => d.games), livePacket ? C.scoreboardGames(livePacket.data, season) : [], !!livePacket?.stale);
    focus = C.focusGame(games);
    const record = C.record(games);
    const regularLoaded = data.some(d => d.phase === 2);
    const bye = data.find(d => d.phase === 2)?.bye;
    let html = `<section class="hero"><div class="hero-line"><span class="tiny-mark"></span><p class="eyebrow">Miami Dolphins · Season ${season}</p></div><h1>FINS <em>UP.</em></h1><p class="hero-copy">Jedes Spiel. Jeder Punkt. Deine Dolphins.<br>Die ganze Saison – in deiner Zeit.</p></section><section class="stats" aria-label="Saisonüberblick"><div class="stat"><b>${regularLoaded ? record.w + '–' + record.l + (record.t ? '–' + record.t : '') : '–'}</b><small>Siege · Niederlagen${record.t ? ' · Remis' : ''}</small></div><div class="stat"><b>${regularLoaded ? record.played + '/' + games.filter(g => g.phase === 2 && !g.cancelled).length : '–'}</b><small>Regular Season</small></div><div class="stat"><b>${bye ? 'W' + esc(bye) : '–'}</b><small>Spielfreie Woche</small></div></section><div class="schedule-intro"><h2>Dein Spielplan</h2><span class="small-label">Alle Zeiten in Deutschland<br>Frühere Spiele ↑ · Kommende ↓</span></div>`;
    if (games.length) {
      const tvFresh = broadcastPacket && !broadcastPacket.stale && Date.now() - Date.parse(broadcastPacket.data.checkedAt) < 72 * 3600000;
      const tvComplete = tvFresh && Object.values(broadcastPacket.data.sources || {}).length >= 2 && Object.values(broadcastPacket.data.sources).every(s => s === 'ok');
      html += `<p class="tv-summary">Sender für Deutschland · Einzelspiel und Konferenz getrennt. ${season < C.currentSeason() ? 'Historische Sender werden nur angezeigt, wenn sie gespeichert wurden.' : 'Die Free-TV-Auswahl wird oft erst kurz vor dem Spiel veröffentlicht.'}${!tvComplete ? ' Die Senderauswahl ist gerade nicht vollständig aktuell; bitte beim Anbieter prüfen.' : ''}</p>`;
    }
    if (!games.length) html += `<div class="empty"><strong>Der Spielplan folgt.</strong><p>Für ${season} sind noch keine Dolphins-Spiele veröffentlicht. Sobald sie verfügbar sind, erscheinen sie hier automatisch.</p></div>`;
    for (const phase of [1, 2, 3]) {
      const list = games.filter(g => g.phase === phase);
      if (!list.length) continue;
      html += `<section aria-label="${phaseNames[phase]}"><div class="phase-heading"><h3>${phaseNames[phase]}</h3></div>`;
      html += list.map(g => card(g, g.id === focus?.id, stale)).join('') + '</section>';
    }
    if (missing.length) html += `<div class="empty"><strong>Ein Teil der Daten fehlt gerade.</strong><p>${esc(missing.join(', '))} konnten nicht geladen werden.</p><button class="retry" data-retry>Erneut versuchen</button></div>`;
    $('content').innerHTML = html;
    $('jumpButton').hidden = !focus;
    $('jumpButton').querySelector('span').textContent = focus?.complete ? 'Letztes Spiel' : 'Aktuelles Spiel';
    clearInterval(countdownTimer);
    countdownTimer = setInterval(() => {
      const node = document.querySelector('.countdown');
      if (node && focus && !(stale && focus.live)) node.textContent = countdownText(focus);
    }, 30000);
    return previousId !== focus?.id;
  }
  const recordText = row => `${row.w}–${row.l}${row.t ? '–' + row.t : ''}`;
  function teamCell(row, i, started) {
    return `<span class="table-team"><span class="rank">${started ? i + 1 : '–'}</span>${image(row.team, '')}<span><strong>${esc(row.team.name || row.team.displayName)}</strong><small>${esc(row.team.abbreviation)}</small></span></span>`;
  }
  function tableRows(rows, started) {
    return rows.map((r, i) => `<tr class="${r.team.abbreviation === 'MIA' ? 'mia' : ''}"><td>${teamCell(r, i, started)}</td><td>${r.w}</td><td>${r.l}</td><td>${r.t}</td><td>${(r.pct * 100).toLocaleString('de-DE', { maximumFractionDigits: 1 })}%</td></tr>`).join('');
  }
  function renderTable(rows) {
    const east = C.rankRows(rows.filter(r => r.division === 'AFC East'));
    if (east.length !== 4) throw new Error('AFC-East-Tabelle unvollständig');
    const started = east.some(r => r.w + r.l + r.t > 0);
    const ranked = C.validSeeds(rows.filter(r => r.conference === 'AFC'));
    $('content').innerHTML = `<section class="section-hero"><p class="eyebrow">Season ${season} · Regular Season</p><h1>Die Division.<br>Unser Revier.</h1><p>Alle vier Teams der AFC East im Blick.</p></section><section class="panel"><h2>AFC East</h2><p>${started ? 'Saisonbilanz aller Division-Teams' : 'Die Regular Season hat noch nicht begonnen.'}</p><div class="table-scroll"><table class="standings"><caption hidden>AFC East ${season}: Siege, Niederlagen, Unentschieden und Siegquote</caption><thead><tr><th scope="col">TEAM</th><th scope="col">S</th><th scope="col">N</th><th scope="col">U</th><th scope="col">QUOTE</th></tr></thead><tbody>${tableRows(east, started && ranked)}</tbody></table></div><p class="table-note">S = Siege · N = Niederlagen · U = Unentschieden<br>Die Quote zählt ein Unentschieden als halben Sieg. Preseason und Playoffs zählen nicht zur Saisonbilanz.</p></section><section class="panel"><h2>Jedes Ergebnis zählt.</h2><p>Die Tabelle verwendet die vollständigen Bilanzen aller Teams. ${ranked ? 'Bei gleicher Bilanz folgt die Reihenfolge der von ESPN gelieferten Platzierung.' : 'Reihenfolge nach Bilanz; eindeutige Platzierungen und Tiebreaker sind derzeit nicht verfügbar.'}</p></section>`;
  }
  function seedRow(row, seeded, started) {
    const code = row.clinch;
    const clinch = code === 'z' ? 'Division gewonnen' : code === 'y' ? 'Division gewonnen' : code === 'x' ? 'Playoffs gesichert' : code === 'e' ? 'Ausgeschieden' : code === '*' ? 'Heimrecht gesichert' : '';
    return `<div class="seed-row ${row.team.abbreviation === 'MIA' ? 'mia' : ''}"><span class="seed-num">${seeded && started ? row.seed : '–'}</span>${image(row.team, '')}<span><strong>${esc(row.team.displayName)}</strong><small>${esc(row.division)}${clinch ? ' · ' + clinch : ''}</small></span><b>${recordText(row)}</b></div>`;
  }
  function postseasonCard(game, stale) {
    const dt = C.dateParts(game.date, game.timed);
    const showScores = game.hasScores && (game.complete || game.live || game.suspended);
    const label = game.cancelled ? 'ABGESAGT' : game.postponed ? 'VERSCHOBEN' : game.suspended ? 'UNTERBROCHEN' : game.live ? (stale ? 'GESPEICHERTER STAND' : 'LIVE') : game.complete ? 'BEENDET' : 'ANSTEHEND';
    const rows = game.teams.map((competitor, index) => {
      const team = competitor.team || { displayName: 'Teilnehmer noch offen', abbreviation: 'TBD' };
      const winner = game.winner === competitor;
      const affiliation = Postseason.conference(team);
      return `<div class="post-team ${winner ? 'post-winner' : ''}" data-team="${esc(team.abbreviation)}">${team.id ? image(team) : '<span class="team-placeholder">?</span>'}<div><strong>${esc(team.displayName)}</strong><small>${affiliation}${game.neutral ? (affiliation ? ' · ' : '') + 'Neutraler Spielort' : (affiliation ? ' · ' : '') + (competitor.homeAway === 'home' ? 'Heim' : 'Auswärts')}</small></div><span class="post-score" aria-label="${esc(team.displayName)}: ${showScores ? game.scores[index] + ' Punkte' : 'noch kein Spielstand'}">${showScores ? game.scores[index] : '–'}</span></div>`;
    }).join('');
    const liveDetail = game.live ? `${game.period > 4 ? 'Overtime' : game.period + '. Viertel'}${game.clock ? ' · ' + game.clock : ''}` : '';
    return `<article class="postgame ${game.week === 5 ? 'superbowl-game' : ''}" id="postgame-${esc(game.id)}"><div class="game-top"><span class="conference-tag ${game.conference === 'NFC' ? 'nfc' : ''}">${esc(game.conference)}</span><span class="badge ${game.live && !stale ? 'live' : ''}">${label}</span></div>${rows}<div class="post-result">${game.winner ? `Sieger: <strong>${esc(game.winner.team.displayName)}</strong>` : game.complete ? 'Sieger oder Ergebnis noch nicht bestätigt.' : liveDetail ? esc(liveDetail) : 'Sieger steht noch nicht fest.'}</div><div class="game-bottom"><div><span class="date">${esc(dt.day)}${dt.day ? ', ' : ''}${esc(dt.date)}</span><small>${game.neutral ? 'Neutraler Spielort' : 'Spielort des Heimteams'}</small></div><div class="post-time"><span class="time">${esc(dt.time)}${dt.time !== 'Offen' ? ' Uhr' : ''}</span><small>Deutsche Zeit</small></div></div><div class="venue">${icon('pin')}<span>${esc(game.venue)}${game.city ? ' · ' + esc(game.city) : ''}</span></div></article>`;
  }
  function conferenceStandings(rows, name, archived) {
    const group = rows.filter(r => r.conference === name);
    const slots = season >= 2020 ? 7 : 6;
    if (group.length !== 16) return `<section class="panel conference-panel" data-conference="${name}"><h2>${name}</h2><p>Die vollständige ${name}-Tabelle ist gerade nicht verfügbar.</p></section>`;
    const seeded = C.validSeeds(group), sorted = C.rankRows(group), started = group.some(r => r.w + r.l + r.t > 0);
    if (!seeded || !started) return `<section class="panel conference-panel" data-conference="${name}"><h2>${name} · Bilanzübersicht</h2><p>${started ? 'Noch keine verlässliche Setzliste verfügbar.' : 'Vor Saisonbeginn stehen noch keine aussagekräftigen Seeds fest.'}</p>${sorted.map(r => seedRow(r, false, started)).join('')}</section>`;
    return `<section class="panel conference-panel" data-conference="${name}"><div class="conference-heading"><h2>${name}</h2><span class="conference-tag ${name === 'NFC' ? 'nfc' : ''}">Seeds 1–${slots}</span></div><p>${archived ? 'Qualifikation nach der Regular Season' : 'Aktuelles Playoff-Feld · Momentaufnahme'}</p><div class="playoff-field">${sorted.slice(0, slots).map(r => seedRow(r, true, true)).join('')}</div><details class="outside-field" data-retain="outside-${name}"><summary>Außerhalb · Seeds ${slots + 1}–16</summary>${sorted.slice(slots).map(r => seedRow(r, true, true)).join('')}</details></section>`;
  }
  function renderPlayoffs(rows, postseason) {
    const slots = season >= 2020 ? 7 : 6;
    const afc = rows.filter(r => r.conference === 'AFC'), mia = afc.find(r => r.team.abbreviation === 'MIA');
    const started = rows.some(r => r.w + r.l + r.t > 0), archived = season < C.currentSeason();
    const seeded = C.validSeeds(afc), actual = postseason.games;
    const championGame = actual.find(g => g.week === 5 && g.complete && g.winner);
    let championCard = '', miamiCard = '';
    if (championGame) {
      const team = championGame.winner.team;
      championCard = `<section class="panel champion-card">${image(team, 'champion-logo')}<div><p class="eyebrow">${esc(championGame.headline || 'Super Bowl')} · Sieger</p><h2>${esc(team.displayName)}</h2><p>Champion der Saison ${season}</p></div></section>`;
    }
    if (mia) {
      const title = !started ? 'Alles noch offen.' : seeded ? 'AFC Seed #' + mia.seed : 'Bilanz ' + recordText(mia);
      const copy = !started ? 'Das Rennen um die Playoffs beginnt mit der Regular Season.' : !seeded ? 'Noch keine verlässliche Setzliste verfügbar.' : mia.seed <= slots ? (archived ? 'Miami war für diese Playoffs qualifiziert.' : 'Miami steht aktuell auf einem Playoff-Platz.') : (archived ? 'Miami war in dieser Saison nicht für die Playoffs qualifiziert.' : 'Miami steht aktuell außerhalb der Playoff-Plätze.');
      miamiCard = `<section class="panel miami-status">${image(mia.team, '')}<span class="eyebrow">Miami Dolphins · ${recordText(mia)}</span><b>${title}</b><p>${copy}</p></section>`;
    }
    let matchups = '', superBowl = '';
    if (!actual.length) {
      const unavailable = postseason.missing.length === Postseason.ROUNDS.length;
      matchups = `<div class="empty"><strong>${unavailable ? 'Playoff-Spiele gerade nicht erreichbar.' : archived ? 'Keine Playoff-Begegnungen verfügbar.' : 'Die Paarungen stehen noch nicht fest.'}</strong><p>${unavailable ? 'Bitte die Daten noch einmal aktualisieren.' : `Die Playoffs der Saison ${season} finden im Kalenderjahr ${season + 1} statt. Sobald die Begegnungen veröffentlicht sind, erscheinen hier Termine, Spielorte und später die Ergebnisse.`}</p></div>`;
    }
    for (const round of Postseason.ROUNDS) {
      const roundGames = actual.filter(g => g.week === round.week);
      if (!roundGames.length && !postseason.missing.includes(round.week)) continue;
      const description = round.week === 5 ? 'AFC-Champion gegen NFC-Champion' : round.week === 3 ? 'AFC & NFC Championship Games' : 'AFC & NFC';
      const roundMarkup = `<details class="post-round" data-retain="round-${round.week}" open><summary><span><strong>${round.name}</strong><small>${description}</small></span><span class="round-count">${roundGames.length ? roundGames.length + (roundGames.length === 1 ? ' Spiel' : ' Spiele') : 'Daten fehlen'}</span></summary><div class="post-games-grid">${roundGames.map(g => postseasonCard(g, postseason.stale)).join('') || '<div class="empty"><p>Diese Runde konnte gerade nicht geladen werden.</p></div>'}</div></details>`;
      if (round.week === 5) superBowl = roundMarkup; else matchups += roundMarkup;
    }
    const seeds = `<details class="seeds-section" data-retain="seeds" ${archived && actual.length ? '' : 'open'}><summary><span><strong>AFC & NFC · Setzlisten</strong><small>${archived ? 'Stand nach der Regular Season' : 'Aktueller Stand der Regular Season'}</small></span></summary><div class="playoff-columns">${['AFC', 'NFC'].map(name => conferenceStandings(rows, name, archived)).join('')}</div><p class="table-note">Seeds 1–4: Division-Sieger · Seeds 5–${slots}: Wild Cards. ${slots === 7 ? 'Seed 1 jeder Conference hat' : 'Seeds 1 und 2 jeder Conference haben'} in der Wild Card Round spielfrei. Die Seeds werden aus ESPN übernommen, einschließlich der dort berücksichtigten Tiebreaker.</p></details>`;
    $('content').innerHTML = `<section class="section-hero"><p class="eyebrow">Season ${season} · AFC & NFC</p><h1>Der ganze Weg.<br>Bis zum Super Bowl.</h1><p>Alle Playoff-Runden, Spielorte und Sieger.<br>Saison ${season} · Postseason ${season + 1}</p></section>${championCard}${superBowl}${miamiCard}<section class="postseason-matchups" aria-label="Playoff-Spiele"><div class="schedule-intro"><h2>Spiele & Ergebnisse</h2><span class="small-label">${actual.length} Begegnungen<br>Deutsche Anstoßzeiten</span></div>${matchups}</section>${seeds}`;
  }
  async function load(options = {}) {
    const { jump = false, quiet = false } = options;
    const token = ++pending, requestedSeason = season, requestedPage = page;
    const oldFocus = focus?.id;
    const retainedDetails = quiet ? [...document.querySelectorAll('details[data-retain]')].map(el => [el.dataset.retain, el.open]) : [];
    const visiblePostGame = quiet && page === 'playoffs' ? [...document.querySelectorAll('.postgame')].find(el => el.getBoundingClientRect().bottom > document.querySelector('.app-header').getBoundingClientRect().bottom) : null;
    const postAnchor = visiblePostGame ? { id: visiblePostGame.id, top: visiblePostGame.getBoundingClientRect().top } : null;
    const anchor = quiet ? [...document.querySelectorAll('.game')].find(el => el.getBoundingClientRect().bottom > document.querySelector('.app-header').getBoundingClientRect().bottom) : null;
    const anchorId = anchor?.id, anchorTop = anchor?.getBoundingClientRect().top;
    clearTimeout(timer); clearInterval(countdownTimer);
    $('refreshButton').disabled = true;
    if (!quiet) {
      focus = null; userMoved = false;
      games = []; postseasonLive = false;
      $('jumpButton').hidden = true;
      $('content').innerHTML = '<p class="loading-text" role="status">Aktuelle NFL-Daten werden geladen …</p><div class="skeleton"></div><div class="skeleton"></div>';
      $('dataStatus').textContent = '';
    }
    updateChrome();
    try {
      if (requestedPage === 'schedule') {
        const requests = [1, 2, 3].map(async phase => {
          const packet = await resource(`schedule:${requestedSeason}:${phase}`, `${API}/teams/15/schedule?season=${requestedSeason}&seasontype=${phase}`, data => C.normalizeSchedule(data, requestedSeason, phase));
          return { ...packet, phase, games: C.normalizeSchedule(packet.data, requestedSeason, phase), bye: packet.data.byeWeek };
        });
        // The season schedule omits scores during games; scoreboard supplies live scores and clock.
        const current = requestedSeason === C.currentSeason();
        requests.push(current ? resource(`live:${requestedSeason}`, `${API}/scoreboard?limit=100`, data => C.scoreboardGames(data, requestedSeason)) : Promise.resolve(null));
        requests.push(Broadcasts ? resource('broadcasts:de', new URL('broadcasts-de.json', location.href).href, Broadcasts.validate) : Promise.resolve(null));
        const responses = await Promise.allSettled(requests);
        if (token !== pending) return;
        const ok = responses.slice(0, 3).filter(r => r.status === 'fulfilled').map(r => r.value);
        const missing = responses.slice(0, 3).flatMap((r, i) => r.status === 'rejected' ? [phaseNames[i + 1]] : []);
        const livePacket = responses[3]?.status === 'fulfilled' ? responses[3].value : null;
        broadcastPacket = responses[4]?.status === 'fulfilled' ? responses[4].value : null;
        if (current && !livePacket) missing.push('Live-Spielstände');
        if (!ok.length && !livePacket) throw new Error('Spielplandaten nicht erreichbar');
        const stale = status([...ok, ...(livePacket ? [livePacket] : [])], missing);
        renderSchedule(ok, stale, missing, livePacket);
      } else if (requestedPage === 'playoffs') {
        const results = await Promise.allSettled([
          resource(`standings:${requestedSeason}`, `${TABLE_API}?season=${requestedSeason}&type=0&level=3`, data => C.parseStandings(data, requestedSeason)),
          ...Postseason.ROUNDS.map(round => resource(`postseason:${requestedSeason}:${round.week}`, `${API}/scoreboard?dates=${requestedSeason}&seasontype=3&week=${round.week}`, data => Postseason.parse(data, requestedSeason, round.week)))
        ]);
        if (token !== pending) return;
        const packets = results.filter(r => r.status === 'fulfilled').map(r => r.value);
        if (!packets.length) throw new Error('Playoff-Daten nicht erreichbar');
        const rows = results[0].status === 'fulfilled' ? C.parseStandings(results[0].value.data, requestedSeason) : [];
        const roundGames = [], missing = [], labels = [];
        if (!rows.length) labels.push('AFC-/NFC-Tabelle');
        Postseason.ROUNDS.forEach((round, i) => {
          const result = results[i + 1];
          if (result.status === 'fulfilled') roundGames.push(...Postseason.parse(result.value.data, requestedSeason, round.week));
          else { missing.push(round.week); labels.push(round.name); }
        });
        const stale = status(packets, labels), actual = Postseason.combine(roundGames);
        postseasonLive = actual.some(g => g.live);
        renderPlayoffs(rows, { games: actual, missing, stale });
        for (const [key, open] of retainedDetails) {
          const el = [...document.querySelectorAll('details[data-retain]')].find(node => node.dataset.retain === key);
          if (el) el.open = open;
        }
        if (postAnchor && $(postAnchor.id)) window.scrollBy(0, $(postAnchor.id).getBoundingClientRect().top - postAnchor.top);
      } else {
        const packet = await resource(`standings:${requestedSeason}`, `${TABLE_API}?season=${requestedSeason}&type=0&level=3`, data => C.parseStandings(data, requestedSeason));
        if (token !== pending) return;
        const rows = C.parseStandings(packet.data, requestedSeason);
        renderTable(rows);
        status([packet]);
      }
      if (token !== pending) return;
      updateChrome();
      if (jump && page === 'schedule' && !userMoved) requestAnimationFrame(() => { if (token === pending && !userMoved) scrollToFocus(); });
      else if (quiet && anchorId && $(anchorId)) window.scrollBy(0, $(anchorId).getBoundingClientRect().top - anchorTop);
      if (quiet && oldFocus && focus?.id !== oldFocus) notice('Das aktuelle Spiel wurde aktualisiert.');
    } catch (error) {
      if (token !== pending) return;
      if (!quiet || !$('content').querySelector('.game, .standings, .seed-row')) {
        $('content').innerHTML = '<div class="empty"><strong>Kurze Auszeit.</strong><p>Die NFL-Daten sind gerade nicht erreichbar oder für diese Saison noch nicht verfügbar. Bitte versuche es gleich noch einmal.</p><button class="retry" data-retry>Erneut versuchen</button></div>';
      }
      $('dataStatus').classList.add('stale');
      $('dataStatus').textContent = 'Aktualisierung fehlgeschlagen. Vorhandene Werte sind möglicherweise veraltet.';
    } finally {
      if (token === pending) {
        $('refreshButton').disabled = false;
        timer = setTimeout(() => { if (!document.hidden) load({ quiet: true }); }, focus?.live || postseasonLive ? 30000 : 120000);
      }
    }
  }
  function navigate(nextPage, reset = false) {
    if (reset) season = C.currentSeason();
    page = nextPage;
    history.pushState({ page, season }, '', pages[page][0]);
    window.scrollTo({ top: 0, behavior: 'auto' });
    seasonOptions(); load({ jump: page === 'schedule' });
  }
  async function openSeasonCalendar() {
    const request = ++calendarRequest;
    calendarLinks = null;
    const subscribe = $('calendarSubscribe');
    subscribe.removeAttribute('href'); subscribe.setAttribute('aria-disabled', 'true');
    $('calendarCopy').disabled = true;
    $('calendarUrl').value = '';
    $('calendarCaution').hidden = true;
    $('calendarSetup').hidden = true;
    $('calendarFeedback').textContent = 'Kalenderabo wird geprüft …';
    returnCalendarFocus = document.activeElement;
    const dialog = $('calendarDialog');
    if (!dialog.open) {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const links = Calendar.links(location.href);
      const response = await fetch(links.status, { cache: 'no-store', signal: controller.signal });
      if (!response.ok) throw new Error('Kalender noch nicht erreichbar');
      const info = Calendar.validateStatus(await response.json());
      if (request !== calendarRequest) return;
      calendarLinks = links;
      subscribe.href = links.webcal; subscribe.removeAttribute('aria-disabled');
      $('calendarCopy').disabled = false;
      $('calendarUrl').value = links.https;
      const updated = new Intl.DateTimeFormat('de-DE', { timeZone: C.TZ, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(info.updatedAt);
      $('calendarFeedback').textContent = `Kalenderstand: ${updated} Uhr · ${info.eventCount} Spieltermine.`;
      if (Date.now() - info.updatedAt > 72 * 3600000) {
        $('calendarCaution').hidden = false;
        $('calendarCaution').textContent = 'Dieser Kalender wurde seit mehr als drei Tagen nicht aktualisiert. Bitte vor dem Abonnieren den Aktualisierungslauf in GitHub prüfen.';
        $('calendarSetup').hidden = false;
      }
    } catch {
      if (request !== calendarRequest) return;
      $('calendarFeedback').textContent = 'Das Kalenderabo ist noch nicht eingerichtet oder gerade nicht erreichbar. Bitte nach der Einrichtung oder später erneut versuchen.';
      $('calendarSetup').hidden = false;
    } finally { clearTimeout(timeout); }
  }
  function closeSeasonCalendar() {
    calendarRequest++;
    const dialog = $('calendarDialog');
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
    returnCalendarFocus?.focus();
  }
  document.addEventListener('click', e => {
    const nav = e.target.closest('a[data-page]');
    if (nav && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) { e.preventDefault(); navigate(nav.dataset.page); return; }
    if (e.target.closest('[data-home]')) { e.preventDefault(); navigate('schedule', true); return; }
    if (e.target.closest('[data-retry]')) { load({ jump: page === 'schedule' }); return; }
    if (e.target.closest('[data-close-calendar]')) { closeSeasonCalendar(); return; }
    if (e.target.closest('#calendarSubscribe[aria-disabled="true"]')) e.preventDefault();
  });
  $('seasonSelect').addEventListener('change', e => {
    season = Number(e.target.value);
    history.replaceState({ page, season }, '', pages[page][0]);
    window.scrollTo({ top: 0, behavior: 'auto' });
    load({ jump: page === 'schedule' });
  });
  $('refreshButton').addEventListener('click', () => load({ quiet: true }));
  $('jumpButton').addEventListener('click', () => scrollToFocus(true));
  $('seasonCalendarButton').addEventListener('click', openSeasonCalendar);
  $('calendarCopy').addEventListener('click', async () => {
    if (!calendarLinks) return;
    try {
      await navigator.clipboard.writeText(calendarLinks.https);
      $('calendarFeedback').textContent = 'Abo-Link kopiert. In Kalender → Kalender → Hinzufügen → Kalenderabonnement einsetzen.';
    } catch {
      $('calendarUrl').focus(); $('calendarUrl').select();
      $('calendarFeedback').textContent = 'Bitte den markierten Abo-Link kopieren und in der Kalender-App als Kalenderabonnement hinzufügen.';
    }
  });
  ['touchstart', 'wheel', 'keydown'].forEach(event => window.addEventListener(event, () => { userMoved = true; }, { passive: true }));
  window.addEventListener('popstate', e => {
    season = e.state?.season || C.currentSeason();
    page = e.state?.page || (location.pathname.endsWith('tabelle.html') ? 'table' : location.pathname.endsWith('playoffs.html') ? 'playoffs' : 'schedule');
    seasonOptions(); load({ jump: page === 'schedule' });
  });
  function returnToApp(reset) {
    if (reset || loadedSeasonYear !== C.currentSeason()) {
      page = 'schedule';
      season = C.currentSeason(); loadedSeasonYear = season; seasonOptions();
      history.replaceState({ page, season }, '', pages[page][0]);
    }
    load({ jump: reset && page === 'schedule', quiet: !reset });
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { lastHidden = Date.now(); clearTimeout(timer); }
    else returnToApp(Date.now() - lastHidden > 60000 || loadedSeasonYear !== C.currentSeason());
  });
  window.addEventListener('pageshow', e => { if (e.persisted) returnToApp(true); });
  window.addEventListener('online', () => load({ quiet: true }));
  window.addEventListener('pagehide', () => { clearTimeout(timer); clearInterval(countdownTimer); });
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  // Intentionally ignore saved years and old ?season= bookmarks on a new visit.
  history.replaceState({ page, season }, '', pages.schedule[0]);
  seasonOptions(); load({ jump: page === 'schedule' });
})();
