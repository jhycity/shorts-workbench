import { useState } from "react";
import { useApp } from "@/lib/app-context";
import type { Series } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { NewShortDialog } from "./NewShortDialog";
import { ShortCard } from "./SeriesView";
import { toast } from "sonner";

export function SubNotebookView({
  series,
  subId,
  onBack,
  onOpenShort,
}: {
  series: Series;
  subId: string;
  onBack: () => void;
  onOpenShort: (shortId: string) => void;
}) {
  const { state, updateSubNotebook, deleteSubNotebook, addIdea } = useApp();
  const sub = series.subNotebooks?.find((s) => s.id === subId);
  const [openNew, setOpenNew] = useState(false);
  const [ideaDraft, setIdeaDraft] = useState({ title: "", description: "" });

  if (!sub) return null;

  const shorts = series.shorts.filter((sh) => sh.subNotebookId === subId);
  const ideas = state.ideas.filter(
    (i) => i.pinnedSubNotebookId === subId,
  );

  const quickAddIdea = () => {
    if (!ideaDraft.title.trim()) return;
    addIdea({
      title: ideaDraft.title.trim(),
      description: ideaDraft.description.trim(),
      contentLineIds: [],
      formatIds: [],
      reason: "",
      refKeywords: sub.name,
      pinnedSeriesId: series.id,
      pinnedSubNotebookId: sub.id,
    });
    setIdeaDraft({ title: "", description: "" });
    toast.success("아이디어를 이 하위 노트북에 저장했어요");
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <button
        onClick={onBack}
        className="text-sm text-muted-foreground hover:text-foreground mb-2"
      >
        ← {series.title}
      </button>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="flex-1">
          <Input
            className="text-2xl font-bold border-0 shadow-none px-0 h-auto focus-visible:ring-0"
            value={sub.name}
            onChange={(e) =>
              updateSubNotebook(series.id, sub.id, { name: e.target.value })
            }
          />
          <Textarea
            rows={2}
            className="mt-1 border-0 shadow-none px-0 text-sm text-muted-foreground focus-visible:ring-0"
            placeholder="이 하위 노트북에서 다룰 세부 주제 설명"
            value={sub.description}
            onChange={(e) =>
              updateSubNotebook(series.id, sub.id, {
                description: e.target.value,
              })
            }
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive"
          onClick={() => {
            if (confirm(`"${sub.name}" 하위 노트북을 삭제할까요?`)) {
              deleteSubNotebook(series.id, sub.id);
              onBack();
            }
          }}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border bg-paper p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">🎬 쇼츠 프로젝트</h2>
            <Button size="sm" onClick={() => setOpenNew(true)}>
              <Plus className="size-4 mr-1" /> 새 쇼츠 만들기
            </Button>
          </div>
          {shorts.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              아직 이 하위 노트북의 쇼츠가 없어요.
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {shorts.map((sh) => (
                <ShortCard
                  key={sh.id}
                  sh={sh}
                  onOpen={() => onOpenShort(sh.id)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border bg-paper p-4">
            <h3 className="font-semibold text-sm mb-2">💡 아이디어 빠른 추가</h3>
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
                저장
              </Button>
            </div>
          </div>
          <div className="rounded-xl border bg-paper p-4">
            <Label className="text-sm font-semibold">
              📌 이 하위 노트북 아이디어 ({ideas.length})
            </Label>
            {ideas.length === 0 ? (
              <p className="text-xs text-muted-foreground mt-2">
                아직 저장된 아이디어가 없어요.
              </p>
            ) : (
              <ul className="space-y-1.5 mt-2">
                {ideas.map((i) => (
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
        </div>
      </div>

      <NewShortDialog
        open={openNew}
        onOpenChange={setOpenNew}
        series={series}
        subNotebookId={sub.id}
        onCreated={(id) => onOpenShort(id)}
      />
    </div>
  );
}
