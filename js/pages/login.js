const ROLE_KEY='fitcore-role';
let authRole=null,authMode='signin',authEmail='',authPw='',authMsg='',authBusy=false;
function getRole(){try{return localStorage.getItem(ROLE_KEY)}catch{return null}}

const AUTH_ERRORS={
 NotAuthorizedException:'이메일 또는 비밀번호가 올바르지 않아요.',
 UserNotFoundException:'이메일 또는 비밀번호가 올바르지 않아요.',
 UsernameExistsException:'이미 가입된 이메일이에요. 로그인해 주세요.',
 InvalidPasswordException:'비밀번호는 8자 이상이며 대문자·소문자·숫자·특수문자를 모두 포함해야 해요.',
 InvalidParameterException:'입력값을 다시 확인해 주세요.',
 CodeMismatchException:'인증 코드가 올바르지 않아요.',
 ExpiredCodeException:'인증 코드가 만료되었어요. 코드를 다시 받아 주세요.',
 LimitExceededException:'시도 횟수가 많아요. 잠시 후 다시 시도해 주세요.',
 EmptySignInUsername:'이메일을 입력해 주세요.',
 EmptySignInPassword:'비밀번호를 입력해 주세요.'
};
const authError=e=>AUTH_ERRORS[e?.name]||e?.message||'오류가 발생했어요. 다시 시도해 주세요.';

function login(){
 const logo=`<div class="login-logo"><b>✚</b><div><strong>FitCore</strong><small>바른 움직임, 건강한 일상</small></div></div><p class="login-lead">허리 건강을 위한</p><h1 class="login-title">안전한 재활의 시작</h1>`;
 if(!authRole){
  return `<div class="login"><div class="login-card">${logo}
   <p class="login-ask">시작할 역할을 선택해 주세요</p>
   <p class="tiny muted" style="margin-top:0">언제든 다시 선택할 수 있어요</p>
   <button class="role-btn primary" onclick="chooseRole('patient')"><span class="role-icon">${icon('user')}</span><span class="grow"><b>환자로 시작하기</b><small>처방 운동과 회복 기록을 확인해요</small></span><svg class="role-arrow" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg></button>
   <button class="role-btn" onclick="chooseRole('doctor')"><span class="role-icon"><svg viewBox="0 0 24 24"><path d="M11 2v2"/><path d="M5 2v2"/><path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1"/><path d="M8 15a6 6 0 0 0 12 0v-3"/><circle cx="20" cy="10" r="2"/></svg></span><span class="grow"><b>의료진으로 시작하기</b><small>환자별 운동과 경과를 관리해요</small></span><svg class="role-arrow" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg></button>
  </div></div>`;
 }
 const roleName=authRole==='doctor'?'의료진':'환자';
 const title={signin:`${roleName} 로그인`,signup:`${roleName} 회원가입`,confirm:'이메일 인증'}[authMode];
 const form=authMode==='confirm'
  ?`<p class="sub">${esc(authEmail)}(으)로 보낸 6자리 인증 코드를 입력해 주세요.</p>
    <div class="field"><label for="auth-code">인증 코드</label><input id="auth-code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="123456"></div>`
  :`<div class="field"><label for="auth-email">이메일</label><input id="auth-email" type="email" autocomplete="email" value="${esc(authEmail)}" placeholder="이메일을 입력해 주세요"></div>
    <div class="field"><label for="auth-pw">비밀번호</label><input id="auth-pw" type="password" autocomplete="${authMode==='signup'?'new-password':'current-password'}" placeholder="비밀번호를 입력해 주세요"></div>
    ${authMode==='signup'?'<p class="tiny muted">8자 이상, 대문자·소문자·숫자·특수문자를 모두 포함해 주세요.</p>':''}`;
 const btn={signin:'로그인',signup:'회원가입',confirm:'인증하고 시작하기'}[authMode];
 const swap=authMode==='signin'?`처음이신가요? <a href="#" onclick="event.preventDefault();setAuthMode('signup')">회원가입</a>`:authMode==='signup'?`이미 계정이 있나요? <a href="#" onclick="event.preventDefault();setAuthMode('signin')">로그인</a>`:`코드를 받지 못했나요? <a href="#" onclick="event.preventDefault();resendCode()">코드 다시 받기</a>`;
 return `<div class="login"><div class="login-card">${logo}
  <button class="back" onclick="authRole=null;authMsg='';showLogin()">${icon('back')} 역할 다시 선택</button>
  <div class="role-chip"><span class="role-icon">${icon(authRole==='doctor'?'clipboard':'user')}</span><div><small class="muted">선택한 역할</small><b>${title}</b></div></div>
  <form onsubmit="event.preventDefault();authSubmit()">${form}
   <div id="auth-msg" class="auth-msg" role="alert">${esc(authMsg)}</div>
   <button class="btn" type="submit" ${authBusy?'disabled':''}>${authBusy?'잠시만요…':btn}</button>
  </form>
  <p class="tiny muted" style="text-align:center">${swap}</p>
 </div></div>`;
}

function showLogin(){
 document.body.classList.add('auth');
 $('#app').innerHTML=login();
 scrollTo({top:0});
 setTimeout(()=>$('#auth-email,#auth-code')?.focus(),0);
}
function chooseRole(role){authRole=role;authMode='signin';authMsg='';showLogin()}
function setAuthMode(m){authMode=m;authMsg='';showLogin()}
function authReady(){if(window.fcAuth)return true;authMsg='로그인 기능을 불러오는 중이에요. 잠시 후 다시 시도해 주세요.';showLogin();return false}

async function authSubmit(){
 if(authBusy||!authReady())return;
 try{
  if(authMode!=='confirm'){authEmail=$('#auth-email').value.trim();authPw=$('#auth-pw').value}
  const code=$('#auth-code')?.value.trim()||'';
  authBusy=true;authMsg='';showLogin();
  if(authMode==='signin'){
   const r=await fcAuth.signIn(authEmail,authPw);
   if(r.nextStep?.signInStep==='CONFIRM_SIGN_UP'){authMode='confirm';await fcAuth.resendCode(authEmail);authMsg='이메일 인증이 필요해요. 받은 코드를 입력해 주세요.'}
    else await enterApp();
  }else if(authMode==='signup'){
   const r=await fcAuth.signUp(authEmail,authPw);
   if(r.nextStep?.signUpStep==='CONFIRM_SIGN_UP'){authMode='confirm';authMsg=''}else{await fcAuth.signIn(authEmail,authPw);await enterApp()}
  }else{
   await fcAuth.confirmSignUp(authEmail,code);
   await fcAuth.signIn(authEmail,authPw);
   await enterApp();
  }
 }catch(e){
  if(e?.name==='UserAlreadyAuthenticatedException'){await enterApp();return}
  if(e?.name==='UserNotConfirmedException'){authMode='confirm';authMsg='이메일 인증이 필요해요. 받은 코드를 입력해 주세요.'}
  else authMsg=authError(e);
  console.error(e);
 }finally{authBusy=false;if(document.body.classList.contains('auth'))showLogin()}
}
async function resendCode(){if(!authReady())return;try{await fcAuth.resendCode(authEmail);authMsg='인증 코드를 다시 보냈어요.'}catch(e){authMsg=authError(e)}showLogin()}

async function enterApp(){
 authPw='';
 try{await window.fcData?.load()}catch(e){console.error(e);alert('기록을 불러오지 못했어요.')}
 try{localStorage.setItem(ROLE_KEY,authRole)}catch{}
 document.body.classList.remove('auth');
 document.body.classList.toggle('doctor-mode',authRole==='doctor');
 go(authRole==='doctor'?'doctor':'home');
}

function logout(){
 confirmModal('로그아웃 하시겠어요?','다시 이용하려면 로그인이 필요해요.','로그아웃',async()=>{
  try{await window.fcAuth?.signOut()}catch(e){console.error(e)}
  window.fcData?.clear();
  try{localStorage.removeItem(ROLE_KEY)}catch{}
  authRole=null;authMode='signin';authMsg='';
  document.body.classList.remove('doctor-mode','focus-mode');
  showLogin();
 });
}