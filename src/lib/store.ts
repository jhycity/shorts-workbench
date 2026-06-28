import type {
  Project,
  Route,
  Category,
  Platform,
  Length,
  Goal,
  Candidate,
  NotebookId,
} from "./types";

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
    createdAt: now,
    updatedAt: now,
    unlocked,
    notebooks: {
      trend: { status: "todo", keywords: [], flows: [], concerns: [] },
      idea: { status: "todo", rawIdeas: [], shapedFormat: "" },
      format: {
        status: "todo",
        formats: [
          { id: uid(), name: "TOP5형", description: "순위로 정보를 정리해 빠르게 전달" },
          { id: uid(), name: "반전 독백형", description: "잔잔하게 시작해 후반에 반전" },
          { id: uid(), name: "비교형", description: "A vs B로 차이를 명확하게" },
          { id: uid(), name: "AI 시대 해석형", description: "현상을 AI 관점으로 해석" },
          { id: uid(), name: "스토리형", description: "짧은 이야기 구조로 몰입" },
          { id: uid(), name: "체크리스트형", description: "해야 할 것을 항목으로 정리" },
        ],
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
        checks: [
          { id: uid(), label: "최근 만든 영상과 대본 구조가 너무 비슷하지 않은가?", checked: false },
          { id: uid(), label: "같은 포맷을 너무 반복하고 있지 않은가?", checked: false },
          { id: uid(), label: "내 해석이나 관점이 들어갔는가?", checked: false },
          { id: uid(), label: "단순히 AI가 만든 흔한 문장만 모은 영상은 아닌가?", checked: false },
          { id: uid(), label: "이미지/영상/음악 소스가 저작권상 안전한가?", checked: false },
          { id: uid(), label: "AI로 만든 현실적인 장면이라면 공개가 필요한지 확인했는가?", checked: false },
          { id: uid(), label: "제목/썸네일이 허위 과장이나 낚시성만 있는 것은 아닌가?", checked: false },
        ],
      },
      export: { status: "todo", editorGuide: "", uploadChecklist: [] },
    },
  };
}

// ----- localStorage -----
const KEY = "shorts-os::projects::v1";
const CURRENT_KEY = "shorts-os::currentProjectId::v1";

export function loadProjects(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Project[]) : [];
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

// ----- progress -----
import { NOTEBOOK_ORDER } from "./types";

export function notebookProgress(project: Project) {
  const done = NOTEBOOK_ORDER.filter(
    (id) => project.notebooks[id].status === "done",
  ).length;
  return { done, total: NOTEBOOK_ORDER.length, pct: Math.round((done / NOTEBOOK_ORDER.length) * 100) };
}

export function isLocked(project: Project, id: NotebookId): boolean {
  if (project.unlocked[id]) return false;
  const idx = NOTEBOOK_ORDER.indexOf(id);
  if (idx <= 0) return false;
  const prev = NOTEBOOK_ORDER[idx - 1];
  return project.notebooks[prev].status !== "done";
}

export function nextStep(project: Project): NotebookId | null {
  return NOTEBOOK_ORDER.find((id) => project.notebooks[id].status !== "done") ?? null;
}
