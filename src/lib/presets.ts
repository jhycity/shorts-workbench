// 시드 데이터: 콘텐츠 라인 9종, 포맷 라이브러리, 다양성 체크
import type { ContentLine, Format, DiversityCheck } from "./types";

export const uid = () => Math.random().toString(36).slice(2, 10);

export const SEED_CONTENT_LINES: ContentLine[] = [
  {
    id: "cl_ai_survival",
    name: "AI 시대 생존/해석",
    emoji: "🤖",
    description: "AI 시대에 살아남는 법, 유명인의 말, 내 생각을 섞은 해석",
    recTone: "차분한 해석형, 뼈 때리는 조언형",
    recHook: "“앞으로 살아남는 사람은 이걸 먼저 봅니다.”",
    recScreen: "자막 중심 + 자료화면 + AI 이미지",
    copyrightCaution: "실제 인물 발언 출처 확인. AI 생성물은 ‘AI’ 표기 검토.",
  },
  {
    id: "cl_twenties",
    name: "20대 현실 조언",
    emoji: "🧭",
    description: "20대 과업/시간/공부/미래 불안에 대한 현실 조언",
    recTone: "빠르게 들리지만 끝에는 생각하게 만드는 현실 조언형",
    recHook: "“20대 때 이걸 놓치면 나중에 크게 후회합니다.”",
    recScreen: "자막 중심 + 감성 배경 + 빠른 컷",
    copyrightCaution: "공포 조장 금지, 출처 없는 통계 사용 금지.",
  },
  {
    id: "cl_trend",
    name: "트렌드 해석",
    emoji: "📈",
    description: "요즘 키워드/밈을 내 채널식으로 해석해서 풀어주는 쇼츠",
    recTone: "빠른 정보 전달 + 한 줄 해석",
    recHook: "“요즘 이거 왜 다 하는지 모르셨죠?”",
    recScreen: "키워드 카드 + 자막 + 짧은 자료 컷",
    copyrightCaution: "원 밈/영상 출처 확인, 단순 짜깁기 금지.",
  },
  {
    id: "cl_news",
    name: "중요 뉴스 브리핑",
    emoji: "📰",
    description: "이번 주 핵심 변화만 빠르게 정리해주는 브리핑",
    recTone: "빠른 정보 전달, 쉽게 풀어주는 설명",
    recHook: "“이번 주 모르면 손해 보는 변화입니다.”",
    recScreen: "뉴스 카드 + 핵심 키워드 + 자막",
    copyrightCaution: "출처/날짜 확인, 팩트체크 필수.",
  },
  {
    id: "cl_hiphop",
    name: "힙합 음악 추천",
    emoji: "🎧",
    description: "취향 추천 + 감상 포인트 중심의 힙합 큐레이션",
    recTone: "취향 추천형, 감상 포인트 중심",
    recHook: "“요즘 들을 곡 없으면 이 리스트부터.”",
    recScreen: "앨범 분위기 + 가사 키워드 + 자막",
    copyrightCaution: "음원 무단 사용 금지. 감상/해설 중심.",
  },
  {
    id: "cl_book",
    name: "책/지식 요약",
    emoji: "📚",
    description: "책의 핵심 문장과 내 해석을 짧게 전달",
    recTone: "지식 전달 + 생각 유도",
    recHook: "“이 책에서 가장 현실적인 문장은 이겁니다.”",
    recScreen: "AI 이미지 + 키워드 카드 + 자막",
    copyrightCaution: "원문 길게 베끼기 금지, 인용 시 출처 표기.",
  },
  {
    id: "cl_animals",
    name: "귀여운 동물 랭킹",
    emoji: "🐾",
    description: "귀여운 동물 클립과 랭킹으로 짧게 몰입시키는 힐링형",
    recTone: "밝고 귀엽게, 짧고 빠르게",
    recHook: "“오늘 본 동물 중 이게 제일 귀엽습니다.”",
    recScreen: "동물 클립/이미지 + 순위 자막",
    copyrightCaution: "남의 영상 무단 사용 금지. 직접 촬영/공개 도메인 권장.",
  },
  {
    id: "cl_asmr",
    name: "ASMR/풍경/소리",
    emoji: "🌿",
    description: "예쁜 풍경/좋은 소리로 잠깐 멈추게 하는 힐링형 쇼츠",
    recTone: "짧은 몰입 유도, 힐링, 감성",
    recHook: "“몇 초만 멈춰서 이 소리 들어보세요.”",
    recScreen: "풀샷 + 소리 중심 + 자막 최소화",
    copyrightCaution: "사용한 소리/영상이 직접 제작 또는 안전한 소스인지 확인.",
  },
  {
    id: "cl_movie",
    name: "저작권 안전 영화/스토리 요약",
    emoji: "🎞️",
    description: "직접 만든 이미지/해설 중심으로 영화·스토리를 안전하게 요약",
    recTone: "해설형, 핵심 요약형",
    recHook: "“이 장면이 중요한 이유는 따로 있습니다.”",
    recScreen: "직접 만든 이미지 + 텍스트 해설",
    copyrightCaution: "영화 클립 무단 사용 금지. 반드시 내 해석/평론 추가.",
  },
];

export function seedFormats(lineIdByName: Record<string, string>): Format[] {
  const L = (...names: string[]) =>
    names.map((n) => lineIdByName[n]).filter(Boolean) as string[];
  const base: Omit<Format, "id">[] = [
    {
      name: "TOP5 랭킹형",
      structure: "5→1 카운트다운, 항목당 5~7초, 마지막 한 줄 정리",
      contentLineIds: L("귀여운 동물 랭킹", "힙합 음악 추천", "책/지식 요약"),
      pros: "정보 밀도가 높고 끝까지 시청률 유지에 강함",
      risks: "비슷한 랭킹이 자주 나오면 ‘양산형’ 인상",
      variations: "역순(1→5) / 4위에 의외 선택 / 0위(번외)",
    },
    {
      name: "AI 시대 해석형",
      structure: "현상 제시 → AI 관점 해석 → 내 결론 한 줄",
      contentLineIds: L("AI 시대 생존/해석", "20대 현실 조언"),
      pros: "트렌드를 ‘내 관점’으로 차별화하기 좋음",
      risks: "비슷한 톤만 반복되면 다 똑같이 보임",
      variations: "비관 vs 낙관 / 10년 후 시점 / 직업별 적용",
    },
    {
      name: "20대 현실 조언형",
      structure: "오해 → 진짜 현실 → 지금 할 일",
      contentLineIds: L("20대 현실 조언"),
      pros: "공감 + 저장 욕구를 동시에 자극",
      risks: "공포 마케팅처럼 보일 수 있음",
      variations: "‘후회 리스트’ / 인터뷰풍 / 데이터 인용",
    },
    {
      name: "뉴스 핵심 브리핑형",
      structure: "헤드라인 → 무엇이 바뀌나 → 나에게 미치는 영향",
      contentLineIds: L("중요 뉴스 브리핑"),
      pros: "정보성으로 신뢰 누적",
      risks: "팩트 오류 시 채널 타격이 큼",
      variations: "주간 브리핑 / 카테고리별 / 비교 분석",
    },
    {
      name: "책/지식 요약형",
      structure: "핵심 문장 → 풀어 설명 → 내 해석",
      contentLineIds: L("책/지식 요약", "AI 시대 생존/해석"),
      pros: "저장·공유율이 높음",
      risks: "원문 의역 과잉 시 왜곡",
      variations: "한 권에서 5문장 / 저자 비교 / 비판적 리뷰",
    },
    {
      name: "반전 독백형",
      structure: "잔잔한 시작 → 빌드업 → 마지막 한 문장 반전",
      contentLineIds: L(
        "AI 시대 생존/해석",
        "20대 현실 조언",
        "저작권 안전 영화/스토리 요약",
      ),
      pros: "엔딩 임팩트 + 공유율",
      risks: "반전 클리셰가 반복되면 식상",
      variations: "1인칭 일기 / 미래의 나 / 가상의 친구",
    },
    {
      name: "비교형",
      structure: "A vs B → 차이 → 결론",
      contentLineIds: L("AI 시대 생존/해석", "책/지식 요약", "트렌드 해석"),
      pros: "정보 정리 + 토론 유발",
      risks: "한쪽 깎기로 빠지면 어그로",
      variations: "과거 vs 현재 / 통념 vs 사실 / 3자 비교",
    },
    {
      name: "ASMR/풍경 몰입형",
      structure: "한 장면 풀샷 → 소리 강조 → 마지막 한 줄 안내",
      contentLineIds: L("ASMR/풍경/소리"),
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
  ].map((label) => ({ id: uid(), label, checked: false }));
}

export const TREND_INBOX_PLACEHOLDERS: Record<keyof import("./types").TrendInbox, string> = {
  keywords:
    "예: AI 에이전트, 취업 불안, 숏폼 중독\n요즘 자주 보이는 단어/주제를 적어두세요.",
  emotions:
    "예: 불안, 공감, 충격, 위로\n사람들이 어떤 감정에 반응할지 적어보세요.",
  refStructure:
    "예: 문제 제기 → 현실 조언 → 반전 결론\n참고한 영상/뉴스/밈의 구조를 적어두세요.",
  myAngle:
    "예: 단순 정보가 아니라 ‘20대가 지금 준비할 능력’으로 연결\n내 채널식 해석을 한 줄로 정리.",
  avoid:
    "예: 공포 조장, 뻔한 명언, 팩트체크 없는 주장\n이 주제에서 피하고 싶은 흔한 접근.",
};
