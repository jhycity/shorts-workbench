// 쇼츠 자동 제작 OS — v3 (키워드 노트북 → 하위 노트북 → 쇼츠)

export type NotebookId =
  | "source"
  | "topic"
  | "hook"
  | "script"
  | "title"
  | "guide"
  | "finalize";

export type NotebookStatus = "todo" | "in_progress" | "done";

export type Length = "30초" | "60초";

// 콘텐츠 라인 (하위 호환용 — 새 UI에서는 노출 안 함)
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
  contentLineIds: string[]; // 하위호환용
  formatIds: string[];
  reason: string;
  refKeywords: string;
  pinnedSeriesId?: string;
  pinnedSubNotebookId?: string;
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
  formatType?: "ranking" | "standard";
  rankingCount?: number;
}


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

// STEP 1: 재료 확인 (읽기 전용 뷰지만 상태는 저장)
export interface SourceNotebookData {
  status: NotebookStatus;
  note: string;
}

// STEP 6: 제작 가이드
export interface GuideNotebookData {
  status: NotebookStatus;
  tts: string;
  subtitleTempo: string;
  screenStyle: string;
  sceneComposition: string;
  brollIdeas: string;
  editorNote: string;
}

// STEP 7: 원본성/수익화 + 최종 내보내기
export interface FinalizeNotebookData {
  status: NotebookStatus;
  checks: DiversityCheck[];
  copyrightNote: string;
  aiDisclosureNote: string;
  myTakeNote: string;
  factCheckNote: string;
  uploadTitle: string;
  uploadDescription: string;
  uploadHashtags: string;
}

export type MaterialKind = "trend" | "idea" | "format" | "custom";
export interface Material {
  id: string;
  kind: MaterialKind;
  ref?: string; // ideaId / formatId
  note?: string; // custom text
}

export interface Short {
  id: string;
  seriesId: string;
  subNotebookId?: string;
  title: string;
  sourceType: "trend" | "idea" | "format" | "blank"; // 하위호환 (첫 재료)
  sourceRef?: string;
  materials: Material[];
  isDraft?: boolean;
  createdAt: number;
  updatedAt: number;
  notebooks: {
    source: SourceNotebookData;
    topic: CandidateNotebook;
    hook: CandidateNotebook;
    script: CandidateNotebook;
    title: TitleNotebookData;
    guide: GuideNotebookData;
    finalize: FinalizeNotebookData;
  };
  unlocked: Record<NotebookId, boolean>;
}

export interface SubNotebook {
  id: string;
  name: string;
  description: string;
  createdAt: number;
}

export interface Series {
  id: string;
  title: string;
  description: string;
  tags: string[]; // 최대 3
  defaultLength: Length;
  defaultTone: string;
  defaultScreenStyle: string;
  defaultFormatId?: string;
  defaultVoice?: string;
  defaultSubtitleStyle?: string;
  subNotebooks: SubNotebook[];
  trendInbox: TrendInbox;
  shorts: Short[];
  // legacy
  contentLineIds?: string[];
  avoidStyles?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface AppState {
  schemaVersion: 3;
  series: Series[];
  contentLines: ContentLine[]; // legacy — 유지만
  ideas: Idea[];
  formats: Format[];
  lastSavedAt: number;
}

export const NOTEBOOK_ORDER: NotebookId[] = [
  "source",
  "topic",
  "hook",
  "script",
  "title",
  "guide",
  "finalize",
];

export const NOTEBOOK_META: Record<
  NotebookId,
  { title: string; subtitle: string; icon: string }
> = {
  source: {
    title: "재료 확인",
    subtitle: "이 쇼츠에 어떤 재료를 골랐는지 정리",
    icon: "🧺",
  },
  topic: { title: "주제 후보", subtitle: "주제 후보 A/B/C 중 하나", icon: "🎯" },
  hook: { title: "후킹 후보", subtitle: "첫 1~2초 문장 A/B/C", icon: "🪝" },
  script: { title: "대본 후보", subtitle: "분량 대본 A/B/C", icon: "📝" },
  title: {
    title: "제목/썸네일 후보",
    subtitle: "제목 A/B/C · 썸네일 문구 A/B/C",
    icon: "🖼️",
  },
  guide: {
    title: "제작 가이드",
    subtitle: "TTS · 자막 · 화면 · 장면 · B-roll · 편집 메모",
    icon: "🎛️",
  },
  finalize: {
    title: "원본성/수익화 체크 · 최종 내보내기",
    subtitle: "위험 점검 + 편집툴에 넣을 최종 패키지",
    icon: "📦",
  },
};

export const TAG_SUGGESTIONS = [
  "AI",
  "20대",
  "뉴스",
  "ASMR",
  "동물",
  "힙합",
  "책/지식",
  "게임",
  "트렌드",
  "밈",
  "힐링",
  "재테크",
];

export const SCREEN_STYLE_SUGGESTIONS = [
  "자막 중심",
  "AI 이미지 중심",
  "실사 B-roll 중심",
  "ASMR/풍경 중심",
  "카드 뉴스형",
];

export const DEFAULT_AVOID_STYLES = [
  "양산형 AI 쇼츠 느낌",
  "의미 없는 명언 영상",
  "팩트체크 없는 주장",
  "자극만 있고 내용 없는 영상",
  "너무 똑같은 포맷 반복",
];
