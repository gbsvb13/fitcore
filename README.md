# FitCore – AWS 로그인 · 운동 기록 저장

## 구현 범위
1. AWS Cognito를 이용한 회원가입 · 이메일 인증 · 로그인 · 로그아웃
2. Amplify Gen 2 + DynamoDB를 통한 운동 기록 저장 · 조회 · 수정 · 삭제
3. 사용자별 접근 권한 설정 (`allow.owner()`): 본인 기록만 읽기·수정·삭제 가능
4. 기존 FITCORE 기록 화면(내 기록, 홈, 운동 상세)과 연동

※ 실제 의료정보가 아닌 가상 데이터로만 테스트했습니다.

## 사용 기술
- AWS Amplify Gen 2 (Cognito, AppSync, DynamoDB)
- 리전: Asia Pacific (Sydney) `ap-southeast-2`
- 프론트엔드: HTML/CSS/JavaScript + Vite

## 주요 파일
| 파일 | 역할 |
|---|---|
| `amplify/auth/resource.ts` | 이메일 로그인 설정 (Cognito) |
| `amplify/data/resource.ts` | `ExerciseRecord` 테이블 + 소유자 권한 규칙 |
| `js/aws.js` | Amplify 연결, 로그인 함수, DynamoDB 동기화 |
| `js/pages/login.js` | 역할 선택 · 로그인 · 회원가입 · 인증 화면 |
| `js/core.js` | `saveRecords()` 저장 시 DynamoDB 동기화 |

## 실행 방법
1. Node.js 20 이상, AWS CLI 설치
2. 각자 본인 AWS 계정으로 `aws configure` (리전: `ap-southeast-2`)
   - IAM 사용자에 `AmplifyBackendDeployFullAccess` 정책 필요
3. 패키지 설치
   ```
   npm install
   ```
4. 터미널 1: AWS 백엔드 실행 (처음 1회는 콘솔에서 리전 bootstrap 필요)
   ```
   npx ampx sandbox
   ```
   → `amplify_outputs.json` 생성
5. 터미널 2: 웹 실행
   ```
   npx vite
   ```
   → http://localhost:5173 접속
6. 프로젝트 종료 후 AWS 리소스 삭제: `npx ampx sandbox delete`

## 보안 주의
- AWS 접근 키 · 비밀번호는 GitHub에 올리지 않습니다 (키는 `~/.aws`에 저장됨).
- `amplify_outputs.json`, `.amplify/`, `node_modules/`는 `.gitignore`로 제외됩니다.

## 테스트 계정 2개를 통한 데이터 접근 통제 검증
테스트 계정 A, B를 만들어 각각 운동 기록을 저장한 뒤, B 계정으로 A의 기록에 접근을 시도했습니다.
4~6번은 앱을 거치지 않고 브라우저 콘솔에서 A의 기록 ID로 API를 직접 호출한 결과입니다.

| # | 테스트 | 기대 결과 | 실제 결과 |
|---|---|---|---|
| 1 | B 로그인 후 내 기록 확인 | A의 기록이 보이지 않음 | ✅ A의 기록 안 보임 |
| 2 | A 재로그인 후 확인 | A의 기록만 보임 | ✅ A의 기록만 보임 |
| 3 | DynamoDB 테이블 확인 | 두 기록의 owner 값이 다름 | ✅ 두 기록의 owner 다름 |
| 4 | B가 A의 기록 직접 조회 (`get`) | 거부됨 | ✅ `data: null`, 오류 반환 |
| 5 | B가 A의 기록 수정 시도 (`update`) | 거부됨 | ✅ `data: null`, 오류 반환 (거부) |
| 6 | B가 A의 기록 삭제 시도 (`delete`) | 거부됨 | ✅ `data: null`, 오류 반환 (거부) |
| 7 | A 재로그인 후 기록 확인 | 기록이 변경·삭제되지 않음 | ✅ 기록 변경·삭제 없음 |

## 구현 중 발생한 문제와 해결
| 문제 | 원인 | 해결 |
|---|---|---|
| IAM Identity Center 사용 불가 | 신규 무료 플랜 계정에서는 지원하지 않음 | IAM 사용자 + 액세스 키 사용 |
| `explicit deny in a service control policy` 오류 | 신규 계정은 지정된 리전(한국 주소 → Sydney)만 사용 가능 | 리전을 `ap-southeast-2`로 변경 |
| `region has not been bootstrapped` | 리전 최초 사용 시 1회 설정 필요 | Amplify 콘솔에서 Initialize setup 실행 |
| `npm.ps1 cannot be loaded` | PowerShell 스크립트 실행 제한 | VS Code 터미널을 Command Prompt로 변경 |
| 기록 불러오기 실패 | `data/resource.ts`가 기본 Todo 예시 그대로였음 | `ExerciseRecord` 모델로 교체 후 재배포 |
| owner 재지정 경고 | 소유자가 owner 필드를 바꿀 수 있음 | owner 필드를 read/delete만 허용 |
| 재로그인 시 기록 사라짐 | `saveRecords()`가 브라우저에만 저장 | DynamoDB 동기화(`fcData.sync`) 추가 |

## 한계 및 향후 과제
- 의료진 역할은 Cognito DOCTOR 그룹으로 확인함 (아래 "의료진 권한 분리" 참고). 의료진 데이터의 서버 측 접근 규칙은 처방·메시지 DynamoDB 연동 때 추가 예정
- 의료진 화면의 환자 데이터는 시연용 가상 데이터
- 처방·메시지는 아직 브라우저에 저장됨 (추후 DynamoDB 연동 필요)

## Cycle 3 사용자 피드백 반영 (2026-11-28)

1. 증상 악화·저림·운동 중단 기록 시 기록 완료 화면에서 다음 운동 버튼 대신 안전 안내 표시. 진단/처방은 하지 않음.
2. NRS는 기본값 없이 0~10 중 명시적 선택해야 저장 가능.
3. 증상 발생 부위·동작 선택 및 운동 중단 여부 저장, 기록 목록·의료진 데모 화면에 표시.
4. 걷기 기록은 세트/반복 대신 1~600분 시간 입력. 기존 DynamoDB의 필수 sets/reps 필드에는 호환용 1/1을 저장하되 UI에서 보이지 않음.
5. 의료진 운동 배정은 세트 1~10, 반복 1~50, 주간 빈도 1~7 정수만 허용.

**중요:** `amplify/data/resource.ts`에 새 선택형 필드가 추가되었습니다. AWS 연동 상태에서 사용하려면 백엔드 스키마를 배포한 후 새 `amplify_outputs.json`으로 빌드해야 합니다. 브라우저 localStorage에서는 즉시 사용할 수 있으나, 미배포 AWS 환경으로 보내면 새 필드가 저장되지 않을 수 있습니다. 기존 환자-의료진 시연용 처방/메시지 공유 및 서버 측 역할 분리 기능은 이 패치 범위 밖이며, 실제 환자 정보는 사용하지 마세요.

## 의료진 권한 분리 (Cognito DOCTOR 그룹)

- `amplify/auth/resource.ts`에 `DOCTOR` 그룹을 추가했습니다.
- 의료진으로 로그인하면 로그인 토큰의 `cognito:groups`에 `DOCTOR`가 있는지 확인합니다 (`fcAuth.isDoctor()`). 없으면 로그아웃하고 안내 문구를 보여줍니다.
- 브라우저 저장값(`fitcore-role`)을 `doctor`로 바꿔도, 페이지를 열 때 그룹을 다시 확인해 환자 화면으로 되돌립니다.
- 그룹 등록은 사용자가 할 수 없고 관리자가 직접 합니다.
  - AWS 콘솔: Cognito → 사용자 풀 → 그룹 → `DOCTOR` → 사용자 추가
  - CLI: `aws cognito-idp admin-add-user-to-group --user-pool-id <user_pool_id> --username <이메일> --group-name DOCTOR`
- 적용하려면 `npx ampx sandbox`로 백엔드를 다시 배포해야 합니다.
- 의료진 전용 서버 규칙은 아래 처방·메시지 모델에 `allow.groups(['DOCTOR'])`로 적용했습니다.

## 처방·메시지 계정 간 동기화 (DynamoDB)

- 모델: `PatientProfile`(환자 본인 작성, DOCTOR 읽기), `Prescription`(DOCTOR만 작성·수정, 해당 환자는 읽기), `Message`(해당 환자와 DOCTOR만 읽기·쓰기)
- 환자 계정으로 로그인하면 프로필이 만들어지고, 본인 처방·메시지를 AWS에서 불러옵니다.
- 의료진 계정에는 실제 환자 계정이 "이름 (실제 계정)"으로 환자 목록에 추가됩니다 (데모 환자 5명은 그대로).
- 처방 저장·메시지 전송·읽음 표시는 AWS에도 저장되고, 양쪽 화면은 15초마다 새로 불러옵니다.
- 시험 (2026-11-28, 서로 다른 브라우저 2개): 환자 계정 표시, 처방 3종 전달, 메시지 양방향 전달 모두 통과
- 한계: 환자 운동 기록(ExerciseRecord)은 본인만 볼 수 있어 의료진 화면에는 아직 표시되지 않습니다 (환자 동의 기반 공유는 후속 과제). 개인 운동 계획은 브라우저에만 저장됩니다.
