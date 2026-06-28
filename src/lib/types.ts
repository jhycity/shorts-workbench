export type NotebookId =
  | "trend"
  | "idea"
  | "format"
  | "topic"
  | "hook"
  | "script"
  | "title"
  | "voice"
  | "scene"
  | "diversity"
  | "export";

export type NotebookStatus = "todo" | "in_progress" | "done";

export type Route = "trend" | "idea";
export type Category =
  | "AI"
  | "자기계발"
  | "돈/부업"
  | "20대 현실 조언"
  | "음악/창작"
  | "공부"
  | "사회현상";
export type Platform = "유튜브 쇼츠" | "인스타 릴스" | "틱톡";
export type Length = "30초" | "60초";
export type Goal = "조회수 실험" | "수익화 실험" | "채널 성장" | "브랜딩";

export interface Candidate {
  id: string;
  text: string;
}

// 후보 3개 + 선택값을 가지는 표준 노트북 데이터
export interface CandidateNotebook {
  status: NotebookStatus;
  candidates: [Candidate, Candidate, Candidate];
  selectedId: string | null;
}

// 트렌드 노트북: 자유 메모 리스트
export interface TrendNotebookData {
  status: NotebookStatus;
  keywords: string[]; // 트렌드 키워드
  flows: string[]; // 참고 흐름
  concerns: string[]; // 사람들의 고민
}

// 내 아이디어 노트북
export interface IdeaNotebookData {
  status: NotebookStatus;
  rawIdeas: string[]; // 떠오른 아이디어 메모
  shapedFormat: string; // 새 포맷으로 정리한 결과
}

// 포맷 라이브러리
export interface FormatItem {
  id: string;
  name: string;
  description: string;
}
export interface FormatNotebookData {
  status: NotebookStatus;
  formats: FormatItem[];
  selectedFormatId: string | null;
}

// 제목/썸네일
export interface TitleNotebookData {
  status: NotebookStatus;
  titles: [Candidate, Candidate, Candidate];
  thumbs: [Candidate, Candidate, Candidate];
  selectedTitleId: string | null;
  selectedThumbId: string | null;
}

// 다양성/원본성 체크
export interface DiversityCheck {
  id: string;
  label: string;
  checked: boolean;
}
export interface DiversityNotebookData {
  status: NotebookStatus;
  checks: DiversityCheck[];
  note: string;
}

export interface ExportNotebookData {
  status: NotebookStatus;
  editorGuide: string;
  uploadChecklist: string[];
}

export interface Project {
  id: string;
  title: string;
  route: Route;
  category: Category;
  platform: Platform;
  length: Length;
  goal: Goal;
  createdAt: number;
  updatedAt: number;
  notebooks: {
    trend: TrendNotebookData;
    idea: IdeaNotebookData;
    format: FormatNotebookData;
    topic: CandidateNotebook;
    hook: CandidateNotebook;
    script: CandidateNotebook;
    title: TitleNotebookData;
    voice: CandidateNotebook;
    scene: CandidateNotebook;
    diversity: DiversityNotebookData;
    export: ExportNotebookData;
  };
  unlocked: Record<NotebookId, boolean>; // 강제 진행으로 잠금 해제된 노트북
}

export const NOTEBOOK_ORDER: NotebookId[] = [
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
];

export const NOTEBOOK_META: Record<
  NotebookId,
  { title: string; subtitle: string; icon: string }
> = {
  trend: {
    title: "트렌드 노트북",
    subtitle: "트렌드 키워드 · 흐름 · 사람들의 고민",
    icon: "📈",
  },
  idea: {
    title: "내 아이디어 노트북",
    subtitle: "독자적인 영상 아이디어를 새 포맷으로",
    icon: "💡",
  },
  format: {
    title: "포맷 라이브러리",
    subtitle: "TOP5형 · 반전 독백형 · 비교형 등",
    icon: "📚",
  },
  topic: { title: "주제 선택", subtitle: "주제 후보 3개 중 하나", icon: "🎯" },
  hook: { title: "후킹 노트북", subtitle: "첫 1~2초 문장 후보 3개", icon: "🪝" },
  script: { title: "대본 노트북", subtitle: "30/60초 대본 후보 3개", icon: "📝" },
  title: {
    title: "제목 / 썸네일",
    subtitle: "제목 3개 · 썸네일 문구 3개",
    icon: "🖼️",
  },
  voice: { title: "목소리 노트북", subtitle: "TTS 톤 후보 3개", icon: "🎙️" },
  scene: {
    title: "장면 구성 노트북",
    subtitle: "자막 · B-roll · 화면 흐름",
    icon: "🎬",
  },
  diversity: {
    title: "다양성 / 원본성 체크",
    subtitle: "반복 · 저작권 · 낚시성 점검",
    icon: "🛡️",
  },
  export: {
    title: "최종 내보내기",
    subtitle: "선택값을 한 번에 패키지로",
    icon: "📦",
  },
};
