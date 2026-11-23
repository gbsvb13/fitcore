let msgFilter='all';
function doctorMessages(){
 const unread=unreadForDoctor();
 return `<section class="card"><div class="flex between"><div><h2 style="margin:0">환자 대화</h2><p class="tiny muted" style="margin:2px 0 0">최근 메시지를 확인하세요.</p></div>${unread?`<span class="badge">${unread}</span>`:''}</div>
 <div class="search-box">${icon('search')}<input id="msg-search" class="search" placeholder="이름 또는 진단명 검색" oninput="drawMessages()"></div>
 <div class="chips" id="msg-chips"><button class="chip" data-f="all" onclick="msgFilter='all';drawMessages()">전체</button><button class="chip" data-f="unread" onclick="msgFilter='unread';drawMessages()">안 읽음 ${unread}</button></div>
 <div id="msg-list"></div></section>`;
}
function drawMessages(){
 const t=($('#msg-search')?.value||'').trim();
 document.querySelectorAll('#msg-chips .chip').forEach(b=>b.classList.toggle('active',b.dataset.f===msgFilter));
 const rows=PATIENTS.map(p=>({p,t:thread(p.id)})).filter(({p,t:th})=>(msgFilter==='all'||th.unreadDoctor)&&(!t||p.name.includes(t)||p.diagnosis.includes(t)))
  .sort((a,b)=>new Date(b.t.msgs.at(-1)?.date||0)-new Date(a.t.msgs.at(-1)?.date||0));
 const box=$('#msg-list');if(!box)return;
 box.innerHTML=rows.map(({p,t:th})=>{const last=th.msgs.at(-1);return `<button class="conv ${th.unreadDoctor?'unread':''}" onclick="selectedPatient='${p.id}';go('doctorChat')"><div class="avatar">${esc(p.name[0])}</div><div class="grow"><div class="flex between"><b>${esc(p.name)}</b><span class="tiny muted">${last?timeLabel(last.date):''}</span></div><small class="muted">${esc(p.diagnosis)}</small><div class="flex between"><p class="tiny" style="margin:2px 0 0">${last?esc(last.text||'운동 안내를 보냈어요'):'대화 없음'}</p>${th.unreadDoctor?`<span class="badge sm">${th.unreadDoctor}</span>`:''}</div></div></button>`}).join('')||'<p class="sub">대화가 없습니다.</p>';
}
function doctorChat(){
 const p=patient(selectedPatient);msgMarkRead(p.id,'doctor');
 return `<div class="page-head chat-head"><button class="icon-back" onclick="go('doctorMessages')" aria-label="뒤로 가기">${icon('back')}</button><div class="flex"><div class="avatar">${esc(p.name[0])}</div><div><b>${esc(p.name)}</b><small class="muted">${esc(p.diagnosis)}</small></div></div><button class="smallbtn" onclick="go('doctorPatient')">환자 정보</button></div>${chatView(p.id,'doctor')}`;
}
