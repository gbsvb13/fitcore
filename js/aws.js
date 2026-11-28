import { Amplify } from 'aws-amplify';
import { signUp, confirmSignUp, resendSignUpCode, signIn, signOut, getCurrentUser, fetchUserAttributes, fetchAuthSession } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import outputs from '../amplify_outputs.json';

Amplify.configure(outputs);
const client = generateClient();

// ---------- 로그인 (Cognito) ----------
window.fcAuth = {
  signUp: (email, password) =>
    signUp({ username: email, password, options: { userAttributes: { email } } }),
  confirmSignUp: (email, code) =>
    confirmSignUp({ username: email, confirmationCode: code }),
  resendCode: (email) => resendSignUpCode({ username: email }),
  signIn: (email, password) => signIn({ username: email, password }),
  signOut: () => signOut(),
  currentUser: () => getCurrentUser(),
  email: async () => (await fetchUserAttributes()).email,
  // 의료진 여부는 브라우저에 저장된 값이 아니라 Cognito 로그인 토큰의 그룹으로 판단한다.
  // forceRefresh: 관리자가 그룹을 바꾼 뒤에도 최신 토큰으로 확인한다.
  isDoctor: async () => {
    try {
      const { tokens } = await fetchAuthSession({ forceRefresh: true });
      const groups = tokens?.accessToken?.payload?.['cognito:groups'];
      return Array.isArray(groups) && groups.includes('DOCTOR');
    } catch (e) {
      console.error(e);
      return false;
    }
  }
};

// ---------- 운동 기록 저장 (DynamoDB) ----------
const KEY = 'fitcore-demo-records-v1';
let synced = new Map();

const toApp = (m) => ({ id: m.id, date: m.recordedAt, exercise: m.exerciseId, sets: m.sets, reps: m.reps,
  before: m.painBefore, after: m.painAfter, symptoms: m.symptoms || [], memo: m.memo || '', durationMinutes: m.durationMinutes ?? null, symptomLocation: m.symptomLocation || '', triggerAction: m.triggerAction || '', stoppedEarly: m.stoppedEarly || false });
const toCloud = (r) => ({ id: r.id, exerciseId: r.exercise, sets: r.sets, reps: r.reps,
  painBefore: r.before, painAfter: r.after, symptoms: r.symptoms || [], memo: r.memo || '', durationMinutes: r.durationMinutes ?? null, symptomLocation: r.symptomLocation || '', triggerAction: r.triggerAction || '', stoppedEarly: r.stoppedEarly || false, recordedAt: r.date });
const same = (a, b) => JSON.stringify(toCloud(a)) === JSON.stringify(toCloud(b));

async function listAll() {
  let items = [], nextToken = null;
  do {
    const res = await client.models.ExerciseRecord.list({ nextToken, limit: 100 });
    if (res.errors?.length) throw new Error(res.errors[0].message);
    items = items.concat(res.data);
    nextToken = res.nextToken;
  } while (nextToken);
  return items;
}

window.fcData = {
  async load() {
    const items = (await listAll()).map(toApp).sort((a, b) => new Date(b.date) - new Date(a.date));
    synced = new Map(items.map((r) => [r.id, { ...r }]));
    localStorage.setItem(KEY, JSON.stringify(items));
    return items;
  },
  clear() {
    synced = new Map();
    localStorage.removeItem(KEY);
  },
  async sync(list) {
    const now = new Map(list.map((r) => [r.id, r])), jobs = [];
    for (const r of list) {
      const old = synced.get(r.id);
      if (!old) jobs.push(client.models.ExerciseRecord.create(toCloud(r)));
      else if (!same(old, r)) jobs.push(client.models.ExerciseRecord.update(toCloud(r)));
    }
    for (const id of synced.keys()) if (!now.has(id)) jobs.push(client.models.ExerciseRecord.delete({ id }));
    synced = new Map(list.map((r) => [r.id, { ...r }]));
    const results = await Promise.allSettled(jobs);
    const failed = results.filter((x) => x.status === 'rejected' || x.value?.errors?.length);
    if (failed.length) {
      console.error(failed);
      alert('일부 기록을 클라우드에 저장하지 못했어요. 인터넷 연결을 확인해 주세요.');
    }
  }
};

// ---------- 처방·메시지 계정 간 동기화 ----------
// 화면 코드는 그대로 두고, shared.js의 처방(fitcore-rx)·메시지(fitcore-messages) 저장소를 AWS와 맞춘다.
// 환자 계정: 자기 데이터를 데모 환자 ID 'p1' 자리에 불러온다.
// 의료진 계정: 실제 환자 계정을 'u:<프로필 id>' 환자로 목록에 추가한다.
const RX_LOCAL = 'fitcore-rx';
const MSG_LOCAL = 'fitcore-messages';
const readLocal = (k, fallback) => { try { return JSON.parse(localStorage.getItem(k) || 'null') ?? fallback; } catch { return fallback; } };
const clone = (v) => JSON.parse(JSON.stringify(v));

async function listModel(model, options = {}) {
  let items = [], nextToken = null;
  do {
    const res = await client.models[model].list({ ...options, nextToken, limit: 200 });
    if (res.errors?.length) throw new Error(res.errors[0].message);
    items = items.concat(res.data);
    nextToken = res.nextToken;
  } while (nextToken);
  return items;
}
const check = (res) => { if (res?.errors?.length) throw new Error(res.errors[0].message); return res?.data; };
const cloudFail = (e) => { console.error(e); alert('클라우드에 저장하지 못했어요. 인터넷 연결을 확인해 주세요.'); };

window.fcCloud = {
  role: null,
  selfOwner: null,
  pidOwner: new Map(),
  timer: null,

  ownerOf(pid) {
    if (this.role === 'patient') return pid === DEMO_PATIENT_ID ? this.selfOwner : null;
    return this.pidOwner.get(pid) || null;
  },

  async initPatient(email) {
    this.reset();
    let profile = (await listModel('PatientProfile'))[0];
    if (!profile) profile = check(await client.models.PatientProfile.create({ email, displayName: email.split('@')[0] }));
    this.role = 'patient';
    this.selfOwner = profile.owner;
    patient(DEMO_PATIENT_ID).name = profile.displayName || email.split('@')[0];
    await this.pull();
    this.startRefresh();
  },

  async initDoctor() {
    this.reset();
    this.role = 'doctor';
    for (const pr of await listModel('PatientProfile')) {
      const pid = 'u:' + pr.id;
      this.pidOwner.set(pid, pr.owner);
      if (!PATIENTS.some((p) => p.id === pid)) {
        PATIENTS.push({ id: pid, name: pr.displayName || pr.email.split('@')[0], age: '-', sex: '-', no: '실제 계정', diagnosis: '실제 계정 환자', week: 1, weeks: 8, status: '양호', adherence: 0, logs: [], cloud: true });
      }
    }
    await this.pull();
    this.startRefresh();
  },

  // AWS → 브라우저 저장소
  async pull() {
    if (!this.role) return;
    const ownerToPid = new Map();
    if (this.role === 'patient') ownerToPid.set(this.selfOwner, DEMO_PATIENT_ID);
    else for (const [pid, owner] of this.pidOwner) ownerToPid.set(owner, pid);

    const [rxItems, msgItems] = await Promise.all([listModel('Prescription'), listModel('Message')]);

    const allRx = clone(readLocal(RX_LOCAL, RX_DEFAULT));
    for (const pid of ownerToPid.values()) allRx[pid] = [];
    for (const r of rxItems) {
      const pid = ownerToPid.get(r.patientOwner);
      if (pid) allRx[pid].push({ id: r.exerciseId, sets: r.sets, reps: r.reps, perWeek: r.perWeek, note: r.note || '', date: r.prescribedAt });
    }
    localStorage.setItem(RX_LOCAL, JSON.stringify(allRx));

    const allMsg = clone(readLocal(MSG_LOCAL, MSG_DEFAULT));
    for (const pid of ownerToPid.values()) allMsg[pid] = { unreadDoctor: 0, unreadPatient: 0, msgs: [] };
    for (const m of msgItems.sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt))) {
      const pid = ownerToPid.get(m.patientOwner);
      if (!pid) continue;
      const t = allMsg[pid];
      t.msgs.push({ from: m.sender, text: m.text || '', date: m.sentAt, ...(m.exerciseId ? { ex: m.exerciseId } : {}) });
      if (m.sender === 'patient' && !m.readByDoctor) t.unreadDoctor++;
      if (m.sender === 'doctor' && !m.readByPatient) t.unreadPatient++;
    }
    localStorage.setItem(MSG_LOCAL, JSON.stringify(allMsg));
  },

  // shared.js의 rxSave()가 호출: 바뀐 실제 환자의 처방만 AWS에 다시 쓴다 (의료진만 가능).
  onRxSave(prev, all) {
    if (this.role !== 'doctor') return;
    for (const pid of this.pidOwner.keys()) {
      if (JSON.stringify(prev[pid] || []) !== JSON.stringify(all[pid] || [])) this.saveRx(pid, all[pid] || []).catch(cloudFail);
    }
  },
  async saveRx(pid, list) {
    const owner = this.ownerOf(pid);
    if (!owner) return;
    const old = await listModel('Prescription', { filter: { patientOwner: { eq: owner } } });
    for (const r of old) check(await client.models.Prescription.delete({ id: r.id }));
    for (const r of list) {
      check(await client.models.Prescription.create({ patientOwner: owner, exerciseId: r.id, sets: r.sets, reps: r.reps, perWeek: r.perWeek, note: r.note || '', prescribedAt: r.date || new Date().toISOString() }));
    }
  },

  // shared.js의 msgSend()가 호출
  sendMessage(pid, from, text, exId) {
    const owner = this.ownerOf(pid);
    if (!owner) return;
    client.models.Message.create({ patientOwner: owner, sender: from, text: text || '', exerciseId: exId || null, sentAt: new Date().toISOString(), readByDoctor: from === 'doctor', readByPatient: from === 'patient' })
      .then(check).catch(cloudFail);
  },

  // shared.js의 msgMarkRead()가 호출
  markRead(pid, who) {
    const owner = this.ownerOf(pid);
    if (!owner) return;
    const field = who === 'doctor' ? 'readByDoctor' : 'readByPatient';
    const other = who === 'doctor' ? 'patient' : 'doctor';
    listModel('Message', { filter: { patientOwner: { eq: owner } } })
      .then((items) => Promise.all(items.filter((m) => m.sender === other && !m[field]).map((m) => client.models.Message.update({ id: m.id, [field]: true }))))
      .catch(console.error);
  },

  // 다른 기기에서 온 처방·메시지를 15초마다 가져온다. 입력 중일 때는 화면을 다시 그리지 않는다.
  startRefresh() {
    clearInterval(this.timer);
    this.timer = setInterval(async () => {
      try {
        await this.pull();
        const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
        if (!typing && !document.body.classList.contains('auth') && typeof render === 'function') render();
      } catch (e) { console.error(e); }
    }, 15000);
  },

  // 로그아웃: 다른 계정의 데이터가 같은 브라우저에 남지 않게 지운다.
  reset() {
    clearInterval(this.timer);
    this.role = null;
    this.selfOwner = null;
    this.pidOwner = new Map();
    for (let i = PATIENTS.length - 1; i >= 0; i--) if (PATIENTS[i].cloud) PATIENTS.splice(i, 1);
    localStorage.removeItem(RX_LOCAL);
    localStorage.removeItem(MSG_LOCAL);
  }
};

// ---------- 페이지를 열 때: 로그인 상태 확인 ----------
getCurrentUser()
  .then(async () => {
    window.fcUserEmail = await window.fcAuth.email();
    window.fcIsDoctor = await window.fcAuth.isDoctor();
    try { await window.fcData.load(); } catch (e) { console.error(e); alert('기록을 불러오지 못했어요.'); }
    // 브라우저 저장값을 'doctor'로 바꿔도 DOCTOR 그룹이 아니면 환자 화면으로 되돌린다.
    if (localStorage.getItem('fitcore-role') === 'doctor' && !window.fcIsDoctor) {
      try { localStorage.setItem('fitcore-role', 'patient'); } catch {}
      try { await window.fcCloud.initPatient(window.fcUserEmail); } catch (e) { console.error(e); }
      document.body.classList.remove('doctor-mode');
      if (typeof go === 'function' && !document.body.classList.contains('auth')) go('home');
      // 환자 화면이 먼저 그려진 뒤 안내창을 띄운다.
      setTimeout(() => alert('이 계정에는 의료진 권한이 없어 환자 화면으로 이동했어요.'), 100);
      return;
    }
    try {
      if (localStorage.getItem('fitcore-role') === 'doctor') await window.fcCloud.initDoctor();
      else await window.fcCloud.initPatient(window.fcUserEmail);
    } catch (e) { console.error(e); }
    if (typeof render === 'function' && !document.body.classList.contains('auth')) render();
  })
  .catch(() => {
    window.fcData.clear();
    window.fcCloud.reset();
    try { localStorage.removeItem('fitcore-role'); } catch {}
    document.body.classList.remove('doctor-mode');
    if (typeof showLogin === 'function') showLogin();
  });

