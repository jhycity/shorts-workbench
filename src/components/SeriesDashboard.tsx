import { useState } from "react";
import { useApp } from "@/lib/app-context";
import { seriesStats } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FolderPlus, ArrowRight, Library, Lightbulb, ListChecks } from "lucide-react";
import { NewSeriesDialog } from "./NewSeriesDialog";
import { SaveStatusBadge, BackupButtons } from "./SaveStatus";
import { ContentLinesManager, IdeasManager, FormatsManager } from "./Managers";

export function SeriesDashboard({
  onOpenSeries,
}: {
  onOpenSeries: (id: string) => void;
}) {
  const { state, saveStatus, lastSavedAt } = useApp();
  const [openNew, setOpenNew] = useState(false);
  const [openMgr, setOpenMgr] = useState<null | "lines" | "ideas" | "formats">(
    null,
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">제작 노트북</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            큰 주제(제작 노트북) 안에서 쇼츠 여러 편을 계속 만들어 나가세요.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <SaveStatusBadge status={saveStatus} lastSavedAt={lastSavedAt} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1 mb-6">
        <Button variant="ghost" size="sm" onClick={() => setOpenMgr("lines")}>
          <ListChecks className="size-4 mr-1" /> 콘텐츠라인 관리
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setOpenMgr("ideas")}>
          <Lightbulb className="size-4 mr-1" /> 아이디어 보관함
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setOpenMgr("formats")}>
          <Library className="size-4 mr-1" /> 포맷 라이브러리
        </Button>
        <span className="mx-1 text-muted-foreground">|</span>
        <BackupButtons />
        <div className="ml-auto">
          <Button onClick={() => setOpenNew(true)}>
            <Plus className="size-4 mr-1.5" /> 새 제작 노트북
          </Button>
        </div>
      </div>

      {state.series.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-paper/60 p-16 text-center">
          <div className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-accent text-2xl">
            📓
          </div>
          <h2 className="mt-4 text-xl font-semibold">
            아직 제작 노트북이 없어요
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            큰 주제를 하나 만들고, 그 안에서 쇼츠를 계속 찍어내세요.
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

      <NewSeriesDialog
        open={openNew}
        onOpenChange={setOpenNew}
        onCreated={(id) => onOpenSeries(id)}
      />
      <ContentLinesManager
        open={openMgr === "lines"}
        onOpenChange={(v) => setOpenMgr(v ? "lines" : null)}
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

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border bg-card py-1.5">
      <div className="text-base font-semibold tabular-nums">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}
