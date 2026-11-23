// 화면: 내 정보 + 의료진과 메시지
let notifyOpen=false;
const NOTIFY_KEY='fitcore-notify-patient';
function me(){
 const p=patient(DEMO_PATIENT_ID),n=loadJSON(NOTIFY_KEY,{remind:true,doctor:true});
 const next=new Date();next.setDate(next.getDate()+((4-next.getDay()+7)%7||7));
 const nextTxt=next.toLocaleDateString('ko-KR',{month:'long',day:'numeric',weekday:'long'})+', 오전 10:30';
 return `<section class="card profile"><div class="avatar big">${esc(p.name[0])}</div><div class="grow"><h2 style="margin:0">${esc(p.name)}님</h2><p class="sub" style="margin:2px 0 6px">환자 번호 ${p.no}</p><span class="pill">재활 프로그램 ${p.week}주차</span></div></section>
 <section class="card"><p class="eyebrow">나의 담당 의료진</p><div class="flex between"><div class="flex"><div class="avatar">${DOCTOR_NAME[0]}</div><div><b>${DOCTOR_NAME} 의료진</b><p class="tiny muted" style="margin:0">${CLINIC_NAME}</p></div></div><button class="icon-btn mint" onclick="go('chat')" aria-label="메시지">${icon('message')}<span class="dot" id="pt-msg-dot" hidden></span></button></div><hr><div class="flex between tiny"><span class="muted">다음 상담일</span><b>${nextTxt}</b></div></section>
 <section class="card menu">
  <button onclick="go('plan')">${icon('clipboard')}<span class="grow">나의 재활 계획</span>${icon('chevron','muted')}</button>
  <button onclick="go('discGuide')">${icon('book')}<span class="grow">허리디스크 운동 안내</span>${icon('chevron','muted')}</button>
  <button onclick="notifyOpen=!notifyOpen;render()">${icon('bell')}<span class="grow">알림 설정</span>${icon('chevron','muted '+(notifyOpen?'rot':''))}</button>
  ${notifyOpen?`<div class="sub-menu"><label class="toggle-row"><span>운동 알림</span><input type="checkbox" ${n.remind?'checked':''} onchange="setNotify('remind',this.checked)"></label><label class="toggle-row"><span>의료진 메시지 알림</span><input type="checkbox" ${n.doctor?'checked':''} onchange="setNotify('doctor',this.checked)"></label><p class="tiny muted">시연용 설정입니다. 실제 알림은 보내지 않아요.</p></div>`:''}
  <button onclick="resetDemo()">${icon('refresh')}<span class="grow">시연 기록 초기화</span>${icon('chevron','muted')}</button>
 </section>
 <button class="text-btn" onclick="logout()">${icon('logout')} 로그아웃</button>`;
}
function setNotify(k,v){const n=loadJSON(NOTIFY_KEY,{remind:true,doctor:true});n[k]=v;saveJSON(NOTIFY_KEY,n)}

function chat(){
 msgMarkRead(DEMO_PATIENT_ID,'patient');
 return `<div class="page-head chat-head"><button class="icon-back" onclick="go('me')" aria-label="뒤로 가기">${icon('back')}</button><div class="flex"><div class="avatar">${DOCTOR_NAME[0]}</div><div><b>${DOCTOR_NAME} 의료진</b><small class="muted">${CLINIC_NAME}</small></div></div><span></span></div>${chatView(DEMO_PATIENT_ID,'patient')}`;
}

const PATIENT_EXTRA_VIEWS={me,chat};
