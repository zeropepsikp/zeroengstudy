// Firebase 초기화 + 인증 + Firestore 데이터 접근 계층
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// ── 인증 ──────────────────────────────────────────────
export function onAuth(cb) {
  return onAuthStateChanged(auth, cb);
}

export async function login() {
  try {
    await signInWithPopup(auth, provider);
  } catch (e) {
    // 팝업이 차단되면 리다이렉트로 대체
    if (
      e.code === "auth/popup-blocked" ||
      e.code === "auth/cancelled-popup-request" ||
      e.code === "auth/operation-not-supported-in-this-environment"
    ) {
      await signInWithRedirect(auth, provider);
    } else {
      throw e;
    }
  }
}

export function logout() {
  return signOut(auth);
}

export function currentUser() {
  return auth.currentUser;
}

// ── 프로필 ────────────────────────────────────────────
export async function getProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data().profile || null : null;
}

export async function saveProfile(uid, profile) {
  await setDoc(
    doc(db, "users", uid),
    { profile, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

// ── 모듈 결과 저장/불러오기 ──────────────────────────────
export async function saveModuleResult(uid, moduleId, content) {
  await setDoc(doc(db, "users", uid, "modules", moduleId), {
    content,
    updatedAt: serverTimestamp(),
  });
}

export async function getModuleResult(uid, moduleId) {
  const snap = await getDoc(doc(db, "users", uid, "modules", moduleId));
  return snap.exists() ? snap.data().content : null;
}

// ── 진도 기록 ──────────────────────────────────────────
export async function logProgress(uid, entry) {
  const id = entry.date; // YYYY-MM-DD
  await setDoc(doc(db, "users", uid, "progress", id), {
    ...entry,
    updatedAt: serverTimestamp(),
  });
}

export async function getProgress(uid, max = 30) {
  const q = query(
    collection(db, "users", uid, "progress"),
    orderBy("date", "desc"),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
}

// ── 앱 학습 상태 (SRS/체크리스트/스트릭 등) ────────────
export async function getAppState(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data().appState || null : null;
}

export async function saveAppState(uid, state) {
  await setDoc(
    doc(db, "users", uid),
    { appState: state, stateUpdatedAt: serverTimestamp() },
    { merge: true }
  );
}

// ── 회화 세션 저장 ─────────────────────────────────────
export async function saveChat(uid, sessionId, messages) {
  await setDoc(doc(db, "users", uid, "chats", sessionId), {
    messages,
    updatedAt: serverTimestamp(),
  });
}
