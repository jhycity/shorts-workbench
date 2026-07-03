import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/app-context";
import { createSeries } from "@/lib/store";
import type { Length } from "@/lib/types";
import { DEFAULT_AVOID_STYLES } from "@/lib/types";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated?: (seriesId: string) => void;
}

const MAX_LINES = 3;

export function NewSeriesDialog({ open, onOpenChange, onCreated }: Props) {
  const { state, addSeries } = useApp();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contentLineIds, setContentLineIds] = useState<string[]>([]);
  const [defaultLength, setDefaultLength] = useState<Length>("30초");
  const [defaultTone, setDefaultTone] = useState("");

  const toggleLine = (id: string) => {
    setContentLineIds((cur) => {
      if (cur.includes(id)) return cur.filter((x) => x !== id);
      if (cur.length >= MAX_LINES) {
        toast.warning(
          "콘텐츠라인이 너무 많으면 결과가 흐려질 수 있어요. 핵심 3개만 선택하세요.",
        );
        return cur;
      }
      return [...cur, id];
    });
  };

  const reset = () => {
    setTitle("");
    setDescription("");
    setContentLineIds([]);
    setDefaultLength("30초");
    setDefaultTone("");
  };

  const submit = () => {
    if (!title.trim() || contentLineIds.length === 0) return;
    const se = createSeries({
      title: title.trim(),
      description: description.trim(),
      contentLineIds,
      defaultLength,
      defaultTone: defaultTone.trim(),
      defaultScreenStyle: "",
      avoidStyles: DEFAULT_AVOID_STYLES,
    });
    addSeries(se);
    onCreated?.(se.id);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>새 제작 노트북(시리즈)</DialogTitle>
          <DialogDescription>
            하나의 큰 주제 안에서 여러 개의 쇼츠를 계속 만들어 나가는 작업대를 만들어요.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          <div className="grid gap-2">
            <Label>제작 노트북 제목</Label>
            <Input
              placeholder="예: 20대 현실 조언"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label>설명 (선택)</Label>
            <Textarea
              rows={2}
              placeholder="이 시리즈가 어떤 시청자에게, 어떤 톤으로 다가가는지"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label>
              콘텐츠라인 (최대 3개) ·{" "}
              <span className="text-xs text-muted-foreground">
                {contentLineIds.length}/3 선택
              </span>
            </Label>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {state.contentLines.map((c) => {
                const selected = contentLineIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleLine(c.id)}
                    className={`text-left rounded-lg border p-3 transition ${
                      selected
                        ? "border-primary bg-accent ring-2 ring-primary/30"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-sm font-semibold">
                      <span>{c.emoji}</span>
                      <span>{c.name}</span>
                    </div>
                    <div className="mt-1 text-[11px] leading-snug text-muted-foreground line-clamp-3">
                      {c.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>기본 영상 길이</Label>
              <div className="flex gap-2">
                {(["30초", "60초"] as Length[]).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setDefaultLength(l)}
                    className={`flex-1 rounded-md border px-3 py-2 text-sm ${
                      defaultLength === l
                        ? "border-primary bg-accent"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>기본 톤</Label>
            <Input
              placeholder="예: 빠르게 들리지만 끝에는 생각하게 만드는 현실 조언형"
              value={defaultTone}
              onChange={(e) => setDefaultTone(e.target.value)}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            피하고 싶은 스타일은 최종 단계의 <b>다양성/원본성 체크</b>에서 관리해요.
          </p>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button
            onClick={submit}
            disabled={!title.trim() || contentLineIds.length === 0}
          >
            제작 노트북 만들기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
