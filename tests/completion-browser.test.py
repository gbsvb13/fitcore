"""Local Chromium UI regression test. Requires playwright + /usr/bin/chromium. No external services."""
import re, json
from pathlib import Path
from playwright.sync_api import sync_playwright

root=Path(__file__).resolve().parents[1]
results=[]
shots=Path(root,'tests','screenshots');shots.mkdir(parents=True,exist_ok=True)
# Inline the local demo assets to avoid localhost networking (blocked in some sandboxes).
html=(root/'demo.html').read_text(encoding='utf-8')
html=re.sub(r'<link rel="stylesheet" href="https://fonts.googleapis.com/[^>]+>', '', html)
html=html.replace('<link rel="stylesheet" href="style.css">','<style>'+ (root/'style.css').read_text(encoding='utf-8') +'</style>')
html=re.sub(r'<script src="([^"]+)"></script>',lambda m:'<script>'+ (root/m.group(1)).read_text(encoding='utf-8').replace('</script>',r'<\/script>')+'</script>',html)
store_shim="""<script>const __store=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>__store.has(String(k))?__store.get(String(k)):null,setItem:(k,v)=>__store.set(String(k),String(v)),removeItem:k=>__store.delete(String(k)),clear:()=>__store.clear()}});</script>"""
html=html.replace('<body>','<body>'+store_shim)

def check(name, fn):
    try:
        fn();results.append({'name':name,'result':'PASS'});print('PASS',name)
    except Exception as exc:
        results.append({'name':name,'result':'FAIL','detail':str(exc)});print('FAIL',name,str(exc))

def fill_pain(page,before,after):
    page.locator('.pain').nth(0).locator('button.nrs-option').nth(before).click()
    page.locator('.pain').nth(1).locator('button.nrs-option').nth(after).click()

def assert_text(s,t):
    assert s in t,f'Could not find {s!r} in {t[:500]!r}'
def assert_absent(s,t):
    assert s not in t,f'Unexpected {s!r} in {t[:500]!r}'


with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    context=browser.new_context(viewport={'width':390,'height':844},device_scale_factor=1)
    page=context.new_page();page.set_content(html,wait_until='domcontentloaded')
    errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
    page.evaluate("go('record','bird')")
    fill_pain(page,2,8)
    page.locator('label.sym-chip').filter(has_text='다리 저림').click(force=True)
    page.locator('#stopped-early').check(force=True)
    page.get_by_role('button',name='운동 기록 저장하기').click()
    check('중단 기록 완료 화면에 다음 운동 안내 없음', lambda: (_ for _ in ()).throw(AssertionError(page.locator('#app').inner_text())) if '다음 운동 ·' in page.locator('#app').inner_text() else None)
    page.evaluate("go('home')")
    home_text=page.locator('#app').inner_text()
    check('홈 처방 진행률 중단 0/3', lambda: assert_text('0 / 3 완료',home_text))
    check('홈 주간 달성률 중단 0/5', lambda: assert_text('0/5회 완료했어요',home_text))
    check('홈 안전 안내 지속', lambda: assert_text('오늘의 증상 기록을 확인해 주세요',home_text))
    check('홈 바로 운동 시작 유도하지 않음', lambda: assert_absent('오늘 운동 시작하기',home_text))
    page.screenshot(path=str(shots/'before_after_stopped_home.png'),full_page=True)
    page.evaluate("go('plan')")
    page.get_by_role('button',name='선택한 운동 등록하기').count() # no-op, list check
    page.evaluate("planSave({ids:['bird'],goal:3});render()")
    plan_text=page.locator('#app').inner_text()
    check('계획 중단 기록은 별도 표기',lambda: (assert_text('0회 완료',plan_text),assert_text('중단 기록 1건',plan_text)))
    page.screenshot(path=str(shots/'stopped_plan.png'),full_page=True)
    page.evaluate("go('history')")
    check('내 기록에 중단 기록 보존',lambda: assert_text('운동 중단',page.locator('#app').inner_text()))
    page.evaluate("go('record','bridge')")
    fill_pain(page,2,2)
    page.locator('label.sym-chip').filter(has_text='특이사항 없음').click(force=True)
    page.get_by_role('button',name='운동 기록 저장하기').click()
    page.evaluate("go('home')")
    check('정상 완료+중단 기록 => 1/3',lambda:assert_text('1 / 3 완료',page.locator('#app').inner_text()))
    check('정상 완료+중단 기록 => 주간 1/5',lambda:assert_text('1/5회 완료했어요',page.locator('#app').inner_text()))
    page.screenshot(path=str(shots/'mixed_home.png'),full_page=True)
    check('브라우저 실행 오류 없음',lambda: assert_absent('ERROR',str(errors)) if not errors else (_ for _ in ()).throw(AssertionError(str(errors))))
    browser.close()
res=root/'Cycle3_COMPLETION_BROWSER_RESULTS.json'
res.write_text(json.dumps({'method':'Chromium localhost demo.html, synthetic records','total':len(results),'passed':sum(x['result']=='PASS' for x in results),'results':results},ensure_ascii=False,indent=2),encoding='utf-8')
print(f"Browser: {sum(x['result']=='PASS' for x in results)}/{len(results)} tests passed")
if any(r['result']!='PASS' for r in results): raise SystemExit(1)
