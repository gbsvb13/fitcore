import { Amplify } from 'aws-amplify';
import { signUp, confirmSignUp, resendSignUpCode, signIn, signOut, getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
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
  email: async () => (await fetchUserAttributes()).email
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

// ---------- 페이지를 열 때: 로그인 상태 확인 ----------
getCurrentUser()
  .then(async () => {
    window.fcUserEmail = await window.fcAuth.email();
    try { await window.fcData.load(); } catch (e) { console.error(e); alert('기록을 불러오지 못했어요.'); }
    if (typeof render === 'function' && !document.body.classList.contains('auth')) render();
  })
  .catch(() => {
    window.fcData.clear();
    try { localStorage.removeItem('fitcore-role'); } catch {}
    document.body.classList.remove('doctor-mode');
    if (typeof showLogin === 'function') showLogin();
  });

