'use strict';
const crypto = require('node:crypto');
const C = require('../core.js');
const escapeText = value => String(value ?? '').replace(/\\/g,'\\\\').replace(/\r\n|\r|\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
const utc = stamp => new Date(stamp).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
function fold(line) {
 let out='',bytes=0;
 for(const char of line){const size=Buffer.byteLength(char,'utf8');if(bytes+size>75){out+='\r\n ';bytes=1;}out+=char;bytes+=size;}
 return out;
}
function snapshot(game, old) {
 const confirmed=game.timed && Number.isFinite(game.stamp) && !game.cancelled && !game.postponed && !game.suspended;
 if(!confirmed && !old) return null;
 return {
  id:game.id,year:game.year,phase:game.phase,week:game.week,
  start:confirmed?game.stamp:old.start,
  opponent:game.opponent.team.displayName,home:game.home,neutral:game.neutral,
  venue:game.venue,city:game.city,
  status:confirmed?'CONFIRMED':'CANCELLED',
  note:confirmed?'':game.cancelled?'Spiel abgesagt.':'Der bisherige Termin ist nicht mehr bestätigt. Ein neuer Termin folgt, sobald er feststeht.',
  complete:game.complete
 };
}
function fingerprint(record) {
 // Scores/completion do not alter the calendar appointment.
 const {complete,...fields}=record;
 return crypto.createHash('sha256').update(JSON.stringify(fields)).digest('hex');
}
function reconcile(games, previous={schema:1,entries:{}}, now=Date.now()) {
 if(previous.schema!==1 || !previous.entries || typeof previous.entries!=='object') throw Error('Unbekanntes Kalenderstatus-Format');
 const entries={},seen=new Set();
 for(const game of C.sortGames(games)) {
  const old=previous.entries[game.id], value=snapshot(game,old?.value);seen.add(game.id);
  if(!value) continue;
  const hash=fingerprint(value),changed=!old || old.hash!==hash;
  entries[game.id]={value,hash,sequence:old?(changed?old.sequence+1:old.sequence):0,created:old?.created||now,modified:changed?now:old.modified};
 }
 // Keep historical appointments. Withdraw an upcoming event removed from a complete source response.
 for(const [id,old] of Object.entries(previous.entries)) {
  if(seen.has(id) || entries[id])continue;
  if(old.value.complete || old.value.start<now){entries[id]=old;continue;}
  const value={...old.value,status:'CANCELLED',note:'Der bisherige Termin wird im aktuellen Spielplan nicht mehr bestätigt.'};
  const hash=fingerprint(value),changed=hash!==old.hash;
  entries[id]={...old,value,hash,sequence:old.sequence+(changed?1:0),modified:changed?now:old.modified};
 }
 return {schema:1,updatedAt:new Date(now).toISOString(),entries};
}
function build(state) {
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Dolphins Hub//Calendar Subscription//DE','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:Miami Dolphins','X-WR-CALDESC:Automatisch aktualisierter Dolphins-Spielplan','X-WR-TIMEZONE:Europe/Berlin','REFRESH-INTERVAL;VALUE=DURATION:PT6H','X-PUBLISHED-TTL:PT6H'];
 for(const entry of Object.values(state.entries).sort((a,b)=>a.value.start-b.value.start)){
  const g=entry.value,phase={1:'Preseason',2:'Regular Season',3:'Playoffs'}[g.phase]||'NFL';
  const description=[`${phase}${g.week?' · Week '+g.week:''} · Saison ${g.year}.`,g.neutral?'Neutraler Spielort.':g.home?'Heimspiel der Miami Dolphins.':'Auswärtsspiel der Miami Dolphins.',g.note,'Anstoßzeit laut ESPN. Die Endzeit ist auf 3,5 Stunden geschätzt.','Kalenderabo: Terminänderungen werden bei der nächsten Aktualisierung deiner Kalender-App übernommen.'].filter(Boolean).join('\n');
  lines.push('BEGIN:VEVENT',`UID:dolphins-${escapeText(g.id)}@private-season-hub`,`SEQUENCE:${entry.sequence}`,`DTSTAMP:${utc(entry.modified)}`,`CREATED:${utc(entry.created)}`,`LAST-MODIFIED:${utc(entry.modified)}`,`DTSTART:${utc(g.start)}`,`DTEND:${utc(g.start+3.5*3600000)}`,`SUMMARY:${escapeText((g.status==='CANCELLED'?'Termin entfällt · ':'')+'Miami Dolphins vs. '+g.opponent)}`,`LOCATION:${escapeText(g.venue+(g.city?', '+g.city:''))}`,`DESCRIPTION:${escapeText(description)}`,`STATUS:${g.status}`,'END:VEVENT');
 }
 lines.push('END:VCALENDAR');return lines.map(fold).join('\r\n')+'\r\n';
}
module.exports={reconcile,build};
