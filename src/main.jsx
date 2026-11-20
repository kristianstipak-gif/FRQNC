import React,{useEffect,useMemo,useState} from 'react';
import{createRoot}from'react-dom/client';import'./style.css';
const API='https://frqnc-api.kristianstipak.workers.dev';
const SOURCES=[['KiwiSDR public directory','https://rx.linkfanel.net/','Veřejné síťové přijímače krátkých vln'],['WebSDR directory','https://www.websdr.org/','Nezávislé webové SDR stanice'],['ReceiverBook','https://www.receiverbook.de/','Katalog veřejných přijímačů'],['OpenWebRX','https://www.openwebrx.de/','Přijímače s různým rozsahem podle stanice'],['SWISS-SDR','https://www.swiss-sdr.ch/','Veřejný síťový SDR zdroj']];
function band(m){return m<.03?'VLF / LF':m<30?'HF':m<300?'VHF':m<3000?'UHF':m<30000?'SHF':'EHF'}
function App(){
 const[q,Q]=useState('');const[u,U]=useState('MHz');const[tab,T]=useState('search');
 const[saved,S]=useState(()=>{try{return JSON.parse(localStorage.getItem('frqnc-saved')||'[]')}catch{return[]}});
 const[rows,R]=useState([]);const[status,ST]=useState('Připraveno');const[busy,B]=useState(false);const[filter,F]=useState('');const[apiState,AS]=useState('Čeká na kontrolu');
 useEffect(()=>localStorage.setItem('frqnc-saved',JSON.stringify(saved)),[saved]);
 const parsed=useMemo(()=>{let n=Number(q.replace(',','.'));if(!Number.isFinite(n)||n<=0)return null;let mhz=u==='Hz'?n/1e6:u==='kHz'?n/1e3:u==='GHz'?n*1e3:n;return{n,mhz,band:band(mhz)}},[q,u]);
 function save(){if(parsed)S(a=>[{...parsed,unit:u,id:Date.now()},...a.filter(x=>x.mhz!==parsed.mhz)].slice(0,100))}
 async function load(){
  B(true);ST('Načítám veřejný adresář přes FRQNC API…');
  try{
   const health=await fetch(API+'/api/health');if(!health.ok)throw Error('API health HTTP '+health.status);AS('API online');
   const res=await fetch(API+'/api/receivers');if(!res.ok)throw Error('Adresář HTTP '+res.status);
   const data=await res.json();if(!Array.isArray(data.receivers))throw Error('Neplatný formát adresáře');
   const found=data.receivers.map(x=>({id:x.id,name:x.name||'KiwiSDR',url:x.url,loc:x.location||'Lokace neuvedena',antenna:x.antenna||'',users:x.users,usersMax:x.users_max,extApi:x.ext_api,offline:x.offline,bands:x.bands||''}));
   R(found);ST('Načteno '+found.length+' veřejných přijímačů · zdroj '+(data.source||'KiwiSDR mirror')+(data.fetched_at?' · aktualizace '+new Date(data.fetched_at).toLocaleString('cs-CZ'):''));
  }catch(e){AS('Chyba API');ST('Načtení se nezdařilo: '+e.message+'. Zkus to znovu později.')}
  finally{B(false)}
 }
 const visible=rows.filter(x=>(x.name+' '+x.loc+' '+x.antenna).toLowerCase().includes(filter.toLowerCase()));
 return <main className="shell"><header><a className="brand" href="#"><b>F</b><span>FRQNC<small>FREQUENCY EXPLORER</small></span></a><label><i/> PUBLIC SDR LAB</label></header>
 <section className="hero"><small>JARVIS RADIO INTELLIGENCE</small><h1>Explore the<br/><em>radio spectrum.</em></h1><p>Vyhledávání frekvencí a veřejných SDR přijímačů z jednoho místa. FRQNC používá veřejná data a respektuje omezení jednotlivých provozovatelů.</p></section>
 <nav>{[['search','Vyhledávání'],['receivers','Přijímače'],['saved','Uložené ('+saved.length+')']].map(([id,name])=><button key={id} className={tab===id?'active':''} onClick={()=>{T(id);if(id==='receivers'&&!rows.length&&!busy)load()}}>{name}</button>)}</nav>
 {tab==='search'&&<section className="panel"><small>FREQUENCY LOOKUP</small><h2>Vyhledat frekvenci</h2><div className="search"><input inputMode="decimal" value={q} onChange={e=>Q(e.target.value)} placeholder="Např. 145.500"/><select value={u} onChange={e=>U(e.target.value)}>{['Hz','kHz','MHz','GHz'].map(x=><option key={x}>{x}</option>)}</select></div>{parsed?<div className="result"><div><small>FREQUENCY</small><b>{parsed.mhz.toLocaleString('cs-CZ',{maximumFractionDigits:6})} MHz</b></div><div><small>BAND</small><b>{parsed.band}</b></div><div><small>STATUS</small><b className="muted">Signál neověřen</b></div></div>:<p className="hint">Zadej frekvenci a jednotku. Samotný záznam frekvence nepotvrzuje vysílání ani aktivní signál.</p>}<button className="primary" disabled={!parsed} onClick={save}>Uložit frekvenci</button></section>}
 {tab==='receivers'&&<section className="panel"><div className="row"><div><small>PUBLIC RECEIVER NETWORK</small><h2>Veřejné přijímače</h2><p className="hint">FRQNC API: {apiState}</p></div><button className="primary" onClick={load} disabled={busy}>{busy?'Načítám…':'Načíst adresář'}</button></div><p className="hint">{status}</p><input className="filter" value={filter} onChange={e=>F(e.target.value)} placeholder="Filtrovat podle názvu, lokace nebo antény"/>{visible.map(x=><a key={x.id} className="receiver" href={x.url} target="_blank" rel="noreferrer"><span><b>{x.name}{x.offline?' · offline':''}</b><small>{x.loc}{x.antenna?' · '+x.antenna:''}</small><small>Uživatelé: {x.users??'—'} / {x.usersMax??'—'} · Externí API: {x.extApi===null?'neuvedeno':x.extApi===0?'vypnuto':x.extApi}</small></span><strong>Otevřít ↗</strong></a>)}{!rows.length&&<p className="hint">Zatím nejsou načtené žádné stanice. Stiskni „Načíst adresář“.</p>}</section>}
 {tab==='saved'&&<section className="panel"><small>PERSONAL ARCHIVE</small><h2>Uložené frekvence</h2>{saved.length?saved.map(x=><div key={x.id} className="receiver"><span><b>{x.n} {x.unit}</b><small>{x.mhz.toFixed(6)} MHz · {x.band}</small></span><button onClick={()=>S(a=>a.filter(y=>y.id!==x.id))}>Odebrat</button></div>):<p className="hint">Zatím tu nic není.</p>}</section>}
 <section className="sources"><small>CONNECTED PUBLIC CATALOGS</small><h2>Další veřejné zdroje</h2><div className="cards">{SOURCES.map(([name,url,desc])=><a key={name} href={url} target="_blank" rel="noreferrer"><b>{name} ↗</b><p>{desc}</p></a>)}</div></section><footer>FRQNC / JARVIS CORE <span>Public data only · Receiver access depends on operator policy</span></footer></main>
}
createRoot(document.getElementById('root')).render(<App/>);