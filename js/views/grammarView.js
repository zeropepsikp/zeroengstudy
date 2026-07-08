// 실전 문법 — 패턴 목록 + 레슨(설명·예문·즉석 퀴즈)
import { el, esc, shell, pageHead, go } from "../ui.js";
import { GRAMMAR_PATTERNS, GRAMMAR_PHASE_LABELS, getPattern } from "../data/grammar.js";
import { S, markGrammarDone } from "../state.js";
import { speak } from "../tts.js";

export function renderGrammarList() {
  let phase = 0;
  const rows = GRAMMAR_PATTERNS.map((g) => {
    const done = S.grammarDone[g.id];
    const header =
      g.phase !== phase
        ? `<div class="phase-label">${GRAMMAR_PHASE_LABELS[(phase = g.phase)]}</div>`
        : "";
    return `${header}
      <a class="unit-row ${done ? "done" : ""}" href="#/grammar/${g.id}">
        <span class="unit-no">🧩</span>
        <span class="unit-title">${esc(g.title)}<small>${esc(g.pattern)}</small></span>
        <span class="unit-state">${done ? `✅ ${done.score}/${done.total}` : "학습하기 →"}</span>
      </a>`;
  }).join("");

  const doneCount = Object.keys(S.grammarDone).length;
  const content = el(`
    <div class="view">
      ${pageHead("🧩 실전 문법 24패턴", "이론이 아니라 회화에서 바로 쓰는 패턴만. 각 패턴은 설명 → 예문 소리 내어 읽기 → 즉석 퀴즈로 끝냅니다.")}
      <div class="review-banner"><div><b>진행: ${doneCount} / ${GRAMMAR_PATTERNS.length} 패턴</b><small>일주일에 2패턴이면 12주에 완성됩니다.</small></div></div>
      <div class="unit-list">${rows}</div>
    </div>`);
  shell("grammar", content);
}

export function renderGrammarLesson(id) {
  const g = getPattern(id);
  if (!g) return go("#/grammar");

  const content = el(`
    <div class="view">
      ${pageHead(`🧩 ${esc(g.title)}`, `핵심 패턴: <code>${esc(g.pattern)}</code>`, "#/grammar")}
      <div class="card-block">
        <h3>💡 핵심만 요약</h3>
        <p class="explain">${esc(g.explain)}</p>
      </div>
      <div class="card-block">
        <h3>🗣️ 회화 예문 — 눈이 아니라 입으로 3번씩</h3>
        ${g.examples
          .map(
            (ex, i) => `
          <div class="ex-row">
            <button class="tts-btn" data-i="${i}">🔊</button>
            <div><b>${esc(ex[0])}</b><span>${esc(ex[1])}</span></div>
          </div>`
          )
          .join("")}
      </div>
      <div class="card-block">
        <h3>✏️ 즉석 퀴즈</h3>
        <div id="quiz"></div>
      </div>
    </div>`);
  shell("grammar", content);

  content.querySelectorAll(".ex-row .tts-btn").forEach((b) => {
    b.onclick = () => speak(g.examples[+b.dataset.i][0], 0.95);
  });

  // 퀴즈
  const quizBox = content.querySelector("#quiz");
  let pos = 0;
  let score = 0;

  function draw() {
    if (pos >= g.quiz.length) {
      markGrammarDone(g.id, score, g.quiz.length);
      const idx = GRAMMAR_PATTERNS.findIndex((p) => p.id === g.id);
      const next = GRAMMAR_PATTERNS[idx + 1];
      quizBox.innerHTML = `
        <div class="finish-box slim">
          <h2>${score === g.quiz.length ? "💯 퍼펙트!" : `결과: ${score} / ${g.quiz.length}`}</h2>
          <p>${score === g.quiz.length ? "이 패턴은 당신 것입니다. 오늘 대화에서 한 번 써 보세요." : "틀린 문제의 해설을 다시 읽고, 예문을 소리 내어 반복하세요."}</p>
          <div class="stage-actions">
            <button class="btn-ghost inline" id="retry">다시 풀기</button>
            ${next ? `<a class="btn-primary" href="#/grammar/${next.id}">다음 패턴 →</a>` : `<a class="btn-primary" href="#/grammar">목록으로</a>`}
          </div>
        </div>`;
      quizBox.querySelector("#retry").onclick = () => { pos = 0; score = 0; draw(); };
      return;
    }
    const q = g.quiz[pos];
    quizBox.innerHTML = `
      <div class="flash-progress">${pos + 1} / ${g.quiz.length}</div>
      <div class="quiz-q gram"><b>${esc(q.q)}</b></div>
      <div class="quiz-choices">
        ${q.c.map((c, i) => `<button class="quiz-choice" data-i="${i}">${esc(c)}</button>`).join("")}
      </div>
      <div class="quiz-fb" id="fb"></div>`;
    quizBox.querySelectorAll(".quiz-choice").forEach((btn) => {
      btn.onclick = () => {
        const ok = +btn.dataset.i === q.a;
        quizBox.querySelectorAll(".quiz-choice").forEach((b) => {
          b.disabled = true;
          if (+b.dataset.i === q.a) b.classList.add("correct");
        });
        if (ok) { score++; btn.classList.add("correct"); }
        else btn.classList.add("wrong");
        quizBox.querySelector("#fb").innerHTML = `<span class="${ok ? "ok" : "no"}">${ok ? "정답!" : "오답."} ${esc(q.why)}</span>`;
        const full = q.q.replace("___", q.c[q.a]);
        speak(full, 0.95);
        setTimeout(() => { pos++; draw(); }, ok ? 1300 : 2400);
      };
    });
  }
  draw();
}
