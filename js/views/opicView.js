// 오픽 스크립트 암기 — 5단계 무지성 암기 드릴
// 1 듣기 → 2 문장암기 → 3 빈칸(2라운드) → 4 키워드 → 5 암송
import { el, esc, shell, pageHead, go, toast } from "../ui.js";
import { OPIC_SCRIPTS, OPIC_CATEGORIES, OPIC_FILLERS, OPIC_STRATEGY, getScript } from "../data/opic.js";
import { S, opicClear, opicStage, opicStats, addCustomScript, deleteCustomScript } from "../state.js";
import { speak, stopSpeak } from "../tts.js";

const STAGES = [
  { n: 1, name: "듣기", desc: "전문을 보면서 음성을 듣고 그대로 따라 읽습니다." },
  { n: 2, name: "문장 암기", desc: "한국어만 보고 영어 문장을 말한 뒤 확인합니다." },
  { n: 3, name: "빈칸 채우기", desc: "단어를 절반씩 지운 상태로 문장을 복원합니다." },
  { n: 4, name: "키워드", desc: "키워드 2~3개만 보고 문장 전체를 복원합니다." },
  { n: 5, name: "암송", desc: "한국어 뜻만 보고 전체를 통째로 말합니다." },
];

const STOP = new Set(["the","a","an","and","or","but","so","because","that","this","these","those","it","is","are","was","were","be","been","being","to","of","in","on","at","for","with","from","as","my","i","you","he","she","we","they","me","him","her","us","them","have","has","had","do","does","did","not","there","their","what","when","where","how","which","who","all","can","could","would","will","just","about","like","more","most","some","one","two","up","out","if","by","than","then","too","very","really","also","after","before","its","im","ive","dont","thats","were","youre","into","over","only","much","many","other","any","because"]);

// 문장에서 키워드 2~3개 추출
function keywords(en) {
  const words = en.replace(/[^\w\s']/g, " ").split(/\s+/).filter(Boolean);
  const cands = words
    .map((w, i) => ({ w, i, k: w.toLowerCase().replace(/'.*$/, "") }))
    .filter((x) => x.k.length >= 4 && !STOP.has(x.k));
  const picked = [...cands].sort((a, b) => b.k.length - a.k.length).slice(0, 3);
  return picked.sort((a, b) => a.i - b.i).map((x) => x.w);
}

// 결정적 의사난수 — 같은 문장은 항상 같은 자리에 빈칸이 생김
function seeded(lineIdx, wordIdx) {
  const v = Math.sin((lineIdx + 1) * 12.9898 + (wordIdx + 1) * 78.233) * 43758.5453;
  return Math.abs(v % 1);
}

// 빈칸 HTML 생성
function clozeHtml(en, lineIdx, ratio) {
  return en
    .split(/(\s+)/)
    .map((tok, i) => {
      if (/^\s+$/.test(tok)) return tok;
      const bare = tok.replace(/[^\w']/g, "");
      if (bare.length < 3 || seeded(lineIdx, i) >= ratio) return esc(tok);
      const lead = tok[0];
      return `<span class="cloze">${esc(lead)}${"_".repeat(Math.max(bare.length - 1, 1))}</span>`;
    })
    .join("");
}

// ══════════ 목록 ══════════
export function renderOpicList(tab = "scripts") {
  const all = [...OPIC_SCRIPTS, ...S.opicCustom];
  const st = opicStats(all.map((s) => s.id));

  const tabs = [
    ["scripts", "📚 스크립트"],
    ["custom", "✍️ 내 스크립트"],
    ["strategy", "🎯 전략·필러"],
  ];

  const content = el(`
    <div class="view">
      ${pageHead("🎤 오픽 스크립트 암기", "무지성 암기 5단계 드릴 — 듣기 → 문장암기 → 빈칸 → 키워드 → 암송. 한 스크립트를 끝까지 밀면 시험장에서 그대로 나옵니다.")}
      <div class="review-banner ${st.done ? "has-due" : ""}">
        <div>
          <b>암송 완료 ${st.done} / ${st.total} 스크립트</b>
          <small>진행 중 ${st.started}개 · 하루 1개씩만 완주해도 한 달이면 전 주제 커버</small>
        </div>
      </div>
      <div class="tabs">
        ${tabs.map(([id, l]) => `<a class="tab ${tab === id ? "on" : ""}" href="#/opic/${id}">${l}</a>`).join("")}
      </div>
      <div id="tabBody"></div>
    </div>`);
  shell("opic", content);
  const body = content.querySelector("#tabBody");

  if (tab === "custom") renderCustomTab(body);
  else if (tab === "strategy") renderStrategyTab(body);
  else renderScriptsTab(body);
}

function scriptRow(s) {
  const stage = opicStage(s.id);
  const pct = Math.round((stage / 5) * 100);
  const label = stage >= 5 ? "✅ 암송 완료" : stage > 0 ? `${stage}/5 단계` : "시작하기 →";
  return `
    <a class="opic-row ${stage >= 5 ? "done" : ""}" href="#/opic/s/${s.id}">
      <div class="opic-main">
        <b>${esc(s.title)}</b>
        <small>${esc(s.q)}</small>
      </div>
      <div class="opic-side">
        <span class="opic-state">${label}</span>
        <div class="opic-track"><div class="opic-fill" style="width:${pct}%"></div></div>
      </div>
    </a>`;
}

function renderScriptsTab(body) {
  body.innerHTML = OPIC_CATEGORIES.map((c) => {
    const list = OPIC_SCRIPTS.filter((s) => s.cat === c.id);
    if (!list.length) return "";
    return `
      <div class="opic-cat">
        <div class="opic-cat-head"><b>${c.icon} ${esc(c.name)}</b><small>${esc(c.desc)}</small></div>
        <div class="unit-list">${list.map(scriptRow).join("")}</div>
      </div>`;
  }).join("");
}

function renderStrategyTab(body) {
  body.innerHTML = `
    <div class="card-block">
      <h3>🎯 오픽 공략 6원칙</h3>
      <div class="method-grid">
        ${OPIC_STRATEGY.map((s) => `
          <div class="method-card">
            <div class="method-icon">${s.icon}</div>
            <b>${esc(s.title)}</b>
            <p>${esc(s.body)}</p>
          </div>`).join("")}
      </div>
    </div>
    ${OPIC_FILLERS.map((g, gi) => `
      <div class="card-block">
        <h3>💬 ${esc(g.group)}</h3>
        ${g.items.map((it, i) => `
          <div class="ex-row">
            <button class="tts-btn" data-g="${gi}" data-i="${i}">🔊</button>
            <div><b>${esc(it[0])}</b><span>${esc(it[1])}</span></div>
          </div>`).join("")}
      </div>`).join("")}`;

  body.querySelectorAll(".tts-btn").forEach((b) => {
    b.onclick = () => speak(OPIC_FILLERS[+b.dataset.g].items[+b.dataset.i][0], 0.95);
  });
}

// ══════════ 내 스크립트 ══════════
function renderCustomTab(body) {
  const list = S.opicCustom.length
    ? `<div class="unit-list">${S.opicCustom.map((s) => `
        <div class="opic-row-wrap">
          ${scriptRow(s)}
          <button class="collect-btn del" data-del="${esc(s.id)}" title="삭제">✕</button>
        </div>`).join("")}</div>`
    : `<div class="empty">아직 내 스크립트가 없습니다.<br>오픽은 설문에서 고른 주제가 사람마다 다르니, 나만의 답변을 만들어 두면 가장 강력해요.</div>`;

  body.innerHTML = `
    <div class="card-block">
      <h3>✍️ 새 스크립트 만들기</h3>
      <p class="muted">영어 문장과 한국어 뜻을 <b>탭(Tab)이나 | 기호</b>로 구분해 한 줄에 하나씩 붙여넣으세요. 뜻을 안 쓰면 영어만 표시됩니다.</p>
      <label>제목<input id="cs-title" placeholder="예: 자기소개 (내 버전)"></label>
      <label>질문 (선택)<input id="cs-q" placeholder="예: Tell me about yourself."></label>
      <label>본문
        <textarea id="cs-body" rows="8" placeholder="Hi, my name is Minsu. | 안녕하세요, 제 이름은 민수입니다.
I work at a marketing company. | 저는 마케팅 회사에서 일합니다."></textarea>
      </label>
      <button class="btn-primary" id="cs-save">스크립트 저장</button>
    </div>
    <div class="card-block">
      <h3>내 스크립트 (${S.opicCustom.length})</h3>
      ${list}
    </div>`;

  body.querySelector("#cs-save").onclick = () => {
    const title = body.querySelector("#cs-title").value.trim();
    const q = body.querySelector("#cs-q").value.trim();
    const raw = body.querySelector("#cs-body").value.trim();
    if (!title || !raw) return toast("제목과 본문을 입력해 주세요", true);
    const lines = raw
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        const parts = l.split(/\t|\s*\|\s*/);
        return [parts[0].trim(), (parts[1] || "").trim()];
      })
      .filter((l) => l[0]);
    if (!lines.length) return toast("본문에 문장이 없습니다", true);
    addCustomScript({
      id: "custom-" + Date.now().toString(36),
      cat: "custom", custom: true,
      title, q: q || title, qKo: "",
      tip: "내가 직접 만든 스크립트입니다.",
      lines,
    });
    toast(`저장 완료! ${lines.length}문장 스크립트 ✅`);
    renderOpicList("custom");
  };

  body.querySelectorAll("[data-del]").forEach((b) => {
    b.onclick = (e) => {
      e.preventDefault();
      if (confirm("이 스크립트를 삭제할까요? 암기 진도도 함께 사라집니다.")) {
        deleteCustomScript(b.dataset.del);
        toast("삭제했습니다");
        renderOpicList("custom");
      }
    };
  });
}

// ══════════ 암기 드릴 ══════════
export function renderOpicScript(id) {
  const script = getScript(id, S.opicCustom);
  if (!script) return go("#/opic");

  let stage = Math.min((opicStage(id) || 0) + 1, 5);
  if (opicStage(id) >= 5) stage = 1; // 완주했으면 처음부터 복습

  const content = el(`
    <div class="view">
      ${pageHead(`🎤 ${esc(script.title)}`, `<b>Q.</b> ${esc(script.q)}${script.qKo ? `<br><span class="q-ko">${esc(script.qKo)}</span>` : ""}`, script.custom ? "#/opic/custom" : "#/opic")}
      ${script.tip ? `<div class="opic-tip">💡 ${esc(script.tip)}</div>` : ""}
      <div class="stage-bar" id="stageBar"></div>
      <div class="stage-desc" id="stageDesc"></div>
      <div id="stage"></div>
    </div>`);
  shell("opic", content);
  const stageBox = content.querySelector("#stage");

  function drawBar() {
    const cleared = opicStage(id);
    content.querySelector("#stageBar").innerHTML = STAGES.map(
      (s) => `<button class="chip ${stage === s.n ? "on" : cleared >= s.n ? "done" : ""}" data-s="${s.n}">${s.n} ${s.name}</button>`
    ).join("");
    content.querySelector("#stageDesc").textContent = STAGES[stage - 1].desc;
    content.querySelectorAll("#stageBar .chip").forEach((b) => {
      b.onclick = () => { stopSpeak(); stage = +b.dataset.s; draw(); };
    });
  }

  function nextStageBtn(labelDone) {
    if (stage >= 5) {
      return `<a class="btn-primary" href="#/opic">🏆 완주! 목록으로</a>`;
    }
    return `<button class="btn-primary" id="nextStage">${labelDone} → ${STAGES[stage].n}단계 ${STAGES[stage].name}</button>`;
  }

  function bindNext() {
    const b = stageBox.querySelector("#nextStage");
    if (b) b.onclick = () => { stopSpeak(); stage++; draw(); };
  }

  function clearAndAdvance(msg) {
    opicClear(id, stage);
    toast(msg);
    drawBar();
  }

  // ── 1단계: 듣기 ──
  function stage1() {
    stageBox.innerHTML = `
      <div class="card-block">
        <div class="analysis-head">
          <h3>전문 듣고 따라 읽기</h3>
          <button class="btn-ghost inline sm-btn" id="playAll">▶ 전체 재생</button>
        </div>
        <div class="script-lines">
          ${script.lines.map((l, i) => `
            <div class="sc-line">
              <button class="tts-btn" data-i="${i}">🔊</button>
              <div><b>${esc(l[0])}</b>${l[1] ? `<span>${esc(l[1])}</span>` : ""}</div>
            </div>`).join("")}
        </div>
      </div>
      <div class="stage-actions">${nextStageBtn("다 읽었어요")}</div>`;

    stageBox.querySelectorAll(".tts-btn").forEach((b) => {
      b.onclick = () => speak(script.lines[+b.dataset.i][0], 0.95);
    });
    stageBox.querySelector("#playAll").onclick = async () => {
      stopSpeak();
      for (const l of script.lines) {
        speak(l[0], 0.95);
        await new Promise((r) => {
          const t = setInterval(() => {
            if (!speechSynthesis.speaking) { clearInterval(t); setTimeout(r, 400); }
          }, 200);
        });
      }
    };
    const nb = stageBox.querySelector("#nextStage");
    if (nb) nb.onclick = () => { stopSpeak(); clearAndAdvance("1단계 완료 — 이제 외워봅시다"); stage++; draw(); };
  }

  // ── 2·3·4단계: 문장 단위 워크스루 ──
  function lineWalk(mode, round = 1) {
    let pos = 0;
    const ratio = mode === "cloze" ? (round === 1 ? 0.4 : 0.75) : 0;

    function drawLine() {
      if (pos >= script.lines.length) {
        if (mode === "cloze" && round === 1) {
          stageBox.innerHTML = `
            <div class="finish-box slim">
              <div class="finish-emoji">🔥</div>
              <h2>1라운드 완료 (40% 빈칸)</h2>
              <p>이제 <b>75%</b>를 지우고 한 번 더 갑니다. 여기서 막히면 2단계로 돌아가도 괜찮아요.</p>
              <button class="btn-primary" id="round2">2라운드 시작 →</button>
            </div>`;
          stageBox.querySelector("#round2").onclick = () => lineWalk("cloze", 2);
          return;
        }
        const msgs = {
          reveal: "2단계 완료 — 문장이 입에 붙었어요",
          cloze: "3단계 완료 — 이제 키워드만으로 갑니다",
          keyword: "4단계 완료 — 마지막은 통암송!",
        };
        clearAndAdvance(msgs[mode]);
        stageBox.innerHTML = `
          <div class="finish-box slim">
            <div class="finish-emoji">✅</div>
            <h2>${STAGES[stage - 1].name} 완료</h2>
            <p>${esc(msgs[mode])}</p>
            <div class="stage-actions">
              <button class="btn-ghost inline" id="again">한 번 더</button>
              ${nextStageBtn("다음 단계")}
            </div>
          </div>`;
        stageBox.querySelector("#again").onclick = () => draw();
        bindNext();
        return;
      }

      const [en, ko] = script.lines[pos];
      let prompt = "";
      if (mode === "reveal") {
        prompt = ko ? `<div class="walk-ko">${esc(ko)}</div>` : `<div class="walk-ko">(뜻 없음 — 순서를 떠올려 말하세요)</div>`;
      } else if (mode === "cloze") {
        prompt = `<div class="walk-cloze">${clozeHtml(en, pos, ratio)}</div>${ko ? `<div class="walk-ko sub">${esc(ko)}</div>` : ""}`;
      } else {
        prompt = `<div class="walk-keys">${keywords(en).map((k) => `<span class="key-chip">${esc(k)}</span>`).join("")}</div>${ko ? `<div class="walk-ko sub">${esc(ko)}</div>` : ""}`;
      }

      stageBox.innerHTML = `
        <div class="flash-progress">${pos + 1} / ${script.lines.length}${mode === "cloze" ? ` · ${round}라운드 (${Math.round(ratio * 100)}% 가림)` : ""}</div>
        <div class="walk-card">
          ${prompt}
          <div class="walk-hint">👄 소리 내어 말한 뒤 아래 버튼으로 확인하세요</div>
          <div class="walk-answer hidden" id="ans">
            <b>${esc(en)}</b>
            <button class="tts-btn" id="sayAns">🔊</button>
          </div>
        </div>
        <div class="stage-actions">
          <button class="btn-ghost inline" id="reveal">정답 확인</button>
          <button class="btn-primary" id="next">다음 문장 →</button>
        </div>`;

      stageBox.querySelector("#reveal").onclick = () => {
        stageBox.querySelector("#ans").classList.remove("hidden");
        speak(en, 0.95);
      };
      const sa = stageBox.querySelector("#sayAns");
      if (sa) sa.onclick = () => speak(en, 0.95);
      stageBox.querySelector("#next").onclick = () => { pos++; drawLine(); };
    }
    drawLine();
  }

  // ── 5단계: 통암송 ──
  function stage5() {
    let revealed = false;
    let rec = null;
    let chunks = [];

    function drawRecite() {
      stageBox.innerHTML = `
        <div class="card-block">
          <h3>🎙️ 한국어만 보고 전체를 통째로 말하세요</h3>
          <p class="muted">멈추지 말고 끝까지. 막히면 필러("Well, let me see...")로 시간을 벌며 이어가세요. 목표 60~90초.</p>
          <div class="recite-list">
            ${script.lines.map((l, i) => `
              <div class="recite-line">
                <span class="rc-no">${i + 1}</span>
                <div>
                  <div class="rc-ko">${esc(l[1] || "—")}</div>
                  <div class="rc-en ${revealed ? "" : "hidden"}">${esc(l[0])}</div>
                </div>
              </div>`).join("")}
          </div>
          <div class="stage-actions">
            <button class="btn-ghost inline" id="toggleEn">${revealed ? "영어 숨기기" : "영어 전문 보기"}</button>
            <button class="btn-ghost inline" id="recBtn">🔴 녹음 시작</button>
          </div>
          <audio id="player" controls class="hidden rec-player"></audio>
        </div>
        <div class="stage-actions">
          <button class="btn-primary" id="doneAll">🏆 암송 성공 — 이 스크립트 완주</button>
        </div>`;

      stageBox.querySelector("#toggleEn").onclick = () => { revealed = !revealed; drawRecite(); };

      const recBtn = stageBox.querySelector("#recBtn");
      recBtn.onclick = async () => {
        if (rec && rec.state === "recording") {
          rec.stop();
          return;
        }
        if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
          return toast("이 브라우저는 녹음을 지원하지 않습니다", true);
        }
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          rec = new MediaRecorder(stream);
          chunks = [];
          rec.ondataavailable = (e) => chunks.push(e.data);
          rec.onstop = () => {
            stream.getTracks().forEach((t) => t.stop());
            const url = URL.createObjectURL(new Blob(chunks, { type: "audio/webm" }));
            const p = stageBox.querySelector("#player");
            p.src = url;
            p.classList.remove("hidden");
            recBtn.textContent = "🔴 다시 녹음";
            toast("녹음 완료 — 들어보고 원문과 비교하세요");
          };
          rec.start();
          recBtn.textContent = "⏹ 녹음 중지";
          toast("녹음 중… 지금 말하세요!");
        } catch (e) {
          toast("마이크 권한이 필요합니다", true);
        }
      };

      stageBox.querySelector("#doneAll").onclick = () => {
        opicClear(id, 5);
        stageBox.innerHTML = `
          <div class="finish-box">
            <div class="finish-emoji">🏆</div>
            <h2>「${esc(script.title)}」 암송 완료!</h2>
            <p>이 스크립트는 이제 당신 것입니다.<br>내일 한 번만 다시 5단계로 복습하면 시험장까지 갑니다.</p>
            <div class="stage-actions">
              <a class="btn-ghost inline" href="#/opic/s/${id}">다시 복습</a>
              <a class="btn-primary" href="#/opic">다음 스크립트 →</a>
            </div>
          </div>`;
        drawBar();
      };
    }
    drawRecite();
  }

  function draw() {
    drawBar();
    if (stage === 1) stage1();
    else if (stage === 2) lineWalk("reveal");
    else if (stage === 3) lineWalk("cloze", 1);
    else if (stage === 4) lineWalk("keyword");
    else stage5();
  }
  draw();
}
