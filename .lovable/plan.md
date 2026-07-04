## 목표
앱을 "키워드 노트북 → 하위 노트북 → 쇼츠 프로젝트" 3단 구조로 정리하고, 예시 데이터 제거·백업 UX 개선·쇼츠 제작 7단계 단순화까지 한 번에 반영.

## 1. 데이터 구조 개편 (`src/lib/types.ts`, `src/lib/store.ts`)
- `Series` → `KeywordNotebook` 개념으로 정리 (기존 타입명은 유지해 마이그레이션 부담↓, 필드만 확장):
  - 제거: `contentLineIds`, `avoidStyles`
  - 추가: `tags: string[]` (최대 3), `defaultScreenStyle`, `defaultFormatId?`, `defaultVoice?`, `defaultSubtitleStyle?`, `subNotebooks: SubNotebook[]`
- 새 타입 `SubNotebook { id, name, description, ideaIds[], formatIds[], shortIds[] }`
- `Short`에 `subNotebookId?: string`, `sourceMix: { trend?: boolean; ideaId?; formatId?; custom?: string }[]` (최대 3), `guide: { tts, subtitleTempo, screenStyle, sceneComposition, brollIdeas, editorNote }` 필드 추가
- `Idea`에 `subNotebookId?` 추가
- `NOTEBOOK_ORDER` 8단계 → 7단계로 축소: `source, topic, hook, script, title, guide, finalize`
- `seedAppState`: `series: []`, 예시 노트북 자동 생성 완전 제거 (이미 되어있으면 유지 확인)
- `schemaVersion: 3`으로 올리고 v2→v3 마이그레이션(빈 tags/subNotebooks 채움)

## 2. 노트북 생성 다이얼로그 (`src/components/NewSeriesDialog.tsx`)
필수: 이름, 설명, 기본 길이, 기본 제작 스타일(=톤), 기본 화면 스타일  
선택: 태그 최대 3개(+안내문구), 주로 쓸 포맷, 주로 쓸 TTS 톤, 자막 스타일  
- 콘텐츠라인 셀렉트 완전 제거

## 3. 대시보드 (`src/components/SeriesDashboard.tsx`)
- 예시 노트북은 카드가 아니라 "새 노트북" 버튼 위 작은 추천 칩만 (이미 부분 반영됨)
- 각 노트북 카드에 삭제 버튼 + 확인창 → localStorage 반영
- 백업 버튼은 새 백업 다이얼로그 열기

## 4. 노트북 뷰 (`src/components/SeriesView.tsx`)
- 하위 노트북 섹션 추가 (생성/삭제/열기)
- 노트북 안에서 아이디어 바로 추가 버튼
- 쇼츠 목록은 하위 노트북 필터 지원

## 5. 하위 노트북 뷰 (신규 `src/components/SubNotebookView.tsx`)
- 이름/설명, 연결 아이디어·포맷·쇼츠, 새 쇼츠 만들기

## 6. 쇼츠 생성 (`src/components/NewShortDialog.tsx`)
- 재료 다중 선택 (트렌드/아이디어/포맷/직접입력) 최대 3, 초과 시 안내
- 하위 노트북 선택 옵션

## 7. 쇼츠 뷰 7단계 (`src/components/ShortView.tsx`)
- 단계: 재료 확인 → 주제 → 후킹 → 대본 → 제목/썸네일 → 제작 가이드 → 원본성/수익화+최종 내보내기
- 6단계는 텍스트 필드 묶음, 7단계는 체크리스트+전체 복사

## 8. 백업 다이얼로그 (신규 `src/components/BackupDialog.tsx`)
- 대상 선택 라디오(전체/노트북/하위노트북/쇼츠/아이디어/포맷)
- 미리보기 요약 카드
- `shorts-os-backup-YYYYMMDD.json` 다운로드 + 클립보드 복사
- 불러오기 유지

## 9. 각 단계 예시 힌트
- 트렌드 입력·주제·후킹 후보에 placeholder + 접이식 예시 카드

## 기술 세부
- 라우팅 없음 (현재 상태 기반 뷰 전환 유지). `src/routes/index.tsx`에 뷰 스택 `dashboard | series | sub | short` 추가.
- 기존 콘텐츠라인 데이터는 표시 안 하되 삭제하지 않고 v3에서 무시 (import 호환).
- 모든 삭제는 `confirm()` + toast.

## 사용 순서 (완료 후 사용자 안내)
1) 키워드 노트북 만들기 → 2) (선택) 하위 노트북 만들기 → 3) 트렌드 입력/아이디어 저장 → 4) 새 쇼츠 만들기(재료 최대 3개) → 5) 7단계 진행 → 6) 최종 내보내기 → 7) 필요 시 백업.
