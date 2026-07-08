// 브라우저 내장 음성 합성(TTS) — 무료, 오프라인 지원
let voice = null;

function pickVoice() {
  const voices = speechSynthesis.getVoices();
  // 미국 영어 원어민 음성 우선
  voice =
    voices.find((v) => v.lang === "en-US" && /Google|Natural|Samantha/i.test(v.name)) ||
    voices.find((v) => v.lang === "en-US") ||
    voices.find((v) => v.lang.startsWith("en")) ||
    null;
}

if (typeof speechSynthesis !== "undefined") {
  pickVoice();
  speechSynthesis.onvoiceschanged = pickVoice;
}

export function speak(text, rate = 1) {
  if (typeof speechSynthesis === "undefined") return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = rate;
  if (voice) u.voice = voice;
  speechSynthesis.speak(u);
}

export function stopSpeak() {
  if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
}

export const ttsAvailable = typeof speechSynthesis !== "undefined";
