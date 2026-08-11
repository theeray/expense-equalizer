import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const settings=window.EEE_FIREBASE||{enabled:false};
const bridge=window.EEEBridge;

const badge=document.getElementById('cloudStatusBadge');
const statusText=document.getElementById('cloudStatusText');
const topStatus=document.getElementById('topSyncStatus');
const setupNote=document.getElementById('firebaseSetupNote');
const info=document.getElementById('sharedTripInfo');
const linkDisplay=document.getElementById('shareLinkDisplay');
const createBtn=document.getElementById('cloudShareBtn');
const copyBtn=document.getElementById('copyInviteBtn');
const leaveBtn=document.getElementById('leaveSharedBtn');

let firebaseApp=null,auth=null,db=null,user=null;
let unsubscribe=null;
let activeShareId=null;
let applyingRemote=false;
let writeTimer=null;
let lastInviteLink='';

function setStatus(label,kind='local',note=''){
  if(statusText) statusText.textContent=label;
  if(topStatus) topStatus.textContent=label;
  if(badge){
    badge.classList.remove('local','syncing','synced','offline','error');
    badge.classList.add(kind);
  }
  if(note&&setupNote) setupNote.textContent=note;
}

function randomShareId(){
  const bytes=new Uint8Array(18);
  crypto.getRandomValues(bytes);
  return Array.from(bytes,b=>b.toString(36).padStart(2,'0')).join('').slice(0,28);
}

function makeInviteLink(shareId){
  const u=new URL('./app.html',window.location.href);
  u.search='';
  u.searchParams.set('trip',shareId);
  return u.toString();
}

async function copyText(text){
  try{
    await navigator.clipboard.writeText(text);
    bridge?.toast?.('Invite link copied');
  }catch{
    const ta=document.createElement('textarea');
    ta.value=text;document.body.appendChild(ta);ta.select();
    document.execCommand('copy');ta.remove();
    bridge?.toast?.('Invite link copied');
  }
}

function updateSharedUI(){
  const trip=bridge?.getCurrentTrip?.();
  const shareId=trip?.shareId||null;
  lastInviteLink=shareId?makeInviteLink(shareId):'';

  if(info) info.classList.toggle('hidden',!shareId);
  if(copyBtn) copyBtn.classList.toggle('hidden',!shareId);
  if(leaveBtn) leaveBtn.classList.toggle('hidden',!shareId);
  if(createBtn){
    createBtn.classList.toggle('hidden',!!shareId);
    createBtn.textContent='Create shared trip link';
  }
  if(linkDisplay) linkDisplay.textContent=lastInviteLink||'—';

  if(!settings.enabled){
    setStatus('Local','local','Firebase is not connected yet. The app will continue working normally on this device.');
  }else if(shareId && navigator.onLine){
    setStatus('Synced','synced','This trip is connected to Firebase and can update across phones.');
  }else if(shareId){
    setStatus('Offline','offline','This shared trip is currently offline. Local changes remain on this device until a connection returns.');
  }else{
    setStatus('Local','local','Firebase is connected. Create a shared trip link when you want to invite others.');
  }
}

async function ensureAuth(){
  if(!settings.enabled) throw new Error('Firebase is not configured');
  if(user) return user;
  if(!auth) throw new Error('Firebase Auth is unavailable');

  return await new Promise((resolve,reject)=>{
    let done=false;
    const off=onAuthStateChanged(auth,async u=>{
      if(done)return;
      if(u){
        done=true;user=u;off();resolve(u);return;
      }
      try{
        await signInAnonymously(auth);
      }catch(e){
        done=true;off();reject(e);
      }
    },e=>{done=true;off();reject(e)});
  });
}

function sanitizeTripForCloud(trip){
  const clean=structuredClone(trip);
  clean.shared=true;
  return clean;
}

async function writeCurrentTripNow(){
  if(!settings.enabled||applyingRemote||!navigator.onLine)return;
  const trip=bridge?.getCurrentTrip?.();
  if(!trip?.shareId)return;
  await ensureAuth();
  setStatus('Syncing','syncing','Saving changes…');

  const ref=doc(db,'trips',trip.shareId);
  await setDoc(ref,{
    shareId:trip.shareId,
    trip:sanitizeTripForCloud(trip),
    updatedAt:serverTimestamp(),
    updatedBy:user.uid
  },{merge:true});

  setStatus('Synced','synced','All changes are synced.');
}

function scheduleWrite(){
  clearTimeout(writeTimer);
  writeTimer=setTimeout(()=>{
    writeCurrentTripNow().catch(err=>{
      console.error(err);
      setStatus(navigator.onLine?'Sync error':'Offline',navigator.onLine?'error':'offline',
        navigator.onLine?'Could not sync this change. Check Firebase setup and security rules.':'Changes will sync when the connection returns.');
    });
  },350);
}

function stopListening(){
  if(unsubscribe){unsubscribe();unsubscribe=null}
  activeShareId=null;
}

async function listenToShare(shareId){
  if(!settings.enabled||!shareId)return;
  if(activeShareId===shareId&&unsubscribe)return;
  stopListening();
  await ensureAuth();

  activeShareId=shareId;
  const ref=doc(db,'trips',shareId);
  unsubscribe=onSnapshot(ref,snap=>{
    if(!snap.exists())return;
    const data=snap.data();
    if(!data?.trip)return;

    const current=bridge?.getCurrentTrip?.();
    // Ignore our own snapshot when the local object already matches closely enough.
    const incoming=structuredClone(data.trip);
    incoming.shareId=shareId;
    incoming.shared=true;

    applyingRemote=true;
    try{
      bridge?.applyRemoteTrip?.(incoming,shareId);
    }finally{
      applyingRemote=false;
    }
    updateSharedUI();
  },err=>{
    console.error(err);
    setStatus('Sync error','error','Realtime sync could not connect. Check Firestore rules and Firebase configuration.');
  });
}

async function createSharedTrip(){
  if(!settings.enabled){
    bridge?.toast?.('Firebase setup is required first');
    switchToMore();
    return;
  }
  try{
    await ensureAuth();
    let trip=bridge.getCurrentTrip();
    let shareId=trip.shareId;
    if(!shareId){
      shareId=randomShareId();
      trip=bridge.attachShareId(shareId);
    }

    setStatus('Syncing','syncing','Creating shared trip…');
    const ref=doc(db,'trips',shareId);
    await setDoc(ref,{
      shareId,
      trip:sanitizeTripForCloud(trip),
      createdAt:serverTimestamp(),
      updatedAt:serverTimestamp(),
      updatedBy:user.uid
    },{merge:true});

    await listenToShare(shareId);
    updateSharedUI();
    await copyText(makeInviteLink(shareId));
    bridge?.toast?.('Shared trip created');
  }catch(err){
    console.error(err);
    setStatus('Setup needed','error','Could not create the shared trip. Check Firebase configuration, Anonymous Authentication, and Firestore rules.');
    bridge?.toast?.('Could not create shared trip');
  }
}

async function joinFromUrl(){
  const params=new URLSearchParams(window.location.search);
  const shareId=params.get('trip');
  if(!shareId)return false;

  if(!settings.enabled){
    setStatus('Setup needed','error','This is a shared-trip link, but Firebase has not been configured in this build yet.');
    bridge?.toast?.('Firebase setup is required to join');
    return false;
  }

  try{
    await ensureAuth();
    setStatus('Joining','syncing','Opening shared trip…');
    const ref=doc(db,'trips',shareId);
    const snap=await getDoc(ref);
    if(!snap.exists()){
      setStatus('Not found','error','This shared trip link was not found.');
      bridge?.toast?.('Shared trip not found');
      return false;
    }

    const data=snap.data();
    if(!data?.trip)throw new Error('Trip data missing');
    applyingRemote=true;
    try{
      bridge.applyRemoteTrip(data.trip,shareId);
    }finally{
      applyingRemote=false;
    }
    await listenToShare(shareId);
    updateSharedUI();
    bridge?.toast?.('Shared trip joined');
    return true;
  }catch(err){
    console.error(err);
    setStatus('Join failed','error','Could not join this shared trip. Check Firebase setup or internet connection.');
    bridge?.toast?.('Could not join shared trip');
    return false;
  }
}

function switchToMore(){
  document.querySelector('[data-tab="more"]')?.click();
}

async function leaveShared(){
  const trip=bridge?.getCurrentTrip?.();
  if(!trip?.shareId)return;
  if(!confirm('Keep this trip on this device but stop syncing it with the shared version?'))return;
  stopListening();
  bridge.removeShareFromCurrent();
  const u=new URL(window.location.href);
  u.searchParams.delete('trip');
  history.replaceState({},'',u);
  updateSharedUI();
  bridge?.toast?.('Trip is now local only');
}

async function initialize(){
  updateSharedUI();

  if(!settings.enabled){
    return;
  }

  try{
    firebaseApp=initializeApp(settings.config);
    auth=getAuth(firebaseApp);
    db=getFirestore(firebaseApp);
    await ensureAuth();

    const joined=await joinFromUrl();
    if(!joined){
      const trip=bridge?.getCurrentTrip?.();
      if(trip?.shareId) await listenToShare(trip.shareId);
      updateSharedUI();
    }
  }catch(err){
    console.error(err);
    setStatus('Setup needed','error','Firebase could not initialize. Check firebase-config.js and the Firebase console setup.');
  }
}

window.addEventListener('eee:state-saved',()=>{
  const trip=bridge?.getCurrentTrip?.();
  updateSharedUI();
  if(settings.enabled&&trip?.shareId){
    listenToShare(trip.shareId).catch(console.error);
    scheduleWrite();
  }else{
    stopListening();
  }
});

window.addEventListener('eee:create-share',createSharedTrip);
window.addEventListener('eee:copy-share-link',()=>{
  const trip=bridge?.getCurrentTrip?.();
  if(trip?.shareId) copyText(makeInviteLink(trip.shareId));
});
window.addEventListener('eee:leave-share',leaveShared);

window.addEventListener('online',()=>{
  updateSharedUI();
  const trip=bridge?.getCurrentTrip?.();
  if(settings.enabled&&trip?.shareId){
    listenToShare(trip.shareId).catch(console.error);
    scheduleWrite();
  }
});
window.addEventListener('offline',updateSharedUI);

initialize();
