'use strict';
const fs=require('node:fs/promises'),path=require('node:path');
const C=require('../core.js'),Feed=require('./calendar-feed.cjs'),Broadcasts=require('../broadcasts.js'),TV=require('./broadcast-feed.cjs');
const ROOT=path.resolve(__dirname,'..');
const API='https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/15/schedule';
async function json(url,allow404=false){
 const res=await fetch(url,{headers:{accept:'application/json'},signal:AbortSignal.timeout(25000)});
 if(allow404&&res.status===404)return null;
 if(!res.ok)throw Error(`HTTP ${res.status} beim Abruf von ${new URL(url).pathname}`);
 return res.json();
}
async function buildSite({root=ROOT,output=path.join(ROOT,'_site'),now=Date.now(),siteBase=process.env.SITE_BASE_URL,automatic=process.env.GITHUB_ACTIONS==='true',fetchJSON=json,previous,previousBroadcasts,fetchHTML}={}){
 const year=C.currentSeason(new Date(now));
 if(previous===undefined){
  if(!siteBase)throw Error('SITE_BASE_URL fehlt; für einen lokalen Probelauf previous explizit übergeben.');
  const base=new URL(siteBase.endsWith('/')?siteBase:siteBase+'/');
  if(base.protocol!=='https:')throw Error('SITE_BASE_URL muss HTTPS verwenden.');
  previous=await fetchJSON(new URL('calendar/state.json',base),true);
 }
 previous=previous||{schema:1,entries:{}};
 const games=[],counts=[];
 // Start with the current season; preserve subscribed history when a new season begins.
 const seasons=[...new Set([year,...Object.values(previous.entries).map(x=>x.value.year)])].sort((a,b)=>a-b);
 for(const season of seasons){
  const phases=await Promise.all([1,2,3].map(async phase=>{
   const data=await fetchJSON(`${API}?season=${season}&seasontype=${phase}`);
   if(data.requestedSeason?.year&&Number(data.requestedSeason.year)!==season)throw Error('Datenquelle liefert die falsche Saison.');
   const normalized=C.normalizeSchedule(data,season,phase);
   if(data.events.length&&!normalized.length)throw Error('Spielplan konnte nicht sicher der angefragten Saison zugeordnet werden.');
   if(!normalized.length&&Object.values(previous.entries).some(x=>x.value.year===season&&x.value.phase===phase))throw Error('Ein zuvor vorhandener Spielplanabschnitt ist leer; Veröffentlichung abgebrochen.');
   return normalized.map(g=>({...g,year:season}));
  }));
  const selected=phases.flat();
  const before=Object.values(previous.entries).filter(x=>x.value.year===season);
  if(!selected.length&&before.length)throw Error(`Unerwartet leerer Spielplan ${season}; bisheriger Kalender bleibt veröffentlicht.`);
  games.push(...selected);counts.push({season,games:selected.length});
 }
 const state=Feed.reconcile(games,previous,now),calendar=Feed.build(state);
 const eventCount=Object.values(state.entries).filter(x=>x.value.status==='CONFIRMED').length;
 if(!eventCount&&Object.keys(previous.entries).length)throw Error('Keine bestätigten Termine: Veröffentlichung abgebrochen.');
 // TV source failures must not stop scores or the existing calendar subscription.
 if(previousBroadcasts===undefined){
  try{previousBroadcasts=Broadcasts.validate(await fetchJSON(new URL('broadcasts-de.json',siteBase.endsWith('/')?siteBase:siteBase+'/'),true));}catch{
   try{previousBroadcasts=Broadcasts.validate(JSON.parse(await fs.readFile(path.join(root,'broadcasts-de.json'),'utf8')));}catch{previousBroadcasts=null;}
  }
 }
 const broadcasts=await TV.refresh({games,previous:previousBroadcasts,now,fetchHTML});
 // A failed schedule/calendar validation above leaves the deployed site intact.
 await fs.mkdir(path.join(output,'calendar'),{recursive:true});
 const files=['index.html','tabelle.html','playoffs.html','app.js','core.js','postseason.js','calendar.js','broadcasts.js','styles.css','manifest.webmanifest','apple-touch-icon.png','favicon.png','README.md','PRUEFUNG.md','ABO_EINRICHTEN.md'];
 for(const file of files)await fs.copyFile(path.join(root,file),path.join(output,file));
 await fs.writeFile(path.join(output,'.nojekyll'),'');
 await fs.writeFile(path.join(output,'calendar','dolphins.ics'),calendar);
 await fs.writeFile(path.join(output,'calendar','state.json'),JSON.stringify(state));
 const status={schema:1,automatic,updatedAt:state.updatedAt,currentSeason:year,eventCount,seasons:counts,refreshHours:6};
 await fs.writeFile(path.join(output,'calendar','status.json'),JSON.stringify(status));
 await fs.writeFile(path.join(output,'broadcasts-de.json'),JSON.stringify(broadcasts));
 return {state,status,broadcasts,output};
}
module.exports={buildSite};
if(require.main===module)buildSite().then(result=>console.log(`Kalender erstellt: ${result.status.eventCount} Termine, Stand ${result.status.updatedAt}`)).catch(error=>{console.error(error.message);process.exitCode=1;});
