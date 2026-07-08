// 학습 상태 싱글턴 — SRS(간격 반복), 유닛/문법 진행, 체크리스트, 스트릭
// localStorage에 즉시 저장 + Firestore에 디바운스 동기화

import { getAppState, saveAppState } from "./store.js";

const LS_KEY = "zes_state";
const SRS_INTERVALS = [1, 2, 4, 7, 15]; // box 1~5의 다음 복습 간격(일)

export let S = defaultState();
let UID = null;
let saveTimer = null;

function defaultState() {
  return {
    startDate: null,      // 프로그램 시작일 YYYY-MM-DD
    srs: {},              // wordId -> { b: box(1~5), d: dueDate }
    unitsDone: {},        // unitId -> { score, total, at }
    grammarDone: {},      // patternId -> { score, total, at }
    checklist: {},        // date -> { itemIdx: true }
    activity: [],         // 학습한 날짜 목록 (스트릭 계산용)
    collected: [],        // 수집한 문장 (몰입 환경용)
  };
}

export const today = () => new Date().toISOString().slice(0, 10);

function addDays(dateStr, n) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

// ── 초기화/동기화 ──────────────────────────────────────
export async function initState(uid) {
  UID = uid;
  // 로컬 캐시 우선 로드
  try {
    const local = JSON.parse(localStorage.getItem(LS_KEY) || "null");
    if (local && local._uid === uid) S = { ...defaultState(), ...local.data };
  } catch (_) {}
  // Firestore에서 로드 (있으면 항상 우선 — 기기 간 동기화)
  try {
    const remote = await getAppState(uid);
    if (remote) S = { ...defaultState(), ...remote };
  } catch (_) {}
  if (!S.startDate) {
    S.startDate = today();
    persist();
  }
}

export function persist() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ _uid: UID, data: S }));
  } catch (_) {}
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    if (UID) saveAppState(UID, S).catch(() => {});
  }, 1500);
}

export function resetProgram() {
  S = defaultState();
  S.startDate = today();
  persist();
}

// ── 프로그램 진행 ──────────────────────────────────────
export function dayNumber() {
  const start = new Date(S.startDate + "T00:00:00");
  const now = new Date(today() + "T00:00:00");
  return Math.max(1, Math.round((now - start) / 86400000) + 1);
}

// ── SRS ───────────────────────────────────────────────
// 유닛 학습 완료: 각 단어를 box1(내일 복습)로 등록. 퀴즈 정답 단어는 box2.
export function srsAddUnit(unitId, wordCount, correctIdx = new Set()) {
  for (let i = 0; i < wordCount; i++) {
    const id = `${unitId}-${i}`;
    if (S.srs[id]) continue; // 재학습 시 기존 스케줄 유지
    const box = correctIdx.has(i) ? 2 : 1;
    S.srs[id] = { b: box, d: addDays(today(), SRS_INTERVALS[box - 1]) };
  }
  persist();
}

// 복습 결과 반영: 알면 box+1, 모르면 box1로
export function srsAnswer(wordId, known) {
  const cur = S.srs[wordId] || { b: 1 };
  const box = known ? Math.min(cur.b + 1, 5) : 1;
  S.srs[wordId] = { b: box, d: addDays(today(), SRS_INTERVALS[box - 1]) };
  persist();
}

export function dueWords() {
  const t = today();
  return Object.entries(S.srs)
    .filter(([, v]) => v.d <= t)
    .map(([id]) => id);
}

export function srsStats() {
  const boxes = [0, 0, 0, 0, 0];
  for (const v of Object.values(S.srs)) boxes[v.b - 1]++;
  return { total: Object.keys(S.srs).length, boxes, due: dueWords().length };
}

// ── 유닛/문법 완료 ─────────────────────────────────────
export function markUnitDone(unitId, score, total) {
  S.unitsDone[unitId] = { score, total, at: today() };
  markActivity();
  persist();
}

export function markGrammarDone(id, score, total) {
  S.grammarDone[id] = { score, total, at: today() };
  markActivity();
  persist();
}

// ── 체크리스트 ────────────────────────────────────────
export function toggleChecklist(idx) {
  const t = today();
  if (!S.checklist[t]) S.checklist[t] = {};
  if (S.checklist[t][idx]) delete S.checklist[t][idx];
  else {
    S.checklist[t][idx] = true;
    markActivity();
  }
  // 오래된 체크리스트 정리 (30일 이전)
  for (const d of Object.keys(S.checklist)) {
    if (d < addDays(t, -30)) delete S.checklist[d];
  }
  persist();
}

export function todayChecklist() {
  return S.checklist[today()] || {};
}

// ── 스트릭 ────────────────────────────────────────────
export function markActivity() {
  const t = today();
  if (!S.activity.includes(t)) {
    S.activity.push(t);
    if (S.activity.length > 120) S.activity = S.activity.slice(-120);
    persist();
  }
}

export function streak() {
  const set = new Set(S.activity);
  let count = 0;
  let d = today();
  // 오늘 활동이 없어도 어제까지 이어졌으면 유지로 계산
  if (!set.has(d)) d = addDays(d, -1);
  while (set.has(d)) {
    count++;
    d = addDays(d, -1);
  }
  return count;
}

// ── 문장 수집 ──────────────────────────────────────────
export function collectSentence(en, ko) {
  if (S.collected.some((c) => c[0] === en)) return false;
  S.collected.unshift([en, ko, today()]);
  if (S.collected.length > 300) S.collected.pop();
  persist();
  return true;
}
