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
import { uid } from "@/lib/presets";
import type { Material, Series } from "@/lib/types";
import { toast } from "sonner";

const MAX_MATERIALS = 3;

export function NewShortDialog({
  open,
  onOpenChange,
  series,
  subNotebookId,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  series: Series;
  subNotebookId?: string;
  onCreated: (id: string) => void;
}) {
  const { state, addShort } = useApp();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [title, setTitle] = useState("");
  const [selectedSub, setSelectedSub] = useState<string>(subNotebookId ?? "");
  const [customText, setCustomText] = useState("");
  const [isDraft, setIsDraft] = useState(true);

  const relevantIdeas = state.ideas.filter(
    (i) =>
      i.pinnedSeriesId === series.id ||
      i.pinnedSubNotebookId === (subNotebookId ?? selectedSub),
  );
  const availableFormats = state.formats;

  const addMaterial = (m: Omit<Material, "id">) => {
    setMaterials((cur) => {
      if (cur.length >= MAX_MATERIALS) {
        toast.warning(
          "조합이 너무 많으면 결과가 흐려질 수 있어요. 핵심 재료 3개까지만 선택하세요.",
        );
        return cur;
      }
      // duplicate check for trend / same ref
      if (m.kind === "trend" && cur.some((c) => c.kind === "trend")) return cur;
      if (m.ref && cur.some((c) => c.ref === m.ref)) return cur;
      return [...cur, { id: uid(), ...m }];
    });
  };

  const removeMaterial = (id: string) =>
    setMaterials((cur) => cur.filter((m) => m.id !== id));

  const submit = () => {
    if (!title.trim()) return;
    const primary = materials[0];
    const sourceType: Parameters<typeof createShort>[0]["sourceType"] =
      primary?.kind === "custom"
        ? "blank"
        : primary?.kind ?? "blank";
    const sh = createShort({
      seriesId: series.id,
      subNotebookId: (subNotebookId ?? selectedSub) || undefined,
      title: title.trim(),
      sourceType,
      sourceRef: primary?.ref,
      materials,
      isDraft,
    });
    addShort(sh);
    setTitle("");
    setMaterials([]);
    setCustomText("");
    onCreated(sh.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>새 쇼츠 만들기</DialogTitle>
          <DialogDescription>
            이 쇼츠를 만들 재료를 최대 3개까지 조합할 수 있어요.
          </DialogDescription>
        </DialogHeader>

        {!subNotebookId && (series.subNotebooks?.length ?? 0) > 0 && (
          <div className="mb-3">
            <Label className="text-xs">하위 노트북 (선택)</Label>
            <select
              className="mt-1 w-full rounded-md border bg-background px-2 py-1.5 text-sm"
              value={selectedSub}
              onChange={(e) => setSelectedSub(e.target.value)}
            >
              <option value="">(하위 노트북 없이)</option>
              {series.subNotebooks!.map((sb) => (
                <option key={sb.id} value={sb.id}>
                  {sb.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Selected materials */}
        <div className="mb-3">
          <Label className="text-xs">
            선택된 재료 · {materials.length}/{MAX_MATERIALS}
          </Label>
          <div className="mt-1 min-h-8 flex flex-wrap gap-1.5">
            {materials.length === 0 && (
              <span className="text-xs text-muted-foreground">
                아래에서 재료를 골라 조합하세요.
              </span>
            )}
            {materials.map((m) => (
              <Badge
                key={m.id}
                variant="secondary"
                className="gap-1 cursor-pointer"
                onClick={() => removeMaterial(m.id)}
              >
                {materialLabel(m, state)} ×
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid gap-3 mb-4">
          {/* 트렌드 */}
          <div className="rounded-lg border p-2.5">
            <div className="text-xs font-semibold mb-1.5">📥 트렌드 입력에서</div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => addMaterial({ kind: "trend" })}
            >
              이 노트북 트렌드 입력함 사용
            </Button>
          </div>
          {/* 아이디어 */}
          <div className="rounded-lg border p-2.5">
            <div className="text-xs font-semibold mb-1.5">💡 저장된 아이디어에서</div>
            {relevantIdeas.length === 0 ? (
              <p className="text-[11px] text-muted-foreground">
                이 노트북에 저장된 아이디어가 없어요.
              </p>
            ) : (
              <div className="max-h-32 overflow-y-auto space-y-1">
                {relevantIdeas.map((i) => (
                  <button
                    key={i.id}
                    type="button"
                    onClick={() => {
                      addMaterial({ kind: "idea", ref: i.id });
                      if (!title) setTitle(i.title);
                    }}
                    className="block w-full text-left rounded-md border bg-card p-1.5 text-xs hover:bg-muted"
                  >
                    <div className="font-medium">{i.title}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* 포맷 */}
          <div className="rounded-lg border p-2.5">
            <div className="text-xs font-semibold mb-1.5">📚 포맷 라이브러리에서</div>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {availableFormats.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => addMaterial({ kind: "format", ref: f.id })}
                  className="block w-full text-left rounded-md border bg-card p-1.5 text-xs hover:bg-muted"
                >
                  <div className="font-medium">{f.name}</div>
                </button>
              ))}
            </div>
          </div>
          {/* Custom */}
          <div className="rounded-lg border p-2.5">
            <div className="text-xs font-semibold mb-1.5">✏️ 직접 입력해서</div>
            <div className="flex gap-2">
              <Input
                className="h-8 text-xs"
                placeholder="예: 발로란트 초보 멘탈 관리"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  if (!customText.trim()) return;
                  addMaterial({ kind: "custom", note: customText.trim() });
                  setCustomText("");
                }}
              >
                추가
              </Button>
            </div>
          </div>
        </div>

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

function materialLabel(m: Material, state: ReturnType<typeof useApp>["state"]) {
  if (m.kind === "trend") return "📥 트렌드";
  if (m.kind === "idea")
    return `💡 ${state.ideas.find((i) => i.id === m.ref)?.title ?? "아이디어"}`;
  if (m.kind === "format")
    return `📚 ${state.formats.find((f) => f.id === m.ref)?.name ?? "포맷"}`;
  return `✏️ ${m.note ?? "직접 입력"}`;
}
