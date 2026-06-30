# 쇼츠 자동 제작 OS — 구조 재설계 계획

## 핵심 변화
- **1단계(시리즈) / 2단계(개별 쇼츠)** 두 계층으로 분리
- 트렌드 입력함은 **시리즈 안**으로, 아이디어 보관함·포맷 라이브러리는 **앱 전역**으로 이동
- 카테고리 제거 → **콘텐츠라인이 유일한 분류 기준**, 사용자가 직접 추가/수정/삭제
- 시리즈당 콘텐츠라인 최대 3개 선택 가능
- 자동 저장 상태 표시 + 수동 저장/백업 내보내기·불러오기

## 새로운 데이터 구조

```text
AppState
├─ series[]                    # 제작 노트북/시리즈
│   ├─ id, title, description
│   ├─ contentLineIds[] (max 3)
│   ├─ defaultLength, defaultTone, defaultScreenStyle
│   ├─ avoidStyles[]
│   ├─ trendInbox { keywords, emotions, refStructure, myAngle, avoid }
│   └─ shorts[]                # 쇼츠 프로젝트
│       ├─ id, title, status, createdAt, updatedAt
│       ├─ sourceType: 'trend' | 'idea' | 'format' | 'blank'
│       ├─ sourceRef           # 원본 아이디어/포맷 id
│       └─ notebooks { topic, hook, script, title, voice, scene, diversity, export }
├─ contentLines[]              # 사용자 편집 가능 (기본 9개 시드)
├─ ideas[]                     # 전역 아이디어 보관함
├─ formats[]                   # 전역 포맷 라이브러리
└─ meta { lastSavedAt, schemaVersion }
```

## 화면 구조

```text
/ (메인 = 시리즈 목록)
  ├─ 헤더: 저장상태 · 수동저장 · 백업 내보내기/불러오기 · 콘텐츠라인 관리 · 아이디어 보관함 · 포맷 라이브러리
  └─ 시리즈 카드 그리드 (제목, 콘텐츠라인 칩, 쇼츠 수, 진행/완료, 최근 업데이트, "새 쇼츠 만들기")

/series/:id (시리즈 내부)
  ├─ 좌: 트렌드 입력함 (예시 placeholder 포함)
  ├─ 우 상: 관련 아이디어 (이 시리즈의 콘텐츠라인과 매칭)
  ├─ 우 중: 관련 포맷
  └─ 하: 쇼츠 프로젝트 목록 + "새 쇼츠 만들기"(4가지 방식 선택)

/series/:id/shorts/:shortId (개별 쇼츠)
  └─ 8단계: topic → hook → script → title → voice → scene → diversity → export
```

라우팅은 TanStack Router 파일 라우트(`series.$seriesId.tsx`, `series.$seriesId.shorts.$shortId.tsx`)로 추가.

## 단계별 작업

1. **타입 재정의** (`src/lib/types.ts`)
   - `Series`, `Short`, `Idea`, `Format`, `ContentLine`(편집형), `TrendInbox` 정의
   - 기존 `Project`는 `Short`로 흡수, `NotebookId`에서 trend/idea/format 제거 → 8단계만

2. **스토어 재작성** (`src/lib/store.ts`)
   - 새 키 `shorts-os::state::v2` (구버전 v1 데이터는 시드 시리즈 1개로 마이그레이션 시도, 실패 시 무시)
   - load/save + `exportBackup()`/`importBackup()` JSON
   - `lastSavedAt` 타임스탬프

3. **컨텍스트 재작성** (`src/lib/app-context.tsx` 신규, 기존 projects-context 제거)
   - series CRUD, short CRUD, idea/format/contentLine CRUD, 트렌드 입력함 갱신
   - 디바운스 자동 저장 + 저장 상태(`idle | saving | saved`)

4. **메인 화면** (`src/components/SeriesDashboard.tsx`)
   - 시리즈 카드 + 새 시리즈 다이얼로그(`NewSeriesDialog.tsx`)
   - 상단 글로벌 액션바(저장상태/백업/관리 시트)

5. **시리즈 뷰** (`src/components/SeriesView.tsx`)
   - 트렌드 입력함(예시 placeholder), 관련 아이디어/포맷 패널, 쇼츠 목록
   - 새 쇼츠 다이얼로그: 4가지 출발점(`NewShortDialog.tsx`)

6. **쇼츠 뷰** (`src/components/ShortView.tsx`)
   - 기존 `NotebookView`를 8단계 한정으로 정리해 재사용

7. **전역 라이브러리 관리 UI**
   - `IdeasManager.tsx`, `FormatsManager.tsx`, `ContentLinesManager.tsx` (Sheet 또는 Dialog)

8. **백업 UX**
   - 헤더에 저장 상태 배지, "지금 저장", "백업 .json 내보내기/불러오기"

9. **시드 데이터**
   - 첫 실행 시 콘텐츠라인 9개 + "20대 현실 조언" 시리즈 + "20대에 무조건 해야 할 것 TOP3" 쇼츠 생성

10. **라우트 파일 추가 + 기존 index.tsx 정리**

## 유지/이동/제거

- 유지: `presets.ts`(시드 데이터로 활용), shadcn UI, 디자인 토큰
- 이동: 트렌드→시리즈, 아이디어/포맷→전역
- 제거: `Category` 필드, 단일-프로젝트 `Project` 타입의 trend/idea/format 노트북

## 명시적 제외 (지금 하지 않음)
- AI API, 자동 생성/업로드, 로그인, 결제, 외부 DB

## 사용 흐름 (완료 후 사용자에게 안내)
1. 메인에서 시리즈 선택 또는 새로 만들기 (콘텐츠라인 최대 3개)
2. 시리즈 안에서 트렌드 입력함 채우기 → "새 쇼츠 만들기"(트렌드/아이디어/포맷/빈)
3. 쇼츠 안에서 8단계 진행 → 최종 내보내기에서 패키지 복사
4. 좋은 아이디어/포맷은 전역 보관함에 저장해 다른 시리즈에서 재사용
