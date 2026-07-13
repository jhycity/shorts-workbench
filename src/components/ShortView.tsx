import { useMemo, useState } from "react";
import { useApp } from "@/lib/app-context";
import type { NotebookId, Series, Short } from "@/lib/types";
import { NOTEBOOK_META, NOTEBOOK_ORDER } from "@/lib/types";
import { isLocked, nextStep, notebookProgress } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { STEP_EXAMPLES } from "@/lib/presets";
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
  const { updateShort, deleteShort, duplicateShort } = useApp();
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

  const subNb = series.subNotebooks?.find((s) => s.id === short.subNotebookId);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <button
        onClick={onBack}
        className="text-sm text-muted-foreground hover:text-foreground mb-2"
      >
        ← 노트북으로 돌아가기
      </button>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <Input
            className="text-3xl font-bold border-0 shadow-none px-0 h-auto focus-visible:ring-0 tracking-tight"
            value={short.title}
            onChange={(e) =>
              updateShort(series.id, short.id, (s) => ({ ...s, title: e.target.value }))
            }
            placeholder="쇼츠 제목"
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="outline">노트북: {series.title}</Badge>
            <div className="flex items-center gap-1">
              <Label className="text-[11px] text-muted-foreground">하위 노트북:</Label>
              <select
                className="rounded-md border bg-background px-2 py-1 text-xs"
                value={short.subNotebookId ?? ""}
                onChange={(e) =>
                  updateShort(series.id, short.id, (s) => ({
                    ...s,
                    subNotebookId: e.target.value || undefined,
                  }))
                }
              >
                <option value="">(없음)</option>
                {(series.subNotebooks ?? []).map((sb) => (
                  <option key={sb.id} value={sb.id}>
                    {sb.name}
                  </option>
                ))}
              </select>
            </div>
            <Badge variant="secondary">{series.defaultLength}</Badge>
            {short.isDraft && <Badge variant="secondary">임시 저장</Badge>}
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
            onClick={() => {
              const id = duplicateShort(series.id, short.id);
              if (id) toast.success("쇼츠를 복제했어요");
            }}
          >
            <Copy className="size-4 mr-1" /> 복제
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
            case "source":
              return <SourceView series={series} short={short} onChange={(v) => patch("source", { ...nb.source, note: v })} />;
            case "topic":
              return (
                <>
                  <ExampleBox items={STEP_EXAMPLES.topic} />
                  <CandidatePicker
                    description="이번 영상의 주제 후보 3개를 적고 하나를 고르세요."
                    placeholder="예: AI 시대에 20대가 잃지 말아야 할 한 가지"
                    data={nb.topic}
                    onChange={(d) => patch("topic", d)}
                  />
                </>
              );
            case "hook":
              return (
                <>
                  <ExampleBox items={STEP_EXAMPLES.hook} />
                  <CandidatePicker
                    description="첫 1~2초에 시청자를 잡을 후킹 문장 3개."
                    placeholder="예: '이거 모르면 1년이 사라집니다.'"
                    data={nb.hook}
                    onChange={(d) => patch("hook", d)}
                  />
                </>
              );
            case "script":
              return (
                <>
                  <ExampleBox items={STEP_EXAMPLES.script} />
                  <CandidatePicker
                    description={`${series.defaultLength} 분량 대본 후보 3개.`}
                    placeholder={"후킹 →\n본문 →\n반전/정리 →\n클로징"}
                    data={nb.script}
                    onChange={(d) => patch("script", d)}
                  />
                </>
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
            case "guide":
              return (
                <GuideEditor
                  series={series}
                  data={nb.guide}
                  onChange={(d) => patch("guide", d)}
                />
              );
            case "finalize":
              return (
                <FinalizeEditor
                  series={series}
                  short={short}
                  onChange={(d) => patch("finalize", d)}
                  onFinalComplete={() => {
                    updateShort(series.id, short.id, (s) => ({
                      ...s,
                      status: "completed",
                      notebooks: {
                        ...s.notebooks,
                        finalize: { ...s.notebooks.finalize, status: "done" },
                      },
                    }));
                    toast.success("쇼츠를 최종 완료했어요");
                    onBack();
                  }}
                />
              );
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
          <CheckCircle2 className="size-4 mr-1.5" /> 이 단계 완료
        </Button>
      </div>

    </div>
  );
}

function ExampleBox({ items }: { items: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-4 rounded-lg border bg-accent/30 text-xs">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-3 py-2 text-left font-medium"
      >
        💡 예시 보기 {open ? "▲" : "▼"}
      </button>
      {open && (
        <ul className="border-t px-3 py-2 space-y-1 text-muted-foreground">
          {items.map((i, idx) => (
            <li key={idx}>· {i}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ===================== Step 1: 재료 확인 =====================
function SourceView({
  series,
  short,
  onChange,
}: {
  series: Series;
  short: Short;
  onChange: (v: string) => void;
}) {
  const { state } = useApp();
  const subNb = series.subNotebooks?.find((s) => s.id === short.subNotebookId);
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        이 쇼츠를 만들 때 어떤 재료를 골랐는지 확인하고, 필요하면 메모를 남겨두세요.
      </p>
      <div className="grid gap-2 text-sm">
        <InfoRow label="키워드 노트북" value={series.title} />
        <InfoRow label="하위 노트북" value={subNb?.name ?? "(선택 안 함)"} />
        <InfoRow
          label="선택한 재료"
          value={
            short.materials.length === 0
              ? "(빈 상태로 시작)"
              : short.materials
                  .map((m) => materialLabel(m, state))
                  .join(" + ")
          }
        />
        <InfoRow label="기본 길이/화면" value={`${series.defaultLength} · ${series.defaultScreenStyle || "-"}`} />
      </div>
      <div>
        <Label className="text-sm">추가 메모</Label>
        <Textarea
          className="mt-1"
          rows={3}
          placeholder="이 재료들을 어떻게 조합할 계획인지 짧게 메모"
          value={short.notebooks.source.note}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

function materialLabel(
  m: Short["materials"][number],
  state: ReturnType<typeof useApp>["state"],
  series?: Series,
) {
  if (m.kind === "trend") {
    if (m.ref) {
      const t = series?.trends?.find((x) => x.id === m.ref);
      return `📰 ${t?.title ?? "트렌드"}`;
    }
    return "📥 트렌드 입력";
  }
  if (m.kind === "idea") {
    const i = state.ideas.find((x) => x.id === m.ref);
    return `💡 ${i?.title ?? "아이디어"}`;
  }
  if (m.kind === "format") {
    const f = state.formats.find((x) => x.id === m.ref);
    return `📚 ${f?.name ?? "포맷"}`;
  }
  return `✏️ ${m.note ?? "직접 입력"}`;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-3 gap-2 rounded-md border bg-card px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="col-span-2 text-sm">{value}</div>
    </div>
  );
}

// ===================== Step 6: 제작 가이드 =====================
function GuideEditor({
  series,
  data,
  onChange,
}: {
  series: Series;
  data: Short["notebooks"]["guide"];
  onChange: (d: Short["notebooks"]["guide"]) => void;
}) {
  const set = <K extends keyof typeof data>(k: K, v: (typeof data)[K]) =>
    onChange({ ...data, [k]: v });
  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted-foreground">
        노트북 기본값: 톤 <b>{series.defaultTone || "-"}</b> · 화면{" "}
        <b>{series.defaultScreenStyle || "-"}</b>
      </p>
      <Field label="TTS 톤" value={data.tts} onChange={(v) => set("tts", v)} placeholder="예: 차분한 남자 저음" />
      <Field label="자막 템포" value={data.subtitleTempo} onChange={(v) => set("subtitleTempo", v)} placeholder="예: 짧은 문장 빠르게, 강조 단어에 노란색" />
      <Field label="화면 스타일" value={data.screenStyle} onChange={(v) => set("screenStyle", v)} placeholder="예: 자막 중심 + AI 이미지 2컷" />
      <TextArea label="장면 구성" value={data.sceneComposition} onChange={(v) => set("sceneComposition", v)} placeholder="0~2초 후킹 자막 / 2~10초 B-roll / 10초~ 인터뷰풍 자막" />
      <TextArea label="B-roll / 이미지 아이디어" value={data.brollIdeas} onChange={(v) => set("brollIdeas", v)} placeholder="예: 새벽 도시, 지친 20대 실루엣, AI 로봇 손" />
      <TextArea label="편집 도구에 넣을 메모" value={data.editorNote} onChange={(v) => set("editorNote", v)} placeholder="컷 전환, 효과음, 자막 스타일 등" />
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-sm">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}
function TextArea({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-sm">{label}</Label>
      <Textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

// ===================== Step 7: 원본성/수익화 + 최종 내보내기 =====================
function FinalizeEditor({
  series,
  short,
  onChange,
  onFinalComplete,
}: {
  series: Series;
  short: Short;
  onChange: (d: Short["notebooks"]["finalize"]) => void;
  onFinalComplete: () => void;
}) {
  const data = short.notebooks.finalize;
  const set = <K extends keyof typeof data>(k: K, v: (typeof data)[K]) =>
    onChange({ ...data, [k]: v });
  const isCompleted = short.status === "completed";


  return (
    <Tabs defaultValue="check">
      <TabsList>
        <TabsTrigger value="check">원본성/수익화 체크</TabsTrigger>
        <TabsTrigger value="export">최종 내보내기</TabsTrigger>
      </TabsList>
      <TabsContent value="check" className="mt-4 space-y-4">
        <ul className="space-y-2">
          {data.checks.map((c) => (
            <li
              key={c.id}
              className="flex items-start gap-3 rounded-md border bg-card p-3"
            >
              <Checkbox
                checked={c.checked}
                onCheckedChange={(v) =>
                  set(
                    "checks",
                    data.checks.map((x) =>
                      x.id === c.id ? { ...x, checked: !!v } : x,
                    ),
                  )
                }
                className="mt-0.5"
              />
              <span className="text-sm">{c.label}</span>
            </li>
          ))}
        </ul>
        <TextArea label="저작권 위험 메모" value={data.copyrightNote} onChange={(v) => set("copyrightNote", v)} placeholder="예: 사용한 음원/이미지 출처, 위험 요소" />
        <TextArea label="AI 사용 공개 필요 여부" value={data.aiDisclosureNote} onChange={(v) => set("aiDisclosureNote", v)} placeholder="예: AI 이미지 사용 → 자막에 'AI 이미지' 표기 예정" />
        <TextArea label="팩트체크 필요 여부" value={data.factCheckNote} onChange={(v) => set("factCheckNote", v)} placeholder="예: 통계 인용 출처 확인 필요" />
        <TextArea label="내 생각/해석 요약" value={data.myTakeNote} onChange={(v) => set("myTakeNote", v)} placeholder="이 쇼츠에 내 관점이 어떻게 들어갔는지" />
      </TabsContent>
      <TabsContent value="export" className="mt-4 space-y-4">
        <div className="grid gap-3">
          <Field label="업로드용 제목" value={data.uploadTitle} onChange={(v) => set("uploadTitle", v)} />
          <TextArea label="업로드용 설명" value={data.uploadDescription} onChange={(v) => set("uploadDescription", v)} />
          <Field label="해시태그 (콤마 구분)" value={data.uploadHashtags} onChange={(v) => set("uploadHashtags", v)} placeholder="예: #20대, #AI, #쇼츠" />
        </div>
        <ExportPackage series={series} short={short} />
        <div className="mt-6 rounded-lg border-2 border-primary/40 bg-primary/5 p-4">
          <div className="text-sm font-semibold mb-1">🏁 최종 완료</div>
          <p className="text-xs text-muted-foreground mb-3">
            아래 버튼을 눌러야만 이 쇼츠가 <b>완료</b> 상태로 바뀝니다.
            완료 후에도 언제든 다시 열어 수정할 수 있어요.
          </p>
          {isCompleted ? (
            <div className="flex items-center gap-2 text-sm text-success-foreground">
              <CheckCircle2 className="size-4 text-success" /> 이미 최종 완료된 쇼츠예요.
            </div>
          ) : (
            <Button onClick={onFinalComplete} className="bg-success hover:bg-success/90">
              <CheckCircle2 className="size-4 mr-1.5" /> 최종 완료로 표시
            </Button>
          )}
        </div>
      </TabsContent>

    </Tabs>
  );
}

function ExportPackage({ series, short }: { series: Series; short: Short }) {
  const nb = short.notebooks;
  const sel = (n: {
    candidates: { id: string; text: string }[];
    selectedId: string | null;
  }) => n.candidates.find((c) => c.id === n.selectedId)?.text ?? "";

  const sections = useMemo(() => {
    const title = nb.title.titles.find((t) => t.id === nb.title.selectedTitleId)?.text ?? "";
    const thumb = nb.title.thumbs.find((t) => t.id === nb.title.selectedThumbId)?.text ?? "";
    const script = sel(nb.script);
    const subtitle = script
      .split(/[.!?]\s+|\n+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .join("\n");
    const tts = script.replace(/([.!?])\s+/g, "$1\n").replace(/\n{2,}/g, "\n\n");
    const checkedCount = nb.finalize.checks.filter((c) => c.checked).length;
    return [
      { label: "쇼츠 제목", value: title || short.title },
      { label: "노트북 / 태그", value: `${series.title}${series.tags?.length ? ` (${series.tags.join(", ")})` : ""}` },
      { label: "주제", value: sel(nb.topic) },
      { label: "후킹", value: sel(nb.hook) },
      { label: "최종 대본", value: script },
      { label: "TTS용 대본", value: tts },
      { label: "자막용 문장", value: subtitle },
      { label: "편집용 장면 구성", value: nb.guide.sceneComposition },
      { label: "B-roll/이미지 아이디어", value: nb.guide.brollIdeas },
      { label: "TTS 톤", value: nb.guide.tts },
      { label: "자막 템포", value: nb.guide.subtitleTempo },
      { label: "화면 스타일", value: nb.guide.screenStyle },
      { label: "편집 도구 메모", value: nb.guide.editorNote },
      { label: "썸네일 문구", value: thumb },
      { label: "업로드용 제목", value: nb.finalize.uploadTitle },
      { label: "업로드용 설명", value: nb.finalize.uploadDescription },
      { label: "해시태그", value: nb.finalize.uploadHashtags },
      { label: "저작권 주의점", value: nb.finalize.copyrightNote },
      { label: "AI 사용 공개 여부", value: nb.finalize.aiDisclosureNote },
      { label: "팩트체크 메모", value: nb.finalize.factCheckNote },
      { label: "내 생각/해석", value: nb.finalize.myTakeNote },
      {
        label: "원본성/수익화 체크 결과",
        value: `${checkedCount}/${nb.finalize.checks.length} 항목 체크됨`,
      },
    ];
  }, [nb, series, short.title]);

  const all = sections
    .map((s) => `# ${s.label}\n${s.value || "(비어 있음)"}`)
    .join("\n\n---\n\n");

  return (
    <div className="space-y-4 mt-4">
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
