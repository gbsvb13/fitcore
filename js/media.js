// 운동 사진·영상·애니메이션 불러오기 (RepDB, Free Exercise DB, Flow)
/* Free Exercise DB: only explicitly verified exercise-to-source matches.
   Photos and English steps are served together from each original exercise file.
   Requires an internet connection; existing Korean content remains a fallback. */
const FEDB_BASE='https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

const FEDB_IDS={
 cable_push:'Triceps_Pushdown',
 smith_squat:'Smith_Machine_Squat',smith_calf:'Smith_Machine_Calf_Raise',
 leg_press:'Leg_Press',leg_press_calf:'Calf_Press_On_The_Leg_Press_Machine',
 lat_wide:'Wide-Grip_Lat_Pulldown',row_neutral:'Seated_Cable_Rows',chest_press:'Machine_Bench_Press',
 legcurl_seated:'Seated_Leg_Curl',leg_ext:'Leg_Extensions'
};

const FEDB_CACHE={};

// Verified name/ID mappings only; variants with differing movements deliberately omitted.

/* Rehab media = RepDB free tier, machine media = Free Exercise DB.
   The RepDB public JSON may evolve; only exact exercise-name aliases are accepted.
   Images served from RepDB CDN, no scraping of medical provider media. */
const REPDB_BASE='https://cdn.jsdelivr.net/gh/RepDB/exercise-dataset@main/';

const REPDB_JSON=REPDB_BASE+'exercises.json';

const REPDB_ALIASES={
 bird:['bird dog','bird-dog'],
 bridge:['glute bridge','bodyweight glute bridge','floor glute bridge','bridge'],
 heel:['heel slide','heel slides','supine heel slide'],
 deadbug:['dead bug','deadbug'],
 pelvic:['pelvic tilt','supine pelvic tilt','posterior pelvic tilt'],
 catcow:['cat cow','cat-cow','cat cow stretch','cat camel'],
 sitstand:['sit to stand','sit-to-stand','chair squat','chair sit to stand'],
 walking:['walking','walk']
};

let repdbPromise=null, repdbStatus='';

const repdbNorm=t=>String(t||'').toLowerCase().replace(/[^a-z0-9]/g,'');

function repdbRows(data){if(Array.isArray(data))return data;for(const field of ['exercises','data','items'])if(Array.isArray(data?.[field]))return data[field];return Object.values(data||{}).filter(v=>v&&typeof v==='object'&&!Array.isArray(v)&&('name' in v||'name_en' in v));}

function loadRepdb(){if(!repdbPromise)repdbPromise=fetch(REPDB_JSON).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()}).then(repdbRows).then(rows=>{if(!rows.length)throw Error('JSON 데이터 형식 불일치');return rows}).catch(err=>{repdbPromise=null;throw err});return repdbPromise;}

function repdbName(rec){return rec.name_en||rec.name?.en||rec.name||rec.title_en||rec.title||'';}

function repdbImagePaths(rec){const im=rec.images?.flat||rec.images||{};const paths=[im.start,im.peak,im.main].filter(v=>typeof v==='string'&&v.length);return [...new Set(paths)].map(v=>/^https:\/\//i.test(v)?v:REPDB_BASE+v.replace(/^\/+/,''));}

async function repdbFind(id){const rows=await loadRepdb();const accepted=REPDB_ALIASES[id]||[];return {record: rows.find(e=>accepted.some(a=>repdbNorm(a)===repdbNorm(repdbName(e)))&&repdbImagePaths(e).length>0)||null,total:rows.length};}

function repdbCredit(){return '<p class="tiny"><a href="https://repdb.co" target="_blank" rel="noopener noreferrer">Exercise data and illustrations by RepDB (repdb.co)</a> · 무료판, 출처 표기 · 의료 검수 자료 아님</p>';}

function rehabFallback(id,compact=false){return '';}

function showRehabFallback(id,message){const c=document.getElementById('rehab-detail-cover'),info=document.getElementById('rehab-source-info');if(c){c.innerHTML='';c.closest('.optional-media-card')?.remove();}if(info)info.innerHTML='';}

async function hydrateRehab(id){
 try{
  const {record,total}=await repdbFind(id);
  if(current!=='detail'||selected!==id)return;
  const cover=document.getElementById('rehab-detail-cover'),info=document.getElementById('rehab-source-info');if(!cover)return;
  if(!record){showRehabFallback(id,'');return;}
  const imgs=repdbImagePaths(record);cover.closest('.optional-media-card')?.classList.add('has-media');cover.innerHTML=imgs.map((src,i)=>`<img src="${esc(src)}" loading="lazy" alt="${esc(repdbName(record))} ${i===0?'시작 자세':'동작 자세'}" class="rehab-pose" onerror="this.style.display='none';this.parentElement.setAttribute('data-broken','true')">`).join('');
  cover.querySelectorAll('img.rehab-pose').forEach(img=>{img.addEventListener('error',()=>{if(cover.querySelectorAll('img.rehab-pose:not([style*=\"display: none\"])').length===0)showRehabFallback(id,'이미지 파일 로딩 실패');});});
  if(info)info.innerHTML='<b>RepDB 원본과 일치</b> · '+esc(repdbName(record))+' (ID '+esc(record.id||'미표기')+')'+repdbCredit()+'<p class="tiny">이 그림은 일반 운동 예시이며 허리디스크에 안전하다는 인증은 아닙니다.</p>';
 }catch(err){const cover=document.getElementById('rehab-detail-cover'),info=document.getElementById('rehab-source-info');showRehabFallback(id,'');}
}

async function hydrateRehabCards(){
 const nodes=[...document.querySelectorAll('[data-rehab-cover]')];if(!nodes.length)return;
 try{const rows=await loadRepdb();for(const node of nodes){if(!node.isConnected)continue;const id=node.dataset.rehabCover;const aliases=REPDB_ALIASES[id]||[];const rec=rows.find(e=>aliases.some(a=>repdbNorm(a)===repdbNorm(repdbName(e)))&&repdbImagePaths(e).length);if(rec){node.innerHTML=`<img class="catalog-photo" loading="lazy" src="${esc(repdbImagePaths(rec)[0])}" alt="${esc(repdbName(rec))} 자세 이미지" onerror="this.remove()">`;}else node.innerHTML='';}}
 catch(err){nodes.forEach(el=>{if(el.isConnected)el.innerHTML=''});}
}

function homeMedia(x){return x.type==='home'?`<div class="rehab-cover" data-rehab-cover="${x.id}"></div>`:null}

function setMotionSpeed(rate){const v=document.getElementById('home-motion-video');if(v){v.playbackRate=rate;document.querySelectorAll('[data-motion-rate]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.motionRate)===rate)));}}

function motionMedia(x){return HOME_MEDIA[x.id]?`<div class="card"><b>동작 흐름 미리보기</b><video id="home-motion-video" onloadedmetadata="this.playbackRate=0.5" class="motion-preview" muted autoplay loop playsinline controls preload="metadata" src="media/${x.id}_motion.mp4" aria-label="${esc(x.name)} 일러스트 동작 영상"></video><div class="motion-controls"><span class="tiny">재생 속도:</span>${[0.5,0.75,1].map(n=>`<button class="smallbtn" data-motion-rate="${n}" aria-pressed="${n===0.5}" onclick="setMotionSpeed(${n})">${n}배</button>`).join('')}</div><div class="tiny muted">두 자세를 반복 표시한 시연용 영상입니다. 실제 재활운동 동작이나 권장 속도를 의미하지 않습니다.</div><div class="motion-controls"><button class="smallbtn" onclick="setPose('${x.id}',0)">시작 자세</button><button class="smallbtn" onclick="setPose('${x.id}',1)">동작 자세</button><button class="smallbtn" onclick="setPose('${x.id}',2)">반복 보기</button></div><div id="pose-preview"></div><p class="tiny muted">일러스트: FITCORE 시연용 · 의료 전문가 검수 전</p></div>`:''}

function setPose(id,pose){const p=document.getElementById('pose-preview');if(!p)return;const f=pose===0?'start':pose===1?'finish':null;p.innerHTML=f?`<img class="motion-preview" src="media/${id}_${f}.webp" alt="선택한 자세"><div class="tiny muted">${pose===0?'시작 자세':'동작 자세'}</div>`:'';const original=document.getElementById('home-motion-video');if(original){original.style.display=f?'none':'block';if(f)original.pause();else original.play().catch(()=>{});}}

function photoUrl(sourceId,number=0){return FEDB_BASE+encodeURIComponent(sourceId)+'/'+number+'.jpg'}

function photoOrIcon(x){const hm=homeMedia(x);if(hm)return hm;const id=FEDB_IDS[x.id];return id?`<img class="catalog-photo" loading="lazy" src="${photoUrl(id)}" alt="${esc(x.name)} 운동 동작 참고 사진" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><span class="photo-fallback" style="display:none">${x.icon}</span>`:`<span>${x.icon}</span>`}

async function loadSourceDetails(id){
 const sourceId=FEDB_IDS[id];if(!sourceId)return;
 const target=document.getElementById('fdb-info');if(!target)return;
 try{
  if(!FEDB_CACHE[sourceId]){
   const response=await fetch(FEDB_BASE+encodeURIComponent(sourceId)+'.json');
   if(!response.ok)throw Error('HTTP '+response.status);
   FEDB_CACHE[sourceId]=await response.json();
  }
  const data=FEDB_CACHE[sourceId];
  if(current!=='detail'||selected!==id)return;
  const el=document.getElementById('fdb-info');if(!el)return;
  const english=Array.isArray(data.instructions)?data.instructions:[];
  const imgs=Array.isArray(data.images)?data.images.slice(0,2):[];
  const media=imgs.map(path=>`<img class="reference-photo" loading="lazy" alt="${esc(data.name)} 자세 사진" src="${FEDB_BASE+path.split('/').map(encodeURIComponent).join('/')}" onerror="this.remove()">`).join('');
  el.innerHTML=`<div class="card"><b>Free Exercise DB 원본 자료</b><p class="tiny">원본 운동명: ${esc(data.name)} · 분류: ${esc(data.equipment||'정보 없음')} · 공식 의료 검수 자료가 아님</p><div class="source-photos">${media}</div><details class="origin-details"><summary>영어 원문 설명 보기</summary>${english.length?`<ol class="source-steps">${english.map(step=>`<li>${esc(step)}</li>`).join('')}</ol>`:'<p>운동 단계 설명이 없습니다.</p>'}</details><a href="${FEDB_BASE+encodeURIComponent(sourceId)+'.json'}" target="_blank" rel="noopener noreferrer">데이터 원문 확인 ↗</a><p class="tiny">출처: yuhonas/free-exercise-db (Unlicense). 일반 운동 데이터이며 허리디스크 환자 대상 안전성 검증이 아닙니다.</p></div>`;
 }catch(err){const el=document.getElementById('fdb-info');if(el)el.innerHTML=''}
}

const FLOW_ROOT='https://cdn.jsdelivr.net/gh/ozansozuozgit/flow-exercise-dataset@main/';

const FLOW_JSON=FLOW_ROOT+'data/exercises.json';

const FLOW_ALIASES={
 bird:['bird dog','bird-dog','quadruped bird dog'],
 bridge:['glute bridge','butt lift bridge','hip bridge','bridge'],
 heel:['heel slide','heel slides','supine heel slide'],
 cable_push:['triceps pushdown','cable triceps pushdown','tricep pushdown','cable pushdown'],
 cable_curl:['cable biceps curl','cable curl'],
 cable_row:['standing cable row','cable row'],
 smith_squat:['smith machine squat','smith squat'],
 smith_calf:['smith machine calf raise','smith calf raise'],
 leg_press:['leg press','sled leg press'],
 leg_press_calf:['calf press on leg press machine','leg press calf raise'],
 lat_wide:['wide grip lat pulldown','lat pulldown','wide-grip lat pulldown'],
 lat_neutral:['neutral grip lat pulldown','close grip lat pulldown'],
 row_seated:['seated machine row','seated row'],
 row_wide:['wide grip seated row','wide-grip seated row'],
 chest_press:['machine chest press','chest press'],
 chest_neutral:['neutral grip chest press'],
 legcurl_seated:['seated leg curl'],
 legcurl_lying:['lying leg curl'],
 leg_ext:['leg extension','leg extensions'],
 leg_ext_single:['single leg extension','single-leg extension']
};

let flowPromise=null,flowToken=0,flowTimer=null;

const flowNormalize=t=>String(t||'').toLowerCase().replace(/[^a-z0-9]/g,'');

function stopFlow(){flowToken++;if(flowTimer){clearTimeout(flowTimer);flowTimer=null;}}

function flowRecordList(x){return Array.isArray(x)?x:Array.isArray(x?.data)?x.data:Array.isArray(x?.exercises)?x.exercises:[];}

function fetchFlowCatalog(){
 if(!flowPromise)flowPromise=fetch(FLOW_JSON,{cache:'default'}).then(r=>{if(!r.ok)throw Error('데이터셋 HTTP '+r.status);return r.json()}).then(flowRecordList).then(rows=>{if(!rows.length)throw Error('데이터셋 형식 확인 필요');return rows}).catch(e=>{flowPromise=null;throw e});
 return flowPromise;
}

function flowMatch(id,rows){
 const aliases=FLOW_ALIASES[id]||[];
 return rows.find(e=>aliases.some(name=>flowNormalize(e.name)===flowNormalize(name)) && Array.isArray(e.animation?.frames) && e.animation.frames.length>=2) || null;
}

function flowStatus(html){const box=document.getElementById('flow-motion');if(box)box.innerHTML=html;}

function setFlowMediaReady(id,ready){
 const app=document.getElementById('app');
 if(app&&current==='detail'&&selected===id)app.classList.toggle('flow-media-ready',Boolean(ready));
}

function flowInitPlayback(id,rec,token){
 const elem=document.getElementById('flow-frame'),btn=document.getElementById('flow-play');
 if(!elem||!btn)return;
 const frames=rec.animation.frames.map(x=>FLOW_ROOT+String(x).replace(/^\/+/,''));
 const seq=Array.isArray(rec.animation.sequence)?rec.animation.sequence:[0,1,2,1];
 let delay=Math.min(2200,Math.max(160,Number(rec.animation.frameDurationMs)||650));
 const frameImages=frames.map(src=>{const im=new Image();im.src=src;return im});
 let idx=0,playing=!matchMedia('(prefers-reduced-motion: reduce)').matches;
 function draw(){if(token!==flowToken||current!=='detail'||selected!==id)return;const num=seq[idx%seq.length];if(frames[num])elem.src=frames[num];}
 function tick(){if(token!==flowToken||!playing||current!=='detail'||selected!==id||document.hidden)return;idx++;draw();flowTimer=setTimeout(tick,delay)}
 elem.onload=()=>{
  if(token!==flowToken||current!=='detail'||selected!==id)return;
  const c=document.getElementById('flow-card');
  if(c){c.style.display='block';setFlowMediaReady(id,true);}
 };
 elem.onerror=()=>{
  if(token!==flowToken||current!=='detail'||selected!==id)return;
  playing=false;if(flowTimer)clearTimeout(flowTimer);
  setFlowMediaReady(id,false);flowStatus('');
 };
 btn.onclick=()=>{playing=!playing;btn.textContent=playing?'일시정지':'재생';if(flowTimer)clearTimeout(flowTimer);if(playing)flowTimer=setTimeout(tick,delay)};
 btn.textContent=playing?'일시정지':'재생';draw();if(playing)flowTimer=setTimeout(tick,delay);
 const speeds=document.getElementById('flow-speeds');if(speeds){speeds.addEventListener('click',ev=>{const b=ev.target.closest('button[data-flow-rate]');if(!b)return;const rate=Number(b.dataset.flowRate);if(![0.5,0.75,1].includes(rate))return;delay=Math.round((Number(rec.animation.frameDurationMs)||650)/rate);speeds.querySelectorAll('button').forEach(btn=>btn.setAttribute('aria-pressed',String(btn===b)));if(flowTimer)clearTimeout(flowTimer);if(playing)flowTimer=setTimeout(tick,delay);})} 
 document.addEventListener('visibilitychange',()=>{if(token!==flowToken)return;if(flowTimer)clearTimeout(flowTimer);if(!document.hidden&&playing)flowTimer=setTimeout(tick,delay)},{once:false});
}

async function loadFlowAnimation(id){
 stopFlow();const token=flowToken;
 if(!FLOW_ALIASES[id])return flowStatus('');
 flowStatus('');
 try{
  const rows=await fetchFlowCatalog();
  if(token!==flowToken||current!=='detail'||selected!==id)return;
  const rec=flowMatch(id,rows);
  if(!rec)return flowStatus('');
  const name=esc(rec.name),sourceId=esc(rec.id);
  flowStatus(`<div class="card" id="flow-card" style="display:none"><b>동작 애니메이션 · Flow Exercise Dataset</b><p class="tiny muted">매칭: ${name} (ID ${sourceId}) · 운동별 자세 정확성 미검수</p><div class="flow-stage"><img id="flow-frame" alt="${name} 동작 예시 프레임"></div><div class="motion-controls"><button class="smallbtn" id="flow-play" type="button">일시정지</button><span id="flow-speeds">${[0.5,0.75,1].map(n=>`<button type="button" class="smallbtn" data-flow-rate="${n}" aria-pressed="${n===1}">${n}배</button>`).join('')}</span><a class="smallbtn" href="https://github.com/ozansozuozgit/flow-exercise-dataset" target="_blank" rel="noopener noreferrer">원본 및 사용 조건 ↗</a></div><p class="tiny">연속된 SVG 그림을 반복 표시합니다. 실제 동작 속도나 허리디스크 환자에게 적합한 자세를 의미하지 않습니다. 애니메이션의 출처 및 사용 조건은 원본 저장소에서 확인해 주세요.</p></div>`);
  flowInitPlayback(id,rec,token);
 }catch(err){if(token===flowToken)flowStatus('')}
}
