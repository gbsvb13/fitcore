const ICON={
 home:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
 search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
 chart:'<path d="M4 20h16"/><path d="M7 16v-5"/><path d="M12 16V8"/><path d="M17 16v-3"/>',
 user:'<circle cx="12" cy="8" r="4.5"/><path d="M19.5 21a7.5 7.5 0 0 0-15 0"/>',
 users:'<circle cx="9" cy="8" r="4"/><path d="M16 3.5a4 4 0 0 1 0 8"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M18 14.5a6.5 6.5 0 0 1 4 6.5"/>',
 clipboard:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1"/><path d="M9 10h6"/><path d="M9 14h6"/><path d="M9 18h3"/>',
 message:'<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8"/><path d="M8 12h5"/>',
 bell:'<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
 chevron:'<path d="m9 18 6-6-6-6"/>',
 back:'<path d="m15 18-6-6 6-6"/>',
 check:'<path d="m5 12.5 4.5 4.5L19 7.5"/>',
 play:'<path d="M8 5.5v13l10.5-6.5z"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 layers:'<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
 shield:'<path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z"/><path d="m9 12 2 2 4-4"/>',
 alert:'<path d="M12 4 2.5 20h19z"/><path d="M12 10v4"/><path d="M12 17.5v.01"/>',
 logout:'<path d="M15 4h4v16h-4"/><path d="M10 8l-4 4 4 4"/><path d="M6 12h10"/>',
 edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/>',
 trash:'<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/>',
 calendar:'<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17"/><path d="M8 3v4"/><path d="M16 3v4"/>',
 plus:'<path d="M12 5v14"/><path d="M5 12h14"/>',
 minus:'<path d="M5 12h14"/>',
 paperclip:'<path d="M20 11.5 12 19.5a5 5 0 0 1-7-7l8-8a3.5 3.5 0 0 1 5 5l-8 8a2 2 0 0 1-3-3l7.5-7.5"/>',
 book:'<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>',
 refresh:'<path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4v5h-5"/>',
 trend:'<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>'
};
const icon=(name,cls='')=>`<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICON[name]||''}</svg>`;

const DEMO_PATIENT_ID='p1';
const DOCTOR_NAME='이서윤';
const CLINIC_NAME='바른척추 재활의학과';
const WEEKDAYS=['일','월','화','수','목','금','토'];

const daysAgo=(n,h=9,m=0)=>{const d=new Date();d.setDate(d.getDate()-n);d.setHours(h,m,0,0);return d.toISOString()};
const sameDay=(a,b)=>{a=new Date(a);b=new Date(b);return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate()};
const dayLabel=d=>{const x=new Date(d);return `${fmt(x)} · ${sameDay(x,new Date())?'오늘':WEEKDAYS[x.getDay()]+'요일'}`};
const timeLabel=d=>{const x=new Date(d),now=new Date();if(sameDay(x,now))return x.toLocaleTimeString('ko-KR',{hour:'numeric',minute:'2-digit'});const y=new Date();y.setDate(y.getDate()-1);if(sameDay(x,y))return '어제';return fmt(x)};
const SYMPTOM_LABEL={tingling:'다리 저림',back:'허리 불편감',none:'특이사항 없음'};
const symptomText=s=>(s&&s.length?s.map(k=>SYMPTOM_LABEL[k]||k).join(', '):'증상 미선택');
const loadJSON=(k,fallback)=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return v??fallback}catch{return fallback}};
const saveJSON=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{alert('브라우저 저장 공간에 저장하지 못했습니다.');return false}};

const PATIENTS=[
 {id:'p1',name:'김하늘',age:42,sex:'여성',no:'FC-2024-0182',diagnosis:'요추 추간판 탈출증 L4–L5',week:6,weeks:8,status:'양호',adherence:80,
  logs:[{date:daysAgo(2,19),exercise:'bridge',sets:3,reps:12,before:4,after:3,symptoms:['back'],memo:'마지막 세트에서 엉덩이가 조금 당겼어요.'},{date:daysAgo(4,18),exercise:'heel',sets:2,reps:10,before:5,after:4,symptoms:['tingling'],memo:'오른쪽 다리를 펼 때 아주 약하게 저렸어요.'},{date:daysAgo(7,9),exercise:'bird',sets:3,reps:10,before:5,after:4,symptoms:['none'],memo:''},{date:daysAgo(10,9),exercise:'bird',sets:3,reps:10,before:6,after:5,symptoms:['none'],memo:''}]},
 {id:'p2',name:'박정우',age:55,sex:'남성',no:'FC-2024-0458',diagnosis:'요추 추간판 탈출증 L5–S1',week:3,weeks:8,status:'주의',adherence:45,
  logs:[{date:daysAgo(0,8,42),exercise:'bridge',sets:3,reps:12,before:5,after:7,symptoms:['back'],memo:'브리지 후 통증이 조금 심해졌어요.'},{date:daysAgo(3,9),exercise:'bird',sets:2,reps:10,before:5,after:5,symptoms:['back'],memo:''},{date:daysAgo(6,9),exercise:'heel',sets:2,reps:10,before:6,after:5,symptoms:['none'],memo:''}]},
 {id:'p3',name:'최미영',age:61,sex:'여성',no:'FC-2024-0608',diagnosis:'요추 척추관 협착증',week:4,weeks:8,status:'관찰',adherence:60,
  logs:[{date:daysAgo(1,19,15),exercise:'heel',sets:2,reps:10,before:4,after:4,symptoms:['tingling'],memo:'왼쪽 다리 저림이 있었어요.'},{date:daysAgo(3,9),exercise:'pelvic',sets:2,reps:10,before:5,after:4,symptoms:['none'],memo:''},{date:daysAgo(5,9),exercise:'walking',sets:1,reps:20,before:5,after:4,symptoms:['none'],memo:''}]},
 {id:'p4',name:'윤지호',age:38,sex:'남성',no:'FC-2024-1008',diagnosis:'요추 염좌 및 근막통증',week:5,weeks:6,status:'양호',adherence:100,
  logs:[{date:daysAgo(1,7),exercise:'catcow',sets:2,reps:8,before:3,after:2,symptoms:['none'],memo:''},{date:daysAgo(3,7),exercise:'catcow',sets:2,reps:8,before:3,after:2,symptoms:['none'],memo:''},{date:daysAgo(5,7),exercise:'bird',sets:3,reps:10,before:4,after:3,symptoms:['none'],memo:''}]},
 {id:'p5',name:'한소연',age:47,sex:'여성',no:'FC-2024-0708',diagnosis:'요추 추간판 탈출증 L3–L4',week:2,weeks:8,status:'관찰',adherence:70,
  logs:[{date:daysAgo(2,20),exercise:'pelvic',sets:2,reps:10,before:5,after:4,symptoms:['back'],memo:''},{date:daysAgo(4,20),exercise:'bird',sets:2,reps:8,before:5,after:5,symptoms:['none'],memo:''}]}
];
const patient=id=>PATIENTS.find(p=>p.id===id)||PATIENTS[0];
function patientLogs(p){
 const logs=p.id===DEMO_PATIENT_ID?[...records(),...p.logs]:[...p.logs];
 return logs.sort((a,b)=>new Date(b.date)-new Date(a.date));
}
function patientStatus(p){
 const last=patientLogs(p)[0];
 if(p.id===DEMO_PATIENT_ID&&last&&records().some(r=>r===last||r.id===last.id)){
  if(last.after>last.before||last.symptoms?.includes('tingling'))return '주의';
 }
 return p.status;
}
const statusClass=s=>({'주의':'st-red','관찰':'st-yellow','양호':'st-green'}[s]||'');
function patientAlert(p){
 const last=patientLogs(p)[0];if(!last)return '';
 if(last.after>last.before)return {tag:'통증 증가',text:`${ex(last.exercise).name} 후 통증이 ${last.before}점에서 ${last.after}점으로 증가했어요.`,date:last.date};
 if(last.symptoms?.includes('tingling'))return {tag:'다리 저림',text:`${ex(last.exercise).name} 후 다리 저림을 기록했어요.`,date:last.date};
 return '';
}

const RX_KEY='fitcore-rx';
const RX_DEFAULT={p1:[{id:'bird',sets:3,reps:10,perWeek:5,note:'',date:daysAgo(14)},{id:'bridge',sets:3,reps:12,perWeek:5,note:'',date:daysAgo(14)},{id:'heel',sets:2,reps:10,perWeek:5,note:'다리 저림이 생기면 범위를 줄이세요.',date:daysAgo(14)}],p2:[{id:'bridge',sets:3,reps:12,perWeek:3,note:'',date:daysAgo(10)}]};
const rxLoad=()=>loadJSON(RX_KEY,RX_DEFAULT);
const rxSave=all=>saveJSON(RX_KEY,all);
const rxFor=id=>rxLoad()[id]||[];
const rxOf=(pid,exId)=>rxFor(pid).find(r=>r.id===exId);

const MSG_KEY='fitcore-messages';
const MSG_DEFAULT={
 p1:{unreadDoctor:0,unreadPatient:1,msgs:[{from:'patient',text:'선생님, 오늘 버드독을 할 때 오른쪽 다리가 조금 저렸어요.',date:daysAgo(1,9,18)},{from:'doctor',text:'알려주셔서 감사해요. 오늘은 다리를 높이 들지 말고 통증 없는 범위까지만 진행해 주세요.',date:daysAgo(1,9,32)},{from:'patient',text:'네, 낮게 들었더니 괜찮았어요. 운동 후 통증은 3점이었습니다.',date:daysAgo(1,10,5)},{from:'doctor',text:'버드독 동작이 많이 안정되었어요. 허리가 꺾이지 않도록 복부 힘만 잘 유지해 주세요.',date:daysAgo(1,10,20),ex:'bird'}]},
 p2:{unreadDoctor:2,unreadPatient:0,msgs:[{from:'patient',text:'오늘 브리지를 했어요.',date:daysAgo(0,9,30)},{from:'patient',text:'브리지 후 통증이 조금 심해졌어요.',date:daysAgo(0,9,42)}]},
 p3:{unreadDoctor:1,unreadPatient:0,msgs:[{from:'patient',text:'오늘 운동 기록을 완료했어요.',date:daysAgo(1,19,20)}]},
 p4:{unreadDoctor:0,unreadPatient:0,msgs:[{from:'doctor',text:'캣카우는 허리가 편한 범위에서만 진행해 주세요.',date:daysAgo(2,15)},{from:'patient',text:'알려주신 자세로 다시 해볼게요.',date:daysAgo(2,18)}]},
 p5:{unreadDoctor:0,unreadPatient:0,msgs:[{from:'patient',text:'다음 상담 시간을 확인하고 싶어요.',date:daysAgo(3,20)}]}
};
const msgLoad=()=>loadJSON(MSG_KEY,MSG_DEFAULT);
const msgSave=all=>saveJSON(MSG_KEY,all);
const thread=pid=>msgLoad()[pid]||{unreadDoctor:0,unreadPatient:0,msgs:[]};
function msgSend(pid,from,text,exId){
 const all=msgLoad(),t=all[pid]||{unreadDoctor:0,unreadPatient:0,msgs:[]};
 t.msgs.push({from,text,date:stamp(),...(exId?{ex:exId}:{})});
 if(from==='patient')t.unreadDoctor=(t.unreadDoctor||0)+1;else t.unreadPatient=(t.unreadPatient||0)+1;
 all[pid]=t;return msgSave(all);
}
function msgMarkRead(pid,who){const all=msgLoad();if(!all[pid])return;if(who==='doctor')all[pid].unreadDoctor=0;else all[pid].unreadPatient=0;msgSave(all)}
const unreadForDoctor=()=>PATIENTS.reduce((n,p)=>n+(thread(p.id).unreadDoctor||0),0);

function chatView(pid,me){
 const t=thread(pid),p=patient(pid);
 const bubbles=t.msgs.map(m=>{
  const mine=m.from===me,who=m.from==='doctor'?DOCTOR_NAME[0]:p.name[0];
  const card=m.ex?`<button class="chat-ex" onclick="go('detail','${m.ex}')"><div class="art">${photoOrIcon(ex(m.ex))}</div><div class="grow"><small>운동 안내</small><b>${esc(ex(m.ex).name)}</b><span class="tiny muted">${esc(ex(m.ex).cat)}</span></div>${icon('chevron')}</button>`:'';
  return `<div class="msg ${mine?'mine':''}">${mine?'':`<div class="avatar sm">${esc(who)}</div>`}<div class="msg-body">${m.text?`<div class="bubble">${esc(m.text)}</div>`:''}${card}<span class="tiny muted">${timeLabel(m.date)}</span></div></div>`;
 }).join('');
 const exOptions=EX.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join('');
 return `<div class="chat-wrap"><div class="chat-list" id="chat-list">${bubbles||'<p class="sub" style="text-align:center">아직 대화가 없어요. 첫 메시지를 보내 보세요.</p>'}</div>
 <div class="composer"><div class="grow"><textarea id="chat-text" rows="2" maxlength="300" placeholder="${me==='doctor'?'환자에게':'의료진에게'} 메시지를 입력하세요."></textarea>${me==='doctor'?`<label class="attach">${icon('paperclip')}<select id="chat-ex"><option value="">운동 첨부</option>${exOptions}</select></label>`:''}</div><button class="btn send" onclick="chatSend('${pid}','${me}')">보내기</button></div></div>`;
}
function chatSend(pid,me){
 const text=($('#chat-text')?.value||'').trim(),exId=$('#chat-ex')?.value||'';
 if(!text&&!exId)return;
 if(msgSend(pid,me,text,exId))render();
}
function scrollChat(){const l=$('#chat-list');if(l)l.lastElementChild?.scrollIntoView({block:'end'})}

function confirmModal(title,text,okLabel,onOk){
 closeModal();
 const m=document.createElement('div');m.className='modal-bg';m.id='modal';
 m.innerHTML=`<div class="modal" role="dialog" aria-modal="true"><div class="modal-icon">${icon('logout')}</div><h3>${esc(title)}</h3><p class="sub">${esc(text)}</p><div class="modal-actions"><button class="btn alt" id="modal-cancel">취소</button><button class="btn" id="modal-ok">${esc(okLabel)}</button></div></div>`;
 document.body.appendChild(m);
 m.querySelector('#modal-cancel').onclick=closeModal;
 m.onclick=e=>{if(e.target===m)closeModal()};
 m.querySelector('#modal-ok').onclick=()=>{closeModal();onOk()};
}
function closeModal(){document.getElementById('modal')?.remove()}

function stepper(id,value,min,max,unit){
 return `<div class="stepper"><button type="button" onclick="stepBy('${id}',-1,${min},${max})" aria-label="줄이기">${icon('minus')}</button><span><input id="${id}" type="number" min="${min}" max="${max}" value="${value}" inputmode="numeric"><small>${unit}</small></span><button type="button" onclick="stepBy('${id}',1,${min},${max})" aria-label="늘리기">${icon('plus')}</button></div>`;
}
function stepBy(id,d,min,max){const el=$('#'+id);if(!el)return;const v=Math.min(max,Math.max(min,(parseInt(el.value,10)||0)+d));el.value=v;el.dispatchEvent(new Event('input'))}

const NAV_GROUP={home:'home',plan:'home',discGuide:'home',purpose:'purpose',gym:'purpose',machine:'purpose',detail:'purpose',record:'purpose',success:'purpose',history:'history',me:'me',chat:'me',
 doctor:'doctor',doctorPatients:'doctorPatients',doctorPatient:'doctorPatients',doctorPrescribe:'doctorPrescribe',doctorMessages:'doctorMessages',doctorChat:'doctorMessages',doctorMe:'doctorMe'};
const PAGE_TITLE={purpose:'운동 찾기',gym:'운동 찾기',machine:'운동 찾기',detail:'운동 상세',record:'운동 피드백',success:'기록 완료',history:'내 기록',me:'내 정보',chat:'메시지',plan:'재활 계획',discGuide:'운동 안내',
 doctor:'대시보드',doctorPatients:'환자 목록',doctorPatient:'환자 상세',doctorPrescribe:'운동 처방',doctorMessages:'메시지',doctorChat:'메시지',doctorMe:'내 정보'};
const FOCUS_PAGES=['detail','record','chat','doctorChat'];
const HEAD_PAGES=[...FOCUS_PAGES,'doctorPatient','doctorPrescribe'];
function afterRender(){
 document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('on',b.dataset.go===(NAV_GROUP[current]||current)));
 const t=document.getElementById('page-title');if(t)t.textContent=PAGE_TITLE[current]||'';
 document.body.classList.toggle('focus-mode',FOCUS_PAGES.includes(current));
 document.body.classList.toggle('has-head',HEAD_PAGES.includes(current));
 const badge=document.getElementById('doc-msg-badge');if(badge){const n=unreadForDoctor();badge.textContent=n;badge.hidden=!n}
 const pbadge=document.getElementById('pt-msg-dot');if(pbadge)pbadge.hidden=!(thread(DEMO_PATIENT_ID).unreadPatient>0);
 if(current==='chat'||current==='doctorChat')scrollChat();
 if(current==='purpose'&&typeof drawPurpose==='function')drawPurpose();
 if(current==='doctorPatients')filterPatients();
 if(current==='doctorMessages')drawMessages();
}
