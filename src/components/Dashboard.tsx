import { useState } from "react";
import { useProjects } from "@/lib/projects-context";
import { NOTEBOOK_META, NOTEBOOK_ORDER } from "@/lib/types";
import { nextStep, notebookProgress } from "@/lib/store";
import { CONTENT_LINE_MAP } from "@/lib/presets";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, FolderPlus, ArrowRight } from "lucide-react";
import { NewProjectDialog } from "./NewProjectDialog";

export function Dashboard() {
  const { projects, setCurrentId } = useProjects();
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">쇼츠 자동 제작 OS</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            노트북 카드를 따라가며 쇼츠 한 편을 끝까지 완성하세요.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4 mr-1.5" /> 새 프로젝트 만들기
        </Button>
      </div>

      {projects.length === 0 ? (
        <EmptyState onCreate={() => setOpen(true)} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((p) => {
            const progress = notebookProgress(p);
            const next = nextStep(p);
            return (
              <button
                key={p.id}
                onClick={() => setCurrentId(p.id)}
                className="notebook-card text-left p-6"
              >
                <div className="pl-2">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h2 className="font-semibold text-lg leading-snug">{p.title}</h2>
                    <ArrowRight className="size-4 text-muted-foreground shrink-0 mt-1" />
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    <Badge className="text-[10px] bg-primary/15 text-primary border-primary/20" variant="outline">
                      {CONTENT_LINE_MAP[p.contentLine].emoji} {CONTENT_LINE_MAP[p.contentLine].name}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {p.route === "trend" ? "트렌드 기반" : "내 아이디어 기반"}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">{p.platform}</Badge>
                    <Badge variant="outline" className="text-[10px]">{p.length}</Badge>
                  </div>

                  <Progress value={progress.pct} className="h-1.5" />
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{progress.done}/{progress.total} 완료</span>
                    <span>
                      다음: {next ? NOTEBOOK_META[next].title : "전부 완료 🎉"}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-10 rounded-xl border bg-paper p-6">
        <h3 className="font-semibold mb-3">📓 11단계 노트북 흐름</h3>
        <ol className="grid gap-2 md:grid-cols-2 text-sm">
          {NOTEBOOK_ORDER.map((id, i) => (
            <li key={id} className="flex items-center gap-2 text-muted-foreground">
              <span className="inline-flex size-5 items-center justify-center rounded-full bg-secondary text-[11px] tabular-nums">
                {i + 1}
              </span>
              <span className="text-foreground">{NOTEBOOK_META[id].icon} {NOTEBOOK_META[id].title}</span>
            </li>
          ))}
        </ol>
      </div>

      <NewProjectDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed bg-paper/60 p-16 text-center">
      <div className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-accent text-2xl">
        🎬
      </div>
      <h2 className="mt-4 text-xl font-semibold">아직 프로젝트가 없어요</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        쇼츠 한 편을 처음부터 끝까지 관리하는 노트북형 작업대를 만들어보세요.
      </p>
      <Button className="mt-5" onClick={onCreate}>
        <FolderPlus className="size-4 mr-1.5" /> 첫 프로젝트 시작하기
      </Button>
    </div>
  );
}
