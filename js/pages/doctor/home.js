function doctor(){
 const today=new Date().toLocaleDateString('ko-KR',{year:'numeric',month:'long',day:'numeric',weekday:'long'});
 const alerts=PATIENTS.map(p=>({p,a:patientAlert(p)})).filter(x=>x.a);
 const avg=Math.round(PATIENTS.reduce((s,p)=>s+p.adherence,0)/PATIENTS.length);
 const todayLogs=PATIENTS.reduce((n,p)=>n+patientLogs(p).filter(x=>sameDay(x.date,new Date())).length,0);
 const reached=PATIENTS.filter(p=>p.adherence>=80).length,warn=PATIENTS.filter(p=>patientStatus(p)==='주의').length;
 const activity=PATIENTS.map(p=>({p,l:patientLogs(p)[0]})).filter(x=>x.l).sort((a,b)=>new Date(b.l.date)-new Date(a.l.date));
 return `<section class="greet"><p class="tiny muted" style="margin:0">${today}</p><h1>안녕하세요, ${DOCTOR_NAME} 의료진님</h1><p class="hero-sub">오늘도 환자들의 회복 여정을 함께해 주세요.</p></section>
 <div class="stat4">
  <div class="card mini"><span class="card-icon mint">${icon('users')}</span><div class="tiny muted">담당 환자 수</div><div class="stat">${PATIENTS.length}<span class="tiny muted"> 명</span></div><div class="tiny teal">시연용 가상 환자</div></div>
  <div class="card mini"><span class="card-icon mint">${icon('chart')}</span><div class="tiny muted">이번 주 운동 수행률</div><div class="stat">${avg}<span class="tiny muted"> %</span></div><div class="tiny teal">평균 수행률</div></div>
  <div class="card mini"><span class="card-icon orange">${icon('alert')}</span><div class="tiny muted">통증 악화 알림</div><div class="stat">${alerts.length}<span class="tiny muted"> 건</span></div><div class="tiny warn-txt">${alerts.length?'지금 확인이 필요해요':'특이사항 없음'}</div></div>
  <div class="card mini"><span class="card-icon grey">${icon('clipboard')}</span><div class="tiny muted">오늘 등록된 기록</div><div class="stat">${todayLogs}<span class="tiny muted"> 건</span></div><div class="tiny teal">미확인 메시지 ${unreadForDoctor()}건</div></div>
 </div>
 <div class="dash-grid">
 <section class="card"><div class="flex between"><div><h2 style="margin:0">주의 필요 환자</h2><p class="tiny muted" style="margin:2px 0 0">최근 통증 또는 증상 변화가 감지되었어요.</p></div><span class="status st-red">${alerts.length}명</span></div>
  ${alerts.length?alerts.map(({p,a})=>`<button class="alert-row" onclick="selectedPatient='${p.id}';go('doctorPatient')"><div class="avatar warm">${esc(p.name[0])}</div><div class="grow"><b>${esc(p.name)} <span class="status st-red">${a.tag}</span></b><p class="tiny" style="margin:2px 0">${esc(a.text)}</p><small class="muted">${timeLabel(a.date)}</small></div>${icon('chevron','muted')}</button>`).join(''):'<p class="sub">현재 주의가 필요한 환자가 없어요.</p>'}
 </section>
 <section class="card"><div class="flex between"><div><h2 style="margin:0">주간 수행 현황</h2><p class="tiny muted" style="margin:2px 0 0">전체 담당 환자 기준</p></div></div>
  <div class="week-card" style="margin-top:12px"><div class="ring" style="--p:${avg}"><b>${avg}%</b><small>평균</small></div><div class="grow legend"><div><i class="lg teal"></i>목표 달성<b>${reached}명</b></div><div><i class="lg mint"></i>진행 중<b>${PATIENTS.length-reached-warn}명</b></div><div><i class="lg red"></i>주의 필요<b>${warn}명</b></div></div></div>
 </section>
 </div>
 <section class="card"><div class="flex between"><div><h2 style="margin:0">최근 환자 활동</h2><p class="tiny muted" style="margin:2px 0 0">환자가 새로 남긴 운동 기록이에요.</p></div><button class="smallbtn" onclick="go('doctorPatients')">전체 환자 보기</button></div>
  ${activity.map(({p,l})=>{const st=patientStatus(p);return `<button class="act-row" onclick="selectedPatient='${p.id}';go('doctorPatient')"><div class="avatar sm">${esc(p.name[0])}</div><b class="grow">${esc(p.name)}<small class="muted">${esc(ex(l.exercise).name)} · ${timeLabel(l.date)}</small></b><span class="${l.after>l.before?'warn-txt':'teal'}"><b>${l.before} → ${l.after}</b></span><span class="status ${statusClass(st)}">${st}</span></button>`}).join('')}
 </section>
 <div class="notice">시연용 가상 환자 데이터입니다. 실제 의료 정보가 아닙니다. 김하늘 환자의 기록에는 이 브라우저의 환자 화면 기록이 함께 표시돼요.</div>`;
}
