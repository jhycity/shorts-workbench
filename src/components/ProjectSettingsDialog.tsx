import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useProjects } from "@/lib/projects-context";

export function ProjectSettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { current, updateCurrent } = useProjects();
  if (!current) return null;

  const toggle = (
    field: "avoidStyles" | "preferredTones",
    idx: number,
  ) =>
    updateCurrent((p) => ({
      ...p,
      [field]: p[field].map((it, i) =>
        i === idx ? { ...it, checked: !it.checked } : it,
      ),
    }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>이 프로젝트의 취향 설정</DialogTitle>
          <DialogDescription>
            아래 체크 항목은 다양성 체크와 최종 패키지에 함께 들어가 ‘내 채널의 색’을 유지하게 도와줘요.
          </DialogDescription>
        </DialogHeader>

        <section className="mt-2">
          <h3 className="font-semibold text-sm mb-2">🚫 피하고 싶은 스타일</h3>
          <ul className="space-y-2">
            {current.avoidStyles.map((it, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-md border bg-card p-3"
              >
                <Checkbox
                  checked={it.checked}
                  onCheckedChange={() => toggle("avoidStyles", i)}
                  className="mt-0.5"
                />
                <span className="text-sm">{it.label}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-6">
          <h3 className="font-semibold text-sm mb-2">💚 좋아하는 영상 톤</h3>
          <ul className="space-y-2">
            {current.preferredTones.map((it, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-md border bg-card p-3"
              >
                <Checkbox
                  checked={it.checked}
                  onCheckedChange={() => toggle("preferredTones", i)}
                  className="mt-0.5"
                />
                <span className="text-sm">{it.label}</span>
              </li>
            ))}
          </ul>
        </section>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>닫기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
