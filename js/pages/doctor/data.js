let selectedPatient='p1';
let patientFilter='all';

function patientCard(p){
 const logs=patientLogs(p),last=logs[0],st=patientStatus(p);
 return `<button class="card pt-card" onclick="selectedPatient='${p.id}';go('doctorPatient')">
  <div class="flex between"><div class="flex"><div class="avatar">${esc(p.name[0])}</div><div><b>${esc(p.name)}</b><small class="muted">${p.age}세 · ${p.no}</small></div></div><span class="status ${statusClass(st)}">${st}</span></div>
  <p class="sub">${esc(p.diagnosis)}</p>
  <div class="pt-stats"><div><small class="muted">최근 운동</small><b>${last?timeLabel(last.date).replace(/^(오전|오후).*/,'오늘'):'–'}</b></div><div><small class="muted">주간 수행률</small><b>${p.adherence}%</b></div><div><small class="muted">최근 통증</small><b class="${last&&last.after>last.before?'warn-txt':''}">${last?last.after:'–'} / 10</b></div></div>
  <div class="progress"><i style="width:${p.adherence}%"></i></div>
 </button>`;
}
function weekDots(logs){
 const monday=weekStart();
 return [0,1,2,3,4,5,6].map(i=>{const d=new Date(monday);d.setDate(d.getDate()+i);const done=logs.some(x=>sameDay(x.date,d));const today=sameDay(d,new Date());const future=d>new Date()&&!today;return `<div class="wd"><small>${WEEKDAYS[d.getDay()]}</small><span class="day ${done?'done':''} ${today?'today':''}">${done?icon('check'):d.getDate()}</span><small class="muted">${done?'완료':today?'오늘':future?'-':'미완료'}</small></div>`}).join('');
}
