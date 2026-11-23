// 화면: 운동 기록하기 + 기록 완료
function record(){let prev=editing?records().find(r=>r.id===editing):null,x=ex(prev?.exercise||selected);const before=prev?.before??2,after=prev?.after??3;
const chip=([k,label])=>`<label class="sym-chip"><input type="checkbox" id="${k}" ${prev?.symptoms?.includes(k)?'checked':''} onchange="symptomPick('${k}')"><span>${label}</span></label>`;
const slider=(id,label,v,cls)=>`<div class="pain"><div class="flex between"><b>${label}</b><span class="pain-val ${cls}"><b id="${id}-val">${v}</b> / 10</span></div><input id="${id}" class="range ${cls}" type="range" min="0" max="10" step="1" value="${v}" oninput="$('#${id}-val').textContent=this.value;this.style.setProperty('--v',this.value*10+'%')" style="--v:${v*10}%"><div class="range-labels"><span>편안해요</span><span>보통이에요</span><span>많이 아파요</span></div></div>`;
return `<div class="page-head"><button class="icon-back" onclick="go('detail')" aria-label="뒤로 가기">${icon('back')}</button><b>${prev?'운동 기록 수정':'오늘의 운동 피드백'}</b><span></span></div>
<section class="card ex-summary"><div class="art">${photoOrIcon(x)}</div><div class="grow"><small class="eyebrow">오늘의 운동</small><b>${esc(x.name)}</b><small class="muted">${esc(x.cat)}</small></div></section>
<section class="card form-step"><h3><span class="num">1</span>운동량을 알려주세요</h3><p class="sub">실제로 진행한 횟수를 입력해 주세요.</p><div class="fields"><div class="field"><label for="sets">세트</label>${stepper('sets',prev?.sets||3,1,100,'세트')}</div><div class="field"><label for="reps">반복 횟수</label>${stepper('reps',prev?.reps||10,1,1000,'회')}</div></div></section>
<section class="card form-step"><h3><span class="num">2</span>통증은 어떠셨나요?</h3><p class="sub">0은 통증 없음, 10은 상상할 수 있는 가장 심한 통증이에요 (NRS).</p>${slider('before','운동 전',before,'orange')}${slider('after','운동 후',after,'teal')}<p class="tiny muted">같은 사람의 자기보고 점수입니다. 회복률이나 의학적 진단으로 해석하지 않습니다.</p></section>
<section class="card form-step"><h3><span class="num">3</span>느낀 증상이 있나요?</h3><p class="sub">해당하는 항목을 모두 선택해 주세요.</p><div class="chips">${[['tingling','다리 저림'],['back','허리 불편감'],['none','특이사항 없음']].map(chip).join('')}</div></section>
<section class="card form-step"><div class="field" style="margin:0"><label for="memo">의료진에게 남길 메모 <span class="muted">선택</span></label><textarea id="memo" rows="3" maxlength="200" placeholder="운동하며 느낀 점이나 궁금한 점을 적어 주세요.">${esc(prev?.memo||'')}</textarea><p class="tiny muted" style="text-align:right">최대 200자</p></div></section>
<div id="form-error" class="tiny" style="color:#b33" role="alert"></div>
<div class="sticky-cta"><button class="btn" onclick="submitRecord()">${prev?'수정 내용 저장':'운동 기록 저장하기'}</button></div>`}

function symptomPick(k){const none=$('#none');if(k==='none'&&none.checked){$('#tingling').checked=false;$('#back').checked=false}else if(k!=='none'&&$('#'+k).checked){none.checked=false}}

function submitRecord(){const n=id=>Number($('#'+id).value),sets=n('sets'),reps=n('reps'),before=n('before'),after=n('after');if(![sets,reps,before,after].every(Number.isInteger)||sets<1||sets>100||reps<1||reps>1000||before<0||before>10||after<0||after>10||['sets','reps','before','after'].some(id=>$('#'+id).value.trim()==='')){$('#form-error').textContent='세트·횟수는 양의 정수, 통증 점수는 0~10 정수로 입력해 주세요.';return}let symptoms=['tingling','back','none'].filter(x=>$('#'+x).checked);if(symptoms.includes('none'))symptoms=['none'];const r=records(),old=editing?r.find(x=>x.id===editing):null;const obj={id:old?.id||String(Date.now()),date:old?.date||stamp(),updatedAt:stamp(),exercise:old?.exercise||selected,sets,reps,before,after,symptoms,memo:$('#memo').value.trim()};if(old)r.splice(r.indexOf(old),1,obj);else r.unshift(obj);try{saveRecords(r);lastId=obj.id;editing=null;go('success')}catch(e){$('#form-error').textContent='저장하지 못했습니다. 저장 공간을 확인하고 다시 시도해 주세요. 입력값은 유지됩니다.'}}

function success() {
  const allRecords = records();
  const saved = allRecords.find(record => record.id === lastId);
  const record = saved || allRecords[0];
  const today = new Date();
  const prescribed = rxFor(DEMO_PATIENT_ID);
  const completedToday = new Set(
    allRecords
      .filter(record => sameDay(record.date, today))
      .map(record => record.exercise)
  );

  const isTodayPrescription = saved
    && sameDay(saved.date, today)
    && prescribed.some(item => item.id === saved.exercise);

  let workoutStatus = '';
  if (isTodayPrescription) {
    const doneCount = prescribed.filter(item => completedToday.has(item.id)).length;
    const next = prescribed.find(item => !completedToday.has(item.id));

    workoutStatus = `
      <section class="card summary">
        <div class="flex between">
          <b>${next ? '오늘의 처방 운동' : '오늘 운동 완료'}</b>
          <span class="count-pill">${doneCount} / ${prescribed.length} 완료</span>
        </div>
        ${next ? `
          <button class="btn" onclick="go('detail','${esc(next.id)}')">
            다음 운동 · ${esc(ex(next.id).name.replace(/ \(.*\)$/, ''))}
          </button>
        ` : ''}
      </section>`;
  }

  return `
    <div class="success">
      <div class="check">${icon('check')}</div>
      <h1>운동 기록이 완료되었어요!</h1>
      <p>운동 기록을 브라우저에 저장했어요.</p>
    </div>
    ${workoutStatus}
    ${record ? `
      <div class="card summary">
        <b>운동 기록 요약</b>
        <div class="flex between">
          <span>${esc(ex(record.exercise).name)}</span>
          <b>${record.sets}세트 × ${record.reps}회</b>
        </div>
        <div class="flex between">
          <span>운동 전 통증</span><b>${record.before}/10</b>
        </div>
        <div class="flex between">
          <span>운동 후 통증</span><b class="teal">${record.after}/10</b>
        </div>
        <div class="flex between">
          <span>증상</span><b>${esc(symptomText(record.symptoms))}</b>
        </div>
      </div>
    ` : ''}
    <button class="btn" onclick="go('home')">홈으로 돌아가기</button>
    <button class="btn alt" onclick="go('history')">내 기록 확인하기</button>`;
}