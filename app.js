/* Dolphins Hub v8.5.4 — compact broadcast summary with optional details. */
(function () {
  'use strict';
  const C = DolphinsCore;
  const Calendar = DolphinsCalendar;
  const Postseason = DolphinsPostseason;
  const Broadcasts = typeof DolphinsBroadcasts === 'undefined' ? null : DolphinsBroadcasts;
  // Embedded brand assets: no additional files or third-party image requests.
  const PROVIDER_LOGOS = {"rtl":"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNjAgMjgiIGZvY3VzYWJsZT0iZmFsc2UiIHJvbGU9ImltZyI+PHRpdGxlPlJUTDwvdGl0bGU+PHBhdGggZmlsbD0iIzAzNzRBQSIgZD0iTTAgMGg0OS43MjV2MjhIMHoiPjwvcGF0aD48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMTQuMTAxIDYuNDFoMTMuMjI0YzQuMDQ5IDAgNi4yNzUgMS44MjEgNi4yNzUgNC44NTcgMCAyLjYzMi0xLjY4NyA0LjM4Ni00LjU4OCA0Ljc5bDYuNDc3IDUuNDY2aC00Ljk5M2wtNi4xNC01LjI2M0gxNy42MXY1LjI2M2gtMy40NDFWNi40MUgxNC4xWm0xMi44MiA3LjAxN2MyLjE1OSAwIDMuMTctLjY3NSAzLjE3LTIuMDkycy0xLjAxMS0yLjA5Mi0zLjE3LTIuMDkySDE3LjYxdjQuMTg0aDkuMzFaIj48L3BhdGg+PHBhdGggZmlsbD0iIzA1OUFDQiIgZD0iTTU0LjcxOCAwaDQ5LjcyNXYyOEg1NC43MTh6Ij48L3BhdGg+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTc3Ljg2IDkuMzc4aC04Ljc3VjYuNDFoMjAuOTgydjIuOTY4aC04Ljc3djEyLjE0NUg3Ny44NlY5LjM3OFoiPjwvcGF0aD48cGF0aCBmaWxsPSIjMDdDNkVEIiBkPSJNMTA5LjQzNiAwaDQ5LjcyNXYyOGgtNDkuNzI1eiI+PC9wYXRoPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0xMjQuODg3IDYuNDFoMy40NHYxMi4xNDRoMTUuMzg0djIuOTY5aC0xOC44MjRWNi40MVoiPjwvcGF0aD48L3N2Zz4=","rtlplus":"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MiAxMiIgZm9jdXNhYmxlPSJmYWxzZSIgcm9sZT0iaW1nIj48dGl0bGU+UlRMKzwvdGl0bGU+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgMGgyMS4zMzh2MTJIMHoiPjwvcGF0aD48cGF0aCBmaWxsPSIjMDIwMjAzIiBkPSJNNi4wNjEgMi43NThoNS42ODZjMS43MzEgMCAyLjY5NS43NzggMi42OTUgMi4wODQgMCAxLjEyLS43MjMgMS44NzEtMS45NTQgMi4wNDdsMi43ODggMi4zNTNoLTIuMTM5bC0yLjYyMS0yLjI3SDcuNTQ0djIuMjY5SDYuMDYyVjIuNzU4aC0uMDAxWm01LjQ5MiAzYy45MTcgMCAxLjM2MS0uMjk2IDEuMzYxLS44OTggMC0uNjAzLS40NDQtLjg5LTEuMzYxLS44OUg3LjU0NHYxLjc4N2g0LjAwOXYuMDAxWiI+PC9wYXRoPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0yMy40NyAwaDIxLjMzOHYxMkgyMy40N3oiPjwvcGF0aD48cGF0aCBmaWxsPSIjMDIwMjAzIiBkPSJNMzMuMzk3IDQuMDM2aC0zLjc1VjIuNzU4aDguOTgzdjEuMjc4aC0zLjc1djUuMjA2aC0xLjQ4M1Y0LjAzNloiPjwvcGF0aD48cGF0aCBmaWxsPSIjZmZmIiBkPSJNNDYuOTM5IDBoMjEuMzM4djEySDQ2LjkzOXoiPjwvcGF0aD48cGF0aCBmaWxsPSIjMDIwMjAzIiBkPSJNNTMuNTcgMi43NThoMS40ODF2NS4yMDZoNi41OTR2MS4yNzhINTMuNTdWMi43NThaIj48L3BhdGg+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTgxLjA4MSA1LjIzM2gtMy40OTZWMi41OTRoLTEuNTQ2djIuNjM5aC0zLjQ5M3YxLjU0OGgzLjQ5M3YyLjYyMWgxLjU0NlY2Ljc4MWgzLjQ5NlY1LjIzM1oiPjwvcGF0aD48L3N2Zz4=","nitro":"data:image/png;base64,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","sky":"data:image/png;base64,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","gamepass":"data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkZGRkZGIiByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+REFaTjwvdGl0bGU+PHBhdGggZD0iTTE0Ljc3NCA4LjI5MWwuNzcyLTIuNTk2Ljc5IDIuNTk2em0zLjg0OCAyLjI2OGwtMi4wMjUtNi4xMjhjLS4wNDUtLjEzNS0uMDk3LS4yMjQtLjE1NC0uMjY2LS4wNTktLjA0MS0uMTUyLS4wNjMtLjI4LS4wNjNoLTEuMTJhLjQ4NS40ODUgMCAwIDAtLjI4NC4wNjhjLS4wNi4wNDUtLjExLjEzMi0uMTQ5LjI2MWwtMi4wNDUgNi4xMjhjLS4wMjUuMDMyLS4wMzguMDk2LS4wMzguMTkyIDAgLjE0OS4wOS4yMjMuMjcuMjIzaC44NGMuMDc2IDAgLjEzOS0uMDAzLjE4Ny0uMDFhLjIwNy4yMDcgMCAwIDAgLjExNi0uMDQ4LjMyNi4zMjYgMCAwIDAgLjA3Ny0uMTE2Yy4wMjItLjA1MS4wNDYtLjExOS4wNzItLjIwMmwuMzE4LTEuMDcxaDIuMzA2bC4zMjcgMS4wNTFjLjAyNi4wOS4wNTEuMTYuMDc3LjIxM2EuMzk1LjM5NSAwIDAgMCAuMDg3LjEyYy4wMzEuMDI4LjA3LjA0Ny4xMTQuMDUzaC4wMDJjLjA0NS4wMDYuMTAzLjAxLjE3My4wMWguODk3Yy4xOCAwIC4yNy0uMDc0LjI3LS4yMjNhLjU5LjU5IDAgMCAwLS4wMDUtLjA5Ljg3OC44NzggMCAwIDAtLjAzNi0uMTA4bC4wMDMuMDA2em0tLjk5NCAyLjQ2N2gtLjY0NmMtLjE2OCAwLS4yNzkuMDI0LS4zMzMuMDcyLS4wNTUuMDQ5LS4wODIuMTQ3LS4wODIuMjk1djMuNjM4bC0xLjkxLTMuNjQ3Yy0uMDc2LS4xNTUtLjE1Mi0uMjUzLS4yMjYtLjI5NS0uMDc0LS4wNDEtLjIwNC0uMDYzLS4zOS0uMDYzaC0uNTk5Yy0uMTY3IDAtLjI3OC4wMjUtLjMzMi4wNzMtLjA1NS4wNDgtLjA4Mi4xNDctLjA4Mi4yOTR2Ni4xMzhjMCAuMTQ4LjAyNS4yNDYuMDc3LjI5NC4wNTIuMDQ4LjE2LjA3Mi4zMjguMDcyaC42NTZjLjE2NyAwIC4yNzgtLjAyNC4zMzItLjA3Mi4wNTUtLjA0OC4wODItLjE0Ni4wODItLjI5NHYtMy42NDhsMS45MSAzLjY1N2MuMDc3LjE1NS4xNTIuMjUzLjIyNy4yOTUuMDczLjA0Mi4yMDQuMDYyLjM5LjA2MmguNTk4Yy4xNjcgMCAuMjc4LS4wMjQuMzMzLS4wNzIuMDU0LS4wNDguMDgyLS4xNDYuMDgyLS4yOTR2LTYuMTM4YzAtLjE0OC0uMDI4LS4yNDYtLjA4Mi0uMjk0LS4wNTUtLjA0OC0uMTY2LS4wNzMtLjMzMy0uMDczem0zLjIwMy0uNTgxbDEuNjY1IDEuNjY1djguMzg1SDEuNTA1VjE0LjExbDEuNjYzLTEuNjY0YS42My42MyAwIDAgMCAwLS44OUwxLjUwNCA5Ljg5MVYxLjUwNWgyMC45OTF2OC4zODRsLTEuNjY1IDEuNjY2YS42My42MyAwIDAgMCAwIC44OXpNMjQgMEgwdjEwLjYxM0wxLjM4NyAxMiAwIDEzLjM4N1YyNGgyNFYxMy4zODdMMjIuNjEzIDEyIDI0IDEwLjYxM3pNMTAuNjcgMTguNDY5SDcuOTZsMi44NTUtNC4wMTRhLjY3LjY3IDAgMCAwIC4wODctLjE1NS40MjUuNDI1IDAgMCAwIC4wMTktLjEzNXYtLjc3MmMwLS4xNDgtLjAyOC0uMjQ2LS4wODItLjI5NC0uMDU1LS4wNDgtLjE2Ni0uMDczLS4zMzQtLjA3M0g2LjM4MmMtLjE0OSAwLS4yNDUuMDI4LS4yOS4wODItLjA0NS4wNTUtLjA2OC4xNjktLjA2OC4zNDN2LjU4YzAgLjE3Mi4wMjMuMjg3LjA2OC4zNDEuMDQ1LjA1NS4xNDEuMDgzLjI5LjA4M2gyLjU0NUw2LjExIDE4LjQ2OWEuNDM4LjQzOCAwIDAgMC0uMTA3LjI3di43OTJjMCAuMTQ4LjAyNy4yNDUuMDgyLjI5NC4wNTUuMDQ4LjE2Ny4wNzIuMzM0LjA3Mmg0LjI1Yy4xNDggMCAuMjQ1LS4wMjcuMjktLjA4MS4wNDUtLjA1NS4wNjgtLjE3LjA2OC0uMzQ0di0uNTc5YzAtLjE3My0uMDIzLS4yODctLjA2OC0uMzQyLS4wNDUtLjA1NS0uMTQyLS4wODItLjI5LS4wODJ6TTkuNDA4IDguMjMzYzAgLjI2NC0uMDE3LjQ4NC0uMDUyLjY2MS0uMDM2LjE3Ny0uMDkzLjMyLS4xNzQuNDNhLjY0OC42NDggMCAwIDEtLjMxOC4yMzEgMS41MjMgMS41MjMgMCAwIDEtLjQ4Ny4wNjhoLS43OXYtNC4xN2guNzljLjM2NiAwIC42My4xMS43OS4zMjQuMTYuMjE1LjI0MS41NzEuMjQxIDEuMDY3djEuMzg5em0xLjM4LTIuNzg5Yy0uMjI1LS40NTctLjUzMy0uNzk1LS45MjEtMS4wMTMtLjM5LS4yMTktLjg4LS4zMjgtMS40Ny0uMzI4SDYuNDE4Yy0uMTY3IDAtLjI3OC4wMjQtLjMzMy4wNzItLjA1NC4wNDktLjA4Mi4xNDctLjA4Mi4yOTR2Ni4xMzhjMCAuMTQ4LjAyOC4yNDYuMDgyLjI5NS4wNTUuMDQ4LjE2Ni4wNzIuMzMzLjA3MmgyLjIxOGMxLjA0OCAwIDEuNzY1LS40NDcgMi4xNS0xLjM0Mi4wOS0uMjA1LjE1My0uNDEzLjE4OC0uNjIyYTQuOTEgNC45MSAwIDAgMCAuMDU0LS43OTZWNi45MTFjMC0uMzY3LS4wMTgtLjY1Ni0uMDU0LS44NjhhMi4yIDIuMiAwIDAgMC0uMTkzLS42MTJsLjAwNi4wMTN6Ii8+PC9zdmc+"};
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
    if (!Broadcasts) return '';
    const info = Broadcasts.resolve(game, broadcastPacket?.data, Date.now(), !!broadcastPacket?.stale);
    if (info.hidden) return '';
    const offers = [...info.full.map(p => ({ ...p, mode: 'Einzelspiel' })), ...info.conference.filter(p => !info.full.some(full => full.id === p.id)).map(p => ({ ...p, mode: 'Konferenz' }))];
    if (!offers.length) return '';
    const links = offers.map(p => {
      const label = `${p.name} · ${p.mode} · ${p.free ? 'Free-TV' : 'kostenpflichtig'}${p.id === 'gamepass' ? ' · separates Game-Pass-Abo' : ''}${info.stale && p.id !== 'gamepass' ? ' · ältere Senderangabe, bitte prüfen' : ''}`;
      const caption = p.mode === 'Konferenz' ? 'Konferenz' : p.id === 'gamepass' ? 'Game Pass' : '';
      return `<a class="tv-provider tv-logo-link tv-${esc(p.id)}" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer" title="${esc(label)}" aria-label="${esc(label + ' · Anbieter öffnen')}"><span class="tv-logo-art"><img src="${PROVIDER_LOGOS[p.id]}" alt="${esc(p.id === 'gamepass' ? 'DAZN' : p.name)}" width="52" height="24"></span><span class="tv-logo-caption" aria-hidden="true">${esc(caption) || '&nbsp;'}</span></a>`;
    }).join('');
    return `<div class="game-tv" aria-label="TV und Streaming in Deutschland">${links}${info.stale ? '<small class="tv-stale">Stand prüfen</small>' : ''}</div>`;
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
      if (!tvComplete) html += '<p class="tv-summary">TV-Auswahl nicht vollständig aktuell · Logos zeigen bekannte Anbieter.</p>';
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
