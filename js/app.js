// 앱 컨트롤러 — 인증, 온보딩, 라우팅, 대시보드, 설정
import { onAuth, login, logout, getProfile, saveProfile } from "./store.js";
import { el, esc, toast, go, shell, setShellCtx, pageHead } from "./ui.js";
import { initState, S, dayNumber, streak, srsStats, toggleChecklist, todayChecklist, resetProgram } from "./state.js";
import { routineFor, weekInfo } from "./data/roadmap.js";
import { VOCAB_UNITS } from "./data/vocab.js";
import { GRAMMAR_PATTERNS } from "./data/grammar.js";
import { DAILY_MISSIONS } from "./data/speaking.js";
import { getGeminiKey, setGeminiKey, GEMINI_MODEL, setGeminiModel } from "./config.js";

import { renderVocabList, renderVocabUnit, renderVocabReview } from "./views/vocabView.js";
import { renderGrammarList, renderGrammarLesson } from "./views/grammarView.js";
import { renderSpeaking } from "./views/speakingView.js";
import { renderRoadmap } from "./views/roadmapView.js";
import { renderImmersion } from "./views/immersionView.js";
import { renderProgress } from "./views/progressView.js";
import { renderChat } from "./views/chatView.js";

const app = document.getElementById("app");
let USER = null;
let PROFILE = null;

// 모듈(및 Firebase CDN) 로딩 성공 신호 — index.html의 타임아웃 안내를 해제
window.__booted = true;

// ── 인증 흐름 ─────────────────────────────────────────
onAuth(async (user) => {
  USER = user;
  if (!user) return renderLogin();
  try {
    PROFILE = await getProfile(user.uid);
  } catch (_) {
    PROFILE = null;
  }
  await initState(user.uid);
  setShellCtx({ user: USER, profile: PROFILE, onLogout: () => logout() });
  if (!PROFILE) renderOnboarding();
  else route();
});

window.addEventListener("hashchange", () => {
  if (USER && PROFILE) route();
});

// ── 라우팅 ────────────────────────────────────────────
function route() {
  setShellCtx({ user: USER, profile: PROFILE, onLogout: () => logout() });
  const [view, p1] = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  switch (view) {
    case "roadmap": return renderRoadmap();
    case "vocab":
      if (p1 === "review") return renderVocabReview();
      if (p1 === "unit") {
        const id = location.hash.split("/").pop();
        return renderVocabUnit(id);
      }
      return renderVocabList();
    case "grammar": return p1 ? renderGrammarLesson(p1) : renderGrammarList();
    case "speaking": return renderSpeaking(p1 || "shadow");
    case "immersion": return renderImmersion();
    case "progress": return renderProgress(USER, PROFILE);
    case "chat": return renderChat(PROFILE);
    case "settings": return renderSettings();
    default: return renderDashboard();
  }
}

// ── 로그인 ────────────────────────────────────────────
function renderLogin() {
  app.innerHTML = "";
  const v = el(`
    <div class="login">
      <div class="login-card">
        <div class="logo">🚀</div>
        <h1>ZERO 영어 스터디</h1>
        <p class="tag">내장 커리큘럼으로 완주하는 3개월 회화 마스터 시스템</p>
        <ul class="feat">
          <li>🧭 12주 로드맵 + 매일 자동 생성되는 훈련 루틴</li>
          <li>📚 핵심 어휘 500 · 간격 반복(SRS) 복습</li>
          <li>🧩 실전 문법 24패턴 + 즉석 퀴즈</li>
          <li>🎙️ 쉐도잉·발음 클리닉·롤플레이 (음성 내장)</li>
          <li>📈 스트릭 & 진도 추적, AI 회화 파트너</li>
        </ul>
        <button id="loginBtn" class="btn-google"><span>G</span> Google로 시작하기</button>
        <p class="fine">로그인하면 학습 기록이 모든 기기에서 동기화됩니다.</p>
      </div>
    </div>`);
  v.querySelector("#loginBtn").onclick = async () => {
    try { await login(); } catch (e) { toast("로그인 실패: " + e.message, true); }
  };
  app.appendChild(v);
}

// ── 온보딩 ────────────────────────────────────────────
function renderOnboarding() {
  app.innerHTML = "";
  const v = el(`
    <div class="onboard">
      <div class="onboard-card">
        <h1>학습 프로필 설정</h1>
        <p class="sub">오늘이 3개월 프로그램의 Day 1이 됩니다. 딱 세 가지만 알려주세요.</p>
        <label>현재 실력
          <select id="ob-level">
            <option>완전 입문</option><option selected>초급</option>
            <option>중급</option><option>중상급</option><option>고급</option>
          </select>
        </label>
        <label>하루 학습 가능 시간
          <select id="ob-time">
            <option>30분</option><option selected>60분</option>
            <option>90분</option><option>120분</option>
          </select>
        </label>
        <label>학습 목표
          <input id="ob-goal" placeholder="예: 여행 회화, 외국인 동료와 스몰토크" value="일상 자유 회화">
        </label>
        <button id="ob-save" class="btn-primary">Day 1 시작하기 🚀</button>
      </div>
    </div>`);
  v.querySelector("#ob-save").onclick = async () => {
    const profile = {
      targetLanguage: "영어",
      currentLevel: v.querySelector("#ob-level").value,
      dailyTime: v.querySelector("#ob-time").value,
      goal: v.querySelector("#ob-goal").value.trim() || "일상 회화",
      environment: "독학",
    };
    try {
      await saveProfile(USER.uid, profile);
      PROFILE = profile;
      toast("Day 1 시작! 오늘의 루틴을 확인하세요 🎉");
      go("#/dashboard");
      route();
    } catch (e) {
      toast("저장 실패: " + e.message, true);
    }
  };
  app.appendChild(v);
}

// ── 대시보드 ──────────────────────────────────────────
function renderDashboard() {
  const day = dayNumber();
  const { week, phase, weekData } = weekInfo(day);
  const stats = srsStats();
  const routine = routineFor(PROFILE.dailyTime);
  const checked = todayChecklist();
  const doneCount = Object.keys(checked).length;
  const totalMin = routine.reduce((s, r) => s + r[0], 0);
  const missionIdx = (day - 1) % DAILY_MISSIONS.length;

  const routineHtml = routine
    .map(
      ([min, name, desc, link], i) => `
    <div class="rt-item ${checked[i] ? "ck" : ""}">
      <button class="rt-check" data-i="${i}">${checked[i] ? "✅" : "⬜"}</button>
      <span class="rt-min">${min}분</span>
      <div class="rt-body"><b>${esc(name)}</b><small>${esc(desc)}</small></div>
      <a class="rt-go" href="${link}">이동 →</a>
    </div>`
    )
    .join("");

  const content = el(`
    <div class="view">
      <header class="page-head dash-head">
        <div>
          <h1>Day ${day} — ${esc(weekData.focus)}</h1>
          <p>${phase.month}개월차 「${esc(phase.theme)}」 · ${Math.min(week, 12)}주차</p>
        </div>
        <div class="dash-badges">
          <div class="badge-stat">🔥 <b>${streak()}</b>일 연속</div>
          <div class="badge-stat">📚 <b>${stats.total}</b>단어</div>
        </div>
      </header>

      ${stats.due ? `
      <a class="due-alert" href="#/vocab/review">
        🔁 <b>복습 대기 ${stats.due}단어</b> — 잊기 전에 5분만 투자하세요 →
      </a>` : ""}

      <div class="card-block">
        <div class="analysis-head">
          <h3>✅ 오늘의 훈련 루틴 (${PROFILE.dailyTime} · 총 ${totalMin}분) — ${doneCount}/${routine.length} 완료</h3>
        </div>
        <div class="progress-track"><div class="progress-fill" style="width:${Math.round((doneCount / routine.length) * 100)}%"></div></div>
        <div class="routine-list">${routineHtml}</div>
      </div>

      <div class="dash-two">
        <div class="card-block">
          <h3>🎯 오늘의 말하기 미션</h3>
          <p class="mission-preview">${esc(DAILY_MISSIONS[missionIdx])}</p>
          <a class="btn-primary sm" href="#/speaking/mission">미션 하러 가기 →</a>
        </div>
        <div class="card-block">
          <h3>📌 이번 주 할 일</h3>
          <ul class="mini-tasks">${weekData.tasks.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
          <a class="btn-ghost inline sm-btn" href="#/roadmap">전체 로드맵 보기</a>
        </div>
      </div>

      <div class="grid mini">
        <a class="card" href="#/vocab"><div class="card-icon">📚</div><h3>어휘 트레이닝</h3><p class="card-desc">${Object.keys(S.unitsDone).length}/${VOCAB_UNITS.length} 유닛 완료</p></a>
        <a class="card" href="#/grammar"><div class="card-icon">🧩</div><h3>실전 문법</h3><p class="card-desc">${Object.keys(S.grammarDone).length}/${GRAMMAR_PATTERNS.length} 패턴 완료</p></a>
        <a class="card" href="#/speaking"><div class="card-icon">🎙️</div><h3>말하기·발음</h3><p class="card-desc">쉐도잉 · 발음 · 롤플레이</p></a>
        <a class="card" href="#/chat"><div class="card-icon">💬</div><h3>AI 회화</h3><p class="card-desc">${getGeminiKey() ? "프리토킹 연습 가능" : "설정에서 키 등록 필요"}</p></a>
      </div>
    </div>`);
  shell("dashboard", content);

  content.querySelectorAll(".rt-check").forEach((b) => {
    b.onclick = () => {
      toggleChecklist(+b.dataset.i);
      renderDashboard();
    };
  });
}

// ── 설정 ──────────────────────────────────────────────
function renderSettings() {
  const keyState = getGeminiKey()
    ? `<span class="ok">✅ 설정됨</span>`
    : `<span class="no">❌ 미설정 (선택 기능)</span>`;
  const content = el(`
    <div class="view">
      ${pageHead("⚙️ 설정", "")}
      <div class="card-block">
        <h3>학습 프로필</h3>
        <label>현재 실력
          <select id="s-level">
            ${["완전 입문", "초급", "중급", "중상급", "고급"].map((l) => `<option ${l === PROFILE.currentLevel ? "selected" : ""}>${l}</option>`).join("")}
          </select>
        </label>
        <label>하루 학습 시간 (대시보드 루틴이 바뀝니다)
          <select id="s-time">
            ${["30분", "60분", "90분", "120분"].map((t) => `<option ${t === PROFILE.dailyTime ? "selected" : ""}>${t}</option>`).join("")}
          </select>
        </label>
        <label>학습 목표<input id="s-goal" value="${esc(PROFILE.goal)}"></label>
        <button id="saveProfile" class="btn-primary">프로필 저장</button>
      </div>

      <div class="card-block">
        <h3>Gemini API 키 ${keyState}</h3>
        <p class="muted">AI 회화 파트너·AI 분석에만 사용됩니다. 커리큘럼·어휘·문법·쉐도잉은 키 없이 전부 동작해요.<br>배포 시 <code>GEMINY_KEY</code> 시크릿이 자동 적용되며, 직접 입력한 키는 이 브라우저에만 저장됩니다.</p>
        <label>API 키<input id="s-key" type="password" placeholder="AIza..."></label>
        <label>모델<input id="s-model" value="${esc(GEMINI_MODEL)}"></label>
        <button id="saveKey" class="btn-primary">API 설정 저장</button>
        <p class="fine"><a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener">Google AI Studio에서 무료 키 발급받기 →</a></p>
      </div>

      <div class="card-block">
        <h3>프로그램 관리</h3>
        <p class="muted">시작일: <b>${S.startDate}</b> (Day ${dayNumber()}) · 3개월 프로그램을 처음부터 다시 시작할 수 있습니다. 학습 기록(SRS·완료 유닛)이 초기화됩니다.</p>
        <button id="resetBtn" class="btn-ghost inline danger">프로그램 초기화 (Day 1부터 다시)</button>
      </div>
    </div>`);
  shell("settings", content);

  content.querySelector("#saveProfile").onclick = async () => {
    const profile = {
      ...PROFILE,
      currentLevel: content.querySelector("#s-level").value,
      dailyTime: content.querySelector("#s-time").value,
      goal: content.querySelector("#s-goal").value.trim() || "일상 회화",
    };
    try {
      await saveProfile(USER.uid, profile);
      PROFILE = profile;
      toast("프로필이 저장되었습니다 ✅");
    } catch (e) {
      toast("저장 실패: " + e.message, true);
    }
  };

  content.querySelector("#saveKey").onclick = () => {
    const key = content.querySelector("#s-key").value.trim();
    const model = content.querySelector("#s-model").value.trim();
    if (key) setGeminiKey(key);
    if (model) setGeminiModel(model);
    toast("API 설정이 저장되었습니다 ✅");
    renderSettings();
  };

  content.querySelector("#resetBtn").onclick = () => {
    if (confirm("정말 초기화할까요? SRS·완료 기록이 모두 지워지고 오늘이 Day 1이 됩니다.")) {
      resetProgram();
      toast("Day 1부터 다시 시작합니다 💪");
      go("#/dashboard");
      route();
    }
  };
}
