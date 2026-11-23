// 화면: 홈
function home(){
 const p=planLoad(),r=records(),start=weekStart(),me=patient(DEMO_PATIENT_ID);
 const rx=rxFor(DEMO_PATIENT_ID);
 const doneToday=id=>r.some(x=>x.exercise===id&&sameDay(x.date,new Date()));
 const doneCount=rx.filter(x=>doneToday(x.id)).length;
 const next=rx.find(x=>!doneToday(x.id))||rx[0];
 const weekRecs=r.filter(x=>new Date(x.date)>=start);
 const goal=rx.length?Math.max(...rx.map(x=>x.perWeek)):p.goal;
 const days=new Set(weekRecs.map(x=>new Date(x.date).toDateString())).size;
 const pct=Math.min(100,Math.round(days/goal*100));
 const last=r[0],prev=r[1];
 let streak=0;for(let i=0;i<60;i++){const d=new Date();d.setDate(d.getDate()-i);if(r.some(x=>sameDay(x.date,d)))streak++;else if(i>0)break}
 const hour=new Date().getHours();
 const hello=hour<12?'좋은 아침이에요,':hour<18?'좋은 오후예요,':'좋은 저녁이에요,';
 const msg=!r.length?'첫 운동을 기록해 보세요.':days>=goal?'이번 주 목표를 달성했어요! 🎉':`목표까지 ${goal-days}회 남았어요.`;
 const monday=new Date(start);
 const dots=[0,1,2,3,4,5,6].map(i=>{const d=new Date(monday);d.setDate(d.getDate()+i);const done=r.some(x=>sameDay(x.date,d));const today=sameDay(d,new Date());return `<span class="day ${done?'done':''} ${today?'today':''}">${done?icon('check'):WEEKDAYS[d.getDay()]}</span>`}).join('');
 const lastDoc=[...thread(DEMO_PATIENT_ID).msgs].reverse().find(m=>m.from==='doctor');
 return `<section class="greet"><p class="hero-hi">${hello}</p><h1>${esc(me.name)}님</h1><p class="hero-sub">오늘도 천천히 시작해요.</p></section>

 <section class="card today">
  <div class="flex between"><div><p class="eyebrow">오늘의 운동</p><h2 style="margin:2px 0 6px">의료진 처방 운동</h2></div>${rx.length?`<span class="count-pill">${doneCount} / ${rx.length} 완료</span>`:''}</div>
  ${rx.length?rx.map(x=>{const e=ex(x.id),d=doneToday(x.id);return `<button class="rx-row ${d?'done':''}" onclick="go('detail','${x.id}')"><span class="round-check">${d?icon('check'):''}</span><span class="grow"><b>${esc(e.name.replace(/ \(.*\)/,''))}</b><small>${x.reps}회 × ${x.sets}세트 · ${esc(e.cat.split(' · ').pop())}</small></span>${icon('chevron','muted')}</button>`}).join(''):'<p class="sub">아직 처방받은 운동이 없어요. 담당 의료진이 운동을 처방하면 여기에 표시돼요.</p>'}
  ${rx.length?`<button class="btn" onclick="go('detail','${next.id}')">${icon('play')} 오늘 운동 시작하기</button>`:`<button class="btn" onclick="go('purpose')">운동 찾아보기</button>`}
 </section>

 <section class="card week-card" onclick="go('plan')" style="cursor:pointer"><div class="ring" style="--p:${pct}"><b>${pct}%</b><small>달성</small></div><div class="grow"><p class="eyebrow">이번 주 운동</p><h3>${days}/${goal}회 완료했어요</h3><p class="sub">${msg}</p><div class="days">${dots}</div></div></section>

 <div class="statrow">
  <div class="card mini"><span class="card-icon orange">${icon('chart')}</span><div class="tiny muted">최근 통증 점수</div><div class="stat">${last?last.after:'–'}<span class="tiny muted"> / 10</span></div><div class="tiny ${last&&prev&&last.after<prev.after?'good':'muted'}">${last?(prev?(last.after<prev.after?`${prev.after-last.after} 감소`:last.after>prev.after?`${last.after-prev.after} 증가`:'변화 없음')+' · ':'')+fmt(last.date):'기록 없음'}</div></div>
  <div class="card mini"><span class="card-icon mint">${icon('calendar')}</span><div class="tiny muted">연속 운동</div><div class="stat">${streak}<span class="tiny muted"> 일째</span></div><div class="tiny muted">이번 주 목표 ${pct}%</div></div>
 </div>

 ${lastDoc?`<section class="card doc-msg" onclick="go('chat')" style="cursor:pointer"><div class="flex between"><div class="flex"><div class="avatar">${DOCTOR_NAME[0]}</div><b>${DOCTOR_NAME} 의료진</b></div><span class="tiny muted">${timeLabel(lastDoc.date)}</span></div><p>${esc(lastDoc.text)}</p><span class="link">메시지 자세히 보기 ›</span></section>`:''}

 <div class="card"><b>허리디스크 환자용 운동 안내</b><p class="sub">운동 전 확인사항, 증상 악화 시 중단 기준, 응급 신호를 확인해 주세요.</p><button class="btn alt" onclick="go('discGuide')">허리디스크 운동 안내 읽기 →</button></div>
 <div class="card"><b>나의 재활운동 계획</b><p class="sub">직접 선택한 운동의 이번 주 기록을 한곳에서 확인하실 수 있습니다.</p><button class="btn alt" onclick="go('plan')">나의 재활운동 계획 관리 →</button></div>

 <section class="safety"><span>${icon('shield')}</span><div><b>안전하게 운동하세요</b><p>운동 중 통증·저림이 심해지면 중단하고 의료진과 상의하세요.</p></div></section>
 <div class="notice">교육용 시연 서비스 · 의학적 검수 미완료 · 기록은 브라우저에만 저장됩니다.</div>`;
}
