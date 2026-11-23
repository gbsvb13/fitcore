// 화면: 운동 찾기 (목적별)
const PURPOSES=[{"id":"control","title":"체간 안정화·운동 조절","short":"체간 안정화","description":"Cochrane의 core strengthening 및 motor control 범주 참고. 개인별 처방이나 안전성 보증은 아닙니다.","ids":["bird","bridge","deadbug"]},{"id":"mobility","title":"유연성·가동성","short":"유연성·가동성","description":"Cochrane stretching / flexibility / mobilising 운동 분류 참고.","ids":["heel","pelvic","catcow"]},{"id":"strength","title":"일반 근력·기능 운동","short":"근력·기능","description":"저항운동과 일상 움직임 예시. 머신 운동은 별도 목록에서 확인할 수 있습니다.","ids":["sitstand"]},{"id":"aerobic","title":"유산소 활동","short":"유산소","description":"Cochrane aerobic 범주 참고. 걷기 활동 예시.","ids":["walking"]}];
let purposeFilter='all';

function findTabs(active){return `<div class="segment"><button class="${active==='purpose'?'on':''}" onclick="go('purpose')">목적별</button><button class="${active==='gym'?'on':''}" onclick="go('gym')">기구별</button></div>`}

function purpose(){return `${findTabs('purpose')}
 <div class="search-box">${icon('search')}<input id="purpose-search" class="search" placeholder="운동 이름을 검색해 보세요" oninput="drawPurpose()"></div>
 <div class="chips scroll" id="purpose-chips"><button class="chip" data-f="all" onclick="purposeFilter='all';drawPurpose()">전체</button>${PURPOSES.map(g=>`<button class="chip" data-f="${g.id}" onclick="purposeFilter='${g.id}';drawPurpose()">${g.short}</button>`).join('')}</div>
 <div id="purpose-items"></div>
 <p class="tiny"><a target="_blank" rel="noopener noreferrer" href="https://doi.org/10.1002/14651858.CD015608">운동 유형 분류 참고: Cochrane (개별 동작 검증 자료 아님) ↗</a></p>
 <div class="warn">⚠ 운동의 일반적인 목적을 설명하는 분류입니다. 허리디스크 환자에게 안전하다는 의미가 아닙니다. 운동 시작 전 담당 의료진에게 개인별 적합성을 확인하세요.</div>`;}

function drawPurpose(){
 const term=($('#purpose-search')?.value||'').trim().toLowerCase();
 document.querySelectorAll('#purpose-chips .chip').forEach(b=>b.classList.toggle('active',b.dataset.f===purposeFilter));
 const groups=PURPOSES.filter(g=>purposeFilter==='all'||g.id===purposeFilter);
 const ids=[...new Set(groups.flatMap(g=>g.ids))].filter(id=>{const x=ex(id);return !term||(x.name+' '+x.cat).toLowerCase().includes(term)});
 const rxIds=rxFor(DEMO_PATIENT_ID).map(r=>r.id);
 ids.sort((a,b)=>(rxIds.includes(b)?1:0)-(rxIds.includes(a)?1:0));
 const g=purposeFilter==='all'?null:groups[0];
 const box=$('#purpose-items');if(!box)return;
 box.innerHTML=`<div class="flex between"><h2>${g?esc(g.title):'추천 운동'}</h2><span class="tiny muted">총 ${ids.length}개</span></div>${g?`<p class="sub" style="margin-top:-6px">${esc(g.description)}</p>`:''}${ids.length?ids.map(id=>item(ex(id))).join(''):'<div class="card">검색 결과가 없습니다.</div>'}`;
 hydrateRehabCards();
}
