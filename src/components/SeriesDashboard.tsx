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
  Trash2,
} from "lucide-react";
import { NewSeriesDialog } from "./NewSeriesDialog";
import { SaveStatusBadge, BackupButtons } from "./SaveStatus";
import { IdeasManager, FormatsManager } from "./Managers";
import { toast } from "sonner";

const EXAMPLE_NOTEBOOKS = [
  "20대 자극 콘텐츠",
  "게임",
  "ASMR",
  "AI 시대 생존법",
  "이번 달 뉴스",
];

const GUIDE_KEY = "shorts-os::guide-open";

export function SeriesDashboard({
  onOpenSeries,
}: {
  onOpenSeries: (id: string) => void;
}) {
  const { state, saveStatus, lastSavedAt, deleteSeries } = useApp();
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
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">키워드 노트북</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            큰 키워드 안에서 <b>하위 노트북</b>과 <b>쇼츠 프로젝트</b>를 계속
            파생시켜 나가세요.
          </p>
        </div>
        <SaveStatusBadge status={saveStatus} lastSavedAt={lastSavedAt} />
      </div>

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
            <Step n={1} title="큰 키워드 노트북을 만든다" desc="예: 20대 자극 콘텐츠, 게임, ASMR, AI 시대" />
            <Step n={2} title="필요하면 하위 노트북을 만든다" desc="예: 게임 → 발로란트/롤/스팀게임" />
            <Step n={3} title="트렌드 입력·아이디어를 재료로 새 쇼츠를 만든다" desc="재료는 최대 3개까지 조합 가능" />
            <Step n={4} title="7단계로 쇼츠를 완성한다" desc="재료 → 주제 → 후킹 → 대본 → 제목/썸네일 → 제작 가이드 → 원본성 체크 + 최종 내보내기" />
            <div className="pt-1 text-xs text-muted-foreground leading-relaxed">
              용어 · <b>키워드 노트북</b>=큰 주제 · <b>하위 노트북</b>=세부 갈래
              · <b>쇼츠 프로젝트</b>=영상 1편 · <b>재료</b>=트렌드/아이디어/포맷/직접입력
            </div>
          </div>
        )}
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Button onClick={() => setOpenNew(true)} size="lg">
          <Plus className="size-4 mr-1.5" /> 새 키워드 노트북 만들기
        </Button>
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <span>예시:</span>
          {EXAMPLE_NOTEBOOKS.map((ex) => (
            <span key={ex} className="rounded-full border bg-card px-2 py-0.5">
              {ex}
            </span>
          ))}
        </div>
      </div>

      {state.series.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-paper/60 p-16 text-center">
          <div className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-accent text-2xl">
            📓
          </div>
          <h2 className="mt-4 text-xl font-semibold">
            아직 키워드 노트북이 없어요
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            큰 키워드 하나부터 만들어보세요.
          </p>
          <Button className="mt-5" onClick={() => setOpenNew(true)}>
            <FolderPlus className="size-4 mr-1.5" /> 첫 키워드 노트북 만들기
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {state.series.map((s) => {
            const stats = seriesStats(s);
            const tags = s.tags ?? [];
            const subCount = s.subNotebooks?.length ?? 0;
            return (
              <div
                key={s.id}
                className="notebook-card group text-left p-6 relative"
              >
                <button
                  onClick={() => onOpenSeries(s.id)}
                  className="absolute inset-0 rounded-xl"
                  aria-label={`${s.title} 열기`}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (
                      confirm(
                        `"${s.title}" 키워드 노트북과 안의 쇼츠 프로젝트를 삭제할까요?`,
                      )
                    ) {
                      deleteSeries(s.id);
                      toast("노트북을 삭제했어요");
                    }
                  }}
                  className="absolute top-3 right-3 z-10 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition"
                  aria-label="삭제"
                >
                  <Trash2 className="size-4" />
                </button>
                <div className="pl-2 relative pointer-events-none">
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
                    {tags.map((t) => (
                      <Badge
                        key={t}
                        variant="outline"
                        className="text-[10px] bg-primary/10 text-primary border-primary/20"
                      >
                        #{t}
                      </Badge>
                    ))}
                    <Badge variant="secondary" className="text-[10px]">
                      {s.defaultLength}
                    </Badge>
                    {subCount > 0 && (
                      <Badge variant="outline" className="text-[10px]">
                        하위 {subCount}
                      </Badge>
                    )}
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
              </div>
            );
          })}
        </div>
      )}

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
