import type {
  AppState,
  Candidate,
  CandidateNotebook,
  ContentLine,
  FinalizeNotebookData,
  GuideNotebookData,
  Length,
  Material,
  NotebookId,
  Series,
  Short,
  SourceNotebookData,
} from "./types";
import { NOTEBOOK_ORDER } from "./types";
import {
  SEED_CONTENT_LINES,
  defaultDiversityChecks,
  seedFormats,
  uid,
} from "./presets";

const KEY = "shorts-os::state::v3";
const LEGACY_V2 = "shorts-os::state::v2";
const LEGACY_V1 = "shorts-os::projects::v1";

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

const emptySource = (): SourceNotebookData => ({ status: "todo", note: "" });

const emptyGuide = (): GuideNotebookData => ({
  status: "todo",
  tts: "",
  subtitleTempo: "",
  screenStyle: "",
  sceneComposition: "",
  brollIdeas: "",
  editorNote: "",
});

const emptyFinalize = (): FinalizeNotebookData => ({
  status: "todo",
  checks: defaultDiversityChecks(),
  copyrightNote: "",
  aiDisclosureNote: "",
  myTakeNote: "",
  factCheckNote: "",
  uploadTitle: "",
  uploadDescription: "",
  uploadHashtags: "",
});

const emptyUnlocked = (): Record<NotebookId, boolean> =>
  Object.fromEntries(NOTEBOOK_ORDER.map((k) => [k, false])) as Record<
    NotebookId,
    boolean
  >;

export function createShort(input: {
  seriesId: string;
  subNotebookId?: string;
  title: string;
  sourceType: Short["sourceType"];
  sourceRef?: string;
  materials?: Material[];
  isDraft?: boolean;
}): Short {
  const now = Date.now();
  return {
    id: uid(),
    seriesId: input.seriesId,
    subNotebookId: input.subNotebookId,
    title: input.title,
    sourceType: input.sourceType,
    sourceRef: input.sourceRef,
    materials: input.materials ?? [],
    isDraft: input.isDraft,
    createdAt: now,
    updatedAt: now,
    notebooks: {
      source: emptySource(),
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
      guide: emptyGuide(),
      finalize: emptyFinalize(),
    },
    unlocked: emptyUnlocked(),
  };
}

export function createSeries(input: {
  title: string;
  description: string;
  tags: string[];
  defaultLength: Length;
  defaultTone: string;
  defaultScreenStyle: string;
  defaultFormatId?: string;
  defaultVoice?: string;
  defaultSubtitleStyle?: string;
}): Series {
  const now = Date.now();
  return {
    id: uid(),
    title: input.title,
    description: input.description,
    tags: input.tags.slice(0, 3),
    defaultLength: input.defaultLength,
    defaultTone: input.defaultTone,
    defaultScreenStyle: input.defaultScreenStyle,
    defaultFormatId: input.defaultFormatId,
    defaultVoice: input.defaultVoice,
    defaultSubtitleStyle: input.defaultSubtitleStyle,
    subNotebooks: [],
    trendInbox: {
      keywords: "",
      emotions: "",
      refStructure: "",
      myAngle: "",
      avoid: "",
    },
    shorts: [],
    contentLineIds: [],
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
  return {
    schemaVersion: 3,
    series: [],
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
      const parsed = JSON.parse(raw);
      if (parsed?.schemaVersion === 3) return normalize(parsed);
    }
    // v2 → v3 migration
    const v2 = localStorage.getItem(LEGACY_V2);
    if (v2) {
      const parsed = JSON.parse(v2);
      const migrated = migrateFromV2(parsed);
      localStorage.setItem(
        "shorts-os::state::v2.backup",
        v2,
      );
      return migrated;
    }
    const legacy = localStorage.getItem(LEGACY_V1);
    if (legacy) {
      localStorage.setItem("shorts-os::projects::v1.backup", legacy);
    }
  } catch {}
  return seedAppState();
}

// v2 → v3
function migrateFromV2(v2: any): AppState {
  const base = seedAppState();
  const series: Series[] = (v2.series ?? []).map((se: any) => ({
    id: se.id ?? uid(),
    title: se.title ?? "제작 노트북",
    description: se.description ?? "",
    tags: [],
    defaultLength: se.defaultLength ?? "30초",
    defaultTone: se.defaultTone ?? "",
    defaultScreenStyle: se.defaultScreenStyle ?? "",
    subNotebooks: [],
    trendInbox: se.trendInbox ?? {
      keywords: "",
      emotions: "",
      refStructure: "",
      myAngle: "",
      avoid: "",
    },
    shorts: (se.shorts ?? []).map((sh: any) => migrateShort(sh, se.id)),
    contentLineIds: se.contentLineIds ?? [],
    createdAt: se.createdAt ?? Date.now(),
    updatedAt: se.updatedAt ?? Date.now(),
  }));
  return {
    ...base,
    series,
    ideas: v2.ideas ?? [],
    formats: v2.formats ?? base.formats,
  };
}

function migrateShort(sh: any, seriesId: string): Short {
  const oldNb = sh.notebooks ?? {};
  const newShort = createShort({
    seriesId: sh.seriesId ?? seriesId,
    title: sh.title ?? "쇼츠",
    sourceType: sh.sourceType ?? "blank",
    sourceRef: sh.sourceRef,
    isDraft: sh.isDraft,
  });
  newShort.id = sh.id ?? newShort.id;
  newShort.createdAt = sh.createdAt ?? newShort.createdAt;
  newShort.updatedAt = sh.updatedAt ?? newShort.updatedAt;
  // 후보 데이터 이전
  if (oldNb.topic) newShort.notebooks.topic = oldNb.topic;
  if (oldNb.hook) newShort.notebooks.hook = oldNb.hook;
  if (oldNb.script) newShort.notebooks.script = oldNb.script;
  if (oldNb.title) newShort.notebooks.title = oldNb.title;
  // voice+scene → guide
  if (oldNb.voice || oldNb.scene) {
    const voiceSel =
      oldNb.voice?.candidates?.find((c: any) => c.id === oldNb.voice?.selectedId)
        ?.text ?? "";
    const sceneSel =
      oldNb.scene?.candidates?.find((c: any) => c.id === oldNb.scene?.selectedId)
        ?.text ?? "";
    newShort.notebooks.guide = {
      ...newShort.notebooks.guide,
      tts: voiceSel,
      sceneComposition: sceneSel,
    };
  }
  // diversity+export → finalize
  if (oldNb.diversity || oldNb.export) {
    newShort.notebooks.finalize = {
      ...newShort.notebooks.finalize,
      checks: oldNb.diversity?.checks ?? newShort.notebooks.finalize.checks,
      copyrightNote: oldNb.export?.copyrightNote ?? "",
      aiDisclosureNote: oldNb.export?.aiDisclosureNote ?? "",
      myTakeNote: oldNb.diversity?.note ?? "",
    };
  }
  return newShort;
}

function normalize(s: AppState): AppState {
  return {
    ...s,
    contentLines: s.contentLines ?? [],
    ideas: s.ideas ?? [],
    formats: s.formats ?? [],
    series: (s.series ?? []).map((se) => ({
      ...se,
      tags: se.tags ?? [],
      subNotebooks: se.subNotebooks ?? [],
      contentLineIds: se.contentLineIds ?? [],
      trendInbox: se.trendInbox ?? {
        keywords: "",
        emotions: "",
        refStructure: "",
        myAngle: "",
        avoid: "",
      },
      shorts: (se.shorts ?? []).map((sh) => ({
        ...sh,
        materials: sh.materials ?? [],
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
  const parsed = JSON.parse(json);
  if (parsed?.schemaVersion === 3) return normalize(parsed);
  if (parsed?.schemaVersion === 2) return migrateFromV2(parsed);
  throw new Error("스키마 버전을 알 수 없어요");
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
  return NOTEBOOK_ORDER.find((id) => s.notebooks[id].status !== "done") ?? null;
}

export function seriesStats(s: Series) {
  const total = s.shorts.length;
  const done = s.shorts.filter(
    (sh) => sh.notebooks.finalize.status === "done",
  ).length;
  const inProgress = s.shorts.filter(
    (sh) =>
      sh.notebooks.finalize.status !== "done" &&
      NOTEBOOK_ORDER.some((id) => sh.notebooks[id].status !== "todo"),
  ).length;
  return { total, done, inProgress };
}
