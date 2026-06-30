import { useMemo, useState } from "react";
import { useApp } from "@/lib/app-context";
import type { NotebookId, Series, Short } from "@/lib/types";
import {
  NOTEBOOK_META,
  NOTEBOOK_ORDER,
} from "@/lib/types";
import { isLocked, nextStep, notebookProgress } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Copy,
  Loader2,
  Lock,
  Sparkles,
  Trash2,
  Unlock,
} from "lucide-react";
import { CandidatePicker } from "./notebooks/Shared";
import { toast } from "sonner";

export function ShortView({
  series,
  short,
  onBack,
}: {
  series: Series;
  short: Short;
  onBack: () => void;
}) {
  const { updateShort, deleteShort } = useApp();
  const [openId, setOpenId] = useState<NotebookId | null>(null);

  const progress = notebookProgress(short);
  const next = nextStep(short);

  if (openId) {
    return (
      <NotebookView
        series={series}
        short={short}
        notebookId={openId}
        onBack={() => setOpenId(null)}
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <button
        onClick={onBack}
        className="text-sm text-muted-foreground hover:text-foreground mb-2"
      >
        ← 시리즈로 돌아가기
      </button>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{short.title}</h1>
          <div className="mt-2 flex flex-wrap gap-1">
            <Badge variant="outline">시리즈: {series.title}</Badge>
            <Badge variant="secondary">{series.defaultLength}</Badge>
            {short.isDraft && (
              <Badge variant="secondary">임시 저장</Badge>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              updateShort(series.id, short.id, (s) => ({
                ...s,
                isDraft: !s.isDraft,
              }))
            }
          >
            {short.isDraft ? "임시 저장 해제" : "임시 저장으로"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => {
              if (confirm(`"${short.title}" 쇼츠를 삭제할까요?`)) {
                deleteShort(series.id, short.id);
                onBack();
              }
            }}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-xl border bg-paper p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium">진행률</div>
          <div className="text-sm tabular-nums text-muted-foreground">
            {progress.done}/{progress.total} · {progress.pct}%
          </div>
        </div>
        <Progress value={progress.pct} />
        {next ? (
          <div className="mt-4 flex items-center justify-between rounded-lg bg-accent/50 p-3">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="size-4 text-primary" />
              <span>
                다음 단계: <strong>{NOTEBOOK_META[next].title}</strong>
              </span>
            </div>
            <Button size="sm" onClick={() => setOpenId(next)}>
              지금 시작
            </Button>
          </div>
        ) : (
          <div className="mt-4 rounded-lg bg-success/10 p-3 text-sm text-success-foreground">
            🎉 모든 단계 완료!
          </div>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {NOTEBOOK_ORDER.map((id, i) => {
          const meta = NOTEBOOK_META[id];
          const st = short.notebooks[id].status;
          const locked = isLocked(short, id);
          return (
            <button
              key={id}
              disabled={locked}
              onClick={() => !locked && setOpenId(id)}
              className="notebook-card text-left p-4 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <div className="flex items-start justify-between mb-2 pl-2">
                <div className="text-2xl">{meta.icon}</div>
                <StatusPill status={st} locked={locked} />
              </div>
              <div className="pl-2">
                <div className="text-[10px] text-muted-foreground">
                  STEP {String(i + 1).padStart(2, "0")}
                </div>
                <div className="font-semibold text-sm mt-0.5">{meta.title}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                  {meta.subtitle}
                </div>
              </div>
              {locked && (
                <div className="mt-2 pl-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() =>
                      updateShort(series.id, short.id, (s) => ({
                        ...s,
                        unlocked: { ...s.unlocked, [id]: true },
                      }))
                    }
                    className="text-[11px] text-muted-foreground inline-flex items-center gap-1 hover:text-foreground"
                  >
                    <Unlock className="size-3" /> 강제 진행
                  </button>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StatusPill({
  status,
  locked,
}: {
  status: "todo" | "in_progress" | "done";
  locked: boolean;
}) {
  if (locked)
    return (
      <Badge variant="outline" className="text-muted-foreground">
        <Lock className="size-3 mr-1" /> 잠금
      </Badge>
    );
  if (status === "done")
    return (
      <Badge className="bg-success text-success-foreground">
        <CheckCircle2 className="size-3 mr-1" /> 완료
      </Badge>
    );
  if (status === "in_progress")
    return (
      <Badge variant="secondary">
        <Loader2 className="size-3 mr-1 animate-spin" /> 진행 중
      </Badge>
    );
  return (
    <Badge variant="outline">
      <Circle className="size-3 mr-1" /> 시작 전
    </Badge>
  );
}

// ===================== NotebookView (단계 작업창) =====================
function NotebookView({
  series,
  short,
  notebookId,
  onBack,
}: {
  series: Series;
  short: Short;
  notebookId: NotebookId;
  onBack: () => void;
}) {
  const { updateShort } = useApp();
  const meta = NOTEBOOK_META[notebookId];
  const nb = short.notebooks;

  const patch = <K extends NotebookId>(id: K, data: Short["notebooks"][K]) =>
    updateShort(series.id, short.id, (s) => ({
      ...s,
      notebooks: { ...s.notebooks, [id]: data } as Short["notebooks"],
    }));

  const setStatus = (st: "todo" | "in_progress" | "done") =>
    updateShort(series.id, short.id, (s) => ({
      ...s,
      notebooks: {
        ...s.notebooks,
        [notebookId]: { ...s.notebooks[notebookId], status: st },
      } as Short["notebooks"],
    }));

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> 쇼츠로 돌아가기
      </button>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="text-3xl">{meta.icon}</div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">
            {meta.title}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{meta.subtitle}</p>
        </div>
        <StatusPill status={short.notebooks[notebookId].status} locked={false} />
      </div>

      <Separator className="mb-6" />

      <div className="rounded-xl border bg-paper p-6 shadow-sm">
        {(() => {
          switch (notebookId) {
            case "topic":
              return (
                <CandidatePicker
                  description="이번 영상의 주제 후보 3개를 적고 하나를 고르세요."
                  placeholder="예: AI 시대에 20대가 잃지 말아야 할 한 가지"
                  data={nb.topic}
                  onChange={(d) => patch("topic", d)}
                />
              );
            case "hook":
              return (
                <CandidatePicker
                  description="첫 1~2초에 시청자를 잡을 후킹 문장 3개."
                  placeholder="예: '이거 모르면 1년이 사라집니다.'"
                  data={nb.hook}
                  onChange={(d) => patch("hook", d)}
                />
              );
            case "script":
              return (
                <CandidatePicker
                  description={`${series.defaultLength} 분량 대본 후보 3개. 줄바꿈을 자연스럽게 넣어주세요.`}
                  placeholder={"후킹 →\n본문 →\n반전/정리 →\n클로징"}
                  data={nb.script}
                  onChange={(d) => patch("script", d)}
                />
              );
            case "title":
              return (
                <Tabs defaultValue="title">
                  <TabsList>
                    <TabsTrigger value="title">제목 3개</TabsTrigger>
                    <TabsTrigger value="thumb">썸네일 문구 3개</TabsTrigger>
                  </TabsList>
                  <TabsContent value="title" className="mt-4">
                    <CandidatePicker
                      placeholder="예: 20대가 1년 안에 망하는 진짜 이유"
                      data={{
                        status: nb.title.status,
                        candidates: nb.title.titles,
                        selectedId: nb.title.selectedTitleId,
                      }}
                      onChange={(d) =>
                        patch("title", {
                          ...nb.title,
                          titles: d.candidates,
                          selectedTitleId: d.selectedId,
                        })
                      }
                    />
                  </TabsContent>
                  <TabsContent value="thumb" className="mt-4">
                    <CandidatePicker
                      placeholder="예: '이거 모르면 끝'"
                      data={{
                        status: nb.title.status,
                        candidates: nb.title.thumbs,
                        selectedId: nb.title.selectedThumbId,
                      }}
                      onChange={(d) =>
                        patch("title", {
                          ...nb.title,
                          thumbs: d.candidates,
                          selectedThumbId: d.selectedId,
                        })
                      }
                    />
                  </TabsContent>
                </Tabs>
              );
            case "voice":
              return (
                <CandidatePicker
                  description="TTS 목소리 톤 후보 3개. 원하면 직접 수정하세요."
                  placeholder="예: 차분한 남자 저음"
                  data={nb.voice}
                  onChange={(d) => patch("voice", d)}
                />
              );
            case "scene":
              return (
                <CandidatePicker
                  description="자막 · B-roll · 이미지 · 화면 흐름 구성 후보 3개."
                  placeholder={
                    "0~2초: 후킹 자막 크게\n2~10초: B-roll(도시 새벽)\n10초~: 인터뷰풍 자막"
                  }
                  data={nb.scene}
                  onChange={(d) => patch("scene", d)}
                />
              );
            case "diversity":
              return (
                <div className="space-y-4">
                  <ul className="space-y-2">
                    {nb.diversity.checks.map((c) => (
                      <li
                        key={c.id}
                        className="flex items-start gap-3 rounded-md border bg-card p-3"
                      >
                        <Checkbox
                          checked={c.checked}
                          onCheckedChange={(v) =>
                            patch("diversity", {
                              ...nb.diversity,
                              checks: nb.diversity.checks.map((x) =>
                                x.id === c.id ? { ...x, checked: !!v } : x,
                              ),
                            })
                          }
                          className="mt-0.5"
                        />
                        <span className="text-sm">{c.label}</span>
                      </li>
                    ))}
                  </ul>
                  <div>
                    <div className="text-sm font-semibold mb-1">
                      수익화 위험 메모
                    </div>
                    <Textarea
                      rows={3}
                      value={nb.diversity.monetizationNote}
                      onChange={(e) =>
                        patch("diversity", {
                          ...nb.diversity,
                          monetizationNote: e.target.value,
                        })
                      }
                      placeholder="예: 폭력적 표현/논란 주제 없음. AI 인물 1컷 등장 → 공개 표기 예정."
                    />
                  </div>
                  <div>
                    <div className="text-sm font-semibold mb-1">추가 메모</div>
                    <Textarea
                      rows={2}
                      value={nb.diversity.note}
                      onChange={(e) =>
                        patch("diversity", { ...nb.diversity, note: e.target.value })
                      }
                    />
                  </div>
                </div>
              );
            case "export":
              return <ExportView series={series} short={short} />;
          }
        })()}
      </div>

      <div className="mt-6 flex flex-wrap gap-2 justify-end">
        <Button variant="ghost" onClick={() => setStatus("todo")}>
          시작 전으로
        </Button>
        <Button variant="outline" onClick={() => setStatus("in_progress")}>
          진행 중으로
        </Button>
        <Button
          onClick={() => {
            setStatus("done");
            toast.success("이 단계를 완료했어요");
            onBack();
          }}
        >
          <CheckCircle2 className="size-4 mr-1.5" /> 완료하고 돌아가기
        </Button>
      </div>
    </div>
  );
}

// ===================== Export View =====================
function ExportView({ series, short }: { series: Series; short: Short }) {
  const { state } = useApp();
  const lines = state.contentLines.filter((c) =>
    series.contentLineIds.includes(c.id),
  );
  const nb = short.notebooks;
  const sel = (n: { candidates: { id: string; text: string }[]; selectedId: string | null }) =>
    n.candidates.find((c) => c.id === n.selectedId)?.text ?? "";

  const sections = useMemo(() => {
    const title = nb.title.titles.find((t) => t.id === nb.title.selectedTitleId)?.text ?? "";
    const thumb = nb.title.thumbs.find((t) => t.id === nb.title.selectedThumbId)?.text ?? "";
    const script = sel(nb.script);
    const subtitle = script
      .split(/[.!?]\s+|\n+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .join("\n");
    const tts = script
      .replace(/([.!?])\s+/g, "$1\n")
      .replace(/\n{2,}/g, "\n\n");
    const checked = nb.diversity.checks.filter((c) => c.checked).length;
    return [
      { label: "쇼츠 제목", value: title },
      { label: "시리즈", value: `${series.title} (${lines.map((l) => l.name).join(", ")})` },
      { label: "주제", value: sel(nb.topic) },
      { label: "후킹", value: sel(nb.hook) },
      { label: "대본 (편집용)", value: script },
      { label: "TTS용 줄바꿈 대본", value: tts },
      { label: "자막용 문장", value: subtitle },
      { label: "장면 구성", value: sel(nb.scene) },
      { label: "목소리 톤", value: sel(nb.voice) },
      { label: "제목 후보 (선택)", value: title },
      { label: "썸네일 문구", value: thumb },
      {
        label: "저작권 주의점",
        value: [
          ...lines.map((l) => `[${l.name}] ${l.copyrightCaution}`),
          nb.export.copyrightNote,
        ]
          .filter(Boolean)
          .join("\n"),
      },
      {
        label: "AI 사용 공개 필요 여부 메모",
        value: nb.export.aiDisclosureNote,
      },
      {
        label: "다양성/원본성 체크 결과",
        value: `${checked}/${nb.diversity.checks.length} 항목 체크\n메모: ${nb.diversity.note || "(없음)"}\n수익화: ${nb.diversity.monetizationNote || "(없음)"}`,
      },
      {
        label: "업로드 전 최종 점검",
        value: nb.export.uploadChecklist.length
          ? nb.export.uploadChecklist.map((x) => `- ${x}`).join("\n")
          : "(없음)",
      },
    ];
  }, [nb, series, lines]);

  const all = sections
    .map((s) => `# ${s.label}\n${s.value || "(비어 있음)"}`)
    .join("\n\n---\n\n");

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={() => {
            navigator.clipboard.writeText(all);
            toast.success("전체 패키지를 복사했어요");
          }}
        >
          <Copy className="size-4 mr-1" /> 전체 복사
        </Button>
      </div>
      <div className="grid gap-3">
        {sections.map((s) => (
          <div key={s.label} className="rounded-md border bg-card p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs font-semibold">{s.label}</div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  navigator.clipboard.writeText(s.value || "");
                  toast("복사했어요");
                }}
              >
                <Copy className="size-3.5" />
              </Button>
            </div>
            <pre className="whitespace-pre-wrap text-sm font-sans text-muted-foreground">
              {s.value || "(비어 있음)"}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
