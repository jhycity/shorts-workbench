import { useState } from "react";
import { useApp } from "@/lib/app-context";
import type { Series } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, ArrowRight, Lightbulb, Library } from "lucide-react";
import { TREND_INBOX_PLACEHOLDERS } from "@/lib/presets";
import { NewShortDialog } from "./NewShortDialog";
import { notebookProgress } from "@/lib/store";
import { IdeasManager, FormatsManager } from "./Managers";
import { toast } from "sonner";

export function SeriesView({
  series,
  onBack,
  onOpenShort,
}: {
  series: Series;
  onBack: () => void;
  onOpenShort: (shortId: string) => void;
}) {
  const { state, updateSeries, deleteSeries } = useApp();
  const [openNew, setOpenNew] = useState(false);
  const [openMgr, setOpenMgr] = useState<null | "ideas" | "formats">(null);

  const lines = state.contentLines.filter((c) =>
    series.contentLineIds.includes(c.id),
  );
  const relatedIdeas = state.ideas.filter(
    (i) =>
      i.pinnedSeriesId === series.id ||
      i.contentLineIds.some((id) => series.contentLineIds.includes(id)),
  );
  const relatedFormats = state.formats.filter((f) =>
    f.contentLineIds.some((id) => series.contentLineIds.includes(id)),
  );

  const setInbox = (key: keyof Series["trendInbox"], val: string) =>
    updateSeries(series.id, (s) => ({
      ...s,
      trendInbox: { ...s.trendInbox, [key]: val },
    }));

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <button
        onClick={onBack}
        className="text-sm text-muted-foreground hover:text-foreground mb-2"
      >
        ← 모든 제작 노트북
      </button>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{series.title}</h1>
          {series.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {series.description}
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-1">
            {lines.map((l) => (
              <Badge
                key={l.id}
                variant="outline"
                className="bg-primary/10 text-primary border-primary/20"
              >
                {l.emoji} {l.name}
              </Badge>
            ))}
            <Badge variant="secondary">{series.defaultLength}</Badge>
            {series.defaultTone && (
              <Badge variant="outline">톤: {series.defaultTone}</Badge>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => setOpenMgr("ideas")}>
            <Lightbulb className="size-4 mr-1" /> 아이디어 보관함
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setOpenMgr("formats")}>
            <Library className="size-4 mr-1" /> 포맷 라이브러리
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => {
              if (
                confirm(
                  `"${series.title}" 제작 노트북을 안의 쇼츠와 함께 삭제할까요?`,
                )
              ) {
                deleteSeries(series.id);
                onBack();
                toast("제작 노트북을 삭제했어요");
              }
            }}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* 좌: 트렌드 입력함 */}
        <div className="lg:col-span-2 rounded-xl border bg-paper p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">📥 트렌드 입력함</h2>
            <span className="text-xs text-muted-foreground">
              자동 저장됩니다
            </span>
          </div>
          <div className="grid gap-3">
            {(
              [
                ["keywords", "요즘 자주 보이는 키워드"],
                ["emotions", "사람들이 반응할 만한 감정"],
                ["refStructure", "참고한 영상/뉴스/밈의 구조"],
                ["myAngle", "이 주제를 내 채널식으로 해석하고 싶은 방향"],
                ["avoid", "피하고 싶은 흔한 접근"],
              ] as [keyof Series["trendInbox"], string][]
            ).map(([k, label]) => (
              <div key={k}>
                <div className="text-xs font-semibold mb-1">{label}</div>
                <Textarea
                  rows={2}
                  value={series.trendInbox[k]}
                  placeholder={TREND_INBOX_PLACEHOLDERS[k]}
                  onChange={(e) => setInbox(k, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 우: 관련 아이디어 / 포맷 */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-paper p-4">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-1">
              <Lightbulb className="size-4" /> 관련 아이디어
            </h3>
            {relatedIdeas.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                이 시리즈에 어울리는 아이디어가 없어요. 보관함에서 추가해보세요.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {relatedIdeas.slice(0, 5).map((i) => (
                  <li
                    key={i.id}
                    className="rounded-md border bg-card p-2 text-xs"
                  >
                    <div className="font-medium">{i.title}</div>
                    {i.description && (
                      <div className="mt-0.5 text-muted-foreground line-clamp-2">
                        {i.description}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-xl border bg-paper p-4">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-1">
              <Library className="size-4" /> 관련 포맷
            </h3>
            {relatedFormats.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                이 시리즈 콘텐츠라인에 매핑된 포맷이 없어요.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {relatedFormats.slice(0, 5).map((f) => (
                  <li
                    key={f.id}
                    className="rounded-md border bg-card p-2 text-xs"
                  >
                    <div className="font-medium">{f.name}</div>
                    {f.structure && (
                      <div className="mt-0.5 text-muted-foreground line-clamp-2">
                        {f.structure}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* 쇼츠 목록 */}
      <div className="mt-6 rounded-xl border bg-paper p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">🎬 쇼츠 프로젝트</h2>
          <Button size="sm" onClick={() => setOpenNew(true)}>
            <Plus className="size-4 mr-1" /> 새 쇼츠 만들기
          </Button>
        </div>
        {series.shorts.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            아직 쇼츠가 없어요. 위의 트렌드 입력함을 채우고 새 쇼츠를 만들어보세요.
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {series.shorts.map((sh) => {
              const p = notebookProgress(sh);
              const exportDone = sh.notebooks.export.status === "done";
              return (
                <button
                  key={sh.id}
                  onClick={() => onOpenShort(sh.id)}
                  className="text-left rounded-lg border bg-card p-3 hover:bg-muted transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium text-sm">{sh.title}</div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-[10px]">
                          출발: {sourceLabel(sh.sourceType)}
                        </Badge>
                        {sh.isDraft && (
                          <Badge variant="secondary" className="text-[10px]">
                            임시 저장
                          </Badge>
                        )}
                        {exportDone && (
                          <Badge className="text-[10px] bg-success text-success-foreground">
                            완료
                          </Badge>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground mt-1" />
                  </div>
                  <div className="mt-2 h-1.5 rounded bg-muted">
                    <div
                      className="h-full rounded bg-primary"
                      style={{ width: `${p.pct}%` }}
                    />
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    {p.done}/{p.total} 단계 완료
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <NewShortDialog
        open={openNew}
        onOpenChange={setOpenNew}
        series={series}
        onCreated={(id) => onOpenShort(id)}
      />
      <IdeasManager
        open={openMgr === "ideas"}
        onOpenChange={(v) => setOpenMgr(v ? "ideas" : null)}
        filterSeriesId={series.id}
      />
      <FormatsManager
        open={openMgr === "formats"}
        onOpenChange={(v) => setOpenMgr(v ? "formats" : null)}
      />
    </div>
  );
}

function sourceLabel(t: string) {
  return (
    {
      trend: "📥 트렌드",
      idea: "💡 아이디어",
      format: "📚 포맷",
      blank: "✨ 빈 상태",
    }[t] ?? t
  );
}
