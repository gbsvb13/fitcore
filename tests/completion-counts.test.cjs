// Usage: node tests/completion-counts.test.cjs
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const files=['js/data.js','js/media.js','js/core.js','js/shared.js','js/pages/patient/home.js','js/pages/patient/plan.js','js/pages/patient/history.js','js/pages/patient/record.js','js/pages/doctor/data.js','js/pages/doctor/patient.js'];
const now=()=>new Date().toISOString();
const testLog=[];
function run(name,action){try{action();testLog.push({name,result:'PASS'});console.log('PASS',name)}catch(e){testLog.push({name,result:'FAIL',error:e.message});console.error('FAIL',name,e.message);process.exitCode=1}}
function setup(records=[],plan={ids:['bird','bridge','heel'],goal:5}){
 const store=new Map([['fitcore-demo-records-v1',JSON.stringify(records)],['fitcore-demo-plan-v1',JSON.stringify(plan)]]);
 const ctx=vm.createContext({localStorage:{getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>{store.set(k,String(v));},removeItem:k=>store.delete(k)},window:{},document:{},console,Date,Math,Set,Array,Intl});
 for(const filename of files)vm.runInContext(fs.readFileSync(path.join(root,filename),'utf8'),ctx,{filename});
 return {ctx,store,html:expr=>vm.runInContext(expr,ctx)};
}
function entry(id,exercise='bird',stoppedEarly=true,when=now()) {return {id,exercise,date:when,sets:2,reps:10,before:3,after:stoppedEarly?8:3,symptoms:stoppedEarly?['tingling']:['none'],stoppedEarly,memo:''};}
const halt=entry('halt');
run('운동 중단 레코드는 완료로 집계되지 않음',()=>{
 const {html}=setup([halt]);assert.equal(html('isCompletedWorkout(records()[0])'),false);
 assert.match(html('home()'),/0 \/ 3 완료/);assert.match(html('home()'),/0\/5회 완료했어요/);
});
run('중단 기록은 주간 달성률·연속 운동을 늘리지 않음',()=>{
 const {html}=setup([halt]);const t=html('home()');assert.match(t,/>0%<\/b>/);assert.match(t,/연속 운동<\/div><div class="stat">0/);
});
run('오늘 증상 중단 시 홈에서 안전 안내 우선, 운동 시작 버튼 제외',()=>{
 const {html}=setup([halt]);const t=html('home()');assert.match(t,/오늘의 증상 기록을 확인해 주세요/);assert.doesNotMatch(t,/오늘 운동 시작하기/);
});
run('중단 기록은 사라지지 않고 기록 조회에 남음',()=>{
 const {html}=setup([halt]);const t=html('history()');assert.match(t,/총 기록/);assert.match(t,/운동 중단/);assert.equal(html('records().length'),1);
});
run('주간 개인 계획의 완료 수 0, 중단 1건을 구분',()=>{
 const {html}=setup([halt]);const t=html('plan()');assert.match(t,/0회 완료/);assert.match(t,/중단 기록 1건/);assert.match(t,/이번 주 0회 완료 · 1회 중단/);
});
run('같은 날 버드독 중단 이후 정상 완료하면 1회 완료로 집계',()=>{
 const {html}=setup([entry('done','bird',false),halt]);const t=html('home()');assert.match(t,/1 \/ 3 완료/);assert.match(t,/1\/5회 완료했어요/);
});
run('서로 다른 운동 정상 1개 + 중단 1개 = 정상 완료 1개',()=>{
 const {html}=setup([entry('bridge','bridge',false),halt]);assert.match(html('home()'),/1 \/ 3 완료/);
});
run('이전 버전의 stoppedEarly 미정의 레코드는 기존대로 완료 처리',()=>{
 const prior=entry('legacy');delete prior.stoppedEarly;
 const {html}=setup([prior]);assert.equal(html('isCompletedWorkout(records()[0])'),true);assert.match(html('home()'),/1 \/ 3 완료/);
});
run('정상 완료 3종이면 오늘 추가 운동 시작 버튼이 사라짐',()=>{
 const {html}=setup([entry('b','bird',false),entry('g','bridge',false),entry('h','heel',false)]);
 const t=html('home()');assert.match(t,/3 \/ 3 완료/);assert.match(t,/오늘 처방 운동 모두 완료/);assert.doesNotMatch(t,/오늘 운동 시작하기/);
});
run('의료진 상세의 주간 완료율에서 당일 중단 기록은 제외',()=>{
 const {html}=setup([halt]);const before=html('doctorPatient()');
 // 의료진 데모의 별도 과거 로그는 남으므로, 중단 기록을 추가하기 전후 완료율이 동일해야 합니다.
 const {html:baseline}=setup([]);const after=baseline('doctorPatient()');
 const getPct=s=>(s.match(/이번 주 수행률<\/small><b>(\d+)%/)||[])[1];
 assert.equal(getPct(before),getPct(after));
});
run('의료진 요일 표시: 중단만 한 날짜는 중단, 완료로 표시하지 않음',()=>{
 const {html}=setup([halt]);const rows=html('weekDots([records()[0]])');assert.match(rows,/class="day halted today"/);assert.match(rows,/>중단<\/small>/);assert.doesNotMatch(rows,/>완료<\/small>/);
});
run('기록 저장·수정 없이 집계만 변경됨',()=>{
 const {html}=setup([halt]);const original=html('JSON.stringify(records())');html('home()');html('plan()');html('doctorPatient()');assert.equal(html('JSON.stringify(records())'),original);
});
if(!process.exitCode)console.log(`\n${testLog.length}/${testLog.length} assertions passed`);
const resultFile=path.resolve(root,'Cycle3_COMPLETION_TEST_RESULTS.json');fs.writeFileSync(resultFile,JSON.stringify({date:now(),method:'Node.js VM / recorded data',total:testLog.length,passed:testLog.filter(x=>x.result==='PASS').length,tests:testLog},null,2));
