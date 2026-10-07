const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cr=n=>n==null?'—':'₹'+Number(n).toFixed(2).replace(/\.?0+$/,'')+' Cr';
const v=x=>x==null||x===''?'—':x;
const ROLES=['BATSMAN','BOWLER','ALL-ROUNDER','WICKET-KEEPER'];
const ORDERS=['Opener','Top Order','Middle Order','Lower Middle Order','Finisher','Wicket-Keeper','Fast Bowler','Spinner','Batting All-Rounder','Bowling All-Rounder'];
let P=[],T=[],banner='',pages={};

function toast(m,t='ok'){const d=document.createElement('div');d.className='toast '+(t==='err'?'err':'');d.textContent=(t==='err'?'⚠ ':'✓ ')+m;$('#toasts').appendChild(d);setTimeout(()=>{d.classList.add('leaving');setTimeout(()=>d.remove(),220)},3500)}
async function api(p,m='GET',b){
  const r=await fetch('/api'+p,{method:m,headers:{'Content-Type':'application/json'},body:b!==undefined?JSON.stringify(b):undefined});
  let d=null;try{d=await r.json()}catch(e){}
  if(!r.ok){const msg=(d&&d.message)||'Request failed';toast(msg,'err');throw new Error(msg)}
  return d}
const rb=r=>`<span class="badge b-gold">${esc(r)}</span>`;
const sb=s=>`<span class="badge b-${String(s).toLowerCase()}">${esc(s)}</span>`;
const ini=n=>String(n).split(' ').map(x=>x[0]).slice(0,2).join('');
const av=(p,sm)=>p.imageUrl?`<img class="avatar ${sm?'sm':''}" src="${esc(p.imageUrl)}" alt="">`:`<div class="avatar ${sm?'sm':''}">${esc(ini(p.name))}</div>`;
const title=t=>$('#title').textContent=t;
function bars(items,fmt=x=>x){const mx=Math.max(1,...items.map(i=>i[1]));return items.map(i=>`<div class="hb"><div class="n">${esc(i[0])}</div><div class="t"><div class="f" style="width:${i[1]/mx*100}%"></div></div><div class="x">${fmt(i[1])}</div></div>`).join('')||'<p>No data yet</p>'}
function modal(h){$('#modal').innerHTML=`<div class="mbox">${h}<div style="text-align:right;margin-top:16px"><button class="b-o" onclick="closeM()">Close</button></div></div>`;$('#modal').classList.add('show')}
function closeM(){$('#modal').classList.remove('show')}
$('#modal').addEventListener('click',e=>{if(e.target.id==='modal')closeM()});

function showPlayer(id){const p=P.find(x=>x.id===id);if(!p)return;
 modal(`<div class="pc">${av(p)}<h2>${esc(p.name)}</h2><p>${esc(p.country)} ${p.overseas?'(Overseas)':''}</p><p>${rb(p.role)} <span class="badge">${esc(v(p.playingOrder))}</span> ${sb(p.status)}</p></div>
 <h3 style="margin-top:14px">Batting</h3><div class="kv"><div><span>Matches</span><b>${v(p.matches)}</b></div><div><span>Runs</span><b>${v(p.runs)}</b></div><div><span>Average</span><b>${v(p.battingAvg)}</b></div><div><span>Strike Rate</span><b>${v(p.strikeRate)}</b></div><div><span>50s</span><b>${v(p.fifties)}</b></div><div><span>100s</span><b>${v(p.hundreds)}</b></div></div>
 <h3 style="margin-top:14px">Bowling</h3><div class="kv"><div><span>Wickets</span><b>${v(p.wickets)}</b></div><div><span>Economy</span><b>${v(p.economy)}</b></div><div><span>Average</span><b>${v(p.bowlingAvg)}</b></div><div><span>Strike Rate</span><b>${v(p.bowlingSR)}</b></div></div>
 <div class="kv"><div><span>Base Price</span><b class="gold">${cr(p.basePrice)}</b></div><div><span>${p.team?'Team / Price':'Status'}</span><b>${p.team?esc(p.team.name)+' · '+cr(p.soldPrice):esc(p.status)}</b></div></div>`)}

pages.dashboard=async()=>{title('Dashboard');const [a,s]=await Promise.all([api('/analytics'),api('/auction/state')]);
 const st=(l,x,g)=>`<div class="card stat"><div class="l">${l}</div><div class="v ${g?'gold':''}">${x}</div></div>`;
 $('#view').innerHTML=`<div class="grid">${st('TOTAL PLAYERS',a.total)}${st('AVAILABLE',a.available)}${st('SOLD',a.sold)}${st('UNSOLD',a.unsold)}</div>
 <div class="grid">${st('TOTAL MONEY SPENT',cr(a.totalSpent),1)}${st('HIGHEST BID',cr(a.highestBid),1)}${st('AVERAGE PRICE',cr(a.averagePrice),1)}${st('CURRENT PLAYER',s.player?esc(s.player.name):'—')}</div>
 <div class="grid">${a.teams.map(x=>`<div class="card"><h3>${esc(x.team.name)}</h3><p>Players: <b>${x.team.playerCount}/${x.team.maxSquad}</b></p><p>Remaining Purse: <b class="gold">${cr(x.team.purse)}</b></p></div>`).join('')}</div>
 <div class="grid"><div class="card"><h3>Team Spending</h3>${bars(a.teams.map(x=>[x.team.name,x.spent]),cr)}</div>
 <div class="card"><h3>Role Distribution</h3>${bars(Object.entries(a.roles))}</div>
 <div class="card"><h3>Sold vs Unsold vs Available</h3>${bars([['Sold',a.sold],['Unsold',a.unsold],['Available',a.available]])}</div>
 <div class="card"><h3>Top 5 Expensive Players</h3>${bars(a.topPurchases.map(p=>[p.name,p.soldPrice]),cr)}</div></div>`};

pages.players=async a=>{a=a||'all';P=await api('/players');
 const f={role:ROLES.includes(a)?a:'',status:['available','sold','unsold'].includes(a)?a.toUpperCase():''};
 title({all:'All Players',available:'Available Players',sold:'Sold Players',unsold:'Unsold Players'}[a]||a);
 const opt=(arr,ph)=>`<option value="">${ph}</option>`+arr.map(x=>`<option>${esc(x)}</option>`).join('');
 $('#view').innerHTML=`<div class="bar"><input id="q" placeholder="Search player..."><select id="r">${opt(ROLES,'Role')}</select><select id="c">${opt(['India','Overseas'],'Country')}</select><select id="o">${opt(ORDERS,'Playing Order')}</select><select id="s">${opt(['AVAILABLE','SOLD','UNSOLD'],'Status')}</select>
 <select id="pr"><option value="">Price Range</option><option value="0-1">Up to ₹1 Cr</option><option value="1-1.5">₹1 – 1.5 Cr</option><option value="1.5-99">Above ₹1.5 Cr</option></select>
 <select id="so"><option value="name">Sort: Name</option><option value="strikeRate">Strike Rate</option><option value="runs">Runs</option><option value="battingAvg">Average</option><option value="wickets">Wickets</option><option value="economy">Economy</option><option value="basePrice">Base Price</option></select></div>
 <div class="card"><div class="scroll"><table><thead><tr><th>Player</th><th>Country</th><th>Role</th><th>Playing Order</th><th>Bat SR</th><th>Bat Avg</th><th>Econ</th><th>Wkts</th><th>Base Price</th><th>Status</th><th></th></tr></thead><tbody id="tb"></tbody></table></div></div>`;
 $('#r').value=f.role;$('#s').value=f.status;
 const draw=()=>{const q=$('#q').value.toLowerCase(),r=$('#r').value,c=$('#c').value,o=$('#o').value,s=$('#s').value,pr=$('#pr').value,so=$('#so').value;
  let l=P.filter(p=>(!q||p.name.toLowerCase().includes(q))&&(!r||p.role===r)&&(!c||(c==='India')===!p.overseas)&&(!o||p.playingOrder===o)&&(!s||p.status===s));
  if(pr){const[lo,hi]=pr.split('-').map(Number);l=l.filter(p=>p.basePrice>lo&&p.basePrice<=hi||(lo===0&&p.basePrice<=hi))}
  const asc=so==='name'||so==='economy';
  l.sort((x,y)=>{if(so==='name')return x.name.localeCompare(y.name);const a=x[so],b=y[so];if(a==null&&b==null)return 0;if(a==null)return 1;if(b==null)return -1;return asc?a-b:b-a});
  $('#tb').innerHTML=l.map(p=>`<tr><td style="display:flex;gap:10px;align-items:center">${av(p,1)}<b>${esc(p.name)}</b></td><td>${esc(p.country)}</td><td>${rb(p.role)}</td><td>${esc(v(p.playingOrder))}</td><td>${v(p.strikeRate)}</td><td>${v(p.battingAvg)}</td><td>${v(p.economy)}</td><td>${v(p.wickets)}</td><td class="gold"><b>${cr(p.basePrice)}</b></td><td>${sb(p.status)}</td><td><button class="b-o" onclick="showPlayer(${p.id})">View</button></td></tr>`).join('')||'<tr><td colspan="11">No players match.</td></tr>'};
 document.querySelectorAll('.bar input,.bar select').forEach(e=>e.addEventListener('input',draw));draw()};

async function A(a,t){try{const r=await api('/auction/'+a,'POST',t?{teamId:t}:undefined);
 if(a==='sold'){banner=`<div class="banner s">SOLD · ${esc(r.playerName)} → ${esc(r.teamName)} · ${cr(r.price)}</div>`;toast('Player successfully sold.')}
 else if(a==='unsold'){banner=`<div class="banner u">UNSOLD · ${esc(r.playerName)}</div>`;toast('Player marked unsold.')}
 else if(a==='bid')toast('Bid placed successfully.');else if(a==='reauction')toast(r.moved+' unsold players moved back to the pool.');
 if(['next','start','reset'].includes(a))banner='';}catch(e){} if(location.hash.startsWith('#/auction'))pages.auction(a==='bid')}
pages.auction=async pop=>{title('Live Auction');const s=await api('/auction/state'),p=s.player;$('#stat').textContent=s.status;
 const run=s.status==='RUNNING';
 const left=p?`<div class="card pc">${av(p)}<h2>${esc(p.name)}</h2><p>${esc(p.country)}</p><p>${rb(p.role)} <span class="badge">${esc(v(p.playingOrder))}</span></p><div class="kv"><div><span>Strike Rate</span><b>${v(p.strikeRate)}</b></div><div><span>Average</span><b>${v(p.battingAvg)}</b></div><div><span>Runs</span><b>${v(p.runs)}</b></div><div><span>Base Price</span><b class="gold">${cr(p.basePrice)}</b></div></div></div>`
  :`<div class="card pc"><h3>No player on the block</h3><p>${s.status==='COMPLETED'?'Auction complete — no available players left.':'Press Start, then Next Player.'}</p></div>`;
 const hi=s.teams.find(t=>t.id===s.highestTeamId);
 const mid=`<div class="card bid"><div class="stat"><div class="l">CURRENT BID</div></div><div class="amt ${pop===true?'pop':''}">${p?cr(s.highestTeamId?s.currentBid:p.basePrice):'—'}</div><p>Highest bidder: <b>${hi?esc(hi.name):'—'}</b></p>${p?`<p>Next bid: <b class="gold">${cr(s.nextBid)}</b></p>`:''}
 <div class="ctl"><button class="b-b" onclick="A('start')">Start</button><button class="b-o" onclick="A('pause')">Pause</button><button class="b-o" onclick="A('resume')">Resume</button></div>
 <div class="ctl"><button class="b-g" ${run&&p&&hi?'':'disabled'} onclick="A('sold')">SOLD</button><button class="b-r" ${run&&p&&!hi?'':'disabled'} onclick="A('unsold')">UNSOLD</button><button onclick="A('next')">NEXT PLAYER</button></div>
 <h3 style="margin-top:20px">Bidding History</h3>${s.bids.map(b=>`<div class="trow"><span>${esc(b.teamName)}</span><b class="gold">${cr(b.amount)}</b></div>`).join('')||'<p>No bids yet</p>'}</div>`;
 const right=`<div class="card"><h3>Teams</h3>${s.teams.map(t=>{const ps=s.passed.includes(t.id),h=t.id===s.highestTeamId;
  return `<div class="trow"><div><b>${esc(t.name)}</b><br><small>${cr(t.purse)} · ${t.playerCount}/${t.maxSquad}</small><br>${h?'<span class="badge b-ok">HIGHEST</span>':ps?'<span class="badge b-gray">PASSED</span>':'<span class="badge b-active">ACTIVE</span>'}</div>
  <div><button class="b-b" ${run&&p&&!ps?'':'disabled'} onclick="A('bid',${t.id})">BID</button> <button class="b-o" ${run&&p&&!ps&&!h?'':'disabled'} onclick="A('pass',${t.id})">PASS</button></div></div>`}).join('')}</div>`;
 $('#view').innerHTML=banner+`<div class="grid3">${left}${mid}${right}</div>`};

pages.team=async id=>{const [t,pl]=await Promise.all([api('/teams/'+id),api('/players')]);P=pl;title(t.name);
 const sq=pl.filter(p=>p.team&&p.team.id==id),n=r=>sq.filter(p=>p.role===r).length;
 $('#view').innerHTML=`<div class="grid"><div class="card stat"><div class="l">REMAINING PURSE</div><div class="v gold">${cr(t.purse)}</div></div><div class="card stat"><div class="l">SQUAD</div><div class="v">${sq.length} / ${t.maxSquad}</div></div><div class="card stat"><div class="l">TOTAL SPENT</div><div class="v">${cr(sq.reduce((a,p)=>a+p.soldPrice,0))}</div></div>
 <div class="card"><h3>Composition</h3>${ROLES.map(r=>`<div class="trow"><span>${r}</span><b>${n(r)}</b></div>`).join('')}</div></div>
 <div class="card"><h3>Squad</h3><div class="scroll"><table><thead><tr><th>Player</th><th>Role</th><th>Playing Order</th><th>Price</th><th>Bat SR</th><th>Econ</th></tr></thead><tbody>${sq.map(p=>`<tr><td><a href="#" onclick="showPlayer(${p.id});return false">${esc(p.name)}</a></td><td>${rb(p.role)}</td><td>${esc(v(p.playingOrder))}</td><td class="gold"><b>${cr(p.soldPrice)}</b></td><td>${v(p.strikeRate)}</td><td>${v(p.economy)}</td></tr>`).join('')||'<tr><td colspan="6">No players purchased yet.</td></tr>'}</tbody></table></div></div>`};

pages.analytics=async()=>{title('Analytics');const a=await api('/analytics');
 $('#view').innerHTML=`<div class="grid"><div class="card"><h3>Team Spending</h3>${bars(a.teams.map(x=>[x.team.name,x.spent]),cr)}</div><div class="card"><h3>Player Roles</h3>${bars(Object.entries(a.roles))}</div><div class="card"><h3>Auction Status</h3>${bars([['Sold',a.sold],['Unsold',a.unsold],['Available',a.available]])}</div><div class="card"><h3>Top Purchases</h3>${bars(a.topPurchases.map(p=>[p.name,p.soldPrice]),cr)}</div></div>
 <div class="card"><h3>Team Squad Strength</h3><table><thead><tr><th>Team</th><th>Batsmen</th><th>Bowlers</th><th>All-Rounders</th><th>Wicket-Keepers</th></tr></thead><tbody>${a.teams.map(x=>`<tr><td><b>${esc(x.team.name)}</b></td>${ROLES.map(r=>`<td>${x.roles[r]||0}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`};

pages.compare=async()=>{title('Player Comparison');P=await api('/players');
 const sel=i=>`<select id="cp${i}" onchange="drawCmp()"><option value="">${i<2?'Select player':'(optional)'}</option>${P.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select>`;
 $('#view').innerHTML=`<div class="bar">${sel(0)}${sel(1)}${sel(2)}</div><div class="card" id="cmp"><p>Pick two or more players.</p></div>`};
function drawCmp(){const l=[0,1,2].map(i=>P.find(p=>p.id==$('#cp'+i).value)).filter(Boolean);if(l.length<2){$('#cmp').innerHTML='<p>Pick two or more players.</p>';return}
 const rows=[['Role','role'],['Country','country'],['Matches','matches'],['Runs','runs'],['Average','battingAvg'],['Strike Rate','strikeRate'],['Wickets','wickets'],['Economy','economy'],['Base Price','basePrice']];
 $('#cmp').innerHTML=`<table><thead><tr><th></th>${l.map(p=>`<th>${esc(p.name)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr><td><b>${r[0]}</b></td>${l.map(p=>`<td>${r[1]==='basePrice'?cr(p[r[1]]):esc(v(p[r[1]]))}</td>`).join('')}</tr>`).join('')}</tbody></table>`}

let XI=[],XT=null;
pages.xi=async()=>{title('Final Playing XI');T=await api('/teams');P=await api('/players');XT=XT&&T.find(t=>t.id===XT)?XT:T[0].id;drawXI(true)};
function drawXI(load){const t=T.find(x=>x.id===XT);if(load)XI=[...t.playingXi];
 const sq=P.filter(p=>p.team&&p.team.id===XT),by=id=>P.find(p=>p.id===id);XI=XI.filter(id=>by(id));
 $('#view').innerHTML=`<div class="bar"><select onchange="XT=+this.value;drawXI(true)">${T.map(x=>`<option value="${x.id}" ${x.id===XT?'selected':''}>${esc(x.name)}</option>`).join('')}</select><button class="b-g" onclick="saveXI()">Save Playing XI</button></div>
 <div class="grid"><div class="card"><h3>Squad (${sq.length})</h3>${sq.map(p=>`<div class="trow"><span>${esc(p.name)} ${rb(p.role)}</span><button class="b-o" ${XI.includes(p.id)||XI.length>=11?'disabled':''} onclick="XI.push(${p.id});drawXI()">Add</button></div>`).join('')||'<p>No players purchased yet.</p>'}</div>
 <div class="card"><h3>Playing XI (${XI.length}/11)</h3>${XI.map((id,i)=>{const p=by(id);return `<div class="trow"><span>${i+1}. <b>${esc(p.name)}</b> <small>${esc(v(p.playingOrder))}</small></span><span><button class="b-o" onclick="mvXI(${i},-1)">↑</button> <button class="b-o" onclick="mvXI(${i},1)">↓</button> <button class="b-r" onclick="XI.splice(${i},1);drawXI()">✕</button></span></div>`}).join('')||'<p>Add players from your squad.</p>'}</div></div>`}
function mvXI(i,d){const j=i+d;if(j<0||j>=XI.length)return;[XI[i],XI[j]]=[XI[j],XI[i]];drawXI()}
async function saveXI(){try{const t=await api('/teams/'+XT+'/xi','PUT',XI);T=T.map(x=>x.id===XT?t:x);toast('Playing XI saved.')}catch(e){}}

pages.history=async()=>{title('Auction History');const h=await api('/auction/history');
 $('#view').innerHTML=`<div class="bar"><input id="hq" placeholder="Search player..."><select id="ht"><option value="">Team</option>${[...new Set(h.map(x=>x.teamName).filter(Boolean))].map(x=>`<option>${esc(x)}</option>`).join('')}</select><select id="hr"><option value="">Role</option>${ROLES.map(r=>`<option>${r}</option>`).join('')}</select><select id="hs"><option value="">Sold/Unsold</option><option>SOLD</option><option>UNSOLD</option></select></div>
 <div class="card"><div class="scroll"><table><thead><tr><th>Player</th><th>Role</th><th>Base</th><th>Winning Team</th><th>Final Price</th><th>Status</th><th>Time</th></tr></thead><tbody id="hb"></tbody></table></div></div>`;
 const draw=()=>{const q=$('#hq').value.toLowerCase(),t=$('#ht').value,r=$('#hr').value,s=$('#hs').value;
  $('#hb').innerHTML=h.filter(x=>(!q||x.playerName.toLowerCase().includes(q))&&(!t||x.teamName===t)&&(!r||x.role===r)&&(!s||x.status===s)).map(x=>`<tr><td><b>${esc(x.playerName)}</b></td><td>${rb(x.role)}</td><td>${cr(x.basePrice)}</td><td>${esc(v(x.teamName))}</td><td class="gold"><b>${cr(x.price)}</b></td><td>${sb(x.status)}</td><td>${esc(String(x.resultTime).replace('T',' ').slice(0,19))}</td></tr>`).join('')||'<tr><td colspan="7">No records.</td></tr>'};
 document.querySelectorAll('.bar input,.bar select').forEach(e=>e.addEventListener('input',draw));draw()};

const NUMF=['age','matches','runs','battingAvg','strikeRate','fifties','hundreds','wickets','bowlingAvg','economy','bowlingSR','basePrice'];
const TXTF=['name','country','imageUrl'];
pages.admin=async()=>{title('Admin');[P,T]=await Promise.all([api('/players'),api('/teams')]);const s=await api('/auction/state');
 $('#view').innerHTML=`<div class="card"><h3>Auction Controls</h3><div class="ctl" style="justify-content:flex-start"><button class="b-b" onclick="A('start')">Start</button><button class="b-o" onclick="A('pause')">Pause</button><button class="b-o" onclick="A('resume')">Resume</button><button class="b-g" onclick="A('reauction')">Re-auction Unsold</button><button class="b-r" onclick="resetA()">Reset Auction</button>
 <input id="inc" type="number" step="0.05" min="0.05" value="${s.increment}" style="width:100px"><button onclick="setInc()">Set Bid Increment (Cr)</button></div></div>
 <div class="card"><h3>Teams</h3>${T.map(t=>`<div class="trow"><input id="tn${t.id}" value="${esc(t.name)}"><input id="tp${t.id}" type="number" value="${t.initialPurse}" style="width:110px"><button onclick="saveTeam(${t.id})">Save</button></div>`).join('')}</div>
 <div class="card"><h3 id="ft">Add Player</h3><div class="form"><input type="hidden" id="f_id">
 ${TXTF.map(k=>`<label>${k}<input id="f_${k}"></label>`).join('')}<label>role<select id="f_role">${ROLES.map(r=>`<option>${r}</option>`).join('')}</select></label><label>playingOrder<select id="f_playingOrder">${ORDERS.map(r=>`<option>${r}</option>`).join('')}</select></label>
 ${NUMF.map(k=>`<label>${k}${k==='basePrice'?' (Cr)':''}<input id="f_${k}" type="number" step="any"></label>`).join('')}</div>
 <div class="ctl" style="justify-content:flex-start"><button class="b-g" onclick="savePlayer()">Save Player</button><button class="b-o" onclick="pages.admin()">Clear</button></div></div>
 <div class="card"><h3>Players (${P.length}/100)</h3><div class="scroll"><table><tbody>${P.map(p=>`<tr><td>${esc(p.name)}</td><td>${rb(p.role)}</td><td>${sb(p.status)}</td><td><button class="b-o" onclick="editP(${p.id})">Edit</button> <button class="b-r" onclick="delP(${p.id})">Delete</button></td></tr>`).join('')}</tbody></table></div></div>`};
async function resetA(){if(!confirm('Reset the whole auction? All results are cleared.'))return;try{await api('/auction/reset','POST');banner='';toast('Auction reset.');pages.admin()}catch(e){}}
async function setInc(){try{await api('/auction/settings','PUT',{increment:+$('#inc').value});toast('Increment updated.')}catch(e){}}
async function saveTeam(id){try{await api('/teams/'+id,'PUT',{name:$('#tn'+id).value,initialPurse:+$('#tp'+id).value});toast('Team updated.');pages.admin();buildNav()}catch(e){}}
function editP(id){const p=P.find(x=>x.id===id);$('#ft').textContent='Edit Player';$('#f_id').value=id;[...TXTF,...NUMF,'role','playingOrder'].forEach(k=>$('#f_'+k).value=p[k]??'');window.scrollTo(0,0)}
async function savePlayer(){const b={};TXTF.forEach(k=>b[k]=$('#f_'+k).value||null);NUMF.forEach(k=>{const x=$('#f_'+k).value;b[k]=x===''?null:Number(x)});b.role=$('#f_role').value;b.playingOrder=$('#f_playingOrder').value;if(b.basePrice==null)b.basePrice=0;
 const id=$('#f_id').value;try{await api('/players'+(id?'/'+id:''),id?'PUT':'POST',b);toast(id?'Player updated.':'Player added.');pages.admin()}catch(e){}}
async function delP(id){if(!confirm('Delete this player?'))return;try{await api('/players/'+id,'DELETE');toast('Player removed.');pages.admin()}catch(e){}}

async function buildNav(){T=await api('/teams');const L=(n,h)=>`<a href="#/${h}">${n}</a>`;
 $('#nav').innerHTML=L('Dashboard','dashboard')+'<h4>AUCTION</h4>'+L('Live Auction','auction')+L('Available Players','players/available')+L('Sold Players','players/sold')+L('Unsold Players','players/unsold')+
 '<h4>PLAYERS</h4>'+L('All Players','players/all')+L('Batsmen','players/BATSMAN')+L('Bowlers','players/BOWLER')+L('All-Rounders','players/ALL-ROUNDER')+L('Wicket-Keepers','players/WICKET-KEEPER')+
 '<h4>TEAMS</h4>'+T.map(t=>L(esc(t.name),'team/'+t.id)).join('')+'<h4>MORE</h4>'+L('Analytics','analytics')+L('Player Comparison','compare')+L('Final Playing XI','xi')+L('Auction History','history')+L('Admin','admin')}
async function route(){const h=location.hash.slice(2)||'dashboard';const[p,a]=h.split('/');
 document.querySelectorAll('.nav a').forEach(x=>x.classList.toggle('on',x.getAttribute('href')==='#/'+h));
 try{await(pages[p]||pages.dashboard)(a);const s=await api('/auction/state');$('#stat').textContent=s.status;const view=$('#view');view.classList.remove('view-enter');void view.offsetWidth;view.classList.add('view-enter')}catch(e){console.error(e)}}
window.addEventListener('hashchange',route);
buildNav().then(route).catch(()=>{$('#view').innerHTML='<div class="card"><h3>Cannot reach the backend</h3><p>Make sure Spring Boot is running and MySQL is reachable.</p></div>'});
