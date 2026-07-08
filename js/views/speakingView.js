// 말하기·발음 — 쉐도잉 / 발음 클리닉 / 롤플레이 / 데일리 미션
import { el, esc, shell, pageHead, toast } from "../ui.js";
import { SHADOWING_METHOD, SHADOWING_SETS, PRONUNCIATION_UNITS, ROLEPLAYS, DAILY_MISSIONS } from "../data/speaking.js";
import { dayNumber, markActivity, collectSentence } from "../state.js";
import { speak, stopSpeak, ttsAvailable } from "../tts.js";

export function renderSpeaking(tab = "shadow") {
  const tabs = [
    ["shadow", "🌀 쉐도잉"],
    ["pron", "👄 발음 클리닉"],
    ["role", "🎭 롤플레이"],
    ["mission", "🎯 오늘의 미션"],
  ];

  const content = el(`
    <div class="view">
      ${pageHead("🎙️ 말하기 & 발음", "문법의 완벽함보다 소리 내어 말하는 양이 실력을 만듭니다. 모든 문장에 원어민 음성(TTS)이 내장되어 있어요.")}
      ${!ttsAvailable ? `<div class="error-box">이 브라우저는 음성 합성을 지원하지 않습니다. Chrome/Edge/Safari를 권장합니다.</div>` : ""}
      <div class="tabs">
        ${tabs.map(([id, label]) => `<a class="tab ${tab === id ? "on" : ""}" href="#/speaking/${id}">${label}</a>`).join("")}
      </div>
      <div id="tabBody"></div>
    </div>`);
  shell("speaking", content);
  const body = content.querySelector("#tabBody");

  if (tab === "pron") renderPron(body);
  else if (tab === "role") renderRoleList(body);
  else if (tab === "mission") renderMission(body);
  else renderShadow(body);
}

// ── 쉐도잉 ────────────────────────────────────────────
function renderShadow(body) {
  body.innerHTML = `
    <div class="card-block">
      <h3>쉐도잉 4단계 방법</h3>
      <ol class="method-list">${SHADOWING_METHOD.map((m) => `<li>${esc(m)}</li>`).join("")}</ol>
    </div>
    ${SHADOWING_SETS.map(
      (set, si) => `
      <div class="card-block">
        <h3>${esc(set.level)}</h3>
        ${set.sentences
          .map(
            (s, i) => `
          <div class="ex-row">
            <button class="tts-btn" data-s="${si}" data-i="${i}">🔊</button>
            <button class="tts-btn slow" data-s="${si}" data-i="${i}" title="천천히">🐢</button>
            <div><b>${esc(s[0])}</b><span>${esc(s[1])}</span></div>
            <button class="collect-btn" data-s="${si}" data-i="${i}" title="내 문장함에 수집">➕</button>
          </div>`
          )
          .join("")}
      </div>`
    ).join("")}`;

  body.querySelectorAll(".tts-btn").forEach((b) => {
    b.onclick = () => {
      const set = SHADOWING_SETS[+b.dataset.s];
      const rate = b.classList.contains("slow") ? set.rate * 0.7 : set.rate;
      speak(set.sentences[+b.dataset.i][0], rate);
      markActivity();
    };
  });
  body.querySelectorAll(".collect-btn").forEach((b) => {
    b.onclick = () => {
      const s = SHADOWING_SETS[+b.dataset.s].sentences[+b.dataset.i];
      toast(collectSentence(s[0], s[1]) ? "문장함에 저장했어요 ✅" : "이미 저장된 문장이에요");
    };
  });
}

// ── 발음 클리닉 ────────────────────────────────────────
function renderPron(body) {
  body.innerHTML = PRONUNCIATION_UNITS.map(
    (u, ui) => `
    <div class="card-block">
      <h3>${esc(u.title)}</h3>
      <p class="explain">${esc(u.tip)}</p>
      ${u.drills
        .map(
          (d, i) => `
        <div class="ex-row">
          <button class="tts-btn" data-u="${ui}" data-i="${i}">🔊</button>
          <button class="tts-btn slow" data-u="${ui}" data-i="${i}" title="천천히">🐢</button>
          <div><b>${esc(d[0])}</b><span>${esc(d[1])}</span></div>
        </div>`
        )
        .join("")}
    </div>`
  ).join("");

  body.querySelectorAll(".tts-btn").forEach((b) => {
    b.onclick = () => {
      const text = PRONUNCIATION_UNITS[+b.dataset.u].drills[+b.dataset.i][0];
      speak(text.replace(/\(.*?\)/g, ""), b.classList.contains("slow") ? 0.65 : 0.95);
      markActivity();
    };
  });
}

// ── 롤플레이 ──────────────────────────────────────────
function renderRoleList(body) {
  body.innerHTML = `
    <div class="rp-grid">
      ${ROLEPLAYS.map(
        (r) => `
        <button class="rp-card" data-id="${r.id}">
          <b>${esc(r.title)}</b>
          <span>${esc(r.scene)}</span>
          <small>${r.lines.length}턴 대화</small>
        </button>`
      ).join("")}
    </div>
    <div id="rpPlayer"></div>`;

  body.querySelectorAll(".rp-card").forEach((c) => {
    c.onclick = () => renderRolePlayer(body.querySelector("#rpPlayer"), ROLEPLAYS.find((r) => r.id === c.dataset.id));
  });
}

function renderRolePlayer(box, rp) {
  let practiceMode = false; // true면 내 대사(B) 가리기

  function draw() {
    box.innerHTML = `
      <div class="card-block" id="rpBox">
        <div class="analysis-head">
          <h3>${esc(rp.title)}</h3>
          <div class="rp-controls">
            <button class="btn-ghost inline sm-btn" id="playAll">▶ 전체 듣기</button>
            <button class="btn-primary sm" id="modeBtn">${practiceMode ? "📖 대본 모두 보기" : "🎭 내 대사 가리기 (연습 모드)"}</button>
          </div>
        </div>
        <p class="muted">${esc(rp.scene)} ${practiceMode ? "— 상대(A) 대사를 듣고, 가려진 내 대사를 먼저 말한 뒤 확인하세요." : ""}</p>
        <div class="dialogue">
          ${rp.lines
            .map(
              ([sp, en, ko], i) => `
            <div class="dl-line ${sp === rp.you ? "me" : ""}">
              <span class="dl-speaker">${sp === rp.you ? "나" : sp}</span>
              <div class="dl-bubble ${practiceMode && sp === rp.you ? "masked" : ""}" data-i="${i}">
                <button class="tts-btn" data-i="${i}">🔊</button>
                <b>${esc(en)}</b><span>${esc(ko)}</span>
                ${practiceMode && sp === rp.you ? '<div class="mask-cover">👆 먼저 말해 본 뒤 눌러서 확인</div>' : ""}
              </div>
            </div>`
            )
            .join("")}
        </div>
      </div>`;

    box.querySelectorAll(".tts-btn").forEach((b) => {
      b.onclick = (e) => {
        e.stopPropagation();
        speak(rp.lines[+b.dataset.i][1], 0.95);
        markActivity();
      };
    });
    box.querySelectorAll(".dl-bubble.masked").forEach((bb) => {
      bb.onclick = () => bb.classList.remove("masked");
    });
    box.querySelector("#modeBtn").onclick = () => { practiceMode = !practiceMode; draw(); };
    box.querySelector("#playAll").onclick = async () => {
      stopSpeak();
      for (const [sp, en] of rp.lines) {
        speak(en, 0.95);
        await new Promise((r) => {
          const check = setInterval(() => {
            if (!speechSynthesis.speaking) { clearInterval(check); setTimeout(r, 500); }
          }, 200);
        });
      }
    };
    box.scrollIntoView({ behavior: "smooth" });
  }
  draw();
}

// ── 오늘의 미션 ───────────────────────────────────────
function renderMission(body) {
  const day = dayNumber();
  const idx = (day - 1) % DAILY_MISSIONS.length;
  body.innerHTML = `
    <div class="card-block mission-box">
      <div class="mission-day">Day ${day} 미션</div>
      <h3>🎯 ${esc(DAILY_MISSIONS[idx])}</h3>
      <p class="muted">틀려도 됩니다. 멈추지 않고 30초 이상 말하는 것이 목표예요. 핸드폰 녹음 기능으로 녹음해서 들어 보면 효과 2배.</p>
      <button class="btn-primary" id="doneBtn">미션 완료! ✅</button>
    </div>
    <div class="card-block">
      <h3>이번 주 미션 미리보기</h3>
      <ol class="method-list">
        ${[1, 2, 3].map((n) => `<li>Day ${day + n}: ${esc(DAILY_MISSIONS[(idx + n) % DAILY_MISSIONS.length])}</li>`).join("")}
      </ol>
    </div>`;
  body.querySelector("#doneBtn").onclick = () => {
    markActivity();
    toast("미션 완료! 오늘의 스트릭이 기록됐어요 🔥");
  };
}
