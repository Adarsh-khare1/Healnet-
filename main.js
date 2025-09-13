// script.js - shared interactivity for the prototype

// ---------- Utils ----------
function id(el){return document.getElementById(el)}
function mk(tag, cls){ let e=document.createElement(tag); if(cls) e.className=cls; return e; }

function getAnonId(){
  let id = localStorage.getItem('campuscare_anonid');
  if(!id){
    id = 'anon_' + Math.random().toString(36).slice(2,9);
    localStorage.setItem('campuscare_anonid', id);
  }
  return id;
}

// Insert anon id into elements with data-anon
function placeAnon(){
  document.querySelectorAll('[data-anon]').forEach(el=>{
    el.innerText = getAnonId();
  });
}

// ---------- Screening logic ----------
const PHQ9 = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself — or that you are a failure",
  "Trouble concentrating on things",
  "Moving or speaking slowly; or being fidgety/restless",
  "Thoughts that you would be better off dead or hurting yourself"
];
const GAD7 = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it's hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid as if something awful might happen"
];

function buildScreeningUI(containerId){
  const phqCont = id(containerId);
  if(!phqCont) return;
  // PHQ9
  const phqCard = mk('div','card');
  phqCard.innerHTML = '<h3>PHQ-9</h3><p class="small">Answer for last 2 weeks</p>';
  PHQ9.forEach((q,i)=>{
    const qdiv = mk('div','qblock');
    qdiv.innerHTML = `<div style="margin-top:10px">${i+1}. ${q}</div>`;
    const opts = mk('div'); opts.style.marginTop='8px';
    ['0 — Not at all','1 — Several days','2 — More than half the days','3 — Nearly every day'].forEach((label,val)=>{
      const b = mk('button'); b.type='button';
      b.className='btn-ghost';
      b.style.marginRight='8px'; b.style.marginTop='6px';
      b.innerText = label;
      b.onclick = ()=> {
        qdiv.dataset.value = val;
        // mark visually
        Array.from(opts.children).forEach(c=>c.style.opacity=0.5);
        b.style.opacity=1;
      };
      opts.appendChild(b);
    });
    qdiv.appendChild(opts);
    phqCard.appendChild(qdiv);
  });
  phqCont.appendChild(phqCard);

  // GAD7
  const gadCard = mk('div','card');
  gadCard.style.marginTop='12px';
  gadCard.innerHTML = '<h3>GAD-7</h3><p class="small">Anxiety screening</p>';
  GAD7.forEach((q,i)=>{
    const qdiv = mk('div','qblock');
    qdiv.innerHTML = `<div style="margin-top:10px">${i+1}. ${q}</div>`;
    const opts = mk('div'); opts.style.marginTop='8px';
    ['0 — Not at all','1 — Several days','2 — More than half the days','3 — Nearly every day'].forEach((label,val)=>{
      const b = mk('button'); b.type='button';
      b.className='btn-ghost';
      b.style.marginRight='8px'; b.style.marginTop='6px';
      b.innerText = label;
      b.onclick = ()=> {
        qdiv.dataset.value = val;
        Array.from(opts.children).forEach(c=>c.style.opacity=0.5);
        b.style.opacity=1;
      };
      opts.appendChild(b);
    });
    qdiv.appendChild(opts);
    gadCard.appendChild(qdiv);
  });
  phqCont.appendChild(gadCard);

  // submit
  const submit = mk('button'); submit.className='btn-block'; submit.innerText='Submit Screening';
  submit.style.marginTop='12px';
  submit.onclick = ()=> {
    // collect
    const phqEls = phqCard.querySelectorAll('.qblock');
    const gadEls = gadCard.querySelectorAll('.qblock');
    let phqScore=0,gadScore=0; let all=true;
    phqEls.forEach(e=>{
      if(e.dataset.value===undefined) all=false; else phqScore += Number(e.dataset.value);
    });
    gadEls.forEach(e=>{
      if(e.dataset.value===undefined) all=false; else gadScore += Number(e.dataset.value);
    });
    if(!all){ alert('Please answer all questions.'); return; }
    // store locally
    const record = { id: getAnonId(), date: new Date().toISOString(), phq:phqScore, gad:gadScore };
    const items = JSON.parse(localStorage.getItem('campuscare_screenings')||'[]');
    items.unshift(record);
    localStorage.setItem('campuscare_screenings', JSON.stringify(items));
    // show result
    showScreeningResult(record);
  };
  phqCont.appendChild(submit);
}

function showScreeningResult(record){
  const node = mk('div','card');
  const phqCat = phqCategory(record.phq);
  const gadCat = gadCategory(record.gad);
  node.innerHTML = `<h3>Results</h3>
    <p class="small">PHQ-9: <strong>${record.phq}</strong> — ${phqCat}</p>
    <p class="small">GAD-7: <strong>${record.gad}</strong> — ${gadCat}</p>
    <div style="margin-top:10px" class="small">Recommendations below.</div>`;
  const rec = mk('div'); rec.style.marginTop='12px';
  if(record.phq>=20 || record.gad>=15){
    rec.innerHTML = `<div style="color:var(--danger);font-weight:700">High severity — immediate support recommended.</div>
      <div class="small">Please consider booking counseling or contact emergency services if at risk.</div>`;
  } else if(record.phq>=15 || record.gad>=10){
    rec.innerHTML = `<div style="color:var(--warning);font-weight:700">Moderate symptoms — counselor recommended.</div>
      <div class="small">Consider booking a counseling session and using targeted resources.</div>`;
  } else {
    rec.innerHTML = `<div style="color:var(--success);font-weight:700">Mild or minimal symptoms.</div>
      <div class="small">Self-help resources and peer support may help. Re-check in 2 weeks.</div>`;
  }
  node.appendChild(rec);

  // quick action
  const actions = mk('div'); actions.style.marginTop='12px';
  const r1 = mk('button'); r1.className='btn-outline'; r1.innerText='Open Resources'; r1.onclick=()=> location.href='resources.html';
  const r2 = mk('button'); r2.className='btn-primary'; r2.style.marginLeft='10px'; r2.innerText='Book Counseling'; r2.onclick=()=> location.href='counseling.html';
  actions.appendChild(r1); actions.appendChild(r2);
  node.appendChild(actions);

  // append to top of main container or modal
  const cont = document.querySelector('.container') || document.body;
  cont.insertBefore(node, cont.firstChild);
}

// categories
function phqCategory(score){
  if(score<=4) return 'Minimal';
  if(score<=9) return 'Mild';
  if(score<=14) return 'Moderate';
  if(score<=19) return 'Moderately severe';
  return 'Severe';
}
function gadCategory(score){
  if(score<=4) return 'Minimal';
  if(score<=9) return 'Mild';
  if(score<=14) return 'Moderate';
  return 'Severe';
}

// ---------- Chat (demo canned replies) ----------
function chatInit(boxId, inputId){
  const box = id(boxId), input = id(inputId);
  if(!box) return;
  // welcome
  bubble(box, "👋 Hi, I'm CampusCare assistant. I can suggest resources, start screening or help you book a counselor.");
  // send handler
  window.sendChat = function(){
    const text = input.value.trim(); if(!text) return;
    bubble(box, text, 'user'); input.value='';
    setTimeout(()=> botReply(box,text), 500);
  };
  // enter key
  input && input.addEventListener('keypress', e=>{ if(e.key==='Enter'){ sendChat(); e.preventDefault(); }})
}
function bubble(box, text, cls='bot'){
  const m = mk('div','msg '+(cls==='user'?'user':'bot')); m.innerText=text; box.appendChild(m);
  box.scrollTop = box.scrollHeight;
}
function botReply(box, text){
  let reply = "Sorry, I didn't get that. Try 'screening', 'resources', or 'book counseling'.";
  text = (text||'').toLowerCase();
  if(/screen|test|phq|gad/.test(text)) reply = "I can start a quick screening for you. Click the screening button or go to Screening.";
  else if(/resource|help|tips|sleep|breath/.test(text)) reply = "Try the Resource Hub — we have guided audios and short exercises.";
  else if(/book|counsel|counsellor|appointment/.test(text)) reply = "You can book confidential counseling on the Counseling page.";
  else if(/hi|hello|hey/.test(text)) reply = "Hello! How are you feeling today?";
  bubble(box, reply, 'bot');
}

// ---------- Forum ----------
function forumInit(listId, textareaId){
  // load existing
  loadForum(listId);
  // post
  if(id('postBtn')) id('postBtn').onclick = ()=> {
    const text = id(textareaId).value.trim(); if(!text) return alert('Write something first');
    const posts = JSON.parse(localStorage.getItem('campuscare_forum')||'[]');
    const p = {id:getAnonId(), text, date:new Date().toISOString()};
    posts.unshift(p); localStorage.setItem('campuscare_forum', JSON.stringify(posts));
    id(textareaId).value = '';
    renderForumPost(p, listId, true);
  };
}
function loadForum(listId){
  const posts = JSON.parse(localStorage.getItem('campuscare_forum')||'[]');
  posts.forEach(p=> renderForumPost(p, listId));
}
function renderForumPost(p, listId, scroll=false){
  const list = id(listId);
  if(!list) return;
  const node = mk('div','post');
  node.innerHTML = `<div class="meta">Posted anonymously • ${new Date(p.date).toLocaleString()}</div>
    <div class="text">${escapeHtml(p.text)}</div>
    <div style="margin-top:8px"><button class="btn-ghost" onclick="replyTo('${p.date}')">Reply</button></div>`;
  list.prepend(node);
  if(scroll) node.scrollIntoView({behavior:'smooth'});
}
function escapeHtml(s){ return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }
function replyTo(date){ alert('Reply feature mock — moderators/counseling will follow up (demo).'); }

// ---------- Counseling booking ----------
function counselingInit(){
  placeAnon();
  if(id('bookBtn')) id('bookBtn').onclick = ()=> {
    const anon = id('anonInput').value.trim() || getAnonId();
    const date = id('dateInput').value;
    const time = id('timeInput').value;
    const mode = id('modeInput').value;
    const note = id('noteInput').value.trim();
    if(!date || !time){ alert('Pick date and time'); return; }
    const items = JSON.parse(localStorage.getItem('campuscare_bookings')||'[]');
    const book = {anon, date, time, mode, note, created:new Date().toISOString()};
    items.unshift(book); localStorage.setItem('campuscare_bookings', JSON.stringify(items));
    id('counselingResult').innerHTML = `<div style="padding:12px;border-radius:8px;background:#f1f5f9">Booking confirmed (demo) • ${date} ${time} • ${mode}</div>`;
  };
}

// ---------- Admin dashboard ----------
function adminInit(){
  // show basic stats from screenings/bookings
  const screens = JSON.parse(localStorage.getItem('campuscare_screenings')||'[]');
  const bookings = JSON.parse(localStorage.getItem('campuscare_bookings')||'[]');
  const total = screens.length;
  const mild = screens.filter(s=> s.phq<=9 && s.gad<=9).length;
  const moderate = screens.filter(s=> (s.phq>=10 && s.phq<=14) || (s.gad>=10 && s.gad<=14)).length;
  const severe = screens.filter(s=> s.phq>=15 || s.gad>=15).length;
  if(id('statTotal')) id('statTotal').innerText = total;
  if(id('statMild')) id('statMild').innerText = mild;
  if(id('statMod')) id('statMod').innerText = moderate;
  if(id('statSev')) id('statSev').innerText = severe;
  // fill bookings table
  const tbody = id('bookingsTbody');
  if(tbody && bookings.length){
    bookings.forEach(b=>{
      const tr = mk('tr');
      tr.innerHTML = `<td>${b.anon}</td><td>${b.date}</td><td>${b.time}</td><td>${b.mode}</td>`;
      tbody.appendChild(tr);
    });
  }
  // recent screenings table
  const stbody = id('screensTbody');
  if(stbody && screens.length){
    screens.slice(0,30).forEach(s=>{
      const tr = mk('tr');
      tr.innerHTML = `<td>${s.id}</td><td>${new Date(s.date).toLocaleString()}</td><td>${s.phq}</td><td>${s.gad}</td>`;
      stbody.appendChild(tr);
    });
  }
}

// ---------- On load plug ins ----------
document.addEventListener('DOMContentLoaded', ()=>{
  // place anon placeholders
  placeAnon();
});
