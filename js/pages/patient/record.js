// Cycle 3 개선: 통증 직접 선택, 증상 악화 시 안전 안내, 부위/동작 기록, 걷기 시간 입력.
const PAIN_RANGE = Array.from({length: 11}, (_, i) => i);
const SYMPTOM_LOCATIONS = [
  ['', '선택해 주세요'], ['lower_back','허리'], ['buttock','엉덩이'],
  ['left_leg','왼쪽 다리'], ['right_leg','오른쪽 다리'], ['both_legs','양쪽 다리'], ['other','기타']
];
const TRIGGER_ACTIONS = [
  ['', '선택해 주세요'], ['start','시작 자세에서'], ['moving','동작을 수행하는 중'],
  ['holding','자세를 유지하는 중'], ['finish','동작을 마무리할 때'], ['after','운동을 끝낸 뒤'], ['other','기타']
];
const LOCATION_NAMES=Object.fromEntries(SYMPTOM_LOCATIONS);
const ACTION_NAMES=Object.fromEntries(TRIGGER_ACTIONS);
const needsSafetyNotice=r=>Boolean(r)&&(r.after>r.before || r.symptoms?.includes('tingling') || r.stoppedEarly);

function record(){
  const prev=editing?records().find(r=>r.id===editing):null;
  const x=ex(prev?.exercise||selected);
  const isWalking=x.id==='walking';
  const before=Number.isInteger(prev?.before)?prev.before:null;
  const after=Number.isInteger(prev?.after)?prev.after:null;
  const chip=([k,label])=>`<label class="sym-chip"><input type="checkbox" id="${k}" ${prev?.symptoms?.includes(k)?'checked':''} onchange="symptomPick('${k}')"><span>${label}</span></label>`;
  const painPicker=(id,label,v,cls)=>`<div class="pain"><div class="flex between"><b>${label}</b><span class="pain-val ${cls}" id="${id}-val">${v===null?'미선택':`<b>${v}</b> / 10`}</span></div><input type="hidden" id="${id}" value="${v??''}"><div class="nrs-options" role="group" aria-label="${label} 통증 점수">${PAIN_RANGE.map(n=>`<button type="button" class="nrs-option ${v===n?'on':''}" aria-pressed="${v===n}" onclick="pickPain('${id}',${n},this)">${n}</button>`).join('')}</div><div class="range-labels"><span>0: 통증 없음</span><span>10: 가장 심한 통증</span></div></div>`;
  const selectField=(id,label,options,value)=>`<div class="field"><label for="${id}">${label}</label><select id="${id}">${options.map(([k,v])=>`<option value="${k}" ${k===value?'selected':''}>${v}</option>`).join('')}</select></div>`;
  return `<div class="page-head"><button class="icon-back" onclick="go('detail')" aria-label="뒤로 가기">${icon('back')}</button><b>${prev?'운동 기록 수정':'오늘의 운동 피드백'}</b><span></span></div>
<section class="card ex-summary"><div class="art">${photoOrIcon(x)}</div><div class="grow"><small class="eyebrow">오늘의 운동</small><b>${esc(x.name)}</b><small class="muted">${esc(x.cat)}</small></div></section>
<section class="card form-step"><h3><span class="num">1</span>운동 수행 정보를 알려주세요</h3>${isWalking?
  `<p class="sub">걷기는 실제 걸은 시간을 분 단위로 기록합니다.</p><div class="field"><label for="duration-minutes">걷기 시간 (분)</label><input id="duration-minutes" type="number" min="1" max="600" step="1" inputmode="numeric" value="${Number.isInteger(prev?.durationMinutes)?prev.durationMinutes:''}" placeholder="예: 20"></div>`:
  `<p class="sub">실제로 진행한 세트와 반복 횟수를 입력해 주세요.</p><div class="fields"><div class="field"><label for="sets">세트</label>${stepper('sets',prev?.sets??3,1,100,'세트')}</div><div class="field"><label for="reps">반복 횟수</label>${stepper('reps',prev?.reps??10,1,1000,'회')}</div></div>`}
 <label class="stop-check"><input type="checkbox" id="stopped-early" ${prev?.stoppedEarly?'checked':''}><span>불편감이나 증상 때문에 운동을 중단했어요.</span></label></section>
<section class="card form-step"><h3><span class="num">2</span>운동 전후 통증을 선택해 주세요</h3><p class="sub">0은 통증 없음, 10은 상상할 수 있는 가장 심한 통증입니다(NRS). 두 점수를 모두 직접 선택해야 저장할 수 있습니다.</p>${painPicker('before','운동 전',before,'orange')}${painPicker('after','운동 후',after,'teal')}<p class="tiny muted">통증 수치는 자기보고 정보이며 의학적 진단이나 회복률을 의미하지 않습니다.</p></section>
<section class="card form-step"><h3><span class="num">3</span>느낀 증상이 있나요?</h3><p class="sub">해당하는 항목을 모두 선택해 주세요.</p><div class="chips">${[['tingling','다리 저림'],['back','허리 불편감'],['none','특이사항 없음']].map(chip).join('')}</div>
<div class="fields">${selectField('symptom-location','증상이 나타난 부위',SYMPTOM_LOCATIONS,prev?.symptomLocation||'')}${selectField('trigger-action','증상이 나타난 동작',TRIGGER_ACTIONS,prev?.triggerAction||'')}</div><p class="tiny muted">해당하는 정보가 있을 때 선택해 주세요. 더 자세한 내용은 아래 메모에 적을 수 있습니다.</p></section>
<section class="card form-step"><div class="field" style="margin:0"><label for="memo">의료진에게 남길 메모 <span class="muted">선택</span></label><textarea id="memo" rows="3" maxlength="200" placeholder="예: 오른쪽 다리를 뻗을 때 저림이 있었어요.">${esc(prev?.memo||'')}</textarea><p class="tiny muted" style="text-align:right">최대 200자</p></div></section>
<div id="form-error" class="tiny" style="color:#b33" role="alert" aria-live="polite"></div>
<div class="sticky-cta"><button class="btn" onclick="submitRecord()">${prev?'수정 내용 저장':'운동 기록 저장하기'}</button></div>`;
}

function pickPain(id,point,button){
  const input=$('#'+id);if(!input||!Number.isInteger(point)||point<0||point>10)return;
  input.value=String(point);
  $('#'+id+'-val').innerHTML=`<b>${point}</b> / 10`;
  button.parentElement.querySelectorAll('button').forEach(x=>{const selected=x===button;x.classList.toggle('on',selected);x.setAttribute('aria-pressed',String(selected))});
  const error=$('#form-error');if(error)error.textContent='';
}
function symptomPick(k){const none=$('#none');if(k==='none'&&none.checked){$('#tingling').checked=false;$('#back').checked=false}else if(k!=='none'&&$('#'+k).checked){none.checked=false}}

function submitRecord(){
  const id=(editing?records().find(r=>r.id===editing)?.exercise:selected)||selected;
  const isWalking=id==='walking';
  const val=key=>$('#'+key)?.value?.trim()??'';
  const before=Number(val('before')),after=Number(val('after'));
  if(!val('before')||!val('after')||![before,after].every(Number.isInteger)||before<0||before>10||after<0||after>10){
    $('#form-error').textContent='운동 전·후 통증 점수를 0~10 중에서 각각 직접 선택해 주세요.';return;
  }
  let sets=1,reps=1,durationMinutes=null;
  if(isWalking){
    durationMinutes=Number(val('duration-minutes'));
    if(!val('duration-minutes')||!Number.isInteger(durationMinutes)||durationMinutes<1||durationMinutes>600){$('#form-error').textContent='걷기 시간을 1~600분 사이의 정수로 입력해 주세요.';return;}
  }else{
    sets=Number(val('sets'));reps=Number(val('reps'));
    if(!val('sets')||!val('reps')||![sets,reps].every(Number.isInteger)||sets<1||sets>100||reps<1||reps>1000){$('#form-error').textContent='세트는 1~100, 반복 횟수는 1~1000 사이의 정수로 입력해 주세요.';return;}
  }
  let symptoms=['tingling','back','none'].filter(x=>$('#'+x)?.checked);
  if(symptoms.includes('none'))symptoms=['none'];
  const symptomLocation=val('symptom-location'),triggerAction=val('trigger-action');
  if(!SYMPTOM_LOCATIONS.some(([k])=>k===symptomLocation)||!TRIGGER_ACTIONS.some(([k])=>k===triggerAction)){$('#form-error').textContent='증상 부위 또는 발생 동작을 다시 선택해 주세요.';return;}
  const stoppedEarly=Boolean($('#stopped-early')?.checked);
  const r=records(),old=editing?r.find(x=>x.id===editing):null;
  const obj={id:old?.id||String(Date.now()),date:old?.date||stamp(),updatedAt:stamp(),exercise:old?.exercise||selected,
    sets,reps,durationMinutes,before,after,symptoms,symptomLocation,triggerAction,stoppedEarly,memo:val('memo')};
  if(old)r.splice(r.indexOf(old),1,obj);else r.unshift(obj);
  try{saveRecords(r);lastId=obj.id;editing=null;go('success')}catch(e){$('#form-error').textContent='저장하지 못했습니다. 저장 공간을 확인하고 다시 시도해 주세요. 입력값은 유지됩니다.'}
}

function success(){
  const allRecords=records(),saved=allRecords.find(r=>r.id===lastId),record=saved||allRecords[0];
  const today=new Date(),prescribed=rxFor(DEMO_PATIENT_ID);
  const completedToday=new Set(allRecords.filter(r=>sameDay(r.date,today)&&!r.stoppedEarly).map(r=>r.exercise));
  const isTodayPrescription=saved&&sameDay(saved.date,today)&&prescribed.some(item=>item.id===saved.exercise);
  const unsafe=needsSafetyNotice(record);
  let workoutStatus='';
  // 증상이 악화됐거나 운동을 중단했다면 다음 운동을 권하지 않습니다.
  if(isTodayPrescription&&!unsafe){
    const doneCount=prescribed.filter(item=>completedToday.has(item.id)).length;
    const next=prescribed.find(item=>!completedToday.has(item.id));
    workoutStatus=`<section class="card summary"><div class="flex between"><b>${next?'오늘의 운동 진행':'오늘의 운동 기록 완료'}</b><span class="count-pill">${doneCount} / ${prescribed.length} 완료</span></div>${next?`<button class="btn" onclick="go('detail','${esc(next.id)}')">다음 운동 · ${esc(ex(next.id).name.replace(/ \(.*\)$/, ''))}</button>`:''}</section>`;
  }
  const location=record?.symptomLocation?LOCATION_NAMES[record.symptomLocation]||'기타':'';
  const action=record?.triggerAction?ACTION_NAMES[record.triggerAction]||'기타':'';
  return `<div class="success"><div class="check">${icon('check')}</div><h1>운동 기록을 저장했어요</h1><p>운동 기록이 브라우저에 저장되었습니다. 클라우드 동기화는 별도로 진행됩니다.</p></div>
    ${unsafe?`<section class="card safety-feedback" role="status"><b>${icon('alert')} 증상 기록을 확인해 주세요</b><p>운동 후 통증 변화 또는 저림, 운동 중단이 기록되었습니다. 지금은 다음 운동을 안내하지 않습니다.</p><p class="recorded-symptoms">통증 ${record.before} → ${record.after} / 10 · ${esc(symptomText(record.symptoms))}${record.stoppedEarly?' · 운동 중단':''}</p><p class="tiny">새로 생기거나 악화되는 통증·저림이 있다면 운동을 중단하고 담당 의료진에게 상담하세요. 이 안내는 개인별 의학적 판단이 아닙니다.</p><button class="btn alt" onclick="go('discGuide')">운동 중단 기준 및 응급 신호 확인</button></section>`:''}
    ${workoutStatus}
    ${record?`<section class="card summary"><b>운동 기록 요약</b><div class="flex between"><span>${esc(ex(record.exercise).name)}</span><b>${esc(workoutSummary(record))}</b></div><div class="flex between"><span>운동 전 통증</span><b>${record.before}/10</b></div><div class="flex between"><span>운동 후 통증</span><b class="teal">${record.after}/10</b></div><div class="flex between"><span>증상</span><b>${esc(symptomText(record.symptoms))}</b></div>${location?`<div class="flex between"><span>증상 부위</span><b>${esc(location)}</b></div>`:''}${action?`<div class="flex between"><span>발생 동작</span><b>${esc(action)}</b></div>`:''}${record.stoppedEarly?'<p class="tiny">운동 도중 중단한 기록입니다.</p>':''}</section>`:''}
    <button class="btn" onclick="go('home')">홈으로 돌아가기</button><button class="btn alt" onclick="go('history')">내 기록 확인하기</button>`;
}
