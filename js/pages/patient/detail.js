// 화면: 운동 상세
function discExerciseAdvice(x){const m=DISC_EXERCISE_GUIDES[x.id];
if(!m){const v=MACHINE_DISC_NOTES[x.id];return `<section class="card disc-advice"><h2>허리디스크 환자 참고사항</h2>${v?`<div class="advice-line"><b>이 운동에서 확인할 점</b><p>${esc(v.check)}</p></div><div class="advice-line"><b>증상·운동량 관련 주의</b><p>${esc(v.caution)}</p></div>`:''}<div class="advice-line"><b>근거의 범위</b><p>이 내용은 기구 동작의 일반적인 자세 점검사항과 허리디스크 환자의 개인별 운동 선택 원칙을 연결한 교육용 안내입니다. 해당 머신 운동이 허리디스크에 효과적이거나 안전하다고 개별 검증한 자료는 아닙니다.</p></div><p class="tiny">운동 중 다리로 퍼지는 통증·저림이나 근력 저하 등 증상이 새로 생기거나 심해지면 중단하고 의료진과 상의하세요.</p><a href="https://www.nice.org.uk/guidance/ng59/chapter/recommendations" target="_blank" rel="noopener noreferrer">자료: NICE NG59 · 개인별 운동 선택 원칙 ↗</a> · <a href="https://www.choosept.com/guide/physical-therapy-guide-herniated-disk" target="_blank" rel="noopener noreferrer">APTA 물리치료 안내 ↗</a></section>`;}
const ref=DISC_GUIDE_REFERENCES[m.source];return `<section class="card disc-advice"><h2>허리디스크 환자 참고사항</h2><div class="advice-line"><b>운동 목적</b><p>${esc(m.aim)}</p></div><div class="advice-line"><b>자세를 확인할 점</b><p>${esc(m.how)}</p></div><div class="advice-line"><b>근거의 범위</b><p>${esc(m.qualification)}</p></div><p class="tiny">운동 중 다리 통증·저림이 새로 생기거나 심해지면 중단하세요. 개인차가 있으므로 담당 의료진 또는 물리치료사와 상의하세요.</p><a href="${ref.url}" target="_blank" rel="noopener noreferrer">자료: ${esc(ref.label)} ↗</a></section>`;}

function exerciseHistoryCard(id){
 const all=records().filter(r=>r.exercise===id).sort((a,b)=>new Date(b.date)-new Date(a.date));
 const recent=all.slice(0,4);
 return `<section class="card"><div class="flex between"><h2 style="margin:0">이전 운동 기록</h2><span class="pill">${all.length}회</span></div>
 <p class="tiny muted">운동별 전후 통증과 증상 기록. 안전성이나 치료 효과를 판정하지 않습니다.</p>
 ${recent.length?recent.map(r=>`<div class="hist-row"><div><small class="muted">${fmt(r.date)}</small><b>${r.sets}세트 × ${r.reps}회</b></div><div><small class="muted">통증 변화</small><b class="teal">${r.before} → ${r.after}</b></div><span class="status ${r.symptoms?.includes('tingling')?'st-red':'st-green'}">${r.symptoms?.includes('tingling')?'저림 기록':'완료'}</span></div>`).join(''):'<p class="sub">아직 이 운동의 기록이 없습니다.</p>'}
 ${all.length>4?`<p class="tiny">최근 4개 기록만 표시</p>`:''}</section>`;
}

function detail(){const x=ex(selected),rx=rxOf(DEMO_PATIENT_ID,x.id),back=x.type==='gym'?'machine':'purpose';return `<div class="page-head"><button class="icon-back" onclick="go('${back}')" aria-label="뒤로 가기">${icon('back')}</button><b>운동 상세</b><span></span></div>
<div class="card optional-media-card media-card ${x.type==='gym'&&FEDB_IDS[x.id]?'machine-fedb-photo':''}"><div class="detail-cover">${x.type==='home'?`<div class="rehab-detail-placeholder" id="rehab-detail-cover"></div>`:FEDB_IDS[x.id]?`<img class="reference-photo" style="width:100%;height:240px" alt="${esc(x.name)} 운동 참고 사진" src="${photoUrl(FEDB_IDS[x.id])}" onerror="this.closest('.optional-media-card')?.remove()">`:`<div style="font-size:73px">${x.icon}</div>`}</div><p class="sub">${x.type==='home'?"":FEDB_IDS[x.id]?"Free Exercise DB 동작 사진 · 출처 표시":""}</p></div>${x.type==='gym'?motionMedia(x):''}<div id="flow-motion" aria-live="polite"></div><div id="fdb-info">${FEDB_IDS[x.id]?'':x.type==='home'?'<div id="rehab-source-info"></div>':''}</div>
<section class="title-block"><span class="pill">${esc(x.cat.split(' · ').pop())}</span><div class="flex between"><h1>${esc(x.name)}</h1>${rx?`<span class="rx-chip">${icon('check')} 처방됨</span>`:''}</div><p class="sub">${esc(x.cat)}</p></section>
<div class="info-row"><div>${icon('layers')}<small>분류</small><b>${esc(x.cat.split(' · ')[0])}</b></div><div>${icon('clipboard')}<small>권장 횟수</small><b>${rx?`${rx.reps}회 × ${rx.sets}`:'의료진 확인'}</b></div><div>${icon('calendar')}<small>주간 빈도</small><b>${rx?`주 ${rx.perWeek}회`:'–'}</b></div></div>
${rx?.note?`<div class="soft"><b>📝 의료진 주의사항</b><p class="sub">${esc(rx.note)}</p></div>`:''}
<div class="soft"><b>📋 운동 전 확인 사항</b><p class="sub">의료진에게 운동 허용 여부를 확인하고, 통증이나 저림이 증가하면 중단하세요.</p></div>
<h2>운동 방법</h2><div class="card steps">${x.steps.map((s,i)=>`<div class="step"><span class="num">${i+1}</span><p>${esc(s)}</p></div>`).join('')}</div>
${discExerciseAdvice(x)}
${exerciseHistoryCard(x.id)}
<details class="detail-extra"><summary>일반 운동 자료 및 검수 정보</summary><div class="card"><p class="sub">${esc(META[x.id]?.status||"시연용")}</p><p class="tiny">연결된 자료는 운동의 개별 안전성을 보증하지 않습니다.</p>${(META[x.id]?.sources||[]).map(k=>`<p class="sub"><a target="_blank" rel="noopener noreferrer" href="${GUIDE_SOURCES[k].url}">${esc(GUIDE_SOURCES[k].label)} ↗</a></p>`).join("")}</div></details>
<p class="tiny safety-link"><a href="#" onclick="event.preventDefault();go('discGuide')">운동 중단 기준·응급 신호 안내 →</a></p>
<div class="sticky-cta"><button class="btn" onclick="editing=null;go('record')">운동 기록하기</button></div>`}
