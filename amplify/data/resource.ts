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
      recordedAt: a.datetime().required(),
      owner: a.string().authorization((allow) => [allow.owner().to(['read', 'delete'])]),
    })
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});