import { defineAuth } from '@aws-amplify/backend';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  // 의료진 권한: DOCTOR 그룹에 등록된 계정만 의료진 화면을 사용할 수 있다.
  // 그룹 등록은 관리자가 AWS 콘솔(또는 CLI)에서 직접 한다. 사용자가 스스로 선택할 수 없다.
  groups: ['DOCTOR'],
});
