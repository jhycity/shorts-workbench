import { useApp, type SaveStatus } from "@/lib/app-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, Download, Upload, Check, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { BackupDialog } from "./BackupDialog";

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
  const { importJson, saveNow } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [openBackup, setOpenBackup] = useState(false);

  const onImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importJson(String(reader.result));
        toast.success("백업을 불러왔어요");
      } catch (e) {
        toast.error("백업 파일이 잘못됐어요", { description: String(e) });
      }
    };
    reader.readAsText(file);
  };

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
        accept="application/json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onImport(f);
          e.target.value = "";
        }}
      />
      <BackupDialog open={openBackup} onOpenChange={setOpenBackup} />
    </>
  );
}
