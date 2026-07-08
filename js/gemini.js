// Gemini API 호출 래퍼
import { getGeminiKey, GEMINI_MODEL } from "./config.js";

const BASE = "https://generativelanguage.googleapis.com/v1beta/models";

/**
 * 단일 프롬프트로 텍스트를 생성합니다.
 * @param {string} prompt  사용자 프롬프트
 * @param {object} opts    { system, temperature }
 * @returns {Promise<string>} 생성된 텍스트
 */
export async function generate(prompt, opts = {}) {
  const key = getGeminiKey();
  if (!key) {
    throw new Error(
      "Gemini API 키가 설정되지 않았습니다. 설정 화면에서 키를 입력하거나 배포 시 GEMINY_KEY 시크릿을 등록하세요."
    );
  }

  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: opts.temperature ?? 0.8,
      maxOutputTokens: opts.maxOutputTokens ?? 4096,
    },
  };
  if (opts.system) {
    body.systemInstruction = { parts: [{ text: opts.system }] };
  }

  const url = `${BASE}/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let detail = "";
    try {
      const j = await res.json();
      detail = j.error?.message || JSON.stringify(j);
    } catch (_) {
      detail = await res.text();
    }
    throw new Error(`Gemini 오류 (${res.status}): ${detail}`);
  }

  const data = await res.json();
  const cand = data.candidates?.[0];
  const text =
    cand?.content?.parts?.map((p) => p.text || "").join("") || "";
  if (!text) {
    throw new Error("응답이 비어 있습니다. 잠시 후 다시 시도해 주세요.");
  }
  return text.trim();
}

/**
 * 멀티턴 대화 (회화 연습용)
 * @param {Array<{role:'user'|'model', text:string}>} history
 * @param {object} opts { system, temperature }
 */
export async function chat(history, opts = {}) {
  const key = getGeminiKey();
  if (!key) throw new Error("Gemini API 키가 설정되지 않았습니다.");

  const body = {
    contents: history.map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    })),
    generationConfig: {
      temperature: opts.temperature ?? 0.9,
      maxOutputTokens: opts.maxOutputTokens ?? 2048,
    },
  };
  if (opts.system) body.systemInstruction = { parts: [{ text: opts.system }] };

  const url = `${BASE}/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let detail = "";
    try {
      detail = (await res.json()).error?.message;
    } catch (_) {}
    throw new Error(`Gemini 오류 (${res.status}): ${detail || ""}`);
  }
  const data = await res.json();
  return (
    data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || ""
  ).trim();
}
