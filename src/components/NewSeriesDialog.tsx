import { useEffect, useState } from "react";
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
import type { Length, Series } from "@/lib/types";
import {
  SCREEN_STYLE_SUGGESTIONS,
  TAG_SUGGESTIONS,
} from "@/lib/types";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated?: (seriesId: string) => void;
  editSeries?: Series;
}

const MAX_TAGS = 3;

export function NewSeriesDialog({ open, onOpenChange, onCreated, editSeries }: Props) {
  const { state, addSeries, updateSeries } = useApp();
  const isEdit = !!editSeries;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [defaultLength, setDefaultLength] = useState<Length>("30초");
  const [defaultTone, setDefaultTone] = useState("");
  const [defaultScreenStyle, setDefaultScreenStyle] = useState("");
  const [defaultFormatId, setDefaultFormatId] = useState<string>("");
  const [defaultVoice, setDefaultVoice] = useState("");
  const [defaultSubtitleStyle, setDefaultSubtitleStyle] = useState("");

  useEffect(() => {
    if (!open || !editSeries) return;
    setTitle(editSeries.title);
    setDescription(editSeries.description);
    setTags(editSeries.tags ?? []);
    setDefaultLength(editSeries.defaultLength);
    setDefaultTone(editSeries.defaultTone);
    setDefaultScreenStyle(editSeries.defaultScreenStyle);
    setDefaultFormatId(editSeries.defaultFormatId ?? "");
    setDefaultVoice(editSeries.defaultVoice ?? "");
    setDefaultSubtitleStyle(editSeries.defaultSubtitleStyle ?? "");
  }, [open, editSeries]);

  const toggleTag = (t: string) => {
    setTags((cur) => {
      if (cur.includes(t)) return cur.filter((x) => x !== t);
      if (cur.length >= MAX_TAGS) {
        toast.warning(
          "태그가 너무 많으면 결과가 흐려질 수 있어요. 핵심 3개만 선택하세요.",
        );
        return cur;
      }
      return [...cur, t];
    });
  };

  const addCustomTag = () => {
    const t = customTag.trim();
    if (!t) return;
    toggleTag(t);
    setCustomTag("");
  };

  const reset = () => {
    setTitle("");
    setDescription("");
    setTags([]);
    setCustomTag("");
    setDefaultLength("30초");
    setDefaultTone("");
    setDefaultScreenStyle("");
    setDefaultFormatId("");
    setDefaultVoice("");
    setDefaultSubtitleStyle("");
  };

  const canSubmit = !!title.trim();

  const submit = () => {
    if (!canSubmit) return;
    if (isEdit && editSeries) {
      updateSeries(editSeries.id, (s) => ({
        ...s,
        title: title.trim(),
        description: description.trim(),
        tags,
        defaultLength,
        defaultTone: defaultTone.trim(),
        defaultScreenStyle: defaultScreenStyle.trim(),
        defaultFormatId: defaultFormatId || undefined,
        defaultVoice: defaultVoice.trim() || undefined,
        defaultSubtitleStyle: defaultSubtitleStyle.trim() || undefined,
      }));
      toast.success("저장했어요");
      onOpenChange(false);
      return;
    }
    const se = createSeries({
      title: title.trim(),
      description: description.trim(),
      tags,
      defaultLength,
      defaultTone: defaultTone.trim(),
      defaultScreenStyle: defaultScreenStyle.trim(),
      defaultFormatId: defaultFormatId || undefined,
      defaultVoice: defaultVoice.trim() || undefined,
      defaultSubtitleStyle: defaultSubtitleStyle.trim() || undefined,
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
          <DialogTitle>{isEdit ? "키워드 노트북 수정" : "새 키워드 노트북"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "제목, 설명, 기본 설정을 언제든지 바꿀 수 있어요."
              : "큰 키워드 하나 안에서 하위 노트북과 쇼츠가 계속 파생돼요."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          <div className="grid gap-2">
            <Label>키워드 노트북 이름 <span className="text-destructive">*</span></Label>
            <Input
              placeholder="예: 20대 자극 콘텐츠, 게임, ASMR, AI 시대"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label>간단한 설명</Label>
            <Textarea
              rows={2}
              placeholder="이 노트북에서 어떤 쇼츠들이 나올 예정인지"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>기본 영상 길이 <span className="text-destructive">*</span></Label>
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
            <Label>기본 제작 스타일 <span className="text-destructive">*</span></Label>
            <Input
              placeholder="예: 빠르게 전달하지만 끝에는 생각하게 만드는 스타일"
              value={defaultTone}
              onChange={(e) => setDefaultTone(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label>기본 화면 스타일 <span className="text-destructive">*</span></Label>
            <Input
              placeholder="예: 자막 중심, AI 이미지 중심, 실사 B-roll 중심, ASMR/풍경 중심"
              value={defaultScreenStyle}
              onChange={(e) => setDefaultScreenStyle(e.target.value)}
            />
            <div className="flex flex-wrap gap-1.5">
              {SCREEN_STYLE_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setDefaultScreenStyle(s)}
                  className="rounded-full border bg-card px-2.5 py-0.5 text-[11px] hover:bg-muted"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border bg-muted/30 p-3">
            <div className="text-xs font-semibold mb-1 text-muted-foreground">
              선택 입력 (건너뛰어도 돼요)
            </div>

            <div className="grid gap-2 mt-2">
              <Label className="text-xs">
                태그 (최대 3개) · {tags.length}/3
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {TAG_SUGGESTIONS.map((t) => {
                  const on = tags.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTag(t)}
                      className={`rounded-full border px-2.5 py-0.5 text-[11px] transition ${
                        on
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border bg-card hover:bg-muted"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
              {tags.filter((t) => !TAG_SUGGESTIONS.includes(t)).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags
                    .filter((t) => !TAG_SUGGESTIONS.includes(t))
                    .map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleTag(t)}
                        className="rounded-full border border-primary bg-primary/15 text-primary px-2.5 py-0.5 text-[11px]"
                      >
                        {t} ×
                      </button>
                    ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  className="h-8 text-xs"
                  placeholder="직접 입력 후 추가"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomTag())}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addCustomTag}
                >
                  추가
                </Button>
              </div>
            </div>

            <div className="grid gap-2 mt-3">
              <Label className="text-xs">주로 쓸 포맷</Label>
              <select
                className="rounded-md border bg-background px-2 py-1.5 text-sm"
                value={defaultFormatId}
                onChange={(e) => setDefaultFormatId(e.target.value)}
              >
                <option value="">(선택 안 함)</option>
                {state.formats.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2 mt-3">
              <Label className="text-xs">주로 쓸 TTS 톤</Label>
              <Input
                className="h-8 text-xs"
                placeholder="예: 차분한 남자 저음, 빠른 정보 전달 톤"
                value={defaultVoice}
                onChange={(e) => setDefaultVoice(e.target.value)}
              />
            </div>

            <div className="grid gap-2 mt-3">
              <Label className="text-xs">자막 스타일</Label>
              <Input
                className="h-8 text-xs"
                placeholder="예: 굵은 흰 자막, 노란 강조, 큰 이모지"
                value={defaultSubtitleStyle}
                onChange={(e) => setDefaultSubtitleStyle(e.target.value)}
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            피하고 싶은 스타일은 마지막 <b>원본성/수익화 체크</b> 단계에서 다뤄요.
          </p>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={submit} disabled={!canSubmit}>
            {isEdit ? "저장" : "키워드 노트북 만들기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
