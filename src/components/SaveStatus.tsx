import { useApp, type SaveStatus } from "@/lib/app-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Save, Download, Upload, Check, Loader2, AlertTriangle } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { BackupDialog } from "./BackupDialog";
import type { ImportedPayload } from "@/lib/store";

export function SaveStatusBadge({
  status,
  lastSavedAt,
}: {
  status: SaveStatus;
  lastSavedAt: number;
}) {
  const ago = lastSavedAt ? timeAgo(lastSavedAt) : "아직 저장 안 됨";
  if (status === "saving")
    return (
      <Badge variant="outline" className="gap-1">
        <Loader2 className="size-3 animate-spin" /> 저장 중…
      </Badge>
    );
  if (status === "error")
    return (
      <Badge variant="outline" className="gap-1 border-destructive text-destructive">
        <AlertTriangle className="size-3" /> 저장 실패
      </Badge>
    );
  return (
    <Badge variant="outline" className="gap-1 text-muted-foreground">
      <Check className="size-3 text-success" /> 저장됨 · {ago}
    </Badge>
  );
}

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 5) return "방금";
  if (s < 60) return `${s}초 전`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return new Date(ts).toLocaleString();
}

export function BackupButtons() {
  const { state, detectImportFile, applyImport, saveNow } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [openBackup, setOpenBackup] = useState(false);
  const [pending, setPending] = useState<ImportedPayload | null>(null);

  const onFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".json")) {
      toast.error("올바른 JSON 파일이 아닙니다.", {
        description: ".json 확장자 파일만 지원해요.",
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload = detectImportFile(String(reader.result));
        setPending(payload);
      } catch (e) {
        toast.error("백업 파일을 읽을 수 없어요", {
          description: e instanceof Error ? e.message : String(e),
        });
      }
    };
    reader.readAsText(file);
  };

  const run = (mode: "replace" | "merge" | "copy" | "overwrite") => {
    if (!pending) return;
    try {
      const c = applyImport(pending, { mode });
      setPending(null);
      toast.success("백업을 불러왔어요", {
        description: `노트북 ${c.series} · 하위 ${c.sub} · 쇼츠 ${c.shorts} · 아이디어 ${c.ideas} · 포맷 ${c.formats}`,
      });
    } catch (e) {
      toast.error("불러오기 실패", {
        description: e instanceof Error ? e.message : String(e),
      });
    }
  };

  const seriesIdConflict =
    pending?.kind === "series" &&
    state.series.some((s) => s.id === pending.series.id);

  return (
    <>
      <Button variant="ghost" size="sm" onClick={saveNow}>
        <Save className="size-4 mr-1" /> 지금 저장
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setOpenBackup(true)}>
        <Download className="size-4 mr-1" /> 백업 내보내기
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => fileRef.current?.click()}
      >
        <Upload className="size-4 mr-1" /> 백업 불러오기
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
      <BackupDialog open={openBackup} onOpenChange={setOpenBackup} />

      <Dialog open={!!pending} onOpenChange={(v) => !v && setPending(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>백업 불러오기</DialogTitle>
            <DialogDescription>
              {pending?.kind === "full" && "전체 앱 백업이에요. 어떻게 가져올까요?"}
              {pending?.kind === "series" &&
                (seriesIdConflict
                  ? "같은 ID의 키워드 노트북이 이미 있어요. 어떻게 처리할까요?"
                  : "단일 키워드 노트북 백업이에요.")}
              {pending?.kind === "ideas" && "아이디어 백업이에요. 기존 아이디어에 병합합니다."}
              {pending?.kind === "formats" && "포맷 백업이에요. 기존 포맷에 병합합니다."}
              {pending?.kind === "sub" && "하위 노트북 단독 백업은 병합 지원이 제한돼요."}
              {pending?.kind === "short" && "쇼츠 단독 백업은 병합 지원이 제한돼요."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 flex-wrap">
            <Button variant="ghost" onClick={() => setPending(null)}>
              취소
            </Button>

            {pending?.kind === "full" && (
              <>
                <Button variant="outline" onClick={() => run("merge")}>
                  기존과 병합
                </Button>
                <Button
                  onClick={() => {
                    if (confirm("현재 데이터를 모두 지우고 백업으로 교체할까요?")) run("replace");
                  }}
                >
                  전체 교체
                </Button>
              </>
            )}

            {pending?.kind === "series" && (
              <>
                <Button variant="outline" onClick={() => run("copy")}>
                  새 복사본으로 가져오기
                </Button>
                {seriesIdConflict ? (
                  <Button onClick={() => run("overwrite")}>
                    기존 노트북 덮어쓰기
                  </Button>
                ) : (
                  <Button onClick={() => run("merge")}>노트북 추가</Button>
                )}
              </>
            )}

            {(pending?.kind === "ideas" || pending?.kind === "formats") && (
              <Button onClick={() => run("merge")}>병합</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
