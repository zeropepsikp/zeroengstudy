import {
  onAuth,
  login,
  logout,
  getProfile,
  saveProfile,
  saveModuleResult,
  getModuleResult,
  logProgress,
  getProgress,
} from "./store.js";
import { MODULES, getModule } from "./prompts.js";
import { generate, chat } from "./gemini.js";
import { renderMarkdown } from "./markdown.js";
import {
  getGeminiKey,
  setGeminiKey,
  GEMINI_MODEL,
  setGeminiModel,
} from "./config.js";

const app = document.getElementById("app");
let USER = null;
let PROFILE = null;

// 모듈(및 Firebase CDN) 로딩 성공 신호 — index.html의 타임아웃 안내를 해제
window.__booted = true;

// ── 유틸 ──────────────────────────────────────────────
const el = (html) => {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
};
const today = () => new Date().toISOString().slice(0, 10);

function toast(msg, isErr = false) {
  const t = el(`<div class="toast ${isErr ? "err" : ""}">${msg}</div>`);
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add("show"));
  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.remove(), 300);
  }, isErr ? 5000 : 2600);
}

// ── 인증 상태 ─────────────────────────────────────────
onAuth(async (user) => {
  USER = user;
  if (!user) {
    renderLogin();
    return;
  }
  try {
    PROFILE = await getProfile(user.uid);
  } catch (e) {
    PROFILE = null;
  }
  if (!PROFILE) renderOnboarding();
  else route();
});

window.addEventListener("hashchange", () => {
  if (USER && PROFILE) route();
});

// ── 라우팅 ────────────────────────────────────────────
function route() {
  const hash = location.hash.replace(/^#\/?/, "");
  const [view, param] = hash.split("/");
  if (!view || view === "dashboard") return renderDashboard();
  if (view === "module") return renderModule(param);
  if (view === "progress") return renderProgress();
  if (view === "chat") return renderChat();
  if (view === "settings") return renderSettings();
  renderDashboard();
}
const go = (h) => (location.hash = h);

// ── 로그인 화면 ────────────────────────────────────────
function renderLogin() {
  app.innerHTML = "";
  const v = el(`
    <div class="login">
      <div class="login-card">
        <div class="logo">🚀</div>
        <h1>ZERO 영어 스터디</h1>
        <p class="tag">AI 언어 코치와 함께하는 3개월 회화 마스터 시스템</p>
        <ul class="feat">
          <li>🧭 나에게 맞춘 3개월 학습 로드맵</li>
          <li>🗣️ 매일 회화·발음 고강도 훈련</li>
          <li>📚 핵심 어휘 · 실전 문법 · 몰입 환경</li>
          <li>📈 학습 진도 기록 & AI 분석</li>
        </ul>
        <button id="loginBtn" class="btn-google">
          <span>G</span> Google로 시작하기
        </button>
        <p class="fine">로그인하면 학습 데이터가 안전하게 저장됩니다.</p>
      </div>
    </div>`);
  v.querySelector("#loginBtn").onclick = async () => {
    try {
      await login();
    } catch (e) {
      toast("로그인 실패: " + e.message, true);
    }
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
        <p class="sub">더 정확한 맞춤 학습을 위해 알려주세요. 언제든 설정에서 변경할 수 있어요.</p>
        <label>목표 언어
          <input id="ob-lang" placeholder="예: 영어, 일본어, 스페인어" value="영어">
        </label>
        <label>현재 실력
          <select id="ob-level">
            <option>완전 입문</option><option selected>초급</option>
            <option>중급</option><option>중상급</option><option>고급</option>
          </select>
        </label>
        <label>하루 학습 가능 시간
          <select id="ob-time">
            <option>30분</option><option selected>60분</option>
            <option>90분</option><option>120분</option><option>120분 이상</option>
          </select>
        </label>
        <label>학습 목표
          <input id="ob-goal" placeholder="예: 여행 회화, 비즈니스 미팅, 원어민과 자유 대화" value="일상 자유 회화">
        </label>
        <label>학습 환경
          <select id="ob-env">
            <option selected>독학</option><option>학원 병행</option>
            <option>원어민 친구 있음</option><option>해외 거주/예정</option>
          </select>
        </label>
        <button id="ob-save" class="btn-primary">시작하기</button>
      </div>
    </div>`);
  v.querySelector("#ob-save").onclick = async () => {
    const profile = {
      targetLanguage: v.querySelector("#ob-lang").value.trim() || "영어",
      currentLevel: v.querySelector("#ob-level").value,
      dailyTime: v.querySelector("#ob-time").value,
      goal: v.querySelector("#ob-goal").value.trim() || "일상 회화",
      environment: v.querySelector("#ob-env").value,
    };
    try {
      await saveProfile(USER.uid, profile);
      PROFILE = profile;
      toast("프로필이 저장되었습니다 🎉");
      go("#/dashboard");
      route();
    } catch (e) {
      toast("저장 실패: " + e.message, true);
    }
  };
  app.appendChild(v);
}

// ── 공통 셸(사이드바) ──────────────────────────────────
function shell(activeId, content) {
  app.innerHTML = "";
  const nav = MODULES.map(
    (m) =>
      `<a href="#/module/${m.id}" class="nav-item ${
        activeId === m.id ? "active" : ""
      }"><span class="ni-icon">${m.icon}</span>${m.title}</a>`
  ).join("");

  const wrap = el(`
    <div class="shell">
      <aside class="sidebar">
        <div class="brand" data-go="#/dashboard">🚀 ZERO 영어</div>
        <div class="who">
          <img src="${USER.photoURL || ""}" onerror="this.style.display='none'" alt="">
          <div><b>${USER.displayName || "학습자"}</b><small>${
    PROFILE.targetLanguage
  } · ${PROFILE.currentLevel}</small></div>
        </div>
        <nav>
          <a href="#/dashboard" class="nav-item ${
            activeId === "dashboard" ? "active" : ""
          }"><span class="ni-icon">🏠</span>대시보드</a>
          ${nav}
          <a href="#/chat" class="nav-item ${
            activeId === "chat" ? "active" : ""
          }"><span class="ni-icon">💬</span>AI 회화 파트너</a>
          <a href="#/settings" class="nav-item ${
            activeId === "settings" ? "active" : ""
          }"><span class="ni-icon">⚙️</span>설정</a>
        </nav>
        <button id="logoutBtn" class="btn-ghost">로그아웃</button>
      </aside>
      <main class="content"></main>
      <button class="menu-toggle" id="menuToggle">☰</button>
    </div>`);

  wrap.querySelector(".content").appendChild(content);
  wrap.querySelector("#logoutBtn").onclick = () => logout();
  wrap.querySelector(".brand").onclick = () => go("#/dashboard");
  const sidebar = wrap.querySelector(".sidebar");
  wrap.querySelector("#menuToggle").onclick = () =>
    sidebar.classList.toggle("open");
  wrap.querySelectorAll(".nav-item").forEach((a) =>
    a.addEventListener("click", () => sidebar.classList.remove("open"))
  );
  app.appendChild(wrap);
}

// ── 대시보드 ──────────────────────────────────────────
function renderDashboard() {
  const cards = MODULES.map(
    (m) => `
    <a class="card" href="#/module/${m.id}">
      <div class="card-icon">${m.icon}</div>
      <h3>${m.title}</h3>
      <p class="card-short">${m.short}</p>
      <p class="card-desc">${m.desc}</p>
    </a>`
  ).join("");

  const content = el(`
    <div class="view">
      <header class="page-head">
        <h1>안녕하세요, ${USER.displayName?.split(" ")[0] || "학습자"}님 👋</h1>
        <p>오늘도 <b>${PROFILE.targetLanguage}</b> 실력을 키워볼까요? 원하는 학습 모듈을 선택하세요.</p>
      </header>
      <section class="quick">
        <a class="quick-btn" href="#/chat">💬 AI와 지금 회화 연습</a>
        <a class="quick-btn" href="#/progress">📈 오늘 학습 기록하기</a>
      </section>
      <div class="grid">${cards}</div>
    </div>`);
  shell("dashboard", content);
}

// ── 모듈 상세(생성) ────────────────────────────────────
async function renderModule(id) {
  const m = getModule(id);
  if (!m) return renderDashboard();
  if (m.id === "progress") return renderProgress();

  const content = el(`
    <div class="view">
      <header class="page-head">
        <button class="back" data-go="#/dashboard">← 대시보드</button>
        <h1>${m.icon} ${m.title}</h1>
        <p>${m.desc}</p>
      </header>
      <div class="module-actions">
        <button id="genBtn" class="btn-primary">✨ AI로 생성하기</button>
        <span class="hint">프로필: ${PROFILE.targetLanguage} · ${PROFILE.currentLevel} · 하루 ${PROFILE.dailyTime}</span>
      </div>
      <div id="output" class="output"><div class="empty">아직 생성된 내용이 없습니다. 위 버튼을 눌러 나만의 맞춤 자료를 만들어 보세요.</div></div>
    </div>`);
  shell(m.id, content);
  content.querySelector(".back").onclick = () => go("#/dashboard");

  const output = content.querySelector("#output");
  const genBtn = content.querySelector("#genBtn");

  // 저장된 결과 불러오기
  try {
    const saved = await getModuleResult(USER.uid, m.id);
    if (saved) {
      output.innerHTML = `<div class="md">${renderMarkdown(saved)}</div>`;
      genBtn.textContent = "🔄 다시 생성하기";
    }
  } catch (_) {}

  genBtn.onclick = async () => {
    genBtn.disabled = true;
    genBtn.textContent = "생성 중…";
    output.innerHTML = `<div class="loading"><div class="spinner"></div><p>AI 코치가 맞춤 자료를 준비하고 있어요…</p></div>`;
    try {
      const prompt = m.build(PROFILE);
      const text = await generate(prompt);
      output.innerHTML = `<div class="md">${renderMarkdown(text)}</div>`;
      await saveModuleResult(USER.uid, m.id, text);
      genBtn.textContent = "🔄 다시 생성하기";
      toast("생성 완료! 결과가 저장되었습니다.");
    } catch (e) {
      output.innerHTML = `<div class="error-box">⚠️ ${e.message}</div>`;
      toast(e.message, true);
    } finally {
      genBtn.disabled = false;
    }
  };
}

// ── 진도 관리 ──────────────────────────────────────────
async function renderProgress() {
  const content = el(`
    <div class="view">
      <header class="page-head">
        <button class="back" data-go="#/dashboard">← 대시보드</button>
        <h1>📈 학습 진도 관리</h1>
        <p>오늘의 학습을 기록하고, AI 분석으로 다음 방향을 잡으세요.</p>
      </header>

      <div class="prog-grid">
        <form id="logForm" class="log-form card-block">
          <h3>오늘 학습 기록</h3>
          <label>날짜<input type="date" id="p-date" value="${today()}"></label>
          <label>말하기 시간 (분)<input type="number" id="p-speak" min="0" value="0"></label>
          <label>습득 어휘 수<input type="number" id="p-vocab" min="0" value="0"></label>
          <label>듣기 이해도 (1~10)<input type="range" id="p-listen" min="1" max="10" value="5" oninput="this.nextElementSibling.textContent=this.value"><output>5</output></label>
          <label>발음 정확도 (1~10)<input type="range" id="p-pron" min="1" max="10" value="5" oninput="this.nextElementSibling.textContent=this.value"><output>5</output></label>
          <label>회화 자신감 (1~10)<input type="range" id="p-conf" min="1" max="10" value="5" oninput="this.nextElementSibling.textContent=this.value"><output>5</output></label>
          <label>메모<textarea id="p-note" rows="2" placeholder="오늘 배운 점, 어려웠던 점"></textarea></label>
          <button class="btn-primary" type="submit">기록 저장</button>
        </form>

        <div class="card-block">
          <h3>최근 추이</h3>
          <div id="chart" class="chart"><div class="empty">기록이 쌓이면 그래프가 표시됩니다.</div></div>
          <div class="stats" id="stats"></div>
        </div>
      </div>

      <div class="card-block">
        <div class="analysis-head">
          <h3>🤖 AI 학습 분석</h3>
          <button id="analyzeBtn" class="btn-primary sm">분석 요청</button>
        </div>
        <div id="analysis" class="output"><div class="empty">기록을 바탕으로 AI가 학습 상태를 분석하고 다음 액션을 제안합니다.</div></div>
      </div>
    </div>`);
  shell("progress", content);
  content.querySelector(".back").onclick = () => go("#/dashboard");

  const drawChart = async () => {
    let data = [];
    try {
      data = await getProgress(USER.uid, 30);
    } catch (_) {}
    data = data.sort((a, b) => a.date.localeCompare(b.date));
    const chart = content.querySelector("#chart");
    const stats = content.querySelector("#stats");
    if (!data.length) return;

    const maxSpeak = Math.max(...data.map((d) => d.speakingMinutes || 0), 10);
    chart.innerHTML =
      `<div class="bars">` +
      data
        .slice(-14)
        .map((d) => {
          const h = Math.round(((d.speakingMinutes || 0) / maxSpeak) * 100);
          return `<div class="bar-col" title="${d.date}: 말하기 ${d.speakingMinutes || 0}분">
              <div class="bar" style="height:${h}%"></div>
              <span>${d.date.slice(5)}</span></div>`;
        })
        .join("") +
      `</div><div class="chart-cap">일별 말하기 시간(분)</div>`;

    const totSpeak = data.reduce((s, d) => s + (d.speakingMinutes || 0), 0);
    const totVocab = data.reduce((s, d) => s + (d.vocabLearned || 0), 0);
    const avg = (k) =>
      (data.reduce((s, d) => s + (d[k] || 0), 0) / data.length).toFixed(1);
    stats.innerHTML = `
      <div class="stat"><b>${totSpeak}분</b><span>총 말하기</span></div>
      <div class="stat"><b>${totVocab}</b><span>누적 어휘</span></div>
      <div class="stat"><b>${avg("listeningScore")}</b><span>평균 듣기</span></div>
      <div class="stat"><b>${avg("pronunciationScore")}</b><span>평균 발음</span></div>
      <div class="stat"><b>${avg("confidence")}</b><span>평균 자신감</span></div>
      <div class="stat"><b>${data.length}일</b><span>기록 일수</span></div>`;
  };
  drawChart();

  content.querySelector("#logForm").onsubmit = async (e) => {
    e.preventDefault();
    const entry = {
      date: content.querySelector("#p-date").value || today(),
      speakingMinutes: +content.querySelector("#p-speak").value || 0,
      vocabLearned: +content.querySelector("#p-vocab").value || 0,
      listeningScore: +content.querySelector("#p-listen").value,
      pronunciationScore: +content.querySelector("#p-pron").value,
      confidence: +content.querySelector("#p-conf").value,
      note: content.querySelector("#p-note").value.trim(),
    };
    try {
      await logProgress(USER.uid, entry);
      toast("기록이 저장되었습니다 ✅");
      drawChart();
    } catch (err) {
      toast("저장 실패: " + err.message, true);
    }
  };

  content.querySelector("#analyzeBtn").onclick = async () => {
    const box = content.querySelector("#analysis");
    box.innerHTML = `<div class="loading"><div class="spinner"></div><p>학습 데이터를 분석하는 중…</p></div>`;
    try {
      const data = await getProgress(USER.uid, 30);
      if (!data.length) {
        box.innerHTML = `<div class="empty">분석할 기록이 없습니다. 먼저 학습을 기록해 주세요.</div>`;
        return;
      }
      const statsText = data
        .sort((a, b) => a.date.localeCompare(b.date))
        .map(
          (d) =>
            `${d.date}: 말하기 ${d.speakingMinutes}분, 어휘 ${d.vocabLearned}개, 듣기 ${d.listeningScore}/10, 발음 ${d.pronunciationScore}/10, 자신감 ${d.confidence}/10${
              d.note ? ` (${d.note})` : ""
            }`
        )
        .join("\n");
      const m = getModule("progress");
      const text = await generate(m.build(PROFILE, statsText));
      box.innerHTML = `<div class="md">${renderMarkdown(text)}</div>`;
    } catch (e) {
      box.innerHTML = `<div class="error-box">⚠️ ${e.message}</div>`;
    }
  };
}

// ── AI 회화 파트너 ─────────────────────────────────────
function renderChat() {
  const sys = `You are a friendly, patient ${PROFILE.targetLanguage} conversation partner and tutor for a Korean learner.
Learner level: ${PROFILE.currentLevel}. Goal: ${PROFILE.goal}.
Rules:
- Reply mainly in ${PROFILE.targetLanguage}, matched to the learner's level (simple for beginners).
- Keep replies short (2-4 sentences) and ask a follow-up question to keep the conversation going.
- After your reply, add a line starting with "💡" giving a brief Korean tip: correct any mistakes the learner made, or teach a useful word/expression.
- Be encouraging and natural.`;

  let history = []; // {role, text}

  const content = el(`
    <div class="view chat-view">
      <header class="page-head">
        <button class="back" data-go="#/dashboard">← 대시보드</button>
        <h1>💬 AI 회화 파트너</h1>
        <p>${PROFILE.targetLanguage}로 자유롭게 대화하세요. AI가 교정과 팁을 함께 줍니다.</p>
      </header>
      <div id="messages" class="messages"></div>
      <form id="chatForm" class="chat-input">
        <input id="chatText" placeholder="${PROFILE.targetLanguage}로 메시지를 입력하세요…" autocomplete="off">
        <button class="btn-primary" type="submit">보내기</button>
      </form>
    </div>`);
  shell("chat", content);
  content.querySelector(".back").onclick = () => go("#/dashboard");

  const messages = content.querySelector("#messages");
  const addMsg = (role, text) => {
    const bubble = el(
      `<div class="msg ${role}"><div class="bubble">${renderMarkdown(
        text
      )}</div></div>`
    );
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
    return bubble;
  };

  addMsg(
    "model",
    `안녕하세요! ${PROFILE.targetLanguage} 회화 연습을 도와드릴게요. 편하게 인사부터 시작해 볼까요? 😊`
  );

  content.querySelector("#chatForm").onsubmit = async (e) => {
    e.preventDefault();
    const input = content.querySelector("#chatText");
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    addMsg("user", text);
    history.push({ role: "user", text });

    const thinking = addMsg("model", "…");
    thinking.querySelector(".bubble").classList.add("typing");
    try {
      const reply = await chat(history, { system: sys });
      history.push({ role: "model", text: reply });
      thinking.querySelector(".bubble").outerHTML = `<div class="bubble">${renderMarkdown(
        reply
      )}</div>`;
      messages.scrollTop = messages.scrollHeight;
    } catch (err) {
      thinking.querySelector(".bubble").outerHTML = `<div class="bubble err-bubble">⚠️ ${err.message}</div>`;
    }
  };
}

// ── 설정 ──────────────────────────────────────────────
function renderSettings() {
  const keyState = getGeminiKey()
    ? `<span class="ok">✅ 설정됨</span>`
    : `<span class="no">❌ 미설정</span>`;
  const content = el(`
    <div class="view">
      <header class="page-head">
        <button class="back" data-go="#/dashboard">← 대시보드</button>
        <h1>⚙️ 설정</h1>
      </header>

      <div class="card-block">
        <h3>학습 프로필</h3>
        <label>목표 언어<input id="s-lang" value="${PROFILE.targetLanguage}"></label>
        <label>현재 실력
          <select id="s-level">
            ${["완전 입문", "초급", "중급", "중상급", "고급"]
              .map(
                (l) =>
                  `<option ${l === PROFILE.currentLevel ? "selected" : ""}>${l}</option>`
              )
              .join("")}
          </select>
        </label>
        <label>하루 학습 시간
          <select id="s-time">
            ${["30분", "60분", "90분", "120분", "120분 이상"]
              .map(
                (t) =>
                  `<option ${t === PROFILE.dailyTime ? "selected" : ""}>${t}</option>`
              )
              .join("")}
          </select>
        </label>
        <label>학습 목표<input id="s-goal" value="${PROFILE.goal}"></label>
        <label>학습 환경
          <select id="s-env">
            ${["독학", "학원 병행", "원어민 친구 있음", "해외 거주/예정"]
              .map(
                (e) =>
                  `<option ${e === PROFILE.environment ? "selected" : ""}>${e}</option>`
              )
              .join("")}
          </select>
        </label>
        <button id="saveProfile" class="btn-primary">프로필 저장</button>
      </div>

      <div class="card-block">
        <h3>Gemini API 키 ${keyState}</h3>
        <p class="muted">배포 시 <code>GEMINY_KEY</code> 시크릿이 자동 적용됩니다. 직접 입력한 키는 이 브라우저에만 저장됩니다.</p>
        <label>API 키<input id="s-key" type="password" placeholder="AIza..." value=""></label>
        <label>모델<input id="s-model" value="${GEMINI_MODEL}"></label>
        <button id="saveKey" class="btn-primary">API 설정 저장</button>
        <p class="fine"><a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener">Google AI Studio에서 무료 키 발급받기 →</a></p>
      </div>
    </div>`);
  shell("settings", content);
  content.querySelector(".back").onclick = () => go("#/dashboard");

  content.querySelector("#saveProfile").onclick = async () => {
    const profile = {
      targetLanguage: content.querySelector("#s-lang").value.trim() || "영어",
      currentLevel: content.querySelector("#s-level").value,
      dailyTime: content.querySelector("#s-time").value,
      goal: content.querySelector("#s-goal").value.trim() || "일상 회화",
      environment: content.querySelector("#s-env").value,
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
}
