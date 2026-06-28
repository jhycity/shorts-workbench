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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProjects } from "@/lib/projects-context";
import { createProject } from "@/lib/store";
import type { Category, Goal, Length, Platform, Route } from "@/lib/types";

const CATEGORIES: Category[] = [
  "AI",
  "자기계발",
  "돈/부업",
  "20대 현실 조언",
  "음악/창작",
  "공부",
  "사회현상",
];
const PLATFORMS: Platform[] = ["유튜브 쇼츠", "인스타 릴스", "틱톡"];
const LENGTHS: Length[] = ["30초", "60초"];
const GOALS: Goal[] = ["조회수 실험", "수익화 실험", "채널 성장", "브랜딩"];

export function NewProjectDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { addProject, setCurrentId } = useProjects();
  const [title, setTitle] = useState("");
  const [route, setRoute] = useState<Route>("trend");
  const [category, setCategory] = useState<Category>("AI");
  const [platform, setPlatform] = useState<Platform>("유튜브 쇼츠");
  const [length, setLength] = useState<Length>("60초");
  const [goal, setGoal] = useState<Goal>("조회수 실험");

  const reset = () => {
    setTitle("");
    setRoute("trend");
    setCategory("AI");
    setPlatform("유튜브 쇼츠");
    setLength("60초");
    setGoal("조회수 실험");
  };

  const submit = () => {
    if (!title.trim()) return;
    const p = createProject({ title: title.trim(), route, category, platform, length, goal });
    addProject(p);
    setCurrentId(p.id);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>새 쇼츠 프로젝트</DialogTitle>
          <DialogDescription>
            프로젝트 하나 = 쇼츠 영상 한 편. 기본 정보를 골라 시작하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="title">프로젝트 제목</Label>
            <Input
              id="title"
              placeholder="예: AI 시대 20대가 진짜 해야 할 부업 TOP5"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label>제작 루트</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRoute("trend")}
                className={`rounded-lg border p-3 text-left text-sm transition ${
                  route === "trend"
                    ? "border-primary bg-accent"
                    : "border-border hover:bg-muted"
                }`}
              >
                <div className="font-semibold">📈 트렌드 기반</div>
                <div className="text-muted-foreground text-xs mt-1">
                  요즘 사람들이 관심 가질 주제로 시작
                </div>
              </button>
              <button
                type="button"
                onClick={() => setRoute("idea")}
                className={`rounded-lg border p-3 text-left text-sm transition ${
                  route === "idea"
                    ? "border-primary bg-accent"
                    : "border-border hover:bg-muted"
                }`}
              >
                <div className="font-semibold">💡 내 아이디어 기반</div>
                <div className="text-muted-foreground text-xs mt-1">
                  직접 떠올린 독자적인 영상으로 시작
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>카테고리</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>플랫폼</Label>
              <Select value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>길이</Label>
              <Select value={length} onValueChange={(v) => setLength(v as Length)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LENGTHS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>목표</Label>
              <Select value={goal} onValueChange={(v) => setGoal(v as Goal)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GOALS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>취소</Button>
          <Button onClick={submit} disabled={!title.trim()}>프로젝트 만들기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
