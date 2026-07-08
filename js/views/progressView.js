// 진도 관리 — 기록 폼 + 차트 + 앱 학습 통계 + (선택) AI 분석
import { el, esc, shell, pageHead, toast } from "../ui.js";
import { logProgress, getProgress } from "../store.js";
import { S, srsStats, streak, dayNumber, markActivity } from "../state.js";
import { generate } from "../gemini.js";
import { getModule } from "../prompts.js";
import { renderMarkdown } from "../markdown.js";
import { getGeminiKey } from "../config.js";
import { VOCAB_UNITS } from "../data/vocab.js";
import { GRAMMAR_PATTERNS } from "../data/grammar.js";

const today = () => new Date().toISOString().slice(0, 10);

export async function renderProgress(user, profile) {
  const stats = srsStats();
  const unitsDone = Object.keys(S.unitsDone).length;
  const grammarDone = Object.keys(S.grammarDone).length;

  const content = el(`
    <div class="view">
      ${pageHead("📈 학습 진도 관리", "숫자가 쌓이는 것을 보는 것 자체가 최고의 동기부여입니다. 매일 학습 후 기록하세요.")}

      <div class="stats big-stats">
        <div class="stat"><b>Day ${dayNumber()}</b><span>프로그램 진행</span></div>
        <div class="stat"><b>🔥 ${streak()}일</b><span>연속 학습</span></div>
        <div class="stat"><b>${stats.total}</b><span>학습 단어 (SRS)</span></div>
        <div class="stat"><b>${unitsDone}/${VOCAB_UNITS.length}</b><span>어휘 유닛</span></div>
        <div class="stat"><b>${grammarDone}/${GRAMMAR_PATTERNS.length}</b><span>문법 패턴</span></div>
        <div class="stat"><b>${stats.due}</b><span>복습 대기</span></div>
      </div>

      <div class="prog-grid">
        <form id="logForm" class="log-form card-block">
          <h3>오늘 학습 기록</h3>
          <label>날짜<input type="date" id="p-date" value="${today()}"></label>
          <label>말하기 시간 (분)<input type="number" id="p-speak" min="0" value="10"></label>
          <label>듣기 이해도 (1~10)<input type="range" id="p-listen" min="1" max="10" value="5" oninput="this.nextElementSibling.textContent=this.value"><output>5</output></label>
          <label>발음 자신감 (1~10)<input type="range" id="p-pron" min="1" max="10" value="5" oninput="this.nextElementSibling.textContent=this.value"><output>5</output></label>
          <label>회화 자신감 (1~10)<input type="range" id="p-conf" min="1" max="10" value="5" oninput="this.nextElementSibling.textContent=this.value"><output>5</output></label>
          <label>메모<textarea id="p-note" rows="2" placeholder="오늘 배운 표현, 어려웠던 점"></textarea></label>
          <button class="btn-primary" type="submit">기록 저장</button>
        </form>

        <div class="card-block">
          <h3>최근 추이 — 말하기 시간</h3>
          <div id="chart" class="chart"><div class="empty">기록이 쌓이면 그래프가 표시됩니다.</div></div>
          <div class="stats" id="dstats"></div>
        </div>
      </div>

      <div class="card-block">
        <div class="analysis-head">
          <h3>🤖 AI 학습 분석 <small class="muted">(Gemini 키 필요 · 선택 기능)</small></h3>
          <button id="analyzeBtn" class="btn-primary sm">분석 요청</button>
        </div>
        <div id="analysis" class="output slim"><div class="empty">주 1회, 기록을 바탕으로 AI가 다음 주 집중 포인트를 제안합니다.</div></div>
      </div>
    </div>`);
  shell("progress", content);

  const drawChart = async () => {
    let data = [];
    try { data = await getProgress(user.uid, 30); } catch (_) {}
    data = data.sort((a, b) => a.date.localeCompare(b.date));
    if (!data.length) return;
    const chart = content.querySelector("#chart");
    const maxSpeak = Math.max(...data.map((d) => d.speakingMinutes || 0), 10);
    chart.innerHTML =
      `<div class="bars">` +
      data.slice(-14).map((d) => {
        const h = Math.round(((d.speakingMinutes || 0) / maxSpeak) * 100);
        return `<div class="bar-col" title="${d.date}: ${d.speakingMinutes || 0}분">
            <div class="bar" style="height:${h}%"></div><span>${d.date.slice(5)}</span></div>`;
      }).join("") +
      `</div>`;
    const totSpeak = data.reduce((s, d) => s + (d.speakingMinutes || 0), 0);
    const avg = (k) => (data.reduce((s, d) => s + (d[k] || 0), 0) / data.length).toFixed(1);
    content.querySelector("#dstats").innerHTML = `
      <div class="stat"><b>${totSpeak}분</b><span>총 말하기</span></div>
      <div class="stat"><b>${avg("listeningScore")}</b><span>평균 듣기</span></div>
      <div class="stat"><b>${avg("confidence")}</b><span>평균 자신감</span></div>`;
  };
  drawChart();

  content.querySelector("#logForm").onsubmit = async (e) => {
    e.preventDefault();
    const entry = {
      date: content.querySelector("#p-date").value || today(),
      speakingMinutes: +content.querySelector("#p-speak").value || 0,
      listeningScore: +content.querySelector("#p-listen").value,
      pronunciationScore: +content.querySelector("#p-pron").value,
      confidence: +content.querySelector("#p-conf").value,
      note: content.querySelector("#p-note").value.trim(),
      vocabLearned: srsStats().total,
    };
    try {
      await logProgress(user.uid, entry);
      markActivity();
      toast("기록 저장! 🔥 스트릭 유지 중");
      drawChart();
    } catch (err) {
      toast("저장 실패: " + err.message, true);
    }
  };

  content.querySelector("#analyzeBtn").onclick = async () => {
    const box = content.querySelector("#analysis");
    if (!getGeminiKey()) {
      box.innerHTML = `<div class="empty">AI 분석에는 Gemini API 키가 필요합니다. <a href="#/settings">설정</a>에서 키를 등록하세요. (앱의 다른 모든 기능은 키 없이 사용 가능)</div>`;
      return;
    }
    box.innerHTML = `<div class="loading"><div class="spinner"></div><p>학습 데이터를 분석하는 중…</p></div>`;
    try {
      let data = [];
      try { data = await getProgress(user.uid, 30); } catch (_) {}
      const appLine = `앱 내 학습: Day ${dayNumber()}, 스트릭 ${streak()}일, 어휘 ${srsStats().total}단어(복습대기 ${srsStats().due}), 어휘유닛 ${Object.keys(S.unitsDone).length}/25, 문법 ${Object.keys(S.grammarDone).length}/24`;
      const logLines = data
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((d) => `${d.date}: 말하기 ${d.speakingMinutes}분, 듣기 ${d.listeningScore}/10, 발음 ${d.pronunciationScore}/10, 자신감 ${d.confidence}/10${d.note ? ` (${d.note})` : ""}`)
        .join("\n");
      const m = getModule("progress");
      const text = await generate(m.build(profile, appLine + "\n" + (logLines || "일별 기록 없음")));
      box.innerHTML = `<div class="md">${renderMarkdown(text)}</div>`;
    } catch (e) {
      box.innerHTML = `<div class="error-box">⚠️ ${esc(e.message)}</div>`;
    }
  };
}
