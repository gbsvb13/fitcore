const DOC_NOTIFY_KEY='fitcore-notify-doctor';
function doctorMe(){
 const n=loadJSON(DOC_NOTIFY_KEY,{pain:true,record:true,message:true});
 const row=(k,t,d)=>`<label class="toggle-row"><span><b>${t}</b><small class="muted">${d}</small></span><input type="checkbox" ${n[k]?'checked':''} onchange="setDocNotify('${k}',this.checked)"></label>`;
 return `<section class="card"><h2 style="margin:0 0 12px">계정 정보</h2><div class="flex between"><div class="flex"><div class="avatar big">${DOCTOR_NAME[0]}</div><div><b>${DOCTOR_NAME}</b><p class="tiny muted" style="margin:0">재활의학과 의료진 · ${CLINIC_NAME}</p></div></div></div></section>
 <section class="card"><h2 style="margin:0 0 4px">알림 설정</h2>${row('pain','환자 통증 악화 알림','운동 후 통증이 증가하면 바로 알려드려요.')}${row('record','새 운동 기록 알림','새로운 운동 기록이 등록되면 알려드려요.')}${row('message','환자 메시지 알림','새로운 메시지가 오면 알려드려요.')}<p class="tiny muted">시연용 설정입니다. 실제 알림은 보내지 않아요.</p></section>
 <section class="card menu"><button onclick="logout()">${icon('logout','warn-txt')}<span class="grow"><b class="warn-txt">로그아웃</b><small class="muted">현재 의료진 계정에서 로그아웃합니다.</small></span>${icon('chevron','muted')}</button></section>`;
}
function setDocNotify(k,v){const n=loadJSON(DOC_NOTIFY_KEY,{pain:true,record:true,message:true});n[k]=v;saveJSON(DOC_NOTIFY_KEY,n)}
