// 앱 시작: 하단 메뉴 연결 + 첫 화면 그리기
document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));

const role=getRole();
if(role==='doctor'){document.body.classList.add('doctor-mode');current='doctor'}
if(role){render()}else{showLogin()}
