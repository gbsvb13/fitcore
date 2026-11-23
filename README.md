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
- 환자/의료진 역할은 화면 선택 방식이며, 실제 권한 분리(Cognito 그룹)는 미구현
- 의료진 화면의 환자 데이터는 시연용 가상 데이터
- 처방·메시지는 아직 브라우저에 저장됨 (추후 DynamoDB 연동 필요)