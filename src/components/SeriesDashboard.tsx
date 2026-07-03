import { useState, useEffect } from "react";
import { useApp } from "@/lib/app-context";
import { seriesStats } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  FolderPlus,
  ArrowRight,
  Library,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from "lucide-react";
import { NewSeriesDialog } from "./NewSeriesDialog";
import { SaveStatusBadge, BackupButtons } from "./SaveStatus";
import { IdeasManager, FormatsManager } from "./Managers";

const EXAMPLE_NOTEBOOKS = [
  "20대 자극 콘텐츠",
  "AI 시대 생존법",
  "이번 달 중요한 뉴스",
  "힙합 음악 추천",
  "ASMR / 풍경 소리 모음",
];

const GUIDE_KEY = "shorts-os::guide-open";

export function SeriesDashboard({
  onOpenSeries,
}: {
  onOpenSeries: (id: string) => void;
}) {
  const { state, saveStatus, lastSavedAt } = useApp();
  const [openNew, setOpenNew] = useState(false);
  const [openMgr, setOpenMgr] = useState<null | "ideas" | "formats">(null);
  const [guideOpen, setGuideOpen] = useState(true);

  useEffect(() => {
    try {
      const v = localStorage.getItem(GUIDE_KEY);
      if (v === "0") setGuideOpen(false);
    } catch {}
  }, []);

  const toggleGuide = () => {
    setGuideOpen((v) => {
      const next = !v;
      try {
        localStorage.setItem(GUIDE_KEY, next ? "1" : "0");
      } catch {}
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* 1. 앱 제목 + 2. 저장 상태 */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">제작 노트북</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            큰 주제(<b>제작 노트북</b>) 안에서 쇼츠 여러 편을 계속 만들어
            나가세요.
          </p>
        </div>
        <SaveStatusBadge status={saveStatus} lastSavedAt={lastSavedAt} />
      </div>

      {/* 3. 처음 쓰는 법 안내 박스 */}
      <div className="mb-5 rounded-xl border bg-accent/40">
        <button
          type="button"
          onClick={toggleGuide}
          className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <HelpCircle className="size-4 text-primary" />
            처음 쓰는 법
          </span>
          {guideOpen ? (
            <ChevronUp className="size-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-4 text-muted-foreground" />
          )}
        </button>
        {guideOpen && (
          <div className="border-t px-4 py-3 text-sm space-y-2.5">
            <Step
              n={1}
              title="큰 제작 노트북을 만든다"
              desc="예: 20대 자극 콘텐츠, AI 시대 생존법, 트렌드 해석"
            />
            <Step
              n={2}
              title="그 노트북 안에서 쇼츠 아이디어를 만든다"
              desc="예: 20대에 무조건 해야 할 것 TOP3"
            />
            <Step
              n={3}
              title="주제 → 후킹 → 대본 → 제목/썸네일 → 장면 구성 → 체크 → 최종 내보내기 순서로 완성"
              desc="각 단계는 후보 중에서 하나를 고르는 방식이에요."
            />
            <div className="pt-1 text-xs text-muted-foreground leading-relaxed">
              용어 안내 · <b>제작 노트북</b>=큰 주제/시리즈 ·{" "}
              <b>쇼츠 프로젝트</b>=영상 1개 · <b>콘텐츠라인</b>=영상 분야/방향
              · <b>포맷</b>=영상 구성 방식 · <b>최종 내보내기</b>=편집툴에
              복사할 패키지
            </div>
          </div>
        )}
      </div>

      {/* 4. 제작 노트북 만들기 버튼 */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Button onClick={() => setOpenNew(true)} size="lg">
          <Plus className="size-4 mr-1.5" /> 새 제작 노트북 만들기
        </Button>
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <span>예시:</span>
          {EXAMPLE_NOTEBOOKS.map((ex) => (
            <span
              key={ex}
              className="rounded-full border bg-card px-2 py-0.5"
            >
              {ex}
            </span>
          ))}
        </div>
      </div>

      {/* 5. 제작 노트북 목록 */}
      {state.series.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-paper/60 p-16 text-center">
          <div className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-accent text-2xl">
            📓
          </div>
          <h2 className="mt-4 text-xl font-semibold">
            아직 제작 노트북이 없어요
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            먼저 큰 주제 하나를 만들고, 그 안에서 쇼츠를 계속 찍어내세요.
          </p>
          <Button className="mt-5" onClick={() => setOpenNew(true)}>
            <FolderPlus className="size-4 mr-1.5" /> 첫 제작 노트북 만들기
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {state.series.map((s) => {
            const stats = seriesStats(s);
            const lines = state.contentLines.filter((c) =>
              s.contentLineIds.includes(c.id),
            );
            return (
              <button
                key={s.id}
                onClick={() => onOpenSeries(s.id)}
                className="notebook-card text-left p-6"
              >
                <div className="pl-2">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h2 className="font-semibold text-lg leading-snug">
                        {s.title}
                      </h2>
                      {s.description && (
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                          {s.description}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground shrink-0 mt-1" />
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {lines.map((l) => (
                      <Badge
                        key={l.id}
                        variant="outline"
                        className="text-[10px] bg-primary/10 text-primary border-primary/20"
                      >
                        {l.emoji} {l.name}
                      </Badge>
                    ))}
                    <Badge variant="secondary" className="text-[10px]">
                      {s.defaultLength}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <Stat label="쇼츠" value={stats.total} />
                    <Stat label="진행" value={stats.inProgress} />
                    <Stat label="완료" value={stats.done} />
                  </div>
                  <div className="mt-3 text-[11px] text-muted-foreground">
                    최근 업데이트: {new Date(s.updatedAt).toLocaleString()}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* 6-7. 전역 라이브러리 바로가기 */}
      <div className="mt-8 pt-5 border-t">
        <div className="mb-2 text-xs font-semibold text-muted-foreground">
          전역 도구
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpenMgr("ideas")}
          >
            <Lightbulb className="size-4 mr-1.5" /> 아이디어 보관함
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpenMgr("formats")}
          >
            <Library className="size-4 mr-1.5" /> 포맷 라이브러리
          </Button>
          <span className="mx-1 h-4 w-px bg-border" />
          {/* 8. 백업 */}
          <BackupButtons />
        </div>
      </div>

      <NewSeriesDialog
        open={openNew}
        onOpenChange={setOpenNew}
        onCreated={(id) => onOpenSeries(id)}
      />
      <IdeasManager
        open={openMgr === "ideas"}
        onOpenChange={(v) => setOpenMgr(v ? "ideas" : null)}
      />
      <FormatsManager
        open={openMgr === "formats"}
        onOpenChange={(v) => setOpenMgr(v ? "formats" : null)}
      />
    </div>
  );
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
        {n}
      </span>
      <div className="min-w-0">
        <div className="font-medium leading-snug">{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-card py-1.5">
      <div className="text-base font-semibold tabular-nums">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}
