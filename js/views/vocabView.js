// 어휘 트레이닝 — 유닛 학습(카드 → 플래시 → 퀴즈) + SRS 복습
import { el, esc, shell, pageHead, go, toast } from "../ui.js";
import { VOCAB_UNITS, PHASE_LABELS, getUnit, wordId, allWords } from "../data/vocab.js";
import { S, srsAddUnit, srsAnswer, dueWords, srsStats, markUnitDone, markActivity } from "../state.js";
import { speak } from "../tts.js";

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

// ── 유닛 목록 ─────────────────────────────────────────
export function renderVocabList() {
  const stats = srsStats();
  let phase = 0;
  const units = VOCAB_UNITS.map((u) => {
    const done = S.unitsDone[u.id];
    const header =
      u.phase !== phase
        ? `<div class="phase-label">${PHASE_LABELS[(phase = u.phase)]}</div>`
        : "";
    return `${header}
      <a class="unit-row ${done ? "done" : ""}" href="#/vocab/unit/${u.id}">
        <span class="unit-no">${u.id}</span>
        <span class="unit-title">${esc(u.title)}<small>${u.words.length}단어</small></span>
        <span class="unit-state">${
          done ? `✅ ${done.score}/${done.total}` : "학습하기 →"
        }</span>
      </a>`;
  }).join("");

  const content = el(`
    <div class="view">
      ${pageHead("📚 어휘 트레이닝", `핵심 어휘 ${allWords().length}개 — 예문 중심 학습과 간격 반복(SRS) 복습으로 대화에서 바로 쓰는 단어를 만듭니다.`)}
      <div class="review-banner ${stats.due ? "has-due" : ""}">
        <div>
          <b>${stats.due ? `복습 대기 ${stats.due}단어` : "오늘 복습 완료!"}</b>
          <small>학습한 단어 ${stats.total}개 · 상자별 ${stats.boxes.join(" / ")}</small>
        </div>
        ${stats.due ? `<a class="btn-primary sm" href="#/vocab/review">복습 시작 →</a>` : ""}
      </div>
      <div class="srs-note">간격 반복: 상자1→내일, 2→2일, 3→4일, 4→7일, 5→15일 뒤 복습. 맞히면 승급, 틀리면 상자1로.</div>
      <div class="unit-list">${units}</div>
    </div>`);
  shell("vocab", content);
}

// ── 유닛 학습 흐름 ─────────────────────────────────────
export function renderVocabUnit(id) {
  const unit = getUnit(id);
  if (!unit) return go("#/vocab");

  const content = el(`
    <div class="view">
      ${pageHead(`📚 유닛 ${unit.id} · ${esc(unit.title)}`, "단계 1: 단어 익히기 → 단계 2: 플래시카드 → 단계 3: 퀴즈", "#/vocab")}
      <div id="stage"></div>
    </div>`);
  shell("vocab", content);
  const stage = content.querySelector("#stage");

  // ── 1단계: 단어 훑어보기 ──
  function stageBrowse() {
    stage.innerHTML = `
      <div class="stage-bar"><span class="chip on">1 익히기</span><span class="chip">2 플래시카드</span><span class="chip">3 퀴즈</span></div>
      <div class="word-table">
        ${unit.words
          .map(
            (w, i) => `
          <div class="word-row">
            <button class="tts-btn" data-i="${i}" title="발음 듣기">🔊</button>
            <div class="word-main"><b>${esc(w[0])}</b><span>${esc(w[1])}</span></div>
            <div class="word-ex"><em>${esc(w[2])}</em><span>${esc(w[3])}</span></div>
          </div>`
          )
          .join("")}
      </div>
      <div class="stage-actions"><button class="btn-primary" id="toFlash">플래시카드 시작 →</button></div>`;
    stage.querySelectorAll(".tts-btn").forEach((b) => {
      b.onclick = () => speak(unit.words[+b.dataset.i][0] + ". " + unit.words[+b.dataset.i][2], 0.9);
    });
    stage.querySelector("#toFlash").onclick = stageFlash;
  }

  // ── 2단계: 플래시카드 ──
  function stageFlash() {
    const order = shuffle(unit.words.map((_, i) => i));
    let pos = 0;
    const unknown = new Set();

    function draw() {
      if (pos >= order.length) return stageQuiz(unknown);
      const i = order[pos];
      const w = unit.words[i];
      stage.innerHTML = `
        <div class="stage-bar"><span class="chip done">1 익히기</span><span class="chip on">2 플래시카드</span><span class="chip">3 퀴즈</span></div>
        <div class="flash-progress">${pos + 1} / ${order.length}</div>
        <div class="flashcard" id="card">
          <div class="fc-front"><b>${esc(w[0])}</b><button class="tts-btn big" id="say">🔊</button><small>카드를 눌러 뜻 확인</small></div>
          <div class="fc-back hidden"><b>${esc(w[1])}</b><em>${esc(w[2])}</em><span>${esc(w[3])}</span></div>
        </div>
        <div class="flash-actions hidden" id="fa">
          <button class="btn-know no" id="dontKnow">🤔 헷갈려요</button>
          <button class="btn-know yes" id="know">😎 알아요</button>
        </div>`;
      const card = stage.querySelector("#card");
      stage.querySelector("#say").onclick = (e) => {
        e.stopPropagation();
        speak(w[0] + ". " + w[2], 0.9);
      };
      card.onclick = () => {
        card.querySelector(".fc-back").classList.remove("hidden");
        stage.querySelector("#fa").classList.remove("hidden");
      };
      stage.querySelector("#know").onclick = () => { pos++; draw(); };
      stage.querySelector("#dontKnow").onclick = () => {
        unknown.add(i);
        order.push(i); // 모르는 카드는 뒤에 다시
        pos++;
        draw();
      };
      speak(w[0], 0.9);
    }
    draw();
  }

  // ── 3단계: 퀴즈 (뜻 고르기 8문항) ──
  function stageQuiz(unknown) {
    const qIdx = shuffle(unit.words.map((_, i) => i)).slice(0, 8);
    let pos = 0;
    const correct = new Set();

    function draw() {
      if (pos >= qIdx.length) return finish();
      const i = qIdx[pos];
      const w = unit.words[i];
      // 오답 보기: 같은 유닛의 다른 뜻 2개
      const others = shuffle(unit.words.filter((_, j) => j !== i)).slice(0, 2).map((o) => o[1]);
      const choices = shuffle([w[1], ...others]);
      stage.innerHTML = `
        <div class="stage-bar"><span class="chip done">1 익히기</span><span class="chip done">2 플래시카드</span><span class="chip on">3 퀴즈</span></div>
        <div class="flash-progress">${pos + 1} / ${qIdx.length}</div>
        <div class="quiz-q"><button class="tts-btn" id="say">🔊</button><b>${esc(w[0])}</b><em>${esc(w[2].replace(new RegExp(w[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), "____"))}</em></div>
        <div class="quiz-choices">
          ${choices.map((c) => `<button class="quiz-choice" data-v="${esc(c)}">${esc(c)}</button>`).join("")}
        </div>
        <div class="quiz-fb" id="fb"></div>`;
      stage.querySelector("#say").onclick = () => speak(w[0] + ". " + w[2], 0.9);
      stage.querySelectorAll(".quiz-choice").forEach((btn) => {
        btn.onclick = () => {
          const ok = btn.dataset.v === w[1];
          stage.querySelectorAll(".quiz-choice").forEach((b) => {
            b.disabled = true;
            if (b.dataset.v === w[1]) b.classList.add("correct");
          });
          if (ok) { correct.add(i); btn.classList.add("correct"); }
          else btn.classList.add("wrong");
          stage.querySelector("#fb").innerHTML = ok
            ? `<span class="ok">정답! ${esc(w[2])}</span>`
            : `<span class="no">아쉬워요 — <b>${esc(w[0])}</b> = ${esc(w[1])}</span>`;
          setTimeout(() => { pos++; draw(); }, ok ? 800 : 1800);
        };
      });
      speak(w[0], 0.9);
    }

    function finish() {
      const score = correct.size;
      markUnitDone(unit.id, score, qIdx.length);
      srsAddUnit(unit.id, unit.words.length, correct);
      stage.innerHTML = `
        <div class="finish-box">
          <div class="finish-emoji">${score >= 7 ? "🏆" : score >= 5 ? "🎉" : "💪"}</div>
          <h2>퀴즈 완료 — ${score} / ${qIdx.length}</h2>
          <p>이 유닛 ${unit.words.length}단어가 복습 일정에 등록되었습니다.<br>내일부터 간격 반복으로 다시 만나요.</p>
          <div class="stage-actions">
            <a class="btn-ghost inline" href="#/vocab/unit/${unit.id}">다시 학습</a>
            ${unit.id < VOCAB_UNITS.length ? `<a class="btn-primary" href="#/vocab/unit/${unit.id + 1}">다음 유닛 →</a>` : `<a class="btn-primary" href="#/vocab">목록으로</a>`}
          </div>
        </div>`;
    }
    draw();
  }

  stageBrowse();
}

// ── SRS 복습 ──────────────────────────────────────────
export function renderVocabReview() {
  const due = shuffle(dueWords());
  const dict = {};
  for (const { id, w } of allWords()) dict[id] = w;

  const content = el(`
    <div class="view">
      ${pageHead("🔁 간격 반복 복습", `복습 대기 ${due.length}단어 — 알면 다음 상자로 승급, 모르면 처음부터.`, "#/vocab")}
      <div id="stage"></div>
    </div>`);
  shell("vocab", content);
  const stage = content.querySelector("#stage");

  if (!due.length) {
    stage.innerHTML = `<div class="finish-box"><div class="finish-emoji">☀️</div><h2>오늘 복습이 없습니다</h2><p>새 유닛을 학습하거나 내일 다시 오세요.</p><a class="btn-primary" href="#/vocab">유닛 목록 →</a></div>`;
    return;
  }

  let pos = 0;
  let knownCount = 0;

  function draw() {
    if (pos >= due.length) {
      markActivity();
      stage.innerHTML = `
        <div class="finish-box">
          <div class="finish-emoji">🧠</div>
          <h2>복습 완료 — ${knownCount} / ${due.length} 기억</h2>
          <p>틀린 단어는 내일 다시 나타납니다. 뇌가 잊기 직전에 다시 만나는 게 핵심이에요.</p>
          <a class="btn-primary" href="#/vocab">목록으로</a>
        </div>`;
      return;
    }
    const id = due[pos];
    const w = dict[id];
    if (!w) { pos++; return draw(); }
    stage.innerHTML = `
      <div class="flash-progress">${pos + 1} / ${due.length} · 상자 ${S.srs[id]?.b || 1}</div>
      <div class="flashcard" id="card">
        <div class="fc-front"><b>${esc(w[0])}</b><button class="tts-btn big" id="say">🔊</button><small>카드를 눌러 뜻 확인</small></div>
        <div class="fc-back hidden"><b>${esc(w[1])}</b><em>${esc(w[2])}</em><span>${esc(w[3])}</span></div>
      </div>
      <div class="flash-actions hidden" id="fa">
        <button class="btn-know no" id="dontKnow">🤔 기억 안 나요</button>
        <button class="btn-know yes" id="know">😎 기억나요</button>
      </div>`;
    const card = stage.querySelector("#card");
    stage.querySelector("#say").onclick = (e) => { e.stopPropagation(); speak(w[0] + ". " + w[2], 0.9); };
    card.onclick = () => {
      card.querySelector(".fc-back").classList.remove("hidden");
      stage.querySelector("#fa").classList.remove("hidden");
    };
    stage.querySelector("#know").onclick = () => { srsAnswer(id, true); knownCount++; pos++; draw(); };
    stage.querySelector("#dontKnow").onclick = () => { srsAnswer(id, false); pos++; draw(); };
    speak(w[0], 0.9);
  }
  draw();
}
