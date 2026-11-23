function doctorPatients(){
 const counts={all:PATIENTS.length};['주의','관찰','양호'].forEach(s=>counts[s]=PATIENTS.filter(p=>patientStatus(p)===s).length);
 return `<div class="search-box">${icon('search')}<input id="pt-search" class="search" placeholder="환자 이름 또는 진단명 검색" oninput="filterPatients()"></div>
 <div class="chips scroll" id="pt-chips">${[['all','전체'],['주의','주의'],['관찰','관찰'],['양호','양호']].map(([k,l])=>`<button class="chip ${patientFilter===k?'active':''}" onclick="patientFilter='${k}';filterPatients()" data-f="${k}">${l} ${counts[k]}</button>`).join('')}</div>
 <div id="pt-list" class="pt-grid"></div>`;
}
function filterPatients(){
 const t=($('#pt-search')?.value||'').trim();
 document.querySelectorAll('#pt-chips .chip').forEach(b=>b.classList.toggle('active',b.dataset.f===patientFilter));
 const list=PATIENTS.filter(p=>(patientFilter==='all'||patientStatus(p)===patientFilter)&&(!t||p.name.includes(t)||p.diagnosis.includes(t)));
 const box=$('#pt-list');if(box)box.innerHTML=list.map(patientCard).join('')||'<div class="card">검색 결과가 없습니다.</div>';
}
