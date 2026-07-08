// AI 회화 파트너 (Gemini · 선택 기능) — 키가 없으면 안내
import { el, esc, shell, pageHead } from "../ui.js";
import { chat } from "../gemini.js";
import { renderMarkdown } from "../markdown.js";
import { getGeminiKey } from "../config.js";
import { markActivity, dayNumber } from "../state.js";
import { weekInfo } from "../data/roadmap.js";
import { speak } from "../tts.js";

export function renderChat(profile) {
  const { week, weekData } = weekInfo(dayNumber());
  const sys = `You are a friendly, patient English conversation partner and tutor for a Korean learner.
Learner level: ${profile.currentLevel}. Goal: ${profile.goal}. They are in week ${week} of a 12-week program (focus: ${weekData.focus}).
Rules:
- Reply mainly in simple English matched to the learner's level.
- Keep replies short (2-4 sentences) and always ask a follow-up question.
- After your reply, add a line starting with "💡" giving a brief Korean tip: correct their mistakes gently or teach one useful expression.
- Be encouraging and natural.`;

  let history = [];
  const hasKey = !!getGeminiKey();

  const content = el(`
    <div class="view chat-view">
      ${pageHead("💬 AI 회화 파트너", "배운 표현을 실전에서 써 보는 곳. 짧아도 좋으니 영어로 먼저 말을 걸어 보세요.")}
      ${!hasKey ? `<div class="error-box">이 기능은 Gemini API 키가 필요합니다. <a href="#/settings">설정</a>에서 무료 키를 등록하세요. 어휘·문법·쉐도잉 등 다른 모든 학습은 키 없이 가능합니다.</div>` : ""}
      <div id="messages" class="messages"></div>
      <form id="chatForm" class="chat-input">
        <input id="chatText" placeholder="영어로 메시지를 입력하세요… (예: Hi! How are you?)" autocomplete="off" ${!hasKey ? "disabled" : ""}>
        <button class="btn-primary" type="submit" ${!hasKey ? "disabled" : ""}>보내기</button>
      </form>
    </div>`);
  shell("chat", content);

  const messages = content.querySelector("#messages");
  const addMsg = (role, text) => {
    const bubble = el(
      `<div class="msg ${role}"><div class="bubble">${renderMarkdown(text)}${
        role === "model" ? '<button class="tts-btn bubble-tts" title="듣기">🔊</button>' : ""
      }</div></div>`
    );
    if (role === "model") {
      const btn = bubble.querySelector(".bubble-tts");
      if (btn) btn.onclick = () => speak(text.split("💡")[0].replace(/[*_#>`]/g, ""), 0.95);
    }
    messages.appendChild(bubble);
    messages.scrollTop = messages.scrollHeight;
    return bubble;
  };

  addMsg("model", `Hi! I'm your English conversation partner. 😊 This week's topic is **${weekData.focus}** — but we can talk about anything! How's your day going?\n\n💡 "How's your day going?"은 "오늘 하루 어때?"라는 가장 흔한 안부 인사예요. 그대로 따라 답해 보세요!`);

  content.querySelector("#chatForm").onsubmit = async (e) => {
    e.preventDefault();
    const input = content.querySelector("#chatText");
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    addMsg("user", text);
    history.push({ role: "user", text });
    markActivity();

    const thinking = addMsg("model", "…");
    thinking.querySelector(".bubble").classList.add("typing");
    try {
      const reply = await chat(history, { system: sys });
      history.push({ role: "model", text: reply });
      thinking.remove();
      addMsg("model", reply);
    } catch (err) {
      thinking.querySelector(".bubble").outerHTML = `<div class="bubble err-bubble">⚠️ ${esc(err.message)}</div>`;
    }
  };
}
