import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CandidateNotebook } from "@/lib/types";
import { Check } from "lucide-react";

interface Props {
  data: CandidateNotebook;
  onChange: (d: CandidateNotebook) => void;
  placeholder?: string;
  description?: string;
}

export function CandidatePicker({ data, onChange, placeholder, description }: Props) {
  const update = (i: number, text: string) => {
    const candidates = data.candidates.map((c, idx) => (idx === i ? { ...c, text } : c)) as typeof data.candidates;
    onChange({ ...data, candidates });
  };

  const select = (id: string) => {
    onChange({ ...data, selectedId: id });
  };

  return (
    <div className="space-y-4">
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      <div className="grid gap-3 md:grid-cols-3">
        {data.candidates.map((c, i) => {
          const selected = data.selectedId === c.id;
          const label = ["A", "B", "C"][i];
          return (
            <div
              key={c.id}
              className={`relative rounded-xl border p-3 transition ${
                selected
                  ? "border-primary bg-accent ring-2 ring-primary/40"
                  : "border-border bg-card"
              }`}
            >
              {selected && (
                <span className="absolute -top-2 -right-2 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 shadow">
                  선택됨
                </span>
              )}
              <div className="flex items-center justify-between mb-2">
                <Badge variant={selected ? "default" : "secondary"}>후보 {label}</Badge>
                {selected && (
                  <span className="text-xs font-medium text-primary inline-flex items-center gap-1">
                    <Check className="size-3" /> 선택됨
                  </span>
                )}
              </div>
              <Textarea
                value={c.text}
                onChange={(e) => update(i, e.target.value)}
                placeholder={placeholder ?? "여기에 후보를 적어주세요"}
                rows={5}
                className="resize-none text-sm"
              />
              <Button
                size="sm"
                variant={selected ? "default" : "outline"}
                className="mt-2 w-full"
                disabled={!c.text.trim()}
                onClick={() => select(selected ? "" : c.id)}
              >
                {selected ? (
                  <><Check className="size-3.5 mr-1" /> 선택 해제</>
                ) : (
                  "이 후보 선택"
                )}
              </Button>
            </div>

          );
        })}
      </div>
    </div>
  );
}

// 자유 입력 리스트 (트렌드 키워드 등)
export function StringList({
  items,
  onChange,
  placeholder,
}: {
  items: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    if (!draft.trim()) return;
    onChange([...items, draft.trim()]);
    setDraft("");
  };
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder={placeholder}
        />
        <Button size="sm" onClick={add}>추가</Button>
      </div>
      {items.length > 0 && (
        <ul className="space-y-1">
          {items.map((it, i) => (
            <li key={i} className="flex items-center justify-between rounded-md bg-muted px-3 py-1.5 text-sm">
              <span>{it}</span>
              <button
                className="text-xs text-muted-foreground hover:text-destructive"
                onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
