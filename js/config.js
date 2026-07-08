// ─────────────────────────────────────────────────────────────
//  앱 설정 (Firebase + Gemini)
//
//  Gemini API 키는 두 가지 방법으로 주입됩니다.
//   1) GitHub Actions 배포 시 저장소 시크릿 `GEMINY_KEY` 값이
//      아래 "__GEMINI_API_KEY__" 자리에 치환됩니다.
//   2) 치환되지 않은 경우(로컬/개발), 사용자가 설정 화면에서
//      직접 입력한 키(localStorage)를 사용합니다.
// ─────────────────────────────────────────────────────────────

export const firebaseConfig = {
  apiKey: "AIzaSyAoZbOuVwyP0mSGLAHbbKgwgF35WzvWOAE",
  authDomain: "zero-engapp.firebaseapp.com",
  projectId: "zero-engapp",
  storageBucket: "zero-engapp.firebasestorage.app",
  messagingSenderId: "282005572728",
  appId: "1:282005572728:web:59aae39f9e25c73fa1718d",
  measurementId: "G-CL4ENWNQPW",
};

// 배포 시 GitHub Actions가 이 문자열을 시크릿 값으로 치환합니다.
const INJECTED_GEMINI_KEY = "__GEMINI_API_KEY__";

export function getGeminiKey() {
  const injected = INJECTED_GEMINI_KEY;
  if (injected && !injected.startsWith("__")) return injected.trim();
  const local = localStorage.getItem("gemini_api_key");
  return local ? local.trim() : "";
}

export function setGeminiKey(key) {
  localStorage.setItem("gemini_api_key", key.trim());
}

// 사용할 Gemini 모델 (무료 티어에서 사용 가능)
export const GEMINI_MODEL =
  localStorage.getItem("gemini_model") || "gemini-2.0-flash";

export function setGeminiModel(model) {
  localStorage.setItem("gemini_model", model);
}
