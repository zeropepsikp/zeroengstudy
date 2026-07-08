# 🚀 ZERO 영어 스터디

**내장 커리큘럼으로 완주하는 3개월 영어 회화 마스터 시스템.**
커리큘럼·어휘·문법·발음 훈련이 전부 앱에 내장되어 있어 **API 키 없이도 모든 학습이 가능**하고, Gemini 키를 넣으면 AI 회화 파트너·AI 분석이 추가로 열립니다. (GitHub Pages 정적 웹앱)

## ✨ 내장 학습 시스템

| 모듈 | 내용 |
| --- | --- |
| 🧭 3개월 로드맵 | 12주 커리큘럼(월별 테마·주별 목표·과제) + 현재 위치(Day N) 자동 표시 |
| ✅ 오늘의 루틴 | 학습 시간(30/60/90/120분)에 맞춘 시간대별 훈련 체크리스트, 매일 자동 생성 |
| 📚 어휘 트레이닝 | **핵심 어휘 500개**(25유닛): 뜻·회화 예문·번역 내장, 학습 흐름 = 익히기 → 플래시카드 → 퀴즈 |
| 🔁 간격 반복(SRS) | 라이트너 5상자: 1→2→4→7→15일 간격 자동 복습 스케줄링 |
| 🧩 실전 문법 | **24패턴**(회화 빈출 순): 요약 설명 + 예문 3개(TTS) + 즉석 퀴즈 3문항(해설) |
| 🎙️ 말하기·발음 | 쉐도잉 30문장(3단계·속도 조절 TTS), 한국인 맞춤 발음 클리닉 8유닛(R/L·F/P·B/V·TH·강세·연음…) |
| 🎭 롤플레이 | 실전 대본 8개(카페·공항·호텔·식당·쇼핑·스몰토크·전화·길찾기) — "내 대사 가리기" 연습 모드 |
| 🎯 데일리 미션 | 30개 말하기 미션이 Day 순환 — 매일 30초 이상 소리 내어 말하기 |
| 🌊 몰입 환경 | 레벨별 콘텐츠 큐레이션 + 능동적 활용법 6가지 + 주간 루틴 + 내 문장함(수집) |
| 📈 진도 관리 | 스트릭(연속 학습)·Day 카운터·SRS 통계·말하기 시간 차트·일별 기록 |
| 💬 AI 회화 파트너 | *(선택·Gemini)* 주차 주제 기반 프리토킹 + 문장마다 한국어 교정 팁 |
| 🤖 AI 학습 분석 | *(선택·Gemini)* 기록 기반 주간 분석과 다음 액션 제안 |

모든 영어 문장에 **원어민 음성(브라우저 내장 TTS, 무료)** 버튼이 붙어 있습니다.

## 🛠️ 기술 구성

- **호스팅**: GitHub Pages (빌드 도구 없음, 순수 ES 모듈)
- **인증**: Firebase Authentication (Google 로그인)
- **DB**: Cloud Firestore — 프로필·학습 상태(SRS/체크리스트/스트릭, 기기 간 동기화)·일별 기록
- **음성**: Web Speech API (SpeechSynthesis)
- **AI(선택)**: Google Gemini API

```
index.html                 진입점
css/styles.css             스타일
js/app.js                  컨트롤러(인증·라우팅·대시보드·설정)
js/ui.js                   공통 UI(셸·토스트)
js/state.js                학습 상태 + SRS 엔진 (localStorage + Firestore 동기화)
js/store.js                Firebase 접근 계층
js/tts.js                  음성 합성
js/gemini.js, prompts.js   AI 보조 기능
js/markdown.js             경량 마크다운 렌더러
js/data/vocab.js           어휘 500 (25유닛)
js/data/grammar.js         문법 24패턴 + 퀴즈
js/data/speaking.js        쉐도잉·발음·롤플레이·미션
js/data/roadmap.js         12주 커리큘럼 + 일일 루틴
js/data/immersion.js       몰입 환경 큐레이션
js/views/*.js              화면별 뷰 7개
.github/workflows/deploy.yml   Pages 배포 (+ GEMINY_KEY 주입)
```

## 🚀 배포 방법

1. **Pages 소스**: Settings → Pages → Source = **GitHub Actions**
2. **(선택) Gemini 키**: Settings → Secrets and variables → Actions → `GEMINY_KEY` 등록
   — 없어도 앱은 완전히 동작하며, AI 기능만 비활성화됩니다. 사용자가 앱 설정에서 직접 키를 넣을 수도 있어요.
3. **푸시 → 자동 배포**: `main` 또는 `claude/language-learning-webapp-usccfq` 브랜치 푸시 시 배포.
   주소: `https://<사용자명>.github.io/zeroengstudy/`
4. **Firebase 콘솔 (최초 1회)**:
   - Authentication → Sign-in method → **Google 사용 설정**
   - Authentication → Settings → **Authorized domains**에 `<사용자명>.github.io` 추가
   - **Firestore Database** 생성 후 보안 규칙:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
      match /{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
    }
  }
}
```

## ⚠️ 보안 참고

- Firebase 설정값은 공개되어도 안전합니다(승인 도메인 + Firestore 규칙으로 보호).
- `GEMINY_KEY`로 주입한 Gemini 키는 클라이언트 JS에 노출됩니다. 무료 개인용은 무난하지만 [AI Studio](https://aistudio.google.com/app/apikey)에서 할당량 제한을 걸어 두세요. 우려되면 시크릿을 비워 두고 사용자별 키 입력 방식으로 운영하세요.

## 💻 로컬 실행

```bash
python3 -m http.server 8000   # ES 모듈 때문에 file:// 로는 동작하지 않음
```

## 📖 학습 설계 원칙

1. **말하기 먼저** — 전체 루틴의 40% 이상이 소리 내는 활동(쉐도잉·미션·롤플레이).
2. **간격 반복** — 잊기 직전에 다시 만나는 SRS로 500단어를 장기 기억으로.
3. **작게, 매일** — 스트릭·체크리스트·Day 카운터로 습관화를 강제.
4. **문맥 중심** — 모든 단어·문법에 회화 예문, 모든 예문에 발음이 붙습니다.
