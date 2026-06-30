import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/app-context";
import { Plus, Trash2 } from "lucide-react";
import type { ContentLine, Format, Idea } from "@/lib/types";
import type { ContentLine, Format, Idea } from "@/lib/types";

// ===================== Content Lines =====================
export function ContentLinesManager({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { state, addContentLine, updateContentLine, deleteContentLine } = useApp();
  const [draft, setDraft] = useState<Omit<ContentLine, "id">>(emptyLine());

  function emptyLine(): Omit<ContentLine, "id"> {
    return {
      name: "",
      emoji: "✨",
      description: "",
      recTone: "",
      recHook: "",
      recScreen: "",
      copyrightCaution: "",
    };
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>콘텐츠라인 관리</DialogTitle>
          <DialogDescription>
            주제 분야, 추천 톤, 주의점을 한 묶음으로 관리하는 콘텐츠 라인입니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 mb-4">
          {state.contentLines.map((c) => (
            <div key={c.id} className="rounded-lg border p-3 bg-card">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Input
                    className="w-16"
                    value={c.emoji}
                    onChange={(e) => updateContentLine(c.id, { emoji: e.target.value })}
                  />
                  <Input
                    className="font-semibold"
                    value={c.name}
                    onChange={(e) => updateContentLine(c.id, { name: e.target.value })}
                  />
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    if (confirm(`"${c.name}" 콘텐츠라인을 삭제할까요?`))
                      deleteContentLine(c.id);
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2 text-sm">
                <Input
                  placeholder="설명"
                  value={c.description}
                  onChange={(e) => updateContentLine(c.id, { description: e.target.value })}
                />
                <Input
                  placeholder="추천 톤"
                  value={c.recTone}
                  onChange={(e) => updateContentLine(c.id, { recTone: e.target.value })}
                />
                <Input
                  placeholder="추천 후킹"
                  value={c.recHook}
                  onChange={(e) => updateContentLine(c.id, { recHook: e.target.value })}
                />
                <Input
                  placeholder="추천 화면 스타일"
                  value={c.recScreen}
                  onChange={(e) => updateContentLine(c.id, { recScreen: e.target.value })}
                />
                <Input
                  className="sm:col-span-2"
                  placeholder="저작권/주의점"
                  value={c.copyrightCaution}
                  onChange={(e) =>
                    updateContentLine(c.id, { copyrightCaution: e.target.value })
                  }
                />
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-dashed p-3 bg-muted/30">
          <div className="text-sm font-semibold mb-2">+ 새 콘텐츠라인 추가</div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              placeholder="이모지"
              value={draft.emoji}
              onChange={(e) => setDraft({ ...draft, emoji: e.target.value })}
            />
            <Input
              placeholder="이름"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
            <Input
              className="sm:col-span-2"
              placeholder="설명"
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            />
            <Input
              placeholder="추천 톤"
              value={draft.recTone}
              onChange={(e) => setDraft({ ...draft, recTone: e.target.value })}
            />
            <Input
              placeholder="추천 후킹"
              value={draft.recHook}
              onChange={(e) => setDraft({ ...draft, recHook: e.target.value })}
            />
            <Input
              placeholder="추천 화면 스타일"
              value={draft.recScreen}
              onChange={(e) => setDraft({ ...draft, recScreen: e.target.value })}
            />
            <Input
              placeholder="저작권/주의점"
              value={draft.copyrightCaution}
              onChange={(e) => setDraft({ ...draft, copyrightCaution: e.target.value })}
            />
          </div>
          <Button
            className="mt-2"
            size="sm"
            disabled={!draft.name.trim()}
            onClick={() => {
              addContentLine(draft);
              setDraft(emptyLine());
            }}
          >
            <Plus className="size-4 mr-1" /> 추가
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ===================== Ideas =====================
export function IdeasManager({
  open,
  onOpenChange,
  filterSeriesId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  filterSeriesId?: string;
}) {
  const { state, addIdea, updateIdea, deleteIdea } = useApp();
  const [draft, setDraft] = useState<Omit<Idea, "id" | "createdAt">>(emptyIdea());

  function emptyIdea(): Omit<Idea, "id" | "createdAt"> {
    return {
      title: "",
      description: "",
      contentLineIds: [],
      formatIds: [],
      reason: "",
      refKeywords: "",
      pinnedSeriesId: filterSeriesId,
    };
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>전역 아이디어 보관함</DialogTitle>
          <DialogDescription>
            떠오른 모든 아이디어를 모아두는 곳. 시리즈를 만들 때 여기서 꺼내 쓸 수 있어요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 mb-4">
          {state.ideas.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-6">
              아직 저장된 아이디어가 없어요.
            </div>
          )}
          {state.ideas.map((i) => (
            <div key={i.id} className="rounded-lg border p-3 bg-card">
              <div className="flex items-center justify-between gap-2">
                <Input
                  className="font-semibold"
                  value={i.title}
                  onChange={(e) => updateIdea(i.id, { title: e.target.value })}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => deleteIdea(i.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <Textarea
                rows={2}
                className="mt-2 text-sm"
                placeholder="아이디어 설명"
                value={i.description}
                onChange={(e) => updateIdea(i.id, { description: e.target.value })}
              />
              <div className="mt-2 grid gap-2 sm:grid-cols-2 text-sm">
                <Input
                  placeholder="떠오른 이유"
                  value={i.reason}
                  onChange={(e) => updateIdea(i.id, { reason: e.target.value })}
                />
                <Input
                  placeholder="참고 키워드 (콤마)"
                  value={i.refKeywords}
                  onChange={(e) => updateIdea(i.id, { refKeywords: e.target.value })}
                />
              </div>
              <MultiSelect
                label="어울리는 콘텐츠라인"
                options={state.contentLines.map((c) => ({ id: c.id, label: `${c.emoji} ${c.name}` }))}
                value={i.contentLineIds}
                onChange={(v) => updateIdea(i.id, { contentLineIds: v })}
              />
              <MultiSelect
                label="어울리는 포맷"
                options={state.formats.map((f) => ({ id: f.id, label: f.name }))}
                value={i.formatIds}
                onChange={(v) => updateIdea(i.id, { formatIds: v })}
              />
              <div className="mt-2">
                <Label className="text-xs">붙일 제작 노트북</Label>
                <select
                  className="mt-1 w-full rounded-md border bg-background px-2 py-1.5 text-sm"
                  value={i.pinnedSeriesId ?? ""}
                  onChange={(e) =>
                    updateIdea(i.id, { pinnedSeriesId: e.target.value || undefined })
                  }
                >
                  <option value="">(연결 없음)</option>
                  {state.series.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-dashed p-3 bg-muted/30">
          <div className="text-sm font-semibold mb-2">+ 새 아이디어 추가</div>
          <div className="grid gap-2">
            <Input
              placeholder="아이디어 제목"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
            <Textarea
              rows={2}
              placeholder="아이디어 설명"
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                placeholder="떠오른 이유"
                value={draft.reason}
                onChange={(e) => setDraft({ ...draft, reason: e.target.value })}
              />
              <Input
                placeholder="참고 키워드 (콤마)"
                value={draft.refKeywords}
                onChange={(e) => setDraft({ ...draft, refKeywords: e.target.value })}
              />
            </div>
            <MultiSelect
              label="어울리는 콘텐츠라인"
              options={state.contentLines.map((c) => ({ id: c.id, label: `${c.emoji} ${c.name}` }))}
              value={draft.contentLineIds}
              onChange={(v) => setDraft({ ...draft, contentLineIds: v })}
            />
            <MultiSelect
              label="어울리는 포맷"
              options={state.formats.map((f) => ({ id: f.id, label: f.name }))}
              value={draft.formatIds}
              onChange={(v) => setDraft({ ...draft, formatIds: v })}
            />
          </div>
          <Button
            className="mt-2"
            size="sm"
            disabled={!draft.title.trim()}
            onClick={() => {
              addIdea(draft);
              setDraft(emptyIdea());
            }}
          >
            <Plus className="size-4 mr-1" /> 추가
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ===================== Formats =====================
export function FormatsManager({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { state, addFormat, updateFormat, deleteFormat } = useApp();
  const [draft, setDraft] = useState<Omit<Format, "id">>(emptyFormat());

  function emptyFormat(): Omit<Format, "id"> {
    return {
      name: "",
      structure: "",
      contentLineIds: [],
      pros: "",
      risks: "",
      variations: "",
    };
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>전역 포맷 라이브러리</DialogTitle>
          <DialogDescription>
            영상 포맷을 모아두는 곳. 어디 시리즈에서든 불러 쓸 수 있어요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 mb-4">
          {state.formats.map((f) => (
            <div key={f.id} className="rounded-lg border p-3 bg-card">
              <div className="flex items-center justify-between gap-2">
                <Input
                  className="font-semibold"
                  value={f.name}
                  onChange={(e) => updateFormat(f.id, { name: e.target.value })}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => deleteFormat(f.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <div className="mt-2 grid gap-2 text-sm">
                <Input
                  placeholder="구조"
                  value={f.structure}
                  onChange={(e) => updateFormat(f.id, { structure: e.target.value })}
                />
                <Input
                  placeholder="장점"
                  value={f.pros}
                  onChange={(e) => updateFormat(f.id, { pros: e.target.value })}
                />
                <Input
                  placeholder="반복 시 위험점"
                  value={f.risks}
                  onChange={(e) => updateFormat(f.id, { risks: e.target.value })}
                />
                <Input
                  placeholder="변주 아이디어"
                  value={f.variations}
                  onChange={(e) => updateFormat(f.id, { variations: e.target.value })}
                />
              </div>
              <MultiSelect
                label="어울리는 콘텐츠라인"
                options={state.contentLines.map((c) => ({ id: c.id, label: `${c.emoji} ${c.name}` }))}
                value={f.contentLineIds}
                onChange={(v) => updateFormat(f.id, { contentLineIds: v })}
              />
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-dashed p-3 bg-muted/30">
          <div className="text-sm font-semibold mb-2">+ 새 포맷 추가</div>
          <div className="grid gap-2">
            <Input
              placeholder="포맷 이름"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
            <Input
              placeholder="구조"
              value={draft.structure}
              onChange={(e) => setDraft({ ...draft, structure: e.target.value })}
            />
            <Input
              placeholder="장점"
              value={draft.pros}
              onChange={(e) => setDraft({ ...draft, pros: e.target.value })}
            />
            <Input
              placeholder="반복 시 위험점"
              value={draft.risks}
              onChange={(e) => setDraft({ ...draft, risks: e.target.value })}
            />
            <Input
              placeholder="변주 아이디어"
              value={draft.variations}
              onChange={(e) => setDraft({ ...draft, variations: e.target.value })}
            />
            <MultiSelect
              label="어울리는 콘텐츠라인"
              options={state.contentLines.map((c) => ({ id: c.id, label: `${c.emoji} ${c.name}` }))}
              value={draft.contentLineIds}
              onChange={(v) => setDraft({ ...draft, contentLineIds: v })}
            />
          </div>
          <Button
            className="mt-2"
            size="sm"
            disabled={!draft.name.trim()}
            onClick={() => {
              addFormat(draft);
              setDraft(emptyFormat());
            }}
          >
            <Plus className="size-4 mr-1" /> 추가
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ===================== shared MultiSelect =====================
function MultiSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: string; label: string }[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div className="mt-2">
      <Label className="text-xs">{label}</Label>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = value.includes(o.id);
          return (
            <button
              key={o.id}
              type="button"
              onClick={() =>
                onChange(on ? value.filter((x) => x !== o.id) : [...value, o.id])
              }
              className={`rounded-full border px-2.5 py-0.5 text-[11px] transition ${
                on
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-card hover:bg-muted"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
