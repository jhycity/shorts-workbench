import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/lib/app-context";
import { Download, Copy } from "lucide-react";
import { toast } from "sonner";

type Scope =
  | { kind: "all" }
  | { kind: "series"; id: string }
  | { kind: "sub"; seriesId: string; id: string }
  | { kind: "short"; seriesId: string; id: string }
  | { kind: "ideas" }
  | { kind: "formats" };

export function BackupDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { state } = useApp();
  const [scope, setScope] = useState<Scope>({ kind: "all" });

  const data = useMemo(() => buildScopeData(scope, state), [scope, state]);

  const summary = useMemo(() => summarize(scope, state), [scope, state]);

  const download = () => {
    const json = JSON.stringify(data.payload, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `shorts-os-backup-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("백업 파일을 내보냈어요");
  };

  const copy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(data.payload, null, 2));
    toast.success("백업 JSON을 클립보드에 복사했어요");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>백업 내보내기</DialogTitle>
          <DialogDescription>
            무엇을 백업할지 고르고, 요약을 확인한 뒤 파일로 저장하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 mb-4">
          <Label className="text-xs">백업 대상</Label>
          <div className="grid gap-1.5">
            <ScopeRow
              label="전체 앱 데이터"
              on={scope.kind === "all"}
              onClick={() => setScope({ kind: "all" })}
            />
            <ScopeRow
              label="전역 아이디어 보관함만"
              on={scope.kind === "ideas"}
              onClick={() => setScope({ kind: "ideas" })}
            />
            <ScopeRow
              label="포맷 라이브러리만"
              on={scope.kind === "formats"}
              onClick={() => setScope({ kind: "formats" })}
            />
          </div>

          {state.series.length > 0 && (
            <>
              <div className="mt-3 text-xs text-muted-foreground">특정 노트북</div>
              <div className="grid gap-1.5 max-h-40 overflow-y-auto">
                {state.series.map((s) => (
                  <ScopeRow
                    key={s.id}
                    label={`📓 ${s.title}`}
                    on={scope.kind === "series" && scope.id === s.id}
                    onClick={() => setScope({ kind: "series", id: s.id })}
                  />
                ))}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">특정 하위 노트북</div>
              <div className="grid gap-1.5 max-h-40 overflow-y-auto">
                {state.series.flatMap((s) =>
                  (s.subNotebooks ?? []).map((sb) => (
                    <ScopeRow
                      key={sb.id}
                      label={`📂 ${s.title} › ${sb.name}`}
                      on={scope.kind === "sub" && scope.id === sb.id}
                      onClick={() =>
                        setScope({ kind: "sub", seriesId: s.id, id: sb.id })
                      }
                    />
                  )),
                )}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">특정 쇼츠</div>
              <div className="grid gap-1.5 max-h-40 overflow-y-auto">
                {state.series.flatMap((s) =>
                  s.shorts.map((sh) => (
                    <ScopeRow
                      key={sh.id}
                      label={`🎬 ${s.title} › ${sh.title}`}
                      on={scope.kind === "short" && scope.id === sh.id}
                      onClick={() =>
                        setScope({ kind: "short", seriesId: s.id, id: sh.id })
                      }
                    />
                  )),
                )}
              </div>
            </>
          )}
        </div>

        <div className="rounded-lg border bg-muted/30 p-3 mb-4">
          <div className="text-xs font-semibold mb-2">미리보기 요약</div>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <SummaryRow label="대상" value={summary.name} />
            <SummaryRow label="키워드 노트북" value={String(summary.seriesCount)} />
            <SummaryRow label="하위 노트북" value={String(summary.subCount)} />
            <SummaryRow label="쇼츠 프로젝트" value={String(summary.shortsCount)} />
            <SummaryRow label="아이디어" value={String(summary.ideasCount)} />
            <SummaryRow label="포맷" value={String(summary.formatsCount)} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-[10px]">
            파일명: shorts-os-backup-{new Date().toISOString().slice(0, 10)}.json
          </Badge>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            닫기
          </Button>
          <Button variant="outline" onClick={copy}>
            <Copy className="size-4 mr-1" /> 클립보드에 복사
          </Button>
          <Button onClick={download}>
            <Download className="size-4 mr-1" /> 백업 파일 만들기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ScopeRow({
  label,
  on,
  onClick,
}: {
  label: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-md border px-3 py-1.5 text-sm transition ${
        on
          ? "border-primary bg-accent ring-1 ring-primary/40"
          : "border-border hover:bg-muted"
      }`}
    >
      {label}
    </button>
  );
}
function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded border bg-card px-2 py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  );
}

function buildScopeData(scope: Scope, state: ReturnType<typeof useApp>["state"]) {
  if (scope.kind === "all") return { payload: state };
  if (scope.kind === "ideas")
    return {
      payload: { type: "ideas", ideas: state.ideas },
    };
  if (scope.kind === "formats")
    return { payload: { type: "formats", formats: state.formats } };
  if (scope.kind === "series") {
    const s = state.series.find((x) => x.id === scope.id);
    return { payload: { type: "series", series: s } };
  }
  if (scope.kind === "sub") {
    const s = state.series.find((x) => x.id === scope.seriesId);
    const sub = s?.subNotebooks?.find((x) => x.id === scope.id);
    const shorts = s?.shorts.filter((sh) => sh.subNotebookId === scope.id);
    return {
      payload: {
        type: "sub",
        subNotebook: sub,
        seriesTitle: s?.title,
        shorts,
      },
    };
  }
  // short
  const s = state.series.find((x) => x.id === scope.seriesId);
  const sh = s?.shorts.find((x) => x.id === scope.id);
  return {
    payload: { type: "short", short: sh, seriesTitle: s?.title },
  };
}

function summarize(scope: Scope, state: ReturnType<typeof useApp>["state"]) {
  const empty = {
    name: "",
    seriesCount: 0,
    subCount: 0,
    shortsCount: 0,
    ideasCount: 0,
    formatsCount: 0,
  };
  if (scope.kind === "all") {
    return {
      name: "전체 앱 데이터",
      seriesCount: state.series.length,
      subCount: state.series.reduce(
        (n, s) => n + (s.subNotebooks?.length ?? 0),
        0,
      ),
      shortsCount: state.series.reduce((n, s) => n + s.shorts.length, 0),
      ideasCount: state.ideas.length,
      formatsCount: state.formats.length,
    };
  }
  if (scope.kind === "ideas")
    return { ...empty, name: "전역 아이디어 보관함", ideasCount: state.ideas.length };
  if (scope.kind === "formats")
    return { ...empty, name: "포맷 라이브러리", formatsCount: state.formats.length };
  if (scope.kind === "series") {
    const s = state.series.find((x) => x.id === scope.id);
    return {
      ...empty,
      name: s?.title ?? "노트북",
      seriesCount: 1,
      subCount: s?.subNotebooks?.length ?? 0,
      shortsCount: s?.shorts.length ?? 0,
    };
  }
  if (scope.kind === "sub") {
    const s = state.series.find((x) => x.id === scope.seriesId);
    const sb = s?.subNotebooks?.find((x) => x.id === scope.id);
    return {
      ...empty,
      name: `${s?.title ?? ""} › ${sb?.name ?? ""}`,
      subCount: 1,
      shortsCount:
        s?.shorts.filter((sh) => sh.subNotebookId === scope.id).length ?? 0,
    };
  }
  const s = state.series.find((x) => x.id === scope.seriesId);
  const sh = s?.shorts.find((x) => x.id === scope.id);
  return { ...empty, name: sh?.title ?? "쇼츠", shortsCount: 1 };
}
