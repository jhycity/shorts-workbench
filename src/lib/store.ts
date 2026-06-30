import type {
  AppState,
  Candidate,
  CandidateNotebook,
  ContentLine,
  Length,
  NotebookId,
  Series,
  Short,
} from "./types";
import { NOTEBOOK_ORDER, DEFAULT_AVOID_STYLES } from "./types";
import {
  SEED_CONTENT_LINES,
  defaultDiversityChecks,
  seedFormats,
  uid,
} from "./presets";

const KEY = "shorts-os::state::v2";
const LEGACY_KEY_V1 = "shorts-os::projects::v1";

const emptyCandidates = (): [Candidate, Candidate, Candidate] => [
  { id: uid(), text: "" },
  { id: uid(), text: "" },
  { id: uid(), text: "" },
];

const emptyCandidateNotebook = (): CandidateNotebook => ({
  status: "todo",
  candidates: emptyCandidates(),
  selectedId: null,
});

const emptyUnlocked = (): Record<NotebookId, boolean> =>
  Object.fromEntries(NOTEBOOK_ORDER.map((k) => [k, false])) as Record<
    NotebookId,
    boolean
  >;

export function createShort(input: {
  seriesId: string;
  title: string;
  sourceType: Short["sourceType"];
  sourceRef?: string;
  isDraft?: boolean;
}): Short {
  const now = Date.now();
  return {
    id: uid(),
    seriesId: input.seriesId,
    title: input.title,
    sourceType: input.sourceType,
    sourceRef: input.sourceRef,
    isDraft: input.isDraft,
    createdAt: now,
    updatedAt: now,
    notebooks: {
      topic: emptyCandidateNotebook(),
      hook: emptyCandidateNotebook(),
      script: emptyCandidateNotebook(),
      title: {
        status: "todo",
        titles: emptyCandidates(),
        thumbs: emptyCandidates(),
        selectedTitleId: null,
        selectedThumbId: null,
      },
      voice: {
        status: "todo",
        candidates: [
          { id: uid(), text: "차분한 남자 저음" },
          { id: uid(), text: "빠른 정보 전달 톤" },
          { id: uid(), text: "감성적 나레이션 톤" },
        ],
        selectedId: null,
      },
      scene: emptyCandidateNotebook(),
      diversity: {
        status: "todo",
        checks: defaultDiversityChecks(),
        note: "",
        monetizationNote: "",
      },
      export: {
        status: "todo",
        editorGuide: "",
        uploadChecklist: [],
        aiDisclosureNote: "",
        copyrightNote: "",
      },
    },
    unlocked: emptyUnlocked(),
  };
}

export function createSeries(input: {
  title: string;
  description: string;
  contentLineIds: string[];
  defaultLength: Length;
  defaultTone: string;
  defaultScreenStyle: string;
  avoidStyles: string[];
}): Series {
  const now = Date.now();
  return {
    id: uid(),
    title: input.title,
    description: input.description,
    contentLineIds: input.contentLineIds.slice(0, 3),
    defaultLength: input.defaultLength,
    defaultTone: input.defaultTone,
    defaultScreenStyle: input.defaultScreenStyle,
    avoidStyles: input.avoidStyles,
    trendInbox: {
      keywords: "",
      emotions: "",
      refStructure: "",
      myAngle: "",
      avoid: "",
    },
    shorts: [],
    createdAt: now,
    updatedAt: now,
  };
}

function lineIdByName(lines: ContentLine[]): Record<string, string> {
  return Object.fromEntries(lines.map((l) => [l.name, l.id]));
}

export function seedAppState(): AppState {
  const lines = SEED_CONTENT_LINES.slice();
  const formats = seedFormats(lineIdByName(lines));
  const series = createSeries({
    title: "20대 현실 조언",
    description:
      "20대가 지금 무엇을 해야 하는지 현실적으로, 그러나 생각할 거리를 남기는 시리즈.",
    contentLineIds: [
      lines.find((l) => l.id === "cl_twenties")!.id,
    ],
    defaultLength: "30초",
    defaultTone: "빠르게 들리지만 끝에는 생각하게 만드는 현실 조언형",
    defaultScreenStyle: "자막 중심 + 감성 배경 + 빠른 컷",
    avoidStyles: [
      "양산형 AI 쇼츠 느낌",
      "의미 없는 명언 영상",
      "팩트체크 없는 주장",
      "자극만 있고 내용 없는 영상",
      "너무 똑같은 포맷 반복",
    ],
  });
  series.shorts.push(
    createShort({
      seriesId: series.id,
      title: "20대에 무조건 해야 할 것 TOP3",
      sourceType: "blank",
      isDraft: true,
    }),
  );
  return {
    schemaVersion: 2,
    series: [series],
    contentLines: lines,
    ideas: [],
    formats,
    lastSavedAt: 0,
  };
}

export function loadAppState(): AppState {
  if (typeof window === "undefined") return seedAppState();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (parsed?.schemaVersion === 2) return normalize(parsed);
    }
    // v1 → v2 폐기성 마이그레이션: 시드 + 안내
    const legacy = localStorage.getItem(LEGACY_KEY_V1);
    if (legacy) {
      // 구조가 너무 달라 자동 변환 대신 백업 키로 보존
      localStorage.setItem("shorts-os::projects::v1.backup", legacy);
    }
  } catch {}
  return seedAppState();
}

function normalize(s: AppState): AppState {
  // 보강: 없는 필드 채우기
  return {
    ...s,
    contentLines: s.contentLines?.length ? s.contentLines : SEED_CONTENT_LINES.slice(),
    ideas: s.ideas ?? [],
    formats: s.formats ?? [],
    series: (s.series ?? []).map((se) => ({
      ...se,
      contentLineIds: se.contentLineIds ?? [],
      avoidStyles: se.avoidStyles ?? DEFAULT_AVOID_STYLES,
      trendInbox: se.trendInbox ?? {
        keywords: "",
        emotions: "",
        refStructure: "",
        myAngle: "",
        avoid: "",
      },
      shorts: (se.shorts ?? []).map((sh) => ({
        ...sh,
        unlocked: sh.unlocked ?? emptyUnlocked(),
      })),
    })),
  };
}

export function saveAppState(state: AppState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    console.error("save failed", e);
  }
}

export function exportBackup(state: AppState): string {
  return JSON.stringify(state, null, 2);
}

export function importBackup(json: string): AppState {
  const parsed = JSON.parse(json) as AppState;
  if (parsed?.schemaVersion !== 2) throw new Error("스키마 버전이 다릅니다");
  return normalize(parsed);
}

// ----- 진행률/잠금 -----
export function notebookProgress(s: Short) {
  const done = NOTEBOOK_ORDER.filter(
    (id) => s.notebooks[id].status === "done",
  ).length;
  return {
    done,
    total: NOTEBOOK_ORDER.length,
    pct: Math.round((done / NOTEBOOK_ORDER.length) * 100),
  };
}

export function isLocked(s: Short, id: NotebookId): boolean {
  if (s.unlocked[id]) return false;
  const idx = NOTEBOOK_ORDER.indexOf(id);
  if (idx <= 0) return false;
  const prev = NOTEBOOK_ORDER[idx - 1];
  return s.notebooks[prev].status !== "done";
}

export function nextStep(s: Short): NotebookId | null {
  return (
    NOTEBOOK_ORDER.find((id) => s.notebooks[id].status !== "done") ?? null
  );
}

export function seriesStats(s: Series) {
  const total = s.shorts.length;
  const done = s.shorts.filter(
    (sh) => sh.notebooks.export.status === "done",
  ).length;
  const inProgress = s.shorts.filter(
    (sh) =>
      sh.notebooks.export.status !== "done" &&
      NOTEBOOK_ORDER.some((id) => sh.notebooks[id].status !== "todo"),
  ).length;
  return { total, done, inProgress };
}
