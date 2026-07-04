// 시드 데이터 (콘텐츠 라인은 하위호환용으로만 유지) + 예시/체크 시드
import type { ContentLine, Format, DiversityCheck } from "./types";

export const uid = () => Math.random().toString(36).slice(2, 10);

export const SEED_CONTENT_LINES: ContentLine[] = [];

export function seedFormats(_lineIdByName: Record<string, string>): Format[] {
  const base: Omit<Format, "id">[] = [
    {
      name: "TOP5 랭킹형",
      structure: "5→1 카운트다운, 항목당 5~7초, 마지막 한 줄 정리",
      contentLineIds: [],
      pros: "정보 밀도가 높고 끝까지 시청률 유지에 강함",
      risks: "비슷한 랭킹이 자주 나오면 '양산형' 인상",
      variations: "역순(1→5) / 4위에 의외 선택 / 0위(번외)",
    },
    {
      name: "AI 시대 해석형",
      structure: "현상 제시 → AI 관점 해석 → 내 결론 한 줄",
      contentLineIds: [],
      pros: "트렌드를 '내 관점'으로 차별화하기 좋음",
      risks: "비슷한 톤만 반복되면 다 똑같이 보임",
      variations: "비관 vs 낙관 / 10년 후 시점 / 직업별 적용",
    },
    {
      name: "20대 현실 조언형",
      structure: "오해 → 진짜 현실 → 지금 할 일",
      contentLineIds: [],
      pros: "공감 + 저장 욕구를 동시에 자극",
      risks: "공포 마케팅처럼 보일 수 있음",
      variations: "'후회 리스트' / 인터뷰풍 / 데이터 인용",
    },
    {
      name: "뉴스 핵심 브리핑형",
      structure: "헤드라인 → 무엇이 바뀌나 → 나에게 미치는 영향",
      contentLineIds: [],
      pros: "정보성으로 신뢰 누적",
      risks: "팩트 오류 시 채널 타격이 큼",
      variations: "주간 브리핑 / 카테고리별 / 비교 분석",
    },
    {
      name: "반전 독백형",
      structure: "잔잔한 시작 → 빌드업 → 마지막 한 문장 반전",
      contentLineIds: [],
      pros: "엔딩 임팩트 + 공유율",
      risks: "반전 클리셰가 반복되면 식상",
      variations: "1인칭 일기 / 미래의 나 / 가상의 친구",
    },
    {
      name: "ASMR/풍경 몰입형",
      structure: "한 장면 풀샷 → 소리 강조 → 마지막 한 줄 안내",
      contentLineIds: [],
      pros: "재시청률·체류시간이 높음",
      risks: "포맷이 너무 비슷해지면 구분이 안 됨",
      variations: "시간대(새벽/밤) / 장소 시리즈 / 텍스트 명상",
    },
  ];
  return base.map((b) => ({ id: uid(), ...b }));
}

export function defaultDiversityChecks(): DiversityCheck[] {
  return [
    "최근 만든 영상과 포맷이 겹치지 않는가?",
    "같은 후킹 문장 구조를 반복하지 않았는가?",
    "내 생각·해석·큐레이션 기준이 들어갔는가?",
    "단순 옮겨오기가 아니라 새 맥락을 만들었는가?",
    "이미지/영상/음악 소스가 저작권상 안전한가?",
    "AI로 만든 현실적 장면이라면 공개 표기를 검토했는가?",
    "제목/썸네일이 허위 과장이나 낚시성만 있지 않은가?",
    "수익화 정책상 위험한 표현(폭력/혐오/허위)을 피했는가?",
    "팩트체크가 필요한 부분은 확인했는가?",
  ].map((label) => ({ id: uid(), label, checked: false }));
}

export const TREND_INBOX_PLACEHOLDERS: Record<
  keyof import("./types").TrendInbox,
  string
> = {
  keywords:
    "예: 숏폼 중독, AI 에이전트, 취업 불안\n요즘 자주 보이는 단어/주제를 적어두세요.",
  emotions:
    "예: 불안, 공감, 충격, 위로\n사람들이 어떤 감정에 반응할지 적어보세요.",
  refStructure:
    "예: 문제 제기 → 현실 조언 → 반전 결론\n참고한 영상/뉴스/밈의 구조.",
  myAngle:
    "예: 단순 정보가 아니라 '20대가 지금 준비할 능력'으로 연결\n내 채널식 해석.",
  avoid:
    "예: 공포 조장, 뻔한 명언, 팩트체크 없는 주장\n이 주제에서 피하고 싶은 흔한 접근.",
};

// 단계별 사용자 예시 (placeholder 확장)
export const STEP_EXAMPLES = {
  topic: [
    "20대가 긴 노력을 못 하게 된 진짜 이유",
    "숏폼을 많이 보면 시간이 사라지는 진짜 이유",
    "AI 시대에 20대가 먼저 버려야 할 습관",
  ],
  hook: [
    "20대 때 가장 무서운 건 시간이 없는 게 아닙니다.",
    "요즘 사람들이 집중을 못 하는 이유는 의지가 약해서가 아닙니다.",
    "AI 시대에 뒤처지는 사람은 이걸 제일 늦게 깨닫습니다.",
  ],
  script: [
    "후킹 한 줄 → 핵심 주장 → 근거/사례 → 반전/정리 → 클로징 한 줄",
  ],
};
