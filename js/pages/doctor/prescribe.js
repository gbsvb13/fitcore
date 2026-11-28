let rxDraft={ids:[],filter:'all'};
function doctorPrescribe(){
 const p=patient(selectedPatient);
 if(!rxDraft.pid||rxDraft.pid!==p.id){const cur=rxFor(p.id);rxDraft={pid:p.id,ids:cur.map(r=>r.id),filter:'all',sets:cur[0]?.sets||3,reps:cur[0]?.reps||10,week:cur[0]?.perWeek||5,note:''}}
 const cats=[['all','전체'],...PURPOSES.map(g=>[g.id,g.short]),['gym','머신']];
 return `<div class="page-head"><button class="icon-back" onclick="go('doctorPatient')" aria-label="환자 상세">${icon('back')}</button><b>운동 처방</b><span></span></div>
 <section class="card form-step"><h3><span class="num">1</span>환자 선택</h3><p class="sub">운동을 처방할 환자를 선택해 주세요.</p><label class="pick-patient"><div class="avatar">${esc(p.name[0])}</div><div class="grow"><b>${esc(p.name)}</b><small class="muted">${esc(p.diagnosis)} · 재활 ${p.week}주차</small></div>${icon('chevron','muted')}<select id="rx-patient" onchange="selectedPatient=this.value;render()">${PATIENTS.map(x=>`<option value="${x.id}" ${x.id===p.id?'selected':''}>${esc(x.name)} · ${esc(x.diagnosis)}</option>`).join('')}</select></label></section>
 <section class="card form-step"><h3><span class="num">2</span>운동 선택</h3><p class="sub">운동 라이브러리에서 처방할 운동을 선택하세요.</p>
  <div class="chips scroll">${cats.map(([k,l])=>`<button class="chip ${rxDraft.filter===k?'active':''}" onclick="rxDraft.filter='${k}';render()">${l}</button>`).join('')}</div>
  <div class="ex-grid">${EX.filter(x=>rxDraft.filter==='all'||(rxDraft.filter==='gym'?x.type==='gym':(PURPOSES.find(g=>g.id===rxDraft.filter)?.ids||[]).includes(x.id))).map(x=>{const on=rxDraft.ids.includes(x.id);return `<button class="ex-tile ${on?'on':''}" onclick="rxToggle('${x.id}')"><div class="art">${photoOrIcon(x)}<span class="tick">${icon(on?'check':'plus')}</span></div><small class="teal">${esc(x.cat.split(' · ').pop())}</small><b>${esc(x.name.replace(/ \(.*\)/,''))}</b><small class="muted">${x.type==='home'?'맨몸':'머신'}</small></button>`}).join('')}</div>
 </section>
 <section class="card form-step"><h3><span class="num">3</span>운동량과 주의사항 설정</h3><p class="sub">선택한 운동에 적용할 기본 계획이에요.</p>
  <div class="fields"><div class="field"><label>세트 수</label>${stepper('rx-sets',rxDraft.sets,1,10,'세트')}</div><div class="field"><label>반복 횟수</label>${stepper('rx-reps',rxDraft.reps,1,50,'회')}</div></div>
  <div class="field"><label>주간 빈도</label>${stepper('rx-week',rxDraft.week,1,7,'회')}</div>
  <div class="field"><label for="rx-note">환자 맞춤 주의사항 <span class="muted">선택</span></label><textarea id="rx-note" rows="3" maxlength="200" placeholder="예: 다리 저림이 생기면 중단하세요" oninput="rxDraft.note=this.value">${esc(rxDraft.note)}</textarea></div>
 </section>
 <div class="notice">시연용 처방 화면입니다. 처방은 이 브라우저에 저장되며 환자 화면에 바로 반영돼요.</div>
 <div class="rx-bar"><div class="grow"><b>선택한 운동 ${rxDraft.ids.length}개</b><small class="muted" id="rx-summary">${rxDraft.sets}세트 × ${rxDraft.reps}회 · 주 ${rxDraft.week}회</small></div><button class="btn" onclick="rxSaveDraft()" ${rxDraft.ids.length?'':'disabled'}>${icon('check')} 처방 저장</button></div>`;
}
function rxToggle(id){
 rxSyncInputs();
 rxDraft.ids=rxDraft.ids.includes(id)?rxDraft.ids.filter(x=>x!==id):[...rxDraft.ids,id];render();
}
function rxSyncInputs(){const n=id=>Number($('#'+id)?.value);if($('#rx-sets')){rxDraft.sets=n('rx-sets');rxDraft.reps=n('rx-reps');rxDraft.week=n('rx-week')}}
function rxSaveDraft(){
 rxSyncInputs();
 const {sets,reps,week}=rxDraft;
 if(![[sets,1,10],[reps,1,50],[week,1,7]].every(([n,min,max])=>Number.isInteger(n)&&n>=min&&n<=max)){alert('세트는 1~10, 횟수는 1~50, 주간 빈도는 1~7 사이의 정수로 입력해 주세요.');return}
 const all=rxLoad(),old=all[selectedPatient]||[];
 all[selectedPatient]=rxDraft.ids.map(id=>{const prev=old.find(r=>r.id===id);return {id,sets,reps,perWeek:week,note:rxDraft.note.trim()||prev?.note||'',date:stamp()}});
 if(rxSave(all)){rxDraft={ids:[],filter:'all'};go('doctorPatient')}
}
document.addEventListener('input',e=>{if(['rx-sets','rx-reps','rx-week'].includes(e.target.id)){rxSyncInputs();const s=$('#rx-summary');if(s)s.textContent=`${rxDraft.sets}세트 × ${rxDraft.reps}회 · 주 ${rxDraft.week}회`}});
