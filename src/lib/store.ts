import type {
  Project,
  Route,
  Category,
  Platform,
  Length,
  Goal,
  Candidate,
  NotebookId,
  ContentLineId,
} from "./types";
import {
  defaultFormats,
  DEFAULT_AVOID_STYLES,
  DEFAULT_PREFERRED_TONES,
  defaultDiversityChecks,
} from "./presets";

const uid = () => Math.random().toString(36).slice(2, 10);

const emptyCandidates = (): [Candidate, Candidate, Candidate] => [
  { id: uid(), text: "" },
  { id: uid(), text: "" },
  { id: uid(), text: "" },
];

export function createProject(input: {
  title: string;
  route: Route;
  category: Category;
  platform: Platform;
  length: Length;
  goal: Goal;
  contentLine: ContentLineId;
}): Project {
  const now = Date.now();
  const unlocked = Object.fromEntries(
    (
      [
        "trend",
        "idea",
        "format",
        "topic",
        "hook",
        "script",
        "title",
        "voice",
        "scene",
        "diversity",
        "export",
      ] as NotebookId[]
    ).map((k) => [k, false]),
  ) as Record<NotebookId, boolean>;

  return {
    id: uid(),
    ...input,
    avoidStyles: DEFAULT_AVOID_STYLES.map((label) => ({ label, checked: true })),
    preferredTones: DEFAULT_PREFERRED_TONES.map((label) => ({ label, checked: true })),
    createdAt: now,
    updatedAt: now,
    unlocked,
    notebooks: {
      trend: { status: "todo", keywords: [], flows: [], concerns: [] },
      idea: { status: "todo", rawIdeas: [], shapedFormat: "" },
      format: {
        status: "todo",
        formats: defaultFormats(),
        selectedFormatId: null,
      },
      topic: { status: "todo", candidates: emptyCandidates(), selectedId: null },
      hook: { status: "todo", candidates: emptyCandidates(), selectedId: null },
      script: { status: "todo", candidates: emptyCandidates(), selectedId: null },
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
      scene: { status: "todo", candidates: emptyCandidates(), selectedId: null },
      diversity: {
        status: "todo",
        note: "",
        checks: defaultDiversityChecks(),
      },
      export: {
        status: "todo",
        editorGuide: "",
        uploadChecklist: [],
        aiDisclosureNote: "",
        copyrightNote: "",
      },
    },
  };
}

// ----- localStorage + migration -----
const KEY = "shorts-os::projects::v1";
const CURRENT_KEY = "shorts-os::currentProjectId::v1";

// 기존 v1 프로젝트에 신규 필드를 보강
function migrate(raw: unknown): Project[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((p: any) => {
    const migrated: Project = {
      ...p,
      contentLine: (p.contentLine as ContentLineId) ?? "ai_survival",
      avoidStyles:
        p.avoidStyles ??
        DEFAULT_AVOID_STYLES.map((label) => ({ label, checked: true })),
      preferredTones:
        p.preferredTones ??
        DEFAULT_PREFERRED_TONES.map((label) => ({ label, checked: true })),
      notebooks: {
        ...p.notebooks,
        format: {
          ...p.notebooks.format,
          // 기존 포맷 항목에 신규 필드 보강
          formats: (p.notebooks.format?.formats ?? []).map((f: any) => ({
            id: f.id ?? uid(),
            name: f.name ?? "(이름 없음)",
            structure: f.structure ?? f.description ?? "",
            suitedLines: f.suitedLines ?? [],
            pros: f.pros ?? "",
            risks: f.risks ?? "",
            variations: f.variations ?? "",
          })),
        },
        diversity: {
          ...p.notebooks.diversity,
          checks:
            p.notebooks.diversity?.checks?.length > 0
              ? p.notebooks.diversity.checks
              : defaultDiversityChecks(),
        },
        export: {
          status: p.notebooks.export?.status ?? "todo",
          editorGuide: p.notebooks.export?.editorGuide ?? "",
          uploadChecklist: p.notebooks.export?.uploadChecklist ?? [],
          aiDisclosureNote: p.notebooks.export?.aiDisclosureNote ?? "",
          copyrightNote: p.notebooks.export?.copyrightNote ?? "",
        },
      },
    };
    return migrated;
  });
}

export function loadProjects(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? migrate(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

export function saveProjects(projects: Project[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(projects));
}

export function loadCurrentId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CURRENT_KEY);
}

export function saveCurrentId(id: string | null) {
  if (typeof window === "undefined") return;
  if (id) localStorage.setItem(CURRENT_KEY, id);
  else localStorage.removeItem(CURRENT_KEY);
}

import { NOTEBOOK_ORDER } from "./types";

export function notebookProgress(project: Project) {
  const done = NOTEBOOK_ORDER.filter(
    (id) => project.notebooks[id].status === "done",
  ).length;
  return {
    done,
    total: NOTEBOOK_ORDER.length,
    pct: Math.round((done / NOTEBOOK_ORDER.length) * 100),
  };
}

export function isLocked(project: Project, id: NotebookId): boolean {
  if (project.unlocked[id]) return false;
  const idx = NOTEBOOK_ORDER.indexOf(id);
  if (idx <= 0) return false;
  const prev = NOTEBOOK_ORDER[idx - 1];
  return project.notebooks[prev].status !== "done";
}

export function nextStep(project: Project): NotebookId | null {
  return (
    NOTEBOOK_ORDER.find((id) => project.notebooks[id].status !== "done") ?? null
  );
}
