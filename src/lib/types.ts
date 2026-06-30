// 쇼츠 자동 제작 OS — v2 (시리즈 → 쇼츠)

export type NotebookId =
  | "topic"
  | "hook"
  | "script"
  | "title"
  | "voice"
  | "scene"
  | "diversity"
  | "export";

export type NotebookStatus = "todo" | "in_progress" | "done";

export type Length = "30초" | "60초";

// 사용자 편집 가능한 콘텐츠 라인
export interface ContentLine {
  id: string;
  name: string;
  emoji: string;
  description: string;
  recTone: string;
  recHook: string;
  recScreen: string;
  copyrightCaution: string;
  isCustom?: boolean;
}

// 전역 아이디어 보관함
export interface Idea {
  id: string;
  title: string;
  description: string;
  contentLineIds: string[];
  formatIds: string[];
  reason: string;
  refKeywords: string;
  pinnedSeriesId?: string;
  createdAt: number;
}

// 전역 포맷 라이브러리
export interface Format {
  id: string;
  name: string;
  structure: string;
  contentLineIds: string[];
  pros: string;
  risks: string;
  variations: string;
  isCustom?: boolean;
}

// 시리즈 내 트렌드 입력함
export interface TrendInbox {
  keywords: string;
  emotions: string;
  refStructure: string;
  myAngle: string;
  avoid: string;
}

export interface Candidate {
  id: string;
  text: string;
}

export interface CandidateNotebook {
  status: NotebookStatus;
  candidates: [Candidate, Candidate, Candidate];
  selectedId: string | null;
}

export interface TitleNotebookData {
  status: NotebookStatus;
  titles: [Candidate, Candidate, Candidate];
  thumbs: [Candidate, Candidate, Candidate];
  selectedTitleId: string | null;
  selectedThumbId: string | null;
}

export interface DiversityCheck {
  id: string;
  label: string;
  checked: boolean;
}

export interface DiversityNotebookData {
  status: NotebookStatus;
  checks: DiversityCheck[];
  note: string;
  monetizationNote: string;
}

export interface ExportNotebookData {
  status: NotebookStatus;
  editorGuide: string;
  uploadChecklist: string[];
  aiDisclosureNote: string;
  copyrightNote: string;
}

export interface Short {
  id: string;
  seriesId: string;
  title: string;
  sourceType: "trend" | "idea" | "format" | "blank";
  sourceRef?: string;
  isDraft?: boolean;
  createdAt: number;
  updatedAt: number;
  notebooks: {
    topic: CandidateNotebook;
    hook: CandidateNotebook;
    script: CandidateNotebook;
    title: TitleNotebookData;
    voice: CandidateNotebook;
    scene: CandidateNotebook;
    diversity: DiversityNotebookData;
    export: ExportNotebookData;
  };
  unlocked: Record<NotebookId, boolean>;
}

export interface Series {
  id: string;
  title: string;
  description: string;
  contentLineIds: string[]; // 최대 3개
  defaultLength: Length;
  defaultTone: string;
  defaultScreenStyle: string;
  avoidStyles: string[];
  trendInbox: TrendInbox;
  shorts: Short[];
  createdAt: number;
  updatedAt: number;
}

export interface AppState {
  schemaVersion: 2;
  series: Series[];
  contentLines: ContentLine[];
  ideas: Idea[];
  formats: Format[];
  lastSavedAt: number;
}

export const NOTEBOOK_ORDER: NotebookId[] = [
  "topic",
  "hook",
  "script",
  "title",
  "voice",
  "scene",
  "diversity",
  "export",
];

export const NOTEBOOK_META: Record<
  NotebookId,
  { title: string; subtitle: string; icon: string }
> = {
  topic: { title: "주제 선택", subtitle: "주제 후보 3개 중 하나", icon: "🎯" },
  hook: { title: "후킹 선택", subtitle: "첫 1~2초 문장 후보 3개", icon: "🪝" },
  script: { title: "대본 선택", subtitle: "분량 대본 후보 3개", icon: "📝" },
  title: {
    title: "제목/썸네일 선택",
    subtitle: "제목 3개 · 썸네일 문구 3개",
    icon: "🖼️",
  },
  voice: { title: "목소리 선택", subtitle: "TTS 톤 후보 3개", icon: "🎙️" },
  scene: {
    title: "장면 구성 선택",
    subtitle: "자막 · B-roll · 화면 흐름",
    icon: "🎬",
  },
  diversity: {
    title: "다양성 / 원본성 / 수익화 체크",
    subtitle: "반복 · 저작권 · 수익화 위험 점검",
    icon: "🛡️",
  },
  export: {
    title: "최종 내보내기",
    subtitle: "선택값을 한 번에 패키지로",
    icon: "📦",
  },
};

export const DEFAULT_AVOID_STYLES = [
  "양산형 AI 쇼츠 느낌",
  "의미 없는 명언 영상",
  "팩트체크 없는 주장",
  "자극만 있고 내용 없는 영상",
  "너무 똑같은 포맷 반복",
];
