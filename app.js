/* Dolphins Hub v8 — static GitHub Pages app, no build step or credentials. */
(function () {
  'use strict';
  const C = DolphinsCore;
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
  let season = C.currentSeason(), page = document.body.dataset.page || 'schedule';
  let games = [], focus = null, pending = 0, timer = null, countdownTimer = null;
  let lastHidden = 0, userMoved = false, toastTimer;
  let loadedSeasonYear = C.currentSeason();
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
    const latest = C.currentSeason();
    $('seasonSelect').innerHTML = Array.from({ length: Math.max(1, latest - 2024 + 1) }, (_, i) => `<option value="${latest - i}">${latest - i}</option>`).join('');
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
    if (game.live) return `${game.period > 4 ? 'Overtime' : `${game.period}. Viertel`}${game.clock ? ' · ' + game.clock : ''}`;
    if (game.suspended) return 'Spiel unterbrochen';
    if (game.complete) return 'Letztes Spiel dieser Saison';
    if (!game.timed || !game.stamp) return 'Anstoßzeit folgt';
    const delta = game.stamp - Date.now();
    if (delta <= 0) return 'Warte auf aktuellen Spielstatus';
    const mins = Math.ceil(delta / 60000), hours = Math.floor(mins / 60), days = Math.floor(hours / 24);
    return days ? `Kickoff in ${days} T ${hours % 24} Std` : hours ? `Kickoff in ${hours} Std ${mins % 60} Min` : `Kickoff in ${mins} Min`;
  }
  function card(game, selected, stale) {
    const dt = C.dateParts(game.date, game.timed);
    const week = game.weekText || (game.week ? 'Week ' + game.week : phaseNames[game.phase]);
    return `<article class="game ${selected ? 'current' : ''}" id="game-${esc(game.id)}" ${selected ? 'aria-current="true"' : ''} aria-label="${esc(week)}, Miami Dolphins gegen ${esc(game.opponent.team.displayName)}"><div class="game-top"><span class="week">${esc(week.toUpperCase())}</span>${gameStatus(game, selected, stale)}</div>${teamRow(game, game.mia, 0)}${teamRow(game, game.opponent, 1)}<div class="game-bottom"><div><span class="date">${esc(dt.day)}${dt.day ? ', ' : ''}${esc(dt.date)}</span><small>${game.neutral ? 'Neutraler Spielort' : game.home ? 'Heimspiel in Miami' : 'Auswärtsspiel'}</small></div><div style="text-align:right"><span class="time">${esc(dt.time)}${dt.time !== 'Offen' ? ' Uhr' : ''}</span><small>Deutsche Zeit</small></div></div><div class="venue">${icon('pin')}<span>${esc(game.venue)}${game.city ? ' · ' + esc(game.city) : ''}</span></div>${selected ? `<div class="focus-extra"><span class="countdown">${stale && game.live ? 'Gespeicherter Live-Stand' : esc(countdownText(game))}</span>${!game.complete && !game.cancelled && !game.postponed && !game.suspended && !game.live && game.timed && game.stamp > Date.now() ? `<button data-calendar="${esc(game.id)}">${icon('calendar')}Kalender</button>` : ''}</div>` : ''}</article>`;
  }
  function scrollToFocus(smooth = false) {
    if (page !== 'schedule' || !focus) return;
    const el = $('game-' + focus.id);
    if (!el) return;
    const top = window.scrollY + el.getBoundingClientRect().top - document.querySelector('.app-header').getBoundingClientRect().height - 14;
    window.scrollTo({ top: Math.max(0, top), behavior: smooth && !matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'auto' });
  }
  function renderSchedule(data, stale, missing) {
    const previousId = focus?.id;
    games = C.sortGames(data.flatMap(d => d.games));
    focus = C.focusGame(games);
    const record = C.record(games);
    const regularLoaded = data.some(d => d.phase === 2);
    const bye = data.find(d => d.phase === 2)?.bye;
    let html = `<section class="hero"><div class="hero-line"><span class="tiny-mark"></span><p class="eyebrow">Miami Dolphins · Season ${season}</p></div><h1>FINS <em>UP.</em></h1><p class="hero-copy">Jedes Spiel. Jeder Punkt. Deine Dolphins.<br>Die ganze Saison – in deiner Zeit.</p></section><section class="stats" aria-label="Saisonüberblick"><div class="stat"><b>${regularLoaded ? record.w + '–' + record.l + (record.t ? '–' + record.t : '') : '–'}</b><small>Siege · Niederlagen${record.t ? ' · Remis' : ''}</small></div><div class="stat"><b>${regularLoaded ? record.played + '/' + games.filter(g => g.phase === 2 && !g.cancelled).length : '–'}</b><small>Regular Season</small></div><div class="stat"><b>${bye ? 'W' + esc(bye) : '–'}</b><small>Spielfreie Woche</small></div></section><div class="schedule-intro"><h2>Dein Spielplan</h2><span class="small-label">Alle Zeiten in Deutschland<br>Frühere Spiele ↑ · Kommende ↓</span></div>`;
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
  function renderPlayoffs(rows) {
    const afc = rows.filter(r => r.conference === 'AFC');
    if (afc.length !== 16) throw new Error('AFC-Daten unvollständig');
    const seeded = C.validSeeds(afc), sorted = C.rankRows(afc);
    const started = afc.some(r => r.w + r.l + r.t > 0), mia = afc.find(r => r.team.abbreviation === 'MIA');
    const archived = season < C.currentSeason();
    const statusTitle = !started ? 'Alles noch offen.' : seeded ? 'AFC Seed #' + mia.seed : 'Bilanz ' + recordText(mia);
    const statusCopy = !started ? 'Mit Beginn der Regular Season startet das Rennen um die Playoffs.' : !seeded ? 'Noch keine verlässliche Setzliste verfügbar. Hier siehst du die vollständigen Bilanzen.' : mia.seed <= 7 ? (archived ? 'Playoff-Platz am Ende der Regular Season.' : 'Aktuell auf einem Playoff-Platz. Die Saison entscheidet.') : (archived ? 'Kein Playoff-Platz am Ende der Regular Season.' : 'Aktuell außerhalb der sieben Playoff-Plätze.');
    let lists;
    if (started && seeded) {
      lists = `<div class="playoff-columns"><section class="panel"><h2>Im Playoff-Feld</h2><p>Seeds 1–7 · AFC</p>${sorted.slice(0, 7).map(r => seedRow(r, true, true)).join('')}<p class="table-note">Seeds 1–4: Division-Sieger · Seeds 5–7: Wild Cards.<br>Seed 1 hat in der ersten Runde spielfrei.</p></section><section class="panel"><h2>Außerhalb</h2><p>Seeds 8–16 · AFC</p><div class="playoff-cut">GRENZE ZU DEN PLAYOFFS</div>${sorted.slice(7).map(r => seedRow(r, true, true)).join('')}</section></div>`;
    } else {
      lists = `<section class="panel"><h2>AFC · Bilanzübersicht</h2><p>${started ? 'Ohne bestätigte Seeds wird keine Playoff-Platzierung behauptet.' : 'Vor Saisonbeginn gibt es noch keine aussagekräftige Setzliste.'}</p>${sorted.map(r => seedRow(r, false, started)).join('')}</section>`;
    }
    $('content').innerHTML = `<section class="section-hero"><p class="eyebrow">Season ${season} · AFC</p><h1>Road to<br>the Playoffs.</h1><p>${archived ? 'Abschlusstabelle der Regular Season.' : 'So steht Miami im Rennen um die Postseason.'}</p></section><section class="panel miami-status">${image({ abbreviation: 'MIA' }, '')}<span class="eyebrow">Miami Dolphins · ${recordText(mia)}</span><b>${statusTitle}</b><p>${statusCopy}</p></section>${lists}<p class="table-note" style="color:var(--muted);line-height:1.7;padding:4px 0">Seeds werden aus den ESPN-Tabellendaten übernommen, einschließlich der dort berücksichtigten Tiebreaker. Eine Momentaufnahme ist noch keine garantierte Qualifikation.</p>`;
  }
  async function load(options = {}) {
    const { jump = false, quiet = false } = options;
    const token = ++pending, requestedSeason = season, requestedPage = page;
    const oldFocus = focus?.id;
    const anchor = quiet ? [...document.querySelectorAll('.game')].find(el => el.getBoundingClientRect().bottom > document.querySelector('.app-header').getBoundingClientRect().bottom) : null;
    const anchorId = anchor?.id, anchorTop = anchor?.getBoundingClientRect().top;
    clearTimeout(timer); clearInterval(countdownTimer);
    $('refreshButton').disabled = true;
    if (!quiet) {
      focus = null; userMoved = false;
      $('jumpButton').hidden = true;
      $('content').innerHTML = '<p class="loading-text" role="status">Aktuelle NFL-Daten werden geladen …</p><div class="skeleton"></div><div class="skeleton"></div>';
      $('dataStatus').textContent = '';
    }
    updateChrome();
    try {
      if (requestedPage === 'schedule') {
        const responses = await Promise.allSettled([1, 2, 3].map(async phase => {
          const packet = await resource(`schedule:${requestedSeason}:${phase}`, `${API}/teams/15/schedule?season=${requestedSeason}&seasontype=${phase}`, data => C.normalizeSchedule(data, requestedSeason, phase));
          return { ...packet, phase, games: C.normalizeSchedule(packet.data, requestedSeason, phase), bye: packet.data.byeWeek };
        }));
        if (token !== pending) return;
        const ok = responses.filter(r => r.status === 'fulfilled').map(r => r.value);
        const missing = responses.flatMap((r, i) => r.status === 'rejected' ? [phaseNames[i + 1]] : []);
        if (!ok.length) throw new Error('Spielplandaten nicht erreichbar');
        const stale = status(ok, missing);
        renderSchedule(ok, stale, missing);
      } else {
        const packet = await resource(`standings:${requestedSeason}`, `${TABLE_API}?season=${requestedSeason}&type=0&level=3`, data => C.parseStandings(data, requestedSeason));
        if (token !== pending) return;
        const rows = C.parseStandings(packet.data, requestedSeason);
        if (requestedPage === 'table') renderTable(rows); else renderPlayoffs(rows);
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
        timer = setTimeout(() => { if (!document.hidden) load({ quiet: true }); }, focus?.live ? 30000 : 120000);
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
  function calendar(game) {
    const escapeICS = s => String(s).replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
    const utc = stamp => new Date(stamp).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Dolphins Hub//DE', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', `UID:dolphins-${game.id}@private-season-hub`, `DTSTAMP:${utc(Date.now())}`, `DTSTART:${utc(game.stamp)}`, `DTEND:${utc(game.stamp + 3.5 * 3600000)}`, `SUMMARY:${escapeICS('Miami Dolphins vs. ' + game.opponent.team.displayName)}`, `LOCATION:${escapeICS(game.venue + (game.city ? ', ' + game.city : ''))}`, 'DESCRIPTION:Anstoßzeit laut ESPN. Änderungen möglich. Die Endzeit ist geschätzt.', 'END:VEVENT', 'END:VCALENDAR'];
    const blob = new Blob([lines.join('\r\n') + '\r\n'], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = `dolphins-${game.id}.ics`; document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
  document.addEventListener('click', e => {
    const nav = e.target.closest('a[data-page]');
    if (nav && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) { e.preventDefault(); navigate(nav.dataset.page); return; }
    if (e.target.closest('[data-home]')) { e.preventDefault(); navigate('schedule', true); return; }
    if (e.target.closest('[data-retry]')) { load({ jump: page === 'schedule' }); return; }
    const add = e.target.closest('[data-calendar]');
    if (add) { const game = games.find(g => g.id === add.dataset.calendar); if (game) calendar(game); }
  });
  $('seasonSelect').addEventListener('change', e => {
    season = Number(e.target.value);
    history.replaceState({ page, season }, '', pages[page][0]);
    window.scrollTo({ top: 0, behavior: 'auto' });
    load({ jump: page === 'schedule' });
  });
  $('refreshButton').addEventListener('click', () => load({ quiet: true }));
  $('jumpButton').addEventListener('click', () => scrollToFocus(true));
  ['touchstart', 'wheel', 'keydown'].forEach(event => window.addEventListener(event, () => { userMoved = true; }, { passive: true }));
  window.addEventListener('popstate', e => {
    season = e.state?.season || C.currentSeason();
    page = e.state?.page || (location.pathname.endsWith('tabelle.html') ? 'table' : location.pathname.endsWith('playoffs.html') ? 'playoffs' : 'schedule');
    seasonOptions(); load({ jump: page === 'schedule' });
  });
  function returnToApp(reset) {
    if (reset || loadedSeasonYear !== C.currentSeason()) {
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
  history.replaceState({ page, season }, '', location.pathname);
  seasonOptions(); load({ jump: page === 'schedule' });
})();
