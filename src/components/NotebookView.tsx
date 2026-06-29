import { useState } from "react";
import { useProjects } from "@/lib/projects-context";
import type { FormatItem, NotebookId, Project } from "@/lib/types";
import { NOTEBOOK_META } from "@/lib/types";
import { CONTENT_LINE_MAP } from "@/lib/presets";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CheckCircle2, Circle, Loader2, Sparkles } from "lucide-react";
import { CandidatePicker, StringList } from "./notebooks/Shared";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

interface Props {
  notebookId: NotebookId;
  onBack: () => void;
}

export function NotebookView({ notebookId, onBack }: Props) {
  const { current, updateCurrent } = useProjects();
  if (!current) return null;
  const meta = NOTEBOOK_META[notebookId];

  const setStatus = (status: "todo" | "in_progress" | "done") => {
    updateCurrent((p) => ({
      ...p,
      notebooks: {
        ...p.notebooks,
        [notebookId]: { ...p.notebooks[notebookId], status },
      } as Project["notebooks"],
    }));
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> 프로젝트로 돌아가기
      </button>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="text-3xl">{meta.icon}</div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">{meta.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{meta.subtitle}</p>
        </div>
        <StatusPill status={current.notebooks[notebookId].status} />
      </div>

      <LineHint notebookId={notebookId} />

      <Separator className="mb-6" />

      <div className="rounded-xl border bg-paper p-6 shadow-sm">
        <NotebookBody notebookId={notebookId} />
      </div>

      <div className="mt-6 flex flex-wrap gap-2 justify-end">
        <Button variant="ghost" onClick={() => setStatus("todo")}>시작 전으로</Button>
        <Button variant="outline" onClick={() => setStatus("in_progress")}>진행 중으로</Button>
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

// 콘텐츠 라인 기반 추천 박스 (각 단계별로 다른 추천 노출)
function LineHint({ notebookId }: { notebookId: NotebookId }) {
  const { current } = useProjects();
  if (!current) return null;
  const line = CONTENT_LINE_MAP[current.contentLine];

  const map: Partial<Record<NotebookId, { label: string; value: string }[]>> = {
    hook: [{ label: "추천 후킹", value: line.recHook }],
    voice: [{ label: "추천 톤", value: line.recTone }],
    scene: [{ label: "추천 화면 스타일", value: line.recScreen }],
    format: [{ label: "추천 포맷", value: line.recFormatNames.join(" · ") }],
    diversity: [{ label: "이 라인의 저작권 주의점", value: line.copyrightCaution }],
    title: [{ label: "추천 톤", value: line.recTone }],
    script: [
      { label: "추천 톤", value: line.recTone },
      { label: "추천 화면 스타일", value: line.recScreen },
    ],
  };

  const items = map[notebookId];
  if (!items) return null;

  return (
    <div className="mb-6 rounded-lg border border-primary/20 bg-accent/40 p-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
        <Sparkles className="size-3.5" /> {line.emoji} {line.name} 라인 가이드
      </div>
      <div className="mt-2 grid gap-1.5 text-sm">
        {items.map((it) => (
          <div key={it.label}>
            <span className="text-muted-foreground">{it.label}: </span>
            <span>{it.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: "todo" | "in_progress" | "done" }) {
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

function NotebookBody({ notebookId }: { notebookId: NotebookId }) {
  const { current, updateCurrent } = useProjects();
  if (!current) return null;
  const nb = current.notebooks;

  const patch = <K extends NotebookId>(id: K, data: Project["notebooks"][K]) =>
    updateCurrent((p) => ({
      ...p,
      notebooks: { ...p.notebooks, [id]: data } as Project["notebooks"],
    }));

  switch (notebookId) {
    case "trend":
      return (
        <div className="space-y-6">
          <Field label="트렌드 키워드" hint="요즘 자주 보이는 단어/주제">
            <StringList
              items={nb.trend.keywords}
              onChange={(v) => patch("trend", { ...nb.trend, keywords: v })}
              placeholder="예: AI 부업, 1인 창업"
            />
          </Field>
          <Field label="참고할 흐름" hint="콘텐츠가 어떤 방향으로 흐르고 있는지">
            <StringList
              items={nb.trend.flows}
              onChange={(v) => patch("trend", { ...nb.trend, flows: v })}
              placeholder="예: 실수담을 솔직하게 말하는 영상이 잘 됨"
            />
          </Field>
          <Field label="사람들이 관심 가질 만한 고민" hint="검색·댓글에서 자주 보이는 고민">
            <StringList
              items={nb.trend.concerns}
              onChange={(v) => patch("trend", { ...nb.trend, concerns: v })}
              placeholder="예: 20대 후반인데 모아둔 돈이 없어요"
            />
          </Field>
        </div>
      );

    case "idea":
      return (
        <div className="space-y-6">
          <Field label="떠오른 아이디어 메모" hint="다듬지 말고 그냥 적어두세요">
            <StringList
              items={nb.idea.rawIdeas}
              onChange={(v) => patch("idea", { ...nb.idea, rawIdeas: v })}
              placeholder="예: AI한테 내 일기 분석시키는 영상"
            />
          </Field>
          <Field label="이 아이디어를 새로운 포맷으로" hint="어떤 영상 구조로 만들지 한 줄 정리">
            <Textarea
              rows={4}
              value={nb.idea.shapedFormat}
              onChange={(e) => patch("idea", { ...nb.idea, shapedFormat: e.target.value })}
              placeholder="예: 내가 쓴 일기 5개 → AI가 한 줄 진단 → 마지막에 반전 멘트"
            />
          </Field>
        </div>
      );

    case "format": {
      const line = CONTENT_LINE_MAP[current.contentLine];
      const recommended = new Set(line.recFormatNames);
      return (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            이번 영상에 사용할 포맷을 하나 골라주세요. <strong>{line.name}</strong> 라인 추천 포맷에는 ⭐ 표시가 붙어요.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {nb.format.formats.map((f) => {
              const selected = nb.format.selectedFormatId === f.id;
              const isRec = recommended.has(f.name);
              return (
                <button
                  key={f.id}
                  onClick={() => patch("format", { ...nb.format, selectedFormatId: f.id })}
                  className={`text-left rounded-lg border p-4 transition ${
                    selected ? "border-primary bg-accent/60 ring-2 ring-primary/30" : "border-border hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm">{f.name}</span>
                    {isRec && (
                      <Badge className="bg-primary/15 text-primary border-primary/20" variant="outline">
                        ⭐ 추천
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2 grid gap-1 text-xs">
                    {f.structure && (
                      <div><span className="text-muted-foreground">구조: </span>{f.structure}</div>
                    )}
                    {f.suitedLines.length > 0 && (
                      <div><span className="text-muted-foreground">어울리는 라인: </span>{f.suitedLines.join(", ")}</div>
                    )}
                    {f.pros && (
                      <div><span className="text-muted-foreground">장점: </span>{f.pros}</div>
                    )}
                    {f.risks && (
                      <div className="text-warning-foreground"><span className="text-muted-foreground">반복 위험: </span>{f.risks}</div>
                    )}
                    {f.variations && (
                      <div><span className="text-muted-foreground">변주: </span>{f.variations}</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          <AddFormat />
        </div>
      );
    }

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
          description={`${current.length} 분량 대본 후보 3개. 줄바꿈을 자연스럽게 넣어주세요.`}
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
          placeholder={"0~2초: 후킹 자막 크게\n2~10초: B-roll(도시 새벽)\n10초~: 인터뷰풍 자막"}
          data={nb.scene}
          onChange={(d) => patch("scene", d)}
        />
      );

    case "diversity": {
      const avoidActive = current.avoidStyles.filter((a) => a.checked);
      return (
        <div className="space-y-5">
          <Tabs defaultValue="checks">
            <TabsList>
              <TabsTrigger value="checks">다양성 체크</TabsTrigger>
              <TabsTrigger value="avoid">피하고 싶은 스타일</TabsTrigger>
            </TabsList>

            <TabsContent value="checks" className="mt-4 space-y-2">
              <ul className="space-y-2">
                {nb.diversity.checks.map((c) => (
                  <li key={c.id} className="flex items-start gap-3 rounded-md border bg-card p-3">
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
            </TabsContent>

            <TabsContent value="avoid" className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">
                이 프로젝트가 절대 닮으면 안 되는 스타일들. (취향 설정에서 수정)
              </p>
              {avoidActive.length === 0 ? (
                <div className="text-sm text-muted-foreground">체크된 항목 없음</div>
              ) : (
                <ul className="space-y-1 text-sm">
                  {avoidActive.map((a, i) => (
                    <li key={i} className="rounded-md border bg-card px-3 py-2">🚫 {a.label}</li>
                  ))}
                </ul>
              )}
            </TabsContent>
          </Tabs>

          <Field label="메모" hint="추가로 점검한 내용을 적어두세요">
            <Textarea
              rows={3}
              value={nb.diversity.note}
              onChange={(e) => patch("diversity", { ...nb.diversity, note: e.target.value })}
              placeholder="예: 음악 소스는 Pixabay 무료 BGM 사용. AI 생성 인물 1컷 등장 → 설명란 표기 예정."
            />
          </Field>
        </div>
      );
    }

    case "export":
      return <ExportView />;
  }
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div>
        <div className="text-sm font-semibold">{label}</div>
        {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
      </div>
      {children}
    </div>
  );
}

function AddFormat() {
  const { current, updateCurrent } = useProjects();
  if (!current) return null;
  return (
    <details className="rounded-md border bg-muted/30 p-3 text-sm">
      <summary className="cursor-pointer text-muted-foreground">+ 새 포맷 추가</summary>
      <FormatAdder
        onAdd={(item) =>
          updateCurrent((p) => ({
            ...p,
            notebooks: {
              ...p.notebooks,
              format: {
                ...p.notebooks.format,
                formats: [
                  ...p.notebooks.format.formats,
                  { id: Math.random().toString(36).slice(2, 9), ...item },
                ],
              },
            },
          }))
        }
      />
    </details>
  );
}

function FormatAdder({ onAdd }: { onAdd: (f: Omit<FormatItem, "id">) => void }) {
  const [name, setName] = useState("");
  const [structure, setStructure] = useState("");
  const [pros, setPros] = useState("");
  const [risks, setRisks] = useState("");
  const [variations, setVariations] = useState("");
  return (
    <div className="mt-3 grid gap-2">
      <Input placeholder="포맷 이름" value={name} onChange={(e) => setName(e.target.value)} />
      <Input placeholder="구조" value={structure} onChange={(e) => setStructure(e.target.value)} />
      <Input placeholder="장점" value={pros} onChange={(e) => setPros(e.target.value)} />
      <Input placeholder="반복 위험" value={risks} onChange={(e) => setRisks(e.target.value)} />
      <Input placeholder="변주 아이디어" value={variations} onChange={(e) => setVariations(e.target.value)} />
      <Button
        size="sm"
        disabled={!name.trim()}
        onClick={() => {
          onAdd({
            name: name.trim(),
            structure: structure.trim(),
            suitedLines: [],
            pros: pros.trim(),
            risks: risks.trim(),
            variations: variations.trim(),
          });
          setName(""); setStructure(""); setPros(""); setRisks(""); setVariations("");
        }}
      >
        추가
      </Button>
    </div>
  );
}

function ExportView() {
  const { current, updateCurrent } = useProjects();
  if (!current) return null;
  const nb = current.notebooks;
  const line = CONTENT_LINE_MAP[current.contentLine];

  const pick = (cands: { id: string; text: string }[], selected: string | null) =>
    cands.find((c) => c.id === selected)?.text || "(미선택)";

  const fmtObj = nb.format.formats.find((f) => f.id === nb.format.selectedFormatId);
  const fmt = fmtObj?.name || "(미선택)";
  const topic = pick(nb.topic.candidates, nb.topic.selectedId);
  const hook = pick(nb.hook.candidates, nb.hook.selectedId);
  const script = pick(nb.script.candidates, nb.script.selectedId);
  const title = pick(nb.title.titles, nb.title.selectedTitleId);
  const thumb = pick(nb.title.thumbs, nb.title.selectedThumbId);
  const voice = pick(nb.voice.candidates, nb.voice.selectedId);
  const scene = pick(nb.scene.candidates, nb.scene.selectedId);

  // TTS용: 문장 단위 줄바꿈
  const ttsScript = script.replace(/([.!?。！？])\s*/g, "$1\n");
  // 자막용: 짧은 문장 단위 (TTS와 거의 동일하지만 빈 줄 제거 + 5어절 기준 컷)
  const subtitleLines = ttsScript
    .split(/\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .join("\n");

  const avoidActive = current.avoidStyles.filter((a) => a.checked).map((a) => a.label);
  const preferActive = current.preferredTones.filter((a) => a.checked).map((a) => a.label);

  const diversityResult = `${nb.diversity.checks.filter((c) => c.checked).length} / ${nb.diversity.checks.length} 항목 확인됨\n${nb.diversity.note ? `메모: ${nb.diversity.note}` : ""}`;

  const finalChecklist = [
    "썸네일/제목이 허위 과장이 아닌지 마지막 확인",
    "BGM/이미지 저작권 표기 또는 라이선스 확인",
    "AI 생성 장면이라면 설명/캡션에 표기 검토",
    "자막 오타 확인",
    "‘피하고 싶은 스타일’ 항목과 닮지 않았는지 한 번 더 비교",
    "업로드 시간대 결정 (플랫폼 알고리즘 고려)",
  ];

  const items: { label: string; value: string }[] = [
    { label: "최종 콘텐츠 라인", value: `${line.emoji} ${line.name} — ${line.description}` },
    { label: "선택한 포맷", value: fmtObj ? `${fmt}\n구조: ${fmtObj.structure}\n반복 위험: ${fmtObj.risks}` : fmt },
    { label: "최종 주제", value: topic },
    { label: "최종 후킹", value: hook },
    { label: "최종 대본", value: script },
    { label: "TTS용 대본 (문장별 줄바꿈)", value: ttsScript },
    { label: "자막용 문장", value: subtitleLines },
    { label: "장면 구성", value: scene },
    { label: "목소리 톤", value: voice },
    { label: "제목 후보 (최종)", value: title },
    { label: "썸네일 문구", value: thumb },
    { label: "저작권 주의점", value: `${line.copyrightCaution}${nb.export.copyrightNote ? `\n메모: ${nb.export.copyrightNote}` : ""}` },
    { label: "AI 사용 공개 필요 여부 메모", value: nb.export.aiDisclosureNote || "(메모 없음)" },
    { label: "다양성/원본성 체크 결과", value: diversityResult },
    { label: "피하고 싶은 스타일 (이번 영상 기준)", value: avoidActive.length ? avoidActive.map((s) => `- ${s}`).join("\n") : "(없음)" },
    { label: "내가 선호하는 영상 톤", value: preferActive.length ? preferActive.map((s) => `- ${s}`).join("\n") : "(없음)" },
    { label: "업로드 전 최종 점검", value: finalChecklist.map((c) => `- [ ] ${c}`).join("\n") },
  ];

  const meta = `프로젝트: ${current.title}
콘텐츠 라인: ${line.name}
플랫폼: ${current.platform} / 길이: ${current.length} / 카테고리: ${current.category}
제작 루트: ${current.route === "trend" ? "트렌드 기반" : "내 아이디어 기반"}
목표: ${current.goal}`;

  const fullText = `# 🎬 쇼츠 최종 패키지

${meta}

${items.map((it) => `## ${it.label}\n${it.value}\n`).join("\n")}
`;

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} 복사됨`);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md bg-muted/50 p-3 text-xs whitespace-pre-wrap font-mono">
        {meta}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="저작권 메모 (영상 고유)" hint="이번 영상에만 적용되는 내용">
          <Textarea
            rows={3}
            value={nb.export.copyrightNote ?? ""}
            onChange={(e) =>
              updateCurrent((p) => ({
                ...p,
                notebooks: {
                  ...p.notebooks,
                  export: { ...p.notebooks.export, copyrightNote: e.target.value },
                },
              }))
            }
            placeholder="예: BGM은 Pixabay ‘calm-piano’ 사용"
          />
        </Field>
        <Field label="AI 사용 공개 필요 여부 메모" hint="실사형 AI 이미지 등">
          <Textarea
            rows={3}
            value={nb.export.aiDisclosureNote ?? ""}
            onChange={(e) =>
              updateCurrent((p) => ({
                ...p,
                notebooks: {
                  ...p.notebooks,
                  export: { ...p.notebooks.export, aiDisclosureNote: e.target.value },
                },
              }))
            }
            placeholder="예: 인물 1컷 AI 생성 → 캡션에 ‘AI 생성’ 표기"
          />
        </Field>
      </div>

      {items.map((it) => (
        <div key={it.label} className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold">{it.label}</div>
            <Button size="sm" variant="outline" onClick={() => copy(it.value, it.label)}>
              복사
            </Button>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-foreground/90">{it.value}</pre>
        </div>
      ))}

      <div className="sticky bottom-4 flex justify-end">
        <Button size="lg" onClick={() => copy(fullText, "전체 패키지")}>
          📦 전체 복사하기
        </Button>
      </div>
    </div>
  );
}
