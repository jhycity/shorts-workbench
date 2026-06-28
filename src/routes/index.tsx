import { createFileRoute } from "@tanstack/react-router";
import { ProjectsProvider, useProjects } from "@/lib/projects-context";
import { Dashboard } from "@/components/Dashboard";
import { ProjectWorkspace } from "@/components/ProjectWorkspace";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "쇼츠 자동 제작 OS" },
      {
        name: "description",
        content:
          "쇼츠 영상 한 편을 처음부터 끝까지 관리하는 노트북형 제작 작업대. 후보 3개 중 선택하며 최종 패키지까지.",
      },
      { property: "og:title", content: "쇼츠 자동 제작 OS" },
      {
        property: "og:description",
        content:
          "트렌드 vs 내 아이디어를 분리해서 관리하고, 11단계 노트북으로 쇼츠 한 편을 완성하세요.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <ProjectsProvider>
      <Shell />
      <Toaster richColors position="top-center" />
    </ProjectsProvider>
  );
}

function Shell() {
  const { current } = useProjects();
  return (
    <div className="min-h-screen">
      <header className="border-b bg-paper/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📓</span>
            <span className="font-semibold tracking-tight">쇼츠 자동 제작 OS</span>
          </div>
          <span className="text-xs text-muted-foreground">
            로컬에 자동 저장됩니다
          </span>
        </div>
      </header>

      {current ? <ProjectWorkspace /> : <Dashboard />}
    </div>
  );
}
