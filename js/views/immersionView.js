// 몰입 환경 — 레벨별 큐레이션 + 활용법 + 주간 루틴 + 수집한 문장함
import { el, esc, shell, pageHead, toast } from "../ui.js";
import { IMMERSION_LEVELS, ACTIVE_METHODS, WEEKLY_IMMERSION } from "../data/immersion.js";
import { S, persist } from "../state.js";
import { speak } from "../tts.js";

export function renderImmersion() {
  const levels = IMMERSION_LEVELS.map(
    (lv) => `
    <div class="card-block">
      <h3>${esc(lv.level)}</h3>
      <p class="motto">“${esc(lv.motto)}”</p>
      ${lv.items
        .map(
          (item) => `
        <div class="imm-type">
          <b>${esc(item.type)}</b>
          <ul>${item.picks.map((p) => `<li><b>${esc(p[0])}</b> — ${esc(p[1])}</li>`).join("")}</ul>
        </div>`
        )
        .join("")}
    </div>`
  ).join("");

  const methods = ACTIVE_METHODS.map(
    (m) => `
    <div class="method-card">
      <div class="method-icon">${m.icon}</div>
      <b>${esc(m.name)}</b>
      <p>${esc(m.how)}</p>
    </div>`
  ).join("");

  const collected = S.collected.length
    ? S.collected
        .map(
          (c, i) => `
      <div class="ex-row">
        <button class="tts-btn" data-i="${i}">🔊</button>
        <div><b>${esc(c[0])}</b><span>${esc(c[1])}</span></div>
        <button class="collect-btn del" data-i="${i}" title="삭제">✕</button>
      </div>`
        )
        .join("")
    : `<div class="empty">쉐도잉 화면에서 ➕ 버튼으로 마음에 드는 문장을 수집하세요.<br>수집한 문장이 나만의 회화 교재가 됩니다.</div>`;

  const content = el(`
    <div class="view">
      ${pageHead("🌊 몰입형 언어 환경", "하루 24시간 중 학습 시간 외의 시간을 영어에 노출시키는 환경 설계. 소비가 아니라 '능동적 활용'이 핵심입니다.")}
      <div class="card-block">
        <h3>📅 주간 몰입 루틴 (학습 시간과 별도, 자투리 시간 활용)</h3>
        <div class="table-wrap"><table>
          <thead><tr>${WEEKLY_IMMERSION.map((w) => `<th>${w[0]}</th>`).join("")}</tr></thead>
          <tbody><tr>${WEEKLY_IMMERSION.map((w) => `<td>${esc(w[1])}</td>`).join("")}</tr></tbody>
        </table></div>
      </div>
      <div class="card-block">
        <h3>⚡ 콘텐츠를 학습으로 바꾸는 6가지 방법</h3>
        <div class="method-grid">${methods}</div>
      </div>
      ${levels}
      <div class="card-block">
        <h3>📥 내 문장함 (${S.collected.length})</h3>
        <div id="collectedBox">${collected}</div>
      </div>
    </div>`);
  shell("immersion", content);

  content.querySelectorAll("#collectedBox .tts-btn").forEach((b) => {
    b.onclick = () => speak(S.collected[+b.dataset.i][0], 0.95);
  });
  content.querySelectorAll("#collectedBox .del").forEach((b) => {
    b.onclick = () => {
      S.collected.splice(+b.dataset.i, 1);
      persist();
      toast("삭제했어요");
      renderImmersion();
    };
  });
}
