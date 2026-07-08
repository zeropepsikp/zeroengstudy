// 3개월 로드맵 — 12주 커리큘럼 + 현재 위치 표시
import { el, esc, shell, pageHead } from "../ui.js";
import { PROGRAM, weekInfo } from "../data/roadmap.js";
import { dayNumber } from "../state.js";

export function renderRoadmap() {
  const day = dayNumber();
  const { week } = weekInfo(day);

  const phases = PROGRAM.phases
    .map((p) => {
      const weeks = p.weeks
        .map((w) => {
          const isNow = w.week === week;
          const isPast = w.week < week;
          return `
          <div class="week-card ${isNow ? "now" : ""} ${isPast ? "past" : ""}">
            <div class="week-head">
              <span class="week-no">${w.week}주차</span>
              ${isNow ? '<span class="badge-now">📍 이번 주</span>' : isPast ? '<span class="badge-past">완료 구간</span>' : ""}
            </div>
            <b>${esc(w.focus)}</b>
            <ul>${w.tasks.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
          </div>`;
        })
        .join("");
      return `
      <div class="phase-block">
        <div class="phase-head">
          <h2>${p.month}개월차 — ${esc(p.theme)}</h2>
          <p class="phase-goal">🎯 ${esc(p.goal)}</p>
        </div>
        <div class="week-grid">${weeks}</div>
      </div>`;
    })
    .join("");

  const content = el(`
    <div class="view">
      ${pageHead("🧭 " + PROGRAM.title, `오늘은 <b>Day ${day} · ${Math.min(week, 12)}주차</b>입니다. ${day > 84 ? "정규 12주 과정을 완주했습니다! 복습과 AI 프리토킹으로 유지하세요. 🏆" : ""}`)}
      <div class="card-block">
        <h3>📌 이 프로그램의 4가지 원칙</h3>
        <ol class="method-list">${PROGRAM.principles.map((p) => `<li>${esc(p)}</li>`).join("")}</ol>
      </div>
      ${phases}
    </div>`);
  shell("roadmap", content);

  // 이번 주로 스크롤
  const now = content.querySelector(".week-card.now");
  if (now) setTimeout(() => now.scrollIntoView({ behavior: "smooth", block: "center" }), 300);
}
