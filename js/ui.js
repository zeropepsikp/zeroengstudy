// UI 공통 헬퍼 — 엘리먼트 생성, 토스트, 셸(사이드바 레이아웃)

export const el = (html) => {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
};

export const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function toast(msg, isErr = false) {
  const t = el(`<div class="toast ${isErr ? "err" : ""}">${msg}</div>`);
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add("show"));
  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.remove(), 300);
  }, isErr ? 5000 : 2600);
}

export const go = (h) => (location.hash = h);

// 셸 컨텍스트 (app.js가 로그인 후 설정)
let CTX = { user: null, profile: null, onLogout: null };
export function setShellCtx(ctx) {
  CTX = ctx;
}

const NAV = [
  ["dashboard", "🏠", "대시보드", "#/dashboard"],
  ["roadmap", "🧭", "3개월 로드맵", "#/roadmap"],
  ["vocab", "📚", "어휘 트레이닝", "#/vocab"],
  ["grammar", "🧩", "실전 문법", "#/grammar"],
  ["speaking", "🎙️", "말하기·발음", "#/speaking"],
  ["opic", "🎤", "오픽 스크립트", "#/opic"],
  ["immersion", "🌊", "몰입 환경", "#/immersion"],
  ["progress", "📈", "진도 관리", "#/progress"],
  ["chat", "💬", "AI 회화 파트너", "#/chat"],
  ["settings", "⚙️", "설정", "#/settings"],
];

export function shell(activeId, content) {
  const app = document.getElementById("app");
  app.innerHTML = "";
  const { user, profile } = CTX;

  const nav = NAV.map(
    ([id, icon, label, href]) =>
      `<a href="${href}" class="nav-item ${activeId === id ? "active" : ""}">
         <span class="ni-icon">${icon}</span>${label}</a>`
  ).join("");

  const wrap = el(`
    <div class="shell">
      <aside class="sidebar">
        <div class="brand" data-go="#/dashboard">🚀 ZERO 영어</div>
        <div class="who">
          <img src="${user?.photoURL || ""}" onerror="this.style.display='none'" alt="">
          <div><b>${esc(user?.displayName || "학습자")}</b><small>${esc(
    profile?.targetLanguage || "영어"
  )} · ${esc(profile?.currentLevel || "")}</small></div>
        </div>
        <nav>${nav}</nav>
        <button id="logoutBtn" class="btn-ghost">로그아웃</button>
      </aside>
      <main class="content"></main>
      <button class="menu-toggle" id="menuToggle">☰</button>
    </div>`);

  wrap.querySelector(".content").appendChild(content);
  wrap.querySelector("#logoutBtn").onclick = () => CTX.onLogout && CTX.onLogout();
  wrap.querySelector(".brand").onclick = () => go("#/dashboard");
  const sidebar = wrap.querySelector(".sidebar");
  wrap.querySelector("#menuToggle").onclick = () => sidebar.classList.toggle("open");
  wrap.querySelectorAll(".nav-item").forEach((a) =>
    a.addEventListener("click", () => sidebar.classList.remove("open"))
  );
  app.appendChild(wrap);
  return wrap;
}

export function pageHead(title, sub, backHref = "#/dashboard") {
  return `
    <header class="page-head">
      ${backHref ? `<a class="back" href="${backHref}">← 뒤로</a>` : ""}
      <h1>${title}</h1>
      ${sub ? `<p>${sub}</p>` : ""}
    </header>`;
}
