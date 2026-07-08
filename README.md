# 🚀 ZERO 영어 스터디

AI 언어 코치와 함께하는 **3개월 회화 마스터 시스템**.
Google 로그인 · Firebase(Firestore) 데이터 저장 · Gemini AI 기반 맞춤 학습을 제공하는 정적 웹앱(GitHub Pages)입니다.

## ✨ 주요 기능

7개의 학습 모듈이 학습자 프로필(목표 언어·실력·시간·목표·환경)에 맞춰 AI로 자료를 생성합니다.

| 모듈 | 설명 |
| --- | --- |
| 🧭 3개월 마스터 운영체제 | 완전한 학습 시스템 & 로드맵 설계 |
| 🗣️ 매일 회화 집중 훈련 | 하루 60~120분 고강도 플랜(시간대별) |
| 📚 핵심 어휘 초고속 습득 | 빈출 단어 + 예문 + 간격 반복 |
| 🎙️ 말하기 & 발음 향상 | 쉐도잉·롤플레이·발음 교정·미션 |
| 🌊 몰입형 언어 환경 구축 | 유튜브·팟캐스트·영화·음악 큐레이션 |
| 🧩 실전 문법 마스터 | 빈출 패턴 중심 문법 + 연습 |
| 📈 학습 진도 관리 | 기록·차트·AI 분석 |

추가로 **💬 AI 회화 파트너**(실시간 대화 + 교정/팁)가 포함됩니다.

## 🛠️ 기술 구성

- **호스팅**: GitHub Pages (정적, 빌드 도구 없음 · 순수 ES 모듈)
- **인증**: Firebase Authentication (Google 로그인)
- **DB**: Cloud Firestore (프로필 / 모듈 결과 / 진도 기록)
- **AI**: Google Gemini API (`gemini-2.0-flash` 기본)

## 🚀 배포 방법 (GitHub Pages)

### 1) Pages 소스 설정
저장소 **Settings → Pages → Build and deployment → Source** 를 **GitHub Actions** 로 설정합니다.

### 2) Gemini API 키 등록 (권장)
**Settings → Secrets and variables → Actions → New repository secret**
- Name: `GEMINY_KEY`
- Value: [Google AI Studio](https://aistudio.google.com/app/apikey)에서 발급한 무료 키

> 배포 시 워크플로가 `js/config.js`의 플레이스홀더를 이 시크릿 값으로 치환합니다.
> 시크릿을 등록하지 않으면, 사용자가 앱 **설정** 화면에서 직접 키를 입력해야 합니다(브라우저 로컬 저장).

### 3) 푸시 → 자동 배포
`main` 또는 `claude/language-learning-webapp-usccfq` 브랜치에 푸시하면
`.github/workflows/deploy.yml` 이 실행되어 Pages로 배포됩니다.
배포 후 주소: `https://<사용자명>.github.io/zeroengstudy/`

### 4) Firebase 콘솔 설정 (최초 1회)
Firebase 프로젝트 `zero-engapp`에서:
- **Authentication → Sign-in method → Google** 사용 설정
- **Authentication → Settings → Authorized domains** 에 다음 추가
  - `<사용자명>.github.io`
- **Firestore Database** 생성(프로덕션 모드) 후 아래 보안 규칙 적용:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

## ⚠️ 보안 참고

- **Firebase 설정값**은 공개되어도 안전합니다(도메인 제한 + Firestore 규칙으로 보호).
- **Gemini API 키**는 클라이언트 사이드에서 사용되므로, `GEMINY_KEY`로 주입하면 배포된 사이트의 소스에 노출될 수 있습니다.
  - 무료 티어 개인용으로는 무난하지만, [Google AI Studio](https://aistudio.google.com/app/apikey)에서 **키 사용량 제한/할당량**을 설정하는 것을 권장합니다.
  - 노출이 우려되면 시크릿을 비워 두고, 각 사용자가 앱 설정에서 자신의 키를 입력하도록 운영할 수 있습니다.

## 💻 로컬 실행

```bash
# 정적 서버로 실행 (모듈 import 때문에 file:// 로는 동작하지 않음)
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000 접속 후, 설정 화면에서 Gemini 키 입력
```

## 📁 구조

```
index.html            진입점
css/styles.css        스타일
js/config.js          Firebase/Gemini 설정 (키 플레이스홀더)
js/store.js           Firebase 인증 + Firestore 접근
js/gemini.js          Gemini API 호출
js/prompts.js         7개 모듈 프롬프트 정의
js/markdown.js        경량 마크다운 렌더러
js/app.js             앱 컨트롤러(라우팅/화면)
.github/workflows/deploy.yml   Pages 배포 + 키 주입
```
