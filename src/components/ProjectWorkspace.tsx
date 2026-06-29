import { useState } from "react";
import { useProjects } from "@/lib/projects-context";
import { NOTEBOOK_META, NOTEBOOK_ORDER, type NotebookId } from "@/lib/types";
import { isLocked, nextStep, notebookProgress } from "@/lib/store";
import { CONTENT_LINE_MAP } from "@/lib/presets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CheckCircle2,
  Circle,
  Loader2,
  Lock,
  Unlock,
  Sparkles,
  Trash2,
  Settings,
} from "lucide-react";
import { NotebookView } from "./NotebookView";
import { ProjectSettingsDialog } from "./ProjectSettingsDialog";
import { toast } from "sonner";

export function ProjectWorkspace() {
  const { current, setCurrentId, deleteProject, unlock } = useProjects();
  const [openId, setOpenId] = useState<NotebookId | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  if (!current) return null;

  if (openId) {
    return <NotebookView notebookId={openId} onBack={() => setOpenId(null)} />;
  }

  const progress = notebookProgress(current);
  const next = nextStep(current);
  const line = CONTENT_LINE_MAP[current.contentLine];

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <button
            onClick={() => setCurrentId(null)}
            className="text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            ← 모든 프로젝트
          </button>
          <h1 className="text-3xl font-bold tracking-tight">{current.title}</h1>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge className="bg-primary/15 text-primary border-primary/20" variant="outline">
              {line.emoji} {line.name}
            </Badge>
            <Badge variant="secondary">
              {current.route === "trend" ? "📈 트렌드 기반" : "💡 내 아이디어 기반"}
            </Badge>
            <Badge variant="outline">{current.category}</Badge>
            <Badge variant="outline">{current.platform}</Badge>
            <Badge variant="outline">{current.length}</Badge>
            <Badge variant="outline">목표: {current.goal}</Badge>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="size-4 mr-1" /> 취향 설정
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => {
              if (confirm("이 프로젝트를 삭제할까요? (되돌릴 수 없어요)")) {
                deleteProject(current.id);
              }
            }}
          >
            <Trash2 className="size-4 mr-1" /> 삭제
          </Button>
        </div>
      </div>

      {/* 콘텐츠 라인 추천 카드 */}
      <Accordion type="single" collapsible defaultValue="rec" className="mb-6">
        <AccordionItem value="rec" className="rounded-xl border bg-paper px-5">
          <AccordionTrigger className="text-sm">
            <span className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <strong>{line.name}</strong> 라인 추천 제작 방식
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-3 sm:grid-cols-2 pb-2 text-sm">
              <RecCard label="추천 영상 톤" value={line.recTone} />
              <RecCard label="추천 후킹" value={line.recHook} />
              <RecCard label="추천 화면 스타일" value={line.recScreen} />
              <RecCard label="저작권/주의점" value={line.copyrightCaution} />
              <RecCard
                label="추천 포맷"
                value={line.recFormatNames.join(" · ")}
                full
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="rounded-xl border bg-paper p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium">진행률</div>
          <div className="text-sm tabular-nums text-muted-foreground">
            {progress.done} / {progress.total} 단계 완료 · {progress.pct}%
          </div>
        </div>
        <Progress value={progress.pct} />
        {next && (
          <div className="mt-4 flex items-center justify-between rounded-lg bg-accent/50 p-3">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="size-4 text-primary" />
              <span>
                다음 단계: <strong>{NOTEBOOK_META[next].title}</strong>
              </span>
            </div>
            <Button size="sm" onClick={() => setOpenId(next)}>
              지금 시작
            </Button>
          </div>
        )}
        {!next && (
          <div className="mt-4 rounded-lg bg-success/10 p-3 text-sm text-success-foreground">
            🎉 모든 단계 완료! 최종 내보내기에서 패키지를 복사하세요.
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {NOTEBOOK_ORDER.map((id, idx) => {
          const meta = NOTEBOOK_META[id];
          const status = current.notebooks[id].status;
          const locked = isLocked(current, id);
          return (
            <button
              key={id}
              data-locked={locked}
              disabled={locked}
              onClick={() => !locked && setOpenId(id)}
              className="notebook-card text-left p-5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <div className="flex items-start justify-between mb-3 pl-2">
                <div className="text-3xl">{meta.icon}</div>
                <NotebookStatus status={status} locked={locked} />
              </div>
              <div className="pl-2">
                <div className="text-xs text-muted-foreground">
                  STEP {String(idx + 1).padStart(2, "0")}
                </div>
                <div className="font-semibold mt-0.5">{meta.title}</div>
                <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {meta.subtitle}
                </div>
              </div>
              {locked && (
                <div className="mt-3 pl-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => {
                      unlock(id);
                      toast("잠금을 해제했어요", {
                        description: "이전 단계를 건너뛰고 진행합니다.",
                      });
                    }}
                    className="text-[11px] text-muted-foreground inline-flex items-center gap-1 hover:text-foreground"
                  >
                    <Unlock className="size-3" /> 강제 진행
                  </button>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <ProjectSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}

function RecCard({
  label,
  value,
  full,
}: {
  label: string;
  value: string;
  full?: boolean;
}) {
  return (
    <div className={`rounded-md border bg-card p-3 ${full ? "sm:col-span-2" : ""}`}>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm">{value}</div>
    </div>
  );
}

function NotebookStatus({
  status,
  locked,
}: {
  status: "todo" | "in_progress" | "done";
  locked: boolean;
}) {
  if (locked)
    return (
      <Badge variant="outline" className="text-muted-foreground">
        <Lock className="size-3 mr-1" /> 잠금
      </Badge>
    );
  if (status === "done")
    return (
      <Badge className="bg-success text-success-foreground">
        <CheckCircle2 className="size-3 mr-1" /> 완료
      </Badge>
    );
  if (status === "in_progress")
    return (
      <Badge variant="secondary">
        <Loader2 className="size-3 mr-1 animate-spin" /> 진행 중
      </Badge>
    );
  return (
    <Badge variant="outline">
      <Circle className="size-3 mr-1" /> 시작 전
    </Badge>
  );
}
