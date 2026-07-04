import { useState } from "react";
import { useApp } from "@/lib/app-context";
import type { Series } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Trash2,
  ArrowRight,
  Lightbulb,
  Library,
  FolderPlus,
} from "lucide-react";
import { TREND_INBOX_PLACEHOLDERS } from "@/lib/presets";
import { NewShortDialog } from "./NewShortDialog";
import { notebookProgress } from "@/lib/store";
import { IdeasManager, FormatsManager } from "./Managers";
import { toast } from "sonner";
import { uid } from "@/lib/presets";

export function SeriesView({
  series,
  onBack,
  onOpenShort,
  onOpenSub,
}: {
  series: Series;
  onBack: () => void;
  onOpenShort: (shortId: string) => void;
  onOpenSub: (subId: string) => void;
}) {
  const {
    state,
    updateSeries,
    deleteSeries,
    addSubNotebook,
    deleteSubNotebook,
    addIdea,
  } = useApp();
  const [openNew, setOpenNew] = useState(false);
  const [openMgr, setOpenMgr] = useState<null | "ideas" | "formats">(null);
  const [subDraft, setSubDraft] = useState("");
  const [ideaDraft, setIdeaDraft] = useState({ title: "", description: "" });

  const relatedIdeas = state.ideas.filter(
    (i) => i.pinnedSeriesId === series.id,
  );
  const relatedFormats = state.formats.filter(
    (f) => f.id === series.defaultFormatId,
  );

  const setInbox = (key: keyof Series["trendInbox"], val: string) =>
    updateSeries(series.id, (s) => ({
      ...s,
      trendInbox: { ...s.trendInbox, [key]: val },
    }));

  const addSub = () => {
    const name = subDraft.trim();
    if (!name) return;
    addSubNotebook(series.id, {
      id: uid(),
      name,
      description: "",
      createdAt: Date.now(),
    });
    setSubDraft("");
  };

  const quickAddIdea = () => {
    if (!ideaDraft.title.trim()) return;
    addIdea({
      title: ideaDraft.title.trim(),
      description: ideaDraft.description.trim(),
      contentLineIds: [],
      formatIds: [],
      reason: "",
      refKeywords: "",
      pinnedSeriesId: series.id,
    });
    setIdeaDraft({ title: "", description: "" });
    toast.success("아이디어를 이 노트북에 저장했어요");
  };

  const subs = series.subNotebooks ?? [];
  const topLevelShorts = series.shorts.filter((sh) => !sh.subNotebookId);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <button
        onClick={onBack}
        className="text-sm text-muted-foreground hover:text-foreground mb-2"
      >
        ← 모든 키워드 노트북
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
            {(series.tags ?? []).map((t) => (
              <Badge
                key={t}
                variant="outline"
                className="bg-primary/10 text-primary border-primary/20"
              >
                #{t}
              </Badge>
            ))}
            <Badge variant="secondary">{series.defaultLength}</Badge>
            {series.defaultTone && (
              <Badge variant="outline">스타일: {series.defaultTone}</Badge>
            )}
            {series.defaultScreenStyle && (
              <Badge variant="outline">화면: {series.defaultScreenStyle}</Badge>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => setOpenMgr("ideas")}>
            <Lightbulb className="size-4 mr-1" /> 전역 아이디어
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setOpenMgr("formats")}>
            <Library className="size-4 mr-1" /> 전역 포맷
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => {
              if (
                confirm(
                  `"${series.title}" 키워드 노트북과 안의 쇼츠 프로젝트를 삭제할까요?`,
                )
              ) {
                deleteSeries(series.id);
                onBack();
                toast("노트북을 삭제했어요");
              }
            }}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      {/* 하위 노트북 */}
      <div className="mb-6 rounded-xl border bg-paper p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">📂 하위 노트북</h2>
          <div className="flex gap-2">
            <Input
              className="h-8 w-56 text-sm"
              placeholder="예: 시간 낭비, 발로란트, 빗소리"
              value={subDraft}
              onChange={(e) => setSubDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSub()}
            />
            <Button size="sm" onClick={addSub}>
              <FolderPlus className="size-4 mr-1" /> 추가
            </Button>
          </div>
        </div>
        {subs.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            큰 키워드 안에서 자주 다룰 세부 주제를 하위 노트북으로 만들어보세요.
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {subs.map((sb) => {
              const count = series.shorts.filter(
                (sh) => sh.subNotebookId === sb.id,
              ).length;
              return (
                <div
                  key={sb.id}
                  className="group flex items-center justify-between rounded-lg border bg-card p-3 hover:bg-muted transition"
                >
                  <button
                    onClick={() => onOpenSub(sb.id)}
                    className="flex-1 text-left"
                  >
                    <div className="font-medium text-sm">{sb.name}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      쇼츠 {count}개
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`"${sb.name}" 하위 노트북을 삭제할까요?`))
                        deleteSubNotebook(series.id, sb.id);
                    }}
                    className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
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
                ["myAngle", "내 채널식 해석 방향"],
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

        {/* 우: 아이디어 빠른 추가 + 관련 */}
        <div className="space-y-4">
          <div className="rounded-xl border bg-paper p-4">
            <h3 className="font-semibold text-sm mb-2 flex items-center gap-1">
              <Lightbulb className="size-4" /> 아이디어 빠른 추가
            </h3>
            <div className="grid gap-2">
              <Input
                className="h-8 text-sm"
                placeholder="아이디어 제목"
                value={ideaDraft.title}
                onChange={(e) =>
                  setIdeaDraft({ ...ideaDraft, title: e.target.value })
                }
              />
              <Textarea
                rows={2}
                className="text-xs"
                placeholder="한 줄 설명"
                value={ideaDraft.description}
                onChange={(e) =>
                  setIdeaDraft({ ...ideaDraft, description: e.target.value })
                }
              />
              <Button size="sm" onClick={quickAddIdea} disabled={!ideaDraft.title.trim()}>
                이 노트북에 저장
              </Button>
            </div>
          </div>

          <div className="rounded-xl border bg-paper p-4">
            <h3 className="font-semibold text-sm mb-2">
              📌 이 노트북 아이디어 ({relatedIdeas.length})
            </h3>
            {relatedIdeas.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                아직 저장된 아이디어가 없어요.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {relatedIdeas.slice(0, 6).map((i) => (
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

          {relatedFormats.length > 0 && (
            <div className="rounded-xl border bg-paper p-4">
              <h3 className="font-semibold text-sm mb-2">📚 기본 포맷</h3>
              <div className="text-xs">
                <div className="font-medium">{relatedFormats[0].name}</div>
                <div className="text-muted-foreground mt-0.5">
                  {relatedFormats[0].structure}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 쇼츠 목록 (하위 미분류) */}
      <div className="mt-6 rounded-xl border bg-paper p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-semibold">🎬 쇼츠 프로젝트</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              하위 노트북에 속하지 않은 쇼츠 · 하위 노트북별 쇼츠는 각 하위 노트북 안에서 관리
            </p>
          </div>
          <Button size="sm" onClick={() => setOpenNew(true)}>
            <Plus className="size-4 mr-1" /> 새 쇼츠 만들기
          </Button>
        </div>
        {topLevelShorts.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            아직 쇼츠가 없어요.
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {topLevelShorts.map((sh) => (
              <ShortCard
                key={sh.id}
                sh={sh}
                onOpen={() => onOpenShort(sh.id)}
              />
            ))}
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

export function ShortCard({
  sh,
  onOpen,
}: {
  sh: import("@/lib/types").Short;
  onOpen: () => void;
}) {
  const p = notebookProgress(sh);
  const finalizeDone = sh.notebooks.finalize.status === "done";
  return (
    <button
      onClick={onOpen}
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
            {finalizeDone && (
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
