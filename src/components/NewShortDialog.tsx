import { useEffect, useState } from "react";
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
import { Check, RotateCcw } from "lucide-react";

const MAX_MATERIALS = 3;

interface DraftState {
  materials: Material[];
  title: string;
  selectedSub: string;
  customText: string;
  isDraft: boolean;
}

const storageKey = (seriesId: string, subId?: string) =>
  `shorts-os::new-short-draft::${seriesId}::${subId ?? "_"}`;

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

  // Load persisted draft on open
  useEffect(() => {
    if (!open) return;
    try {
      const raw = localStorage.getItem(storageKey(series.id, subNotebookId));
      if (raw) {
        const d = JSON.parse(raw) as DraftState;
        setMaterials(d.materials ?? []);
        setTitle(d.title ?? "");
        setSelectedSub(d.selectedSub ?? (subNotebookId ?? ""));
        setCustomText(d.customText ?? "");
        setIsDraft(d.isDraft ?? true);
      }
    } catch {
      /* noop */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Persist on change
  useEffect(() => {
    if (!open) return;
    const d: DraftState = { materials, title, selectedSub, customText, isDraft };
    try {
      localStorage.setItem(storageKey(series.id, subNotebookId), JSON.stringify(d));
    } catch {
      /* noop */
    }
  }, [materials, title, selectedSub, customText, isDraft, open, series.id, subNotebookId]);

  const effectiveSubId = subNotebookId ?? selectedSub;
  const subNb = series.subNotebooks?.find((s) => s.id === effectiveSubId);

  const relevantIdeas = state.ideas.filter(
    (i) => i.pinnedSeriesId === series.id || i.pinnedSubNotebookId === effectiveSubId,
  );
  const availableFormats = state.formats;

  const isTrendInboxSelected = materials.some((m) => m.kind === "trend" && !m.ref);
  const isRefSelected = (ref: string) => materials.some((m) => m.ref === ref);
  const isCustomSelected = (note: string) =>
    materials.some((m) => m.kind === "custom" && m.note === note);

  const toggleMaterial = (m: Omit<Material, "id">) => {
    setMaterials((cur) => {
      // trend inbox (no ref)
      if (m.kind === "trend" && !m.ref) {
        const exists = cur.find((c) => c.kind === "trend" && !c.ref);
        if (exists) return cur.filter((c) => c.id !== exists.id);
        if (cur.length >= MAX_MATERIALS) {
          toast.warning("조합이 너무 많으면 결과가 흐려질 수 있어요. 핵심 재료 3개까지만 선택하세요.");
          return cur;
        }
        return [...cur, { id: uid(), ...m }];
      }
      // deselect by ref
      if (m.ref) {
        const exists = cur.find((c) => c.ref === m.ref);
        if (exists) return cur.filter((c) => c.id !== exists.id);
      }
      // deselect custom by note
      if (m.kind === "custom" && m.note) {
        const exists = cur.find((c) => c.kind === "custom" && c.note === m.note);
        if (exists) return cur.filter((c) => c.id !== exists.id);
      }
      if (cur.length >= MAX_MATERIALS) {
        toast.warning("조합이 너무 많으면 결과가 흐려질 수 있어요. 핵심 재료 3개까지만 선택하세요.");
        return cur;
      }
      return [...cur, { id: uid(), ...m }];
    });
  };

  const removeMaterial = (id: string) =>
    setMaterials((cur) => cur.filter((m) => m.id !== id));

  const resetSelection = () => {
    setMaterials([]);
    setCustomText("");
    toast.success("선택한 재료를 초기화했어요");
  };

  const submit = () => {
    if (!title.trim()) return;
    const primary = materials[0];
    const sourceType: Parameters<typeof createShort>[0]["sourceType"] =
      primary?.kind === "custom" ? "blank" : primary?.kind ?? "blank";
    const sh = createShort({
      seriesId: series.id,
      subNotebookId: effectiveSubId || undefined,
      title: title.trim(),
      sourceType,
      sourceRef: primary?.ref,
      materials,
      isDraft,
    });
    addShort(sh);
    // clear draft
    try {
      localStorage.removeItem(storageKey(series.id, subNotebookId));
    } catch {
      /* noop */
    }
    setTitle("");
    setMaterials([]);
    setCustomText("");
    onCreated(sh.id);
    onOpenChange(false);
  };

  const selectedIdeas = materials
    .filter((m) => m.kind === "idea")
    .map((m) => state.ideas.find((i) => i.id === m.ref)?.title ?? "아이디어");
  const selectedFormats = materials
    .filter((m) => m.kind === "format")
    .map((m) => state.formats.find((f) => f.id === m.ref)?.name ?? "포맷");
  const selectedCustoms = materials
    .filter((m) => m.kind === "custom")
    .map((m) => m.note ?? "직접 입력");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>새 쇼츠 만들기</DialogTitle>
          <DialogDescription>
            이 쇼츠를 만들 재료를 최대 {MAX_MATERIALS}개까지 조합할 수 있어요.
          </DialogDescription>
        </DialogHeader>

        {/* 현재 선택한 재료 요약 박스 */}
        <div className="rounded-lg border-2 border-primary/40 bg-accent/40 p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold">📌 현재 선택한 재료</div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] tabular-nums text-muted-foreground">
                {materials.length}/{MAX_MATERIALS} 선택됨
              </span>
              {materials.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-[11px]"
                  onClick={resetSelection}
                >
                  <RotateCcw className="size-3 mr-1" /> 선택 초기화
                </Button>
              )}
            </div>
          </div>
          <div className="grid gap-1 text-xs">
            <SummaryRow label="키워드 노트북" value={series.title} filled />
            <SummaryRow
              label="하위 노트북"
              value={subNb?.name}
              placeholder="아직 선택 안 됨"
              filled={!!subNb}
            />
            <SummaryRow
              label="트렌드 입력"
              value={isTrendSelected ? "이 노트북 트렌드 입력함" : undefined}
              placeholder="아직 선택 안 됨"
              filled={isTrendSelected}
            />
            <SummaryRow
              label="아이디어"
              value={selectedIdeas.join(", ")}
              placeholder="아직 선택 안 됨"
              filled={selectedIdeas.length > 0}
            />
            <SummaryRow
              label="포맷"
              value={selectedFormats.join(", ")}
              placeholder="아직 선택 안 됨"
              filled={selectedFormats.length > 0}
            />
            <SummaryRow
              label="직접 입력"
              value={selectedCustoms.join(", ")}
              placeholder="아직 선택 안 됨"
              filled={selectedCustoms.length > 0}
            />
          </div>
          {materials.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {materials.map((m) => (
                <Badge
                  key={m.id}
                  variant="default"
                  className="gap-1 cursor-pointer"
                  onClick={() => removeMaterial(m.id)}
                  title="클릭하여 제거"
                >
                  <Check className="size-3" /> {materialLabel(m, state)} ×
                </Badge>
              ))}
            </div>
          )}
        </div>

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

        <div className="grid gap-3 mb-4">
          {/* 트렌드 */}
          <div className="rounded-lg border p-2.5">
            <div className="text-xs font-semibold mb-1.5">📥 트렌드 입력에서</div>
            <SelectableCard
              selected={isTrendSelected}
              onClick={() => toggleMaterial({ kind: "trend" })}
              title="이 노트북 트렌드 입력함 사용"
            />
          </div>

          {/* 아이디어 */}
          <div className="rounded-lg border p-2.5">
            <div className="text-xs font-semibold mb-1.5">💡 저장된 아이디어에서</div>
            {relevantIdeas.length === 0 ? (
              <p className="text-[11px] text-muted-foreground">
                이 노트북에 저장된 아이디어가 없어요.
              </p>
            ) : (
              <div className="max-h-40 overflow-y-auto space-y-1.5">
                {relevantIdeas.map((i) => {
                  const sel = isRefSelected(i.id);
                  return (
                    <SelectableCard
                      key={i.id}
                      selected={sel}
                      onClick={() => {
                        toggleMaterial({ kind: "idea", ref: i.id });
                        if (!sel && !title) setTitle(i.title);
                      }}
                      title={i.title}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* 포맷 */}
          <div className="rounded-lg border p-2.5">
            <div className="text-xs font-semibold mb-1.5">📚 포맷 라이브러리에서</div>
            <div className="max-h-40 overflow-y-auto space-y-1.5">
              {availableFormats.map((f) => {
                const sel = isRefSelected(f.id);
                return (
                  <SelectableCard
                    key={f.id}
                    selected={sel}
                    onClick={() => toggleMaterial({ kind: "format", ref: f.id })}
                    title={f.name}
                  />
                );
              })}
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
                  toggleMaterial({ kind: "custom", note: customText.trim() });
                  setCustomText("");
                }}
              >
                추가
              </Button>
            </div>
            {selectedCustoms.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {materials
                  .filter((m) => m.kind === "custom")
                  .map((m) => (
                    <SelectableCard
                      key={m.id}
                      selected
                      onClick={() => removeMaterial(m.id)}
                      title={m.note ?? "직접 입력"}
                    />
                  ))}
              </div>
            )}
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

function SummaryRow({
  label,
  value,
  placeholder,
  filled,
}: {
  label: string;
  value?: string;
  placeholder?: string;
  filled?: boolean;
}) {
  return (
    <div className="grid grid-cols-[90px_1fr] gap-2 items-baseline">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className={filled ? "font-medium" : "text-muted-foreground italic"}>
        {value || placeholder || "-"}
      </div>
    </div>
  );
}

function SelectableCard({
  selected,
  onClick,
  title,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative block w-full text-left rounded-md border p-2 text-xs transition",
        selected
          ? "border-primary bg-accent ring-2 ring-primary/30 pr-16"
          : "border-border bg-card hover:bg-muted",
      ].join(" ")}
    >
      <div className="font-medium flex items-center gap-1.5">
        {selected && <Check className="size-3.5 text-primary shrink-0" />}
        <span>{title}</span>
      </div>
      {selected && (
        <span className="absolute top-1.5 right-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold px-1.5 py-0.5">
          선택됨
        </span>
      )}
    </button>
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
