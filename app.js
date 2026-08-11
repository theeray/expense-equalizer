const STORAGE_KEY='eee-pwa-v6';
const blankTrip={id:'trip-initial',name:'New Expense Group',createdAt:Date.now(),people:[],expenses:[]};
let state=loadState()||{currentTripId:'trip-initial',trips:[structuredClone(blankTrip)]};
let editExpenseId=null,editPersonId=null,draftMode='weighted',selected=new Set(),deferredInstall=null;

function uid(prefix){return prefix+Math.random().toString(36).slice(2,10)}
function currentTrip(){return state.trips.find(t=>t.id===state.currentTripId)||state.trips[0]}
function saveState(options={}){
  localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
  if(options.sync!==false){
    window.dispatchEvent(new CustomEvent('eee:state-saved',{detail:{tripId:state.currentTripId}}));
  }
}
function loadState(){try{let v=JSON.parse(localStorage.getItem(STORAGE_KEY));return v&&Array.isArray(v.trips)?v:null}catch{return null}}
function money(n){return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Math.round((Number(n)||0)*100)/100)}
function esc(s){return String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]))}
function toast(msg){const el=document.getElementById('toast');el.textContent=msg;el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),1800)}
function personName(id){return currentTrip().people.find(p=>p.id===id)?.name||'Unknown'}
function tripTotal(t=currentTrip()){return t.expenses.reduce((s,e)=>s+(Number(e.amount)||0),0)}

function peopleIcon(count=1){
  if(Number(count)>1){
    return `<span class="avatar-icon" aria-hidden="true"><svg viewBox="0 0 32 32"><circle cx="11" cy="10" r="5"/><circle cx="22" cy="11" r="4.5"/><path d="M2.5 27c.6-7.2 3.9-10.8 8.9-10.8 5.1 0 8.2 3.6 8.7 10.8H2.5Z"/><path d="M17.3 27c-.1-3.4-.9-6.1-2.6-8.1 1.8-1.6 4.1-2.4 6.8-2.4 4.5 0 7.2 3.5 7.8 10.5h-12Z"/></svg></span>`;
  }
  return `<span class="avatar-icon" aria-hidden="true"><svg viewBox="0 0 32 32"><circle cx="16" cy="9" r="6"/><path d="M5 28c.7-8.5 4.4-12.7 11-12.7S26.3 19.5 27 28H5Z"/></svg></span>`;
}
function showSplash(){window.location.href='./index.html?v=23';}

function shares(exp,t=currentTrip()){
  const ids=exp.selected.filter(id=>t.people.some(p=>p.id===id)); if(!ids.length)return {};
  const raw={};
  if(exp.mode==='weighted') ids.forEach(id=>raw[id]=Math.max(0,t.people.find(p=>p.id===id)?.people||0));
  else if(exp.mode==='equal') ids.forEach(id=>raw[id]=1);
  else ids.forEach(id=>raw[id]=Math.max(0,Number(exp.weights?.[id])||0));
  const total=Object.values(raw).reduce((a,b)=>a+b,0); if(total<=0)return {};
  return Object.fromEntries(ids.map(id=>[id,exp.amount*raw[id]/total]));
}
function balances(t=currentTrip()){
  const b=Object.fromEntries(t.people.map(p=>[p.id,0]));
  for(const e of t.expenses){if(!(e.payerId in b))continue;b[e.payerId]+=Number(e.amount)||0;for(const [id,v] of Object.entries(shares(e,t)))if(id in b)b[id]-=v}
  return b;
}
function transfers(t=currentTrip()){
  const b=balances(t),creditors=[],debtors=[];
  for(const [id,v] of Object.entries(b)){const cents=Math.round(v*100);if(cents>0)creditors.push({id,c:cents});else if(cents<0)debtors.push({id,c:-cents})}
  creditors.sort((a,b)=>b.c-a.c);debtors.sort((a,b)=>b.c-a.c);
  const out=[];let i=0,j=0;
  while(i<debtors.length&&j<creditors.length){const x=Math.min(debtors[i].c,creditors[j].c);if(x>0)out.push({from:debtors[i].id,to:creditors[j].id,amount:x/100});debtors[i].c-=x;creditors[j].c-=x;if(!debtors[i].c)i++;if(!creditors[j].c)j++}
  return out;
}

function render(){const t=currentTrip();if(!t)return;
  document.getElementById('tripName').textContent=t.name;document.getElementById('tripTotal').textContent=money(tripTotal(t));
  renderPeople();renderExpenses();renderSettle();renderTrips();renderExpenseControls();
}
function renderPeople(){const t=currentTrip(),el=document.getElementById('peopleList');
  if(!t.people.length){el.innerHTML='<div class="empty-card"><strong>No people added yet.</strong><br><span class="empty-help">Tap + or Add person or group to begin.</span></div>';return}
  el.innerHTML=t.people.map(p=>`<button class="person-card" data-person="${p.id}"><div class="person-main">${peopleIcon(p.people)}<div><div class="card-title">${esc(p.name||'Unnamed')}</div><div class="card-sub">${p.people} ${p.people===1?'person':'people'}</div></div></div><span class="chev">›</span></button>`).join('');
  el.querySelectorAll('[data-person]').forEach(b=>b.onclick=()=>openPersonModal(b.dataset.person));
}
function renderExpenses(){const t=currentTrip(),list=document.getElementById('expenseList'),total=tripTotal(t);document.getElementById('expenseTotal').textContent=money(total);document.getElementById('expenseCount').textContent=t.expenses.length;
  if(!t.expenses.length){list.innerHTML='<div class="empty-card"><strong>No expenses yet.</strong><br><span class="empty-help">Add your first shared expense when you are ready.</span></div>';return}
  list.innerHTML=t.expenses.slice().reverse().map(e=>{const chosen=e.selected.map(personName).filter(Boolean),mode=e.mode==='weighted'?'By people':e.mode==='equal'?'Equal groups':'Custom';return `<button class="expense-card" data-expense="${e.id}"><div class="expense-top"><div><div class="card-title">${esc(e.description||'Expense')}</div><div class="expense-meta">Paid by ${esc(personName(e.payerId))} · ${mode}</div></div><div class="expense-amount">${money(e.amount)}</div></div><div class="pill-row">${chosen.map(n=>`<span class="pill">${esc(n)}</span>`).join('')}</div></button>`}).join('');
  list.querySelectorAll('[data-expense]').forEach(b=>b.onclick=()=>openExpenseModal(b.dataset.expense));
}
function renderSettle(){const t=currentTrip(),tr=transfers(t),b=balances(t);document.getElementById('settleTotal').textContent=money(tripTotal(t));document.getElementById('settleCount').textContent=`${tr.length} ${tr.length===1?'payment':'payments'} to settle`;
  const te=document.getElementById('transfers');te.innerHTML=tr.length?tr.map(x=>`<div class="transfer-card"><div class="transfer-route"><strong>${esc(personName(x.from))}</strong><small>pays ${esc(personName(x.to))}</small></div><div class="transfer-amount">${money(x.amount)}</div></div>`).join(''):'<div class="empty-card"><strong>Nothing to settle yet.</strong><br><span class="empty-help">Add people and expenses to see who owes whom.</span></div>';
  document.getElementById('balances').innerHTML=t.people.map(p=>{const v=b[p.id]||0,cls=v>=-.005?'balance-pos':'balance-neg';return `<div class="balance-card"><div><div class="card-title">${esc(p.name)}</div><div class="card-sub">${v>=-.005?'is owed / even':'owes'}</div></div><div class="${cls}">${v>=0?'+':''}${money(v)}</div></div>`}).join('');
}
function renderTrips(){const el=document.getElementById('tripList');el.innerHTML=state.trips.map(t=>`<button class="trip-card" data-trip="${t.id}"><div class="trip-main"><div class="avatar">${t.id===state.currentTripId?'✓':'$'}</div><div><div class="card-title">${esc(t.name)}</div><div class="card-sub">${t.expenses.length} expenses · ${money(tripTotal(t))}</div></div></div><span class="chev">›</span></button>`).join('');el.querySelectorAll('[data-trip]').forEach(b=>b.onclick=()=>{state.currentTripId=b.dataset.trip;saveState();render();switchTab('people');toast('Trip opened')})}

function openExpenseModal(id=null){const t=currentTrip();if(!t.people.length){switchTab('people');toast('Add a person or group first');return}editExpenseId=id;const e=id?t.expenses.find(x=>x.id===id):null;draftMode=e?.mode||'weighted';selected=new Set(e?.selected||t.people.map(p=>p.id));document.getElementById('expenseModalTitle').textContent=e?'Edit Expense':'New Expense';document.getElementById('desc').value=e?.description||'';document.getElementById('amount').value=e?.amount??'';document.getElementById('deleteExpense').classList.toggle('hidden',!e);document.getElementById('expenseModal').classList.remove('hidden');renderExpenseControls();if(e){document.getElementById('payer').value=e.payerId;if(e.mode==='custom')requestAnimationFrame(()=>document.querySelectorAll('[data-custom]').forEach(i=>i.value=e.weights?.[i.dataset.custom]??1))}}
function closeExpenseModal(){document.getElementById('expenseModal').classList.add('hidden')}
function renderExpenseControls(){const t=currentTrip(),payer=document.getElementById('payer');const old=payer.value;payer.innerHTML=t.people.map(p=>`<option value="${p.id}">${esc(p.name||'Unnamed')}</option>`).join('');if(t.people.some(p=>p.id===old))payer.value=old;
  const el=document.getElementById('participantChips');el.innerHTML=t.people.map(p=>`<button type="button" class="participant ${selected.has(p.id)?'on':''}" data-chip="${p.id}"><span>${esc(p.name||'Unnamed')} <small>· ${p.people}</small></span><span class="check">✓</span></button>`).join('');el.querySelectorAll('[data-chip]').forEach(b=>b.onclick=()=>{selected.has(b.dataset.chip)?selected.delete(b.dataset.chip):selected.add(b.dataset.chip);renderExpenseControls()});
  document.querySelectorAll('.mode').forEach(b=>b.classList.toggle('on',b.dataset.mode===draftMode));const wrap=document.getElementById('customWrap');wrap.classList.toggle('hidden',draftMode!=='custom');if(draftMode==='custom')document.getElementById('customFields').innerHTML=[...selected].map(id=>`<div class="custom-row"><span>${esc(personName(id))}</span><input data-custom="${id}" type="number" min="0" step="0.01" value="1" /></div>`).join('');
}
function saveExpense(){const t=currentTrip(),description=document.getElementById('desc').value.trim(),amount=Number(document.getElementById('amount').value),payerId=document.getElementById('payer').value;if(!description)return toast('Add a description');if(!(amount>0))return toast('Enter an amount');if(!selected.size)return toast('Choose who shared it');const weights={};if(draftMode==='custom'){document.querySelectorAll('[data-custom]').forEach(i=>weights[i.dataset.custom]=Number(i.value)||0);if(Object.values(weights).reduce((a,b)=>a+b,0)<=0)return toast('Custom weights must be above zero')}
  const obj={id:editExpenseId||uid('e'),description,amount,payerId,mode:draftMode,selected:[...selected],weights};if(editExpenseId)t.expenses=t.expenses.map(x=>x.id===editExpenseId?obj:x);else t.expenses.push(obj);saveState();closeExpenseModal();render();toast(editExpenseId?'Expense updated':'Expense added')}
function deleteExpense(){if(!editExpenseId)return;currentTrip().expenses=currentTrip().expenses.filter(e=>e.id!==editExpenseId);saveState();closeExpenseModal();render();toast('Expense deleted')}

function openPersonModal(id=null){const p=id?currentTrip().people.find(x=>x.id===id):null;editPersonId=id;document.getElementById('personModalTitle').textContent=p?'Edit Person or Group':'Add Person or Group';document.getElementById('personName').value=p?.name||'';document.getElementById('personWeight').value=p?.people??1;document.getElementById('deletePerson').classList.toggle('hidden',!p);document.getElementById('personModal').classList.remove('hidden');setTimeout(()=>document.getElementById('personName').focus(),80)}
function closePersonModal(){document.getElementById('personModal').classList.add('hidden')}
function savePerson(){const t=currentTrip(),name=document.getElementById('personName').value.trim(),people=Math.max(.01,Number(document.getElementById('personWeight').value)||1);if(!name)return toast('Add a name');if(editPersonId)t.people=t.people.map(p=>p.id===editPersonId?{...p,name,people}:p);else t.people.push({id:uid('p'),name,people});saveState();closePersonModal();render();toast(editPersonId?'Updated':'Person added')}
function deletePerson(){const t=currentTrip();if(!editPersonId)return;if(t.expenses.some(e=>e.payerId===editPersonId||e.selected.includes(editPersonId)))return toast('Remove their expenses first');t.people=t.people.filter(p=>p.id!==editPersonId);saveState();closePersonModal();render();toast('Removed')}

function openTripModal(){document.getElementById('newTripName').value='';document.getElementById('copyPeople').checked=true;document.getElementById('tripModal').classList.remove('hidden');setTimeout(()=>document.getElementById('newTripName').focus(),80)}
function closeTripModal(){document.getElementById('tripModal').classList.add('hidden')}
function saveTrip(){const name=document.getElementById('newTripName').value.trim();if(!name)return toast('Name the trip');const src=currentTrip(),copy=document.getElementById('copyPeople').checked;const t={id:uid('trip'),name,createdAt:Date.now(),people:copy?src.people.map(p=>({...p,id:uid('p')})):[],expenses:[]};state.trips.push(t);state.currentTripId=t.id;saveState();closeTripModal();render();switchTab('people');toast('New trip created')}
function renameCurrentTrip(){const t=currentTrip();const name=prompt('Rename trip:',t.name);if(name&&name.trim()){t.name=name.trim();saveState();render();toast('Trip renamed')}}
function deleteCurrentTrip(){if(state.trips.length<=1)return toast('Keep at least one trip');const t=currentTrip();if(!confirm(`Delete \"${t.name}\" and all of its expenses?`))return;state.trips=state.trips.filter(x=>x.id!==t.id);state.currentTripId=state.trips[0].id;saveState();render();switchTab('people');toast('Trip deleted')}

function switchTab(id){document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.tab===id));document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===id));window.scrollTo({top:0,behavior:'smooth'})}
async function shareResults(){const t=currentTrip(),tr=transfers(t);let text=`${t.name} — Eric's Expense Equalizer\nShare. Split. Simple.\n\nTotal: ${money(tripTotal(t))}\n\n`;text+=tr.length?tr.map(x=>`${personName(x.from)} pays ${personName(x.to)} ${money(x.amount)}`).join('\n'):'Everyone is already settled.';try{if(navigator.share)await navigator.share({title:`${t.name} settlement`,text});else{await navigator.clipboard.writeText(text);toast('Settlement copied')}}catch(e){if(e?.name!=='AbortError')toast('Could not share') }}


// Phase 2 bridge: exposes only the small surface the optional Firebase module needs.
// The core app remains local-first and does not depend on Firebase to function.
window.EEEBridge={
  getState:()=>structuredClone(state),
  getCurrentTrip:()=>structuredClone(currentTrip()),
  getCurrentTripId:()=>state.currentTripId,
  getTripByShareId:(shareId)=>{
    const t=state.trips.find(x=>x.shareId===shareId);
    return t?structuredClone(t):null;
  },
  attachShareId:(shareId)=>{
    const t=currentTrip();
    t.shareId=shareId;
    t.shared=true;
    saveState({sync:false});
    render();
    return structuredClone(t);
  },
  applyRemoteTrip:(remoteTrip,shareId)=>{
    if(!remoteTrip||!Array.isArray(remoteTrip.people)||!Array.isArray(remoteTrip.expenses)) return false;
    const incoming=structuredClone(remoteTrip);
    incoming.shareId=shareId;
    incoming.shared=true;
    let idx=state.trips.findIndex(t=>t.shareId===shareId);
    if(idx<0) idx=state.trips.findIndex(t=>t.id===incoming.id);
    if(idx>=0){
      state.trips[idx]=incoming;
    }else{
      state.trips.push(incoming);
    }
    state.currentTripId=incoming.id;
    saveState({sync:false});
    render();
    window.dispatchEvent(new CustomEvent('eee:remote-trip-applied',{detail:{shareId}}));
    return true;
  },
  removeShareFromCurrent:()=>{
    const t=currentTrip();
    delete t.shareId;
    delete t.shared;
    saveState({sync:false});
    render();
  },
  render,
  toast
};

// Events
document.querySelectorAll('.nav-btn').forEach(b=>b.onclick=()=>switchTab(b.dataset.tab));
document.getElementById('tripMenuBtn').onclick=()=>switchTab('more');document.getElementById('tripNameBtn').onclick=()=>switchTab('more');
document.getElementById('addPerson').onclick=()=>openPersonModal();document.getElementById('addPersonTop').onclick=()=>openPersonModal();document.getElementById('cancelPerson').onclick=closePersonModal;document.getElementById('savePerson').onclick=savePerson;document.getElementById('deletePerson').onclick=deletePerson;
document.getElementById('openExpenseBtn').onclick=()=>openExpenseModal();document.getElementById('addExpenseBottom').onclick=()=>openExpenseModal();document.getElementById('cancelExpense').onclick=closeExpenseModal;document.getElementById('saveExpense').onclick=saveExpense;document.getElementById('deleteExpense').onclick=deleteExpense;document.querySelectorAll('.mode').forEach(b=>b.onclick=()=>{draftMode=b.dataset.mode;renderExpenseControls()});
document.getElementById('newTrip').onclick=openTripModal;document.getElementById('renameTrip').onclick=renameCurrentTrip;document.getElementById('deleteTrip').onclick=deleteCurrentTrip;document.getElementById('cancelTrip').onclick=closeTripModal;document.getElementById('saveTrip').onclick=saveTrip;document.getElementById('shareResults').onclick=shareResults;
['expenseModal','personModal','tripModal'].forEach(id=>document.getElementById(id).addEventListener('click',e=>{if(e.target.id===id)e.target.classList.add('hidden')}));
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;document.getElementById('installBtn').classList.remove('hidden')});document.getElementById('installBtn').onclick=async()=>{if(!deferredInstall)return;deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;document.getElementById('installBtn').classList.add('hidden')};


const cloudShareBtn=document.getElementById('cloudShareBtn');
const copyInviteBtn=document.getElementById('copyInviteBtn');
const leaveSharedBtn=document.getElementById('leaveSharedBtn');
if(cloudShareBtn) cloudShareBtn.onclick=()=>window.dispatchEvent(new CustomEvent('eee:create-share'));
if(copyInviteBtn) copyInviteBtn.onclick=()=>window.dispatchEvent(new CustomEvent('eee:copy-share-link'));
if(leaveSharedBtn) leaveSharedBtn.onclick=()=>window.dispatchEvent(new CustomEvent('eee:leave-share'));

const welcomeButton=document.getElementById('showSplash');
if(welcomeButton) welcomeButton.onclick=()=>{window.location.href='./index.html?v=23';};

if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
render();
