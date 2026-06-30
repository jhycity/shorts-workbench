import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/lib/app-context";
import { createShort } from "@/lib/store";
import type { Series, Short } from "@/lib/types";

type Source = Short["sourceType"];

export function NewShortDialog({
  open,
  onOpenChange,
  series,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  series: Series;
  onCreated: (id: string) => void;
}) {
  const { state, addShort } = useApp();
  const [source, setSource] = useState<Source>("trend");
  const [title, setTitle] = useState("");
  const [sourceRef, setSourceRef] = useState<string | undefined>();
  const [isDraft, setIsDraft] = useState(true);

  const relevantIdeas = state.ideas.filter(
    (i) =>
      i.pinnedSeriesId === series.id ||
      i.contentLineIds.some((id) => series.contentLineIds.includes(id)),
  );
  const relevantFormats = state.formats.filter((f) =>
    f.contentLineIds.some((id) => series.contentLineIds.includes(id)),
  );

  const submit = () => {
    if (!title.trim()) return;
    const sh = createShort({
      seriesId: series.id,
      title: title.trim(),
      sourceType: source,
      sourceRef,
      isDraft,
    });
    addShort(sh);
    setTitle("");
    setSourceRef(undefined);
    onCreated(sh.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>새 쇼츠 만들기</DialogTitle>
          <DialogDescription>
            이 쇼츠를 어디서부터 시작할지 골라주세요.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 sm:grid-cols-2 mb-4">
          {(
            [
              ["trend", "📥 트렌드 입력함에서", "이 시리즈의 트렌드 메모를 기반으로"],
              ["idea", "💡 아이디어 보관함에서", "저장된 아이디어를 발판으로"],
              ["format", "📚 포맷 라이브러리에서", "검증된 포맷 구조부터 시작"],
              ["blank", "✨ 빈 상태에서", "아무것도 없이 직접 다 채움"],
            ] as [Source, string, string][]
          ).map(([id, label, desc]) => (
            <button
              key={id}
              type="button"
              onClick={() => setSource(id)}
              className={`text-left rounded-lg border p-3 transition ${
                source === id
                  ? "border-primary bg-accent ring-2 ring-primary/30"
                  : "border-border hover:bg-muted"
              }`}
            >
              <div className="font-semibold text-sm">{label}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                {desc}
              </div>
            </button>
          ))}
        </div>

        {source === "idea" && (
          <div className="mb-4">
            <Label className="text-xs">아이디어 선택 (선택사항)</Label>
            <div className="mt-1 max-h-40 overflow-y-auto space-y-1">
              {relevantIdeas.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  이 시리즈에 어울리는 아이디어가 보관함에 없어요.
                </p>
              ) : (
                relevantIdeas.map((i) => (
                  <button
                    key={i.id}
                    type="button"
                    onClick={() => {
                      setSourceRef(i.id);
                      if (!title) setTitle(i.title);
                    }}
                    className={`block w-full text-left rounded-md border p-2 text-xs ${
                      sourceRef === i.id ? "border-primary bg-accent" : "bg-card"
                    }`}
                  >
                    <div className="font-medium">{i.title}</div>
                    {i.description && (
                      <div className="text-muted-foreground line-clamp-2">
                        {i.description}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {source === "format" && (
          <div className="mb-4">
            <Label className="text-xs">포맷 선택 (선택사항)</Label>
            <div className="mt-1 max-h-40 overflow-y-auto space-y-1">
              {relevantFormats.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  이 시리즈에 매핑된 포맷이 없어요. 포맷 라이브러리에서 콘텐츠라인을 연결해보세요.
                </p>
              ) : (
                relevantFormats.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSourceRef(f.id)}
                    className={`block w-full text-left rounded-md border p-2 text-xs ${
                      sourceRef === f.id ? "border-primary bg-accent" : "bg-card"
                    }`}
                  >
                    <div className="font-medium">{f.name}</div>
                    <div className="text-muted-foreground line-clamp-2">
                      {f.structure}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        <div className="grid gap-2 mb-3">
          <Label>쇼츠 제목</Label>
          <Input
            placeholder="예: 20대에 무조건 해야 할 것 TOP3"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={isDraft}
            onChange={(e) => setIsDraft(e.target.checked)}
          />
          작성 중인 임시 저장 상태로 시작
          <Badge variant="secondary" className="text-[10px]">
            언제든 변경 가능
          </Badge>
        </label>

        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={submit} disabled={!title.trim()}>
            쇼츠 만들기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
