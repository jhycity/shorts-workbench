// 콘텐츠 라인, 포맷 라이브러리, 기본 체크 등 정적 프리셋

import type { ContentLineId, ContentLinePreset, FormatItem, DiversityCheck } from "./types";

const uid = () => Math.random().toString(36).slice(2, 10);

export const CONTENT_LINES: ContentLinePreset[] = [
  {
    id: "ai_survival",
    name: "AI 시대 생존/해석",
    emoji: "🤖",
    description:
      "AI 시대에 살아남는 법, 유명인의 말, 내 생각을 섞어 해석하는 쇼츠",
    recTone: "차분한 해석형, 뼈 때리는 조언형",
    recHook: "“앞으로 살아남는 사람은 이걸 먼저 봅니다.”",
    recScreen: "자막 중심 + 자료화면 + AI 이미지",
    copyrightCaution:
      "실제 인물 발언을 쓸 경우 출처 확인, 맥락 왜곡 금지. AI 생성 인물/장면이면 ‘AI’ 표기 검토.",
    recFormatNames: ["AI 시대 해석형", "반전 독백형", "비교형"],
  },
  {
    id: "twenties_reality",
    name: "20대 현실 조언",
    emoji: "🧭",
    description: "20대가 해야 할 과업, 시간, 공부, 미래 불안에 대한 현실 조언",
    recTone: "현실 조언, 공감형, 반전형",
    recHook: "“20대 때 이걸 놓치면 나중에 크게 후회합니다.”",
    recScreen: "자막 중심 + 감성 배경 + 빠른 컷 전환",
    copyrightCaution: "과장된 공포 조장 금지, 출처 없는 통계 사용 금지.",
    recFormatNames: ["20대 현실 조언형", "반전 독백형", "TOP5 랭킹형"],
  },
  {
    id: "cute_animals",
    name: "귀여운 동물 랭킹",
    emoji: "🐾",
    description: "귀여운 동물 클립과 랭킹으로 짧게 몰입시키는 힐링형 쇼츠",
    recTone: "밝고 귀엽게, 짧고 빠르게",
    recHook: "“오늘 본 동물 영상 중 이게 제일 귀엽습니다.”",
    recScreen: "동물 클립/이미지 + 순위 자막",
    copyrightCaution:
      "남의 영상 무단 사용 금지. 출처/라이선스 확인 필수, 가능하면 직접 촬영/공개 도메인 사용.",
    recFormatNames: ["귀여운 동물 순위형", "TOP5 랭킹형"],
  },
  {
    id: "movie_summary",
    name: "저작권 안전 영화/스토리 요약",
    emoji: "🎞️",
    description: "직접 만든 이미지/해설 중심으로 영화·스토리를 안전하게 요약",
    recTone: "해설형, 핵심 요약형",
    recHook: "“이 장면이 중요한 이유는 따로 있습니다.”",
    recScreen: "직접 만든 이미지 + 텍스트 해설 중심 + 공정 이용 검토",
    copyrightCaution:
      "영화 클립 무단 사용 금지, 단순 장면 재업로드 금지. 반드시 내 해석/평론 추가.",
    recFormatNames: ["반전 독백형", "비교형", "책/지식 요약형"],
  },
  {
    id: "news_brief",
    name: "중요 뉴스 브리핑",
    emoji: "📰",
    description: "이번 주/이번 달 핵심 변화만 빠르게 정리해주는 브리핑",
    recTone: "빠른 정보 전달, 쉽게 풀어주는 설명",
    recHook: "“이번 달에 모르면 손해 보는 변화입니다.”",
    recScreen: "뉴스 카드 + 핵심 키워드 + 자막 중심",
    copyrightCaution:
      "출처 확인, 날짜 확인, 팩트체크 필수. 자극적 해석/제목 금지.",
    recFormatNames: ["뉴스 핵심 브리핑형", "TOP5 랭킹형"],
  },
  {
    id: "hiphop_music",
    name: "힙합 음악 추천",
    emoji: "🎧",
    description: "취향 추천 + 감상 포인트 중심의 힙합 큐레이션",
    recTone: "취향 추천형, 랭킹형, 감상 포인트 중심",
    recHook: "“요즘 들을 곡 없으면 이 리스트부터 들어보세요.”",
    recScreen: "앨범 분위기 + 가사 키워드 + 자막 중심",
    copyrightCaution:
      "음원 무단 사용 주의, 짧은 인용도 조심. 감상/해설 중심으로 구성.",
    recFormatNames: ["힙합 추천 랭킹형", "TOP5 랭킹형"],
  },
  {
    id: "book_summary",
    name: "책/지식 요약",
    emoji: "📚",
    description: "책의 핵심 문장과 내 해석을 짧게 전달하는 지식 쇼츠",
    recTone: "지식 전달, 생각 유도, 차분한 해석",
    recHook: "“이 책에서 가장 현실적인 문장은 이겁니다.”",
    recScreen: "AI 이미지 + 키워드 카드 + 자막 중심",
    copyrightCaution:
      "책 내용을 그대로 길게 베끼지 말고 내 해석 추가. 인용 시 출처 표기.",
    recFormatNames: ["책/지식 요약형", "반전 독백형", "비교형"],
  },
  {
    id: "asmr_scenery",
    name: "ASMR/풍경/소리",
    emoji: "🌿",
    description:
      "예쁜 풍경/좋은 소리로 잠깐 멈추게 하고 긴 영상으로 유도하는 힐링형 쇼츠",
    recTone: "짧은 몰입 유도, 힐링, 감성",
    recHook: "“몇 초만 멈춰서 이 소리 들어보세요.”",
    recScreen: "풍경/사물 풀샷 + 소리 중심 + 자막 최소화",
    copyrightCaution:
      "사용한 소리/영상이 직접 제작 또는 안전한 소스(Pixabay 등)인지 확인.",
    recFormatNames: ["ASMR/풍경 몰입형"],
  },
  {
    id: "my_own",
    name: "직접 만든 새 포맷",
    emoji: "✨",
    description: "기존 라인에 없는, 내가 직접 정의하는 콘텐츠 방향",
    recTone: "(직접 정의)",
    recHook: "(직접 정의)",
    recScreen: "(직접 정의)",
    copyrightCaution: "사용하는 소스가 안전한지 항상 확인.",
    recFormatNames: ["직접 만든 새 포맷"],
  },
];

export const CONTENT_LINE_MAP: Record<ContentLineId, ContentLinePreset> =
  Object.fromEntries(CONTENT_LINES.map((c) => [c.id, c])) as Record<
    ContentLineId,
    ContentLinePreset
  >;

// 포맷 라이브러리 (기본값 생성용)
export function defaultFormats(): FormatItem[] {
  const base: Omit<FormatItem, "id">[] = [
    {
      name: "TOP5 랭킹형",
      structure: "5→1 카운트다운, 항목당 5~7초, 마지막에 한 줄 정리",
      suitedLines: ["귀여운 동물 랭킹", "힙합 음악 추천", "책/지식 요약"],
      pros: "정보 밀도가 높고 끝까지 시청률 유지에 강함",
      risks: "비슷한 랭킹이 너무 자주 나오면 ‘양산형’ 인상",
      variations: "역순(1→5) / 4위에 의외 선택 / 0위(번외) 추가",
    },
    {
      name: "AI 시대 해석형",
      structure: "현상 제시 → AI 관점 해석 → 내 결론 한 줄",
      suitedLines: ["AI 시대 생존/해석", "20대 현실 조언"],
      pros: "트렌드를 ‘내 관점’으로 차별화하기 좋음",
      risks: "비슷한 톤만 반복되면 다 똑같이 보임",
      variations: "비관 vs 낙관 / 10년 후 시점 / 직업별 적용",
    },
    {
      name: "20대 현실 조언형",
      structure: "오해 → 진짜 현실 → 지금 할 일",
      suitedLines: ["20대 현실 조언"],
      pros: "공감 + 저장 욕구를 동시에 자극",
      risks: "공포 마케팅처럼 보일 수 있음",
      variations: "‘후회 리스트’ / 인터뷰풍 / 데이터 인용",
    },
    {
      name: "뉴스 핵심 브리핑형",
      structure: "헤드라인 → 무엇이 바뀌나 → 나에게 미치는 영향",
      suitedLines: ["중요 뉴스 브리핑"],
      pros: "정보성으로 신뢰 누적",
      risks: "팩트 오류 시 채널 타격이 큼",
      variations: "주간 브리핑 / 카테고리별(경제/IT) / 비교 분석",
    },
    {
      name: "책/지식 요약형",
      structure: "핵심 문장 → 풀어 설명 → 내 해석",
      suitedLines: ["책/지식 요약", "AI 시대 생존/해석"],
      pros: "저장·공유율이 높음",
      risks: "원문 의역이 과해지면 왜곡 위험",
      variations: "한 권에서 5문장 / 저자 비교 / 비판적 리뷰",
    },
    {
      name: "힙합 추천 랭킹형",
      structure: "분위기 선언 → 곡 소개 3~5개 → 감상 포인트",
      suitedLines: ["힙합 음악 추천"],
      pros: "취향 팬덤 형성에 강함",
      risks: "음원 사용 범위 위험",
      variations: "테마별(새벽/운동) / 신인 픽 / 가사 분석",
    },
    {
      name: "귀여운 동물 순위형",
      structure: "‘오늘 본 것 중 최고’ 선언 → 클립 3~5개 → 1위 강조",
      suitedLines: ["귀여운 동물 랭킹"],
      pros: "전 연령 친화, 댓글 활성",
      risks: "남 영상 사용은 즉시 위험",
      variations: "직접 촬영 / 종(種)별 / 사연 추가",
    },
    {
      name: "ASMR/풍경 몰입형",
      structure: "한 장면 풀샷 → 소리 강조 → 마지막 한 줄 안내",
      suitedLines: ["ASMR/풍경/소리"],
      pros: "재시청률·체류시간이 높음",
      risks: "포맷이 너무 비슷해지면 구분이 안 됨",
      variations: "시간대(새벽/밤) / 장소 시리즈 / 텍스트 명상",
    },
    {
      name: "반전 독백형",
      structure: "잔잔한 시작 → 중반 빌드업 → 마지막 한 문장 반전",
      suitedLines: ["AI 시대 생존/해석", "20대 현실 조언", "저작권 안전 영화/스토리 요약"],
      pros: "엔딩 임팩트 + 공유율",
      risks: "반전 클리셰가 반복되면 식상",
      variations: "1인칭 일기 / 미래의 나 / 가상의 친구",
    },
    {
      name: "비교형",
      structure: "A vs B → 차이 → 결론",
      suitedLines: ["AI 시대 생존/해석", "책/지식 요약"],
      pros: "정보 정리 + 토론 유발",
      risks: "한쪽 깎기로 빠지면 어그로",
      variations: "과거 vs 현재 / 통념 vs 사실 / 3자 비교",
    },
    {
      name: "직접 만든 새 포맷",
      structure: "(직접 정의)",
      suitedLines: ["직접 만든 새 포맷"],
      pros: "차별화의 핵심",
      risks: "검증 안 된 포맷은 첫 시도에 약할 수 있음",
      variations: "기존 두 포맷을 섞기 / 길이/시점만 바꾸기",
    },
  ];
  return base.map((b) => ({ id: uid(), ...b }));
}

export const DEFAULT_AVOID_STYLES = [
  "양산형 AI 쇼츠 느낌",
  "의미 없는 명언 영상",
  "뇌 녹는 이상한 AI 드라마식 영상",
  "이미 너무 많이 퍼진 쇼츠를 그대로 따라 하는 방식",
  "완성도가 낮아서 이질감이 느껴지는 영상",
  "팩트체크 없는 정보 전달",
  "원래 내용과 다르게 멋대로 해석해서 짜깁기하는 영상",
  "자극만 있고 내용이 없는 썸네일/제목",
];

export const DEFAULT_PREFERRED_TONES = [
  "세로 쇼츠의 장점을 살린 빠른 전달",
  "자막은 웬만하면 필수",
  "요즘 흐름 제시 → 해결방안 → 시청자에게 생각할 거리 제공",
  "뇌를 녹이는 자극이 아니라 깨달음이나 반전을 주는 자극",
  "밈을 쓰더라도 내용과 연결되게 사용",
  "트렌드를 따르되 너무 똑같은 느낌은 피하기",
  "예쁜 풍경이나 좋은 소리로 잠깐 멈추게 하는 힐링형 전환도 가능",
];

export function defaultDiversityChecks(): DiversityCheck[] {
  return [
    "최근 만든 영상과 포맷이 겹치지 않는가?",
    "같은 후킹 문장 구조를 반복하지 않았는가?",
    "같은 자막 템포/장면 흐름만 반복하지 않았는가?",
    "내 생각, 해석, 큐레이션 기준이 들어갔는가?",
    "단순히 다른 콘텐츠를 옮겨온 것이 아니라 새로운 맥락을 만들었는가?",
    "이 영상이 내 채널 안에서 다른 영상들과 구분되는가?",
    "시청자가 ‘또 똑같은 AI 쇼츠네’라고 느끼지 않을 요소가 있는가?",
    "이미지/영상/음악 소스가 저작권상 안전한가?",
    "AI로 만든 현실적 장면이라면 공개 표기를 검토했는가?",
    "제목/썸네일이 허위 과장이나 낚시성만 있는 것은 아닌가?",
  ].map((label) => ({ id: uid(), label, checked: false }));
}
