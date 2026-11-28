import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  ExerciseRecord: a
    .model({
      id: a.id().required(),
      exerciseId: a.string().required(),
      sets: a.integer().required(),
      reps: a.integer().required(),
      painBefore: a.integer().required(),
      painAfter: a.integer().required(),
      symptoms: a.string().array(),
      memo: a.string(),
      durationMinutes: a.integer(),
      symptomLocation: a.string(),
      triggerAction: a.string(),
      stoppedEarly: a.boolean(),
      recordedAt: a.datetime().required(),
      owner: a.string().authorization((allow) => [allow.owner().to(['read', 'delete'])]),
    })
    .authorization((allow) => [allow.owner()]),

  // 환자 프로필: 환자 본인이 로그인할 때 만든다. 의료진(DOCTOR)은 환자 목록을 보기 위해 읽기만 가능.
  PatientProfile: a
    .model({
      email: a.string().required(),
      displayName: a.string(),
      owner: a.string().authorization((allow) => [
        allow.owner().to(['read', 'delete']),
        allow.groups(['DOCTOR']).to(['read']),
      ]),
    })
    .authorization((allow) => [allow.owner(), allow.groups(['DOCTOR']).to(['read'])]),

  // 처방: 의료진만 만들고 고칠 수 있다. 해당 환자(patientOwner)는 읽기만 가능.
  Prescription: a
    .model({
      patientOwner: a.string().required(),
      exerciseId: a.string().required(),
      sets: a.integer().required(),
      reps: a.integer().required(),
      perWeek: a.integer().required(),
      note: a.string(),
      prescribedAt: a.datetime().required(),
    })
    .authorization((allow) => [
      allow.groups(['DOCTOR']),
      allow.ownerDefinedIn('patientOwner').to(['read']),
    ]),

  // 메시지: 해당 환자와 의료진만 읽고 쓸 수 있다. 읽음 표시는 update로 처리.
  Message: a
    .model({
      patientOwner: a.string().required(),
      sender: a.string().required(),
      text: a.string(),
      exerciseId: a.string(),
      sentAt: a.datetime().required(),
      readByDoctor: a.boolean(),
      readByPatient: a.boolean(),
    })
    .authorization((allow) => [
      allow.groups(['DOCTOR']),
      allow.ownerDefinedIn('patientOwner').to(['create', 'read', 'update']),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});