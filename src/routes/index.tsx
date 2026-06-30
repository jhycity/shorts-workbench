import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppProvider, useApp } from "@/lib/app-context";
import { SeriesDashboard } from "@/components/SeriesDashboard";
import { SeriesView } from "@/components/SeriesView";
import { ShortView } from "@/components/ShortView";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "쇼츠 자동 제작 OS" },
      {
        name: "description",
        content:
          "제작 노트북(시리즈) 안에서 여러 쇼츠를 계속 만들어 나가는 노트북형 제작 OS.",
      },
      { property: "og:title", content: "쇼츠 자동 제작 OS" },
      {
        property: "og:description",
        content:
          "큰 주제 안에서 쇼츠 여러 편을 관리하고, 8단계로 한 편씩 완성하세요.",
      },
    ],
  }),
  component: Index,
});

type View =
  | { type: "dashboard" }
  | { type: "series"; seriesId: string }
  | { type: "short"; seriesId: string; shortId: string };

function Index() {
  return (
    <AppProvider>
      <Shell />
      <Toaster richColors position="top-center" />
    </AppProvider>
  );
}

function Shell() {
  const { state } = useApp();
  const [view, setView] = useState<View>({ type: "dashboard" });

  return (
    <div className="min-h-screen">
      <header className="border-b bg-paper/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-3">
          <button
            onClick={() => setView({ type: "dashboard" })}
            className="flex items-center gap-2"
          >
            <span className="text-xl">📓</span>
            <span className="font-semibold tracking-tight">
              쇼츠 자동 제작 OS
            </span>
          </button>
          <span className="text-xs text-muted-foreground">
            로컬에 자동 저장됩니다
          </span>
        </div>
      </header>

      {(() => {
        if (view.type === "dashboard") {
          return (
            <SeriesDashboard
              onOpenSeries={(id) =>
                setView({ type: "series", seriesId: id })
              }
            />
          );
        }
        const series = state.series.find((s) => s.id === view.seriesId);
        if (!series) {
          // 삭제된 시리즈
          setView({ type: "dashboard" });
          return null;
        }
        if (view.type === "series") {
          return (
            <SeriesView
              series={series}
              onBack={() => setView({ type: "dashboard" })}
              onOpenShort={(shortId) =>
                setView({ type: "short", seriesId: series.id, shortId })
              }
            />
          );
        }
        const short = series.shorts.find((sh) => sh.id === view.shortId);
        if (!short) {
          setView({ type: "series", seriesId: series.id });
          return null;
        }
        return (
          <ShortView
            series={series}
            short={short}
            onBack={() =>
              setView({ type: "series", seriesId: series.id })
            }
          />
        );
      })()}
    </div>
  );
}
