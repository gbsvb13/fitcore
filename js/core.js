// 공통 기능: 기록 저장, 계획 저장, 화면 이동(go), 화면 그리기(render)
const KEY='fitcore-demo-records-v1';

let current='home',selected='bird',gymFilter='전체',selectedMachine='cable',editing=null,lastId=null;

const $=s=>document.querySelector(s);

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const records=()=>{try{let r=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(r)?r:[]}catch{return []}};

const saveRecords=r=>{localStorage.setItem(KEY,JSON.stringify(r));window.fcData?.sync(r)};
const ex=id=>EX.find(x=>x.id===id)||EX[0];

const fmt=d=>new Date(d).toLocaleDateString('ko-KR',{month:'long',day:'numeric'});

const stamp=()=>new Date().toISOString();

function go(page,id){if(id)selected=id;current=page;render();scrollTo({top:0,behavior:'instant'})}

function item(x){const rx=typeof rxOf==='function'?rxOf(DEMO_PATIENT_ID,x.id):null;return `<button class="exercise ex-card" onclick="go('detail','${x.id}')"><div class="art">${photoOrIcon(x)}${rx?'<span class="rx-badge">처방됨</span>':''}</div><div class="grow"><span class="pill">${esc(x.cat.split(' · ').pop())}</span><strong>${esc(x.name)}</strong><em>${rx?`${rx.reps}회 × ${rx.sets}세트 · 주 ${rx.perWeek}회`:esc(x.cat.split(' · ')[0])}</em></div></button>`}

const PLAN_KEY='fitcore-demo-plan-v1';

const planLoad=()=>{try{const p=JSON.parse(localStorage.getItem(PLAN_KEY)||'{}');return {ids:Array.isArray(p.ids)?p.ids.filter(id=>EX.some(x=>x.id===id)):[],goal:Number.isInteger(p.goal)&&p.goal>=1&&p.goal<=7?p.goal:3}}catch{return {ids:[],goal:3}}};

function planSave(p){try{localStorage.setItem(PLAN_KEY,JSON.stringify(p));return true}catch{alert('계획을 저장하지 못했습니다. 브라우저 저장 공간을 확인해 주세요.');return false}}

function planAdd(){const id=$('#plan-exercise')?.value;if(!id)return;const p=planLoad();if(!p.ids.includes(id)){p.ids.push(id);if(!planSave(p))return}render()}

function planRemove(id){const p=planLoad();p.ids=p.ids.filter(x=>x!==id);if(planSave(p))render()}

function planGoal(v){const p=planLoad();p.goal=Number(v);if(planSave(p))render()}

function weekStart(){const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-(d.getDay()+6)%7);return d}

function render(){stopFlow();document.getElementById('app')?.classList.remove('flow-media-ready');const views={home,discGuide,plan,purpose,gym,machine,detail,record,success,history,...(typeof PATIENT_EXTRA_VIEWS==='object'?PATIENT_EXTRA_VIEWS:{}),...(typeof DOCTOR_VIEWS==='object'?DOCTOR_VIEWS:{})};$('#app').innerHTML=(views[current]||home)();if(current==='gym')drawGym();if(current==='detail'){if(ex(selected).type==='home'){hydrateRehab(selected)}else{loadSourceDetails(selected);loadFlowAnimation(selected)}}hydrateRehabCards();if(typeof afterRender==='function')afterRender()}
