import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  AppState,
  ContentLine,
  Format,
  Idea,
  Series,
  Short,
  SubNotebook,
} from "./types";
import {
  detectImport,
  exportBackup,
  importBackup,
  loadAppState,
  saveAppState,
  syncShortDerived,
  type ImportedPayload,
} from "./store";
import { uid } from "./presets";


export type SaveStatus = "idle" | "saving" | "saved";

interface Ctx {
  state: AppState;
  saveStatus: SaveStatus;
  lastSavedAt: number;
  setState: (updater: (s: AppState) => AppState) => void;
  saveNow: () => void;
  exportJson: () => string;
  exportPartial: (data: unknown) => string;
  importJson: (json: string) => void;
  detectImportFile: (json: string) => ImportedPayload;
  applyImport: (
    payload: ImportedPayload,
    opts: { mode: "replace" | "merge" | "copy" | "overwrite" },
  ) => { series: number; sub: number; shorts: number; ideas: number; formats: number };


  addSeries: (s: Series) => void;
  updateSeries: (id: string, updater: (s: Series) => Series) => void;
  deleteSeries: (id: string) => void;

  addSubNotebook: (seriesId: string, sub: SubNotebook) => void;
  updateSubNotebook: (
    seriesId: string,
    subId: string,
    patch: Partial<SubNotebook>,
  ) => void;
  deleteSubNotebook: (seriesId: string, subId: string) => void;

  addShort: (s: Short) => void;
  duplicateShort: (seriesId: string, shortId: string) => string | null;
  updateShort: (
    seriesId: string,
    shortId: string,
    updater: (s: Short) => Short,
  ) => void;
  deleteShort: (seriesId: string, shortId: string) => void;

  addContentLine: (c: Omit<ContentLine, "id">) => void;
  updateContentLine: (id: string, patch: Partial<ContentLine>) => void;
  deleteContentLine: (id: string) => void;

  addIdea: (i: Omit<Idea, "id" | "createdAt">) => void;
  updateIdea: (id: string, patch: Partial<Idea>) => void;
  deleteIdea: (id: string) => void;

  addFormat: (f: Omit<Format, "id">) => void;
  updateFormat: (id: string, patch: Partial<Format>) => void;
  deleteFormat: (id: string) => void;
}

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setStateInternal] = useState<AppState>(() => loadAppState());
  const [hydrated, setHydrated] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    setStateInternal(loadAppState());
    setHydrated(true);
  }, []);

  const persist = useCallback((next: AppState) => {
    setSaveStatus("saving");
    const stamped = { ...next, lastSavedAt: Date.now() };
    saveAppState(stamped);
    setStateInternal(stamped);
    setSaveStatus("saved");
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    setSaveStatus("saving");
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      const stamped = { ...state, lastSavedAt: Date.now() };
      saveAppState(stamped);
      setStateInternal((cur) =>
        cur === state ? stamped : { ...cur, lastSavedAt: stamped.lastSavedAt },
      );
      setSaveStatus("saved");
    }, 600);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, hydrated]);

  const setState = useCallback(
    (updater: (s: AppState) => AppState) =>
      setStateInternal((cur) => updater(cur)),
    [],
  );

  const value: Ctx = useMemo(
    () => ({
      state,
      saveStatus,
      lastSavedAt: state.lastSavedAt,
      setState,
      saveNow: () => persist(state),
      exportJson: () => exportBackup(state),
      exportPartial: (data) => JSON.stringify(data, null, 2),
      importJson: (json) => persist(importBackup(json)),

      addSeries: (s) =>
        setState((st) => ({ ...st, series: [s, ...st.series] })),
      updateSeries: (id, updater) =>
        setState((st) => ({
          ...st,
          series: st.series.map((se) =>
            se.id === id ? { ...updater(se), updatedAt: Date.now() } : se,
          ),
        })),
      deleteSeries: (id) =>
        setState((st) => ({
          ...st,
          series: st.series.filter((se) => se.id !== id),
        })),

      addSubNotebook: (seriesId, sub) =>
        setState((st) => ({
          ...st,
          series: st.series.map((se) =>
            se.id === seriesId
              ? {
                  ...se,
                  subNotebooks: [...(se.subNotebooks ?? []), sub],
                  updatedAt: Date.now(),
                }
              : se,
          ),
        })),
      updateSubNotebook: (seriesId, subId, patch) =>
        setState((st) => ({
          ...st,
          series: st.series.map((se) =>
            se.id === seriesId
              ? {
                  ...se,
                  subNotebooks: (se.subNotebooks ?? []).map((sb) =>
                    sb.id === subId ? { ...sb, ...patch } : sb,
                  ),
                }
              : se,
          ),
        })),
      deleteSubNotebook: (seriesId, subId) =>
        setState((st) => ({
          ...st,
          series: st.series.map((se) =>
            se.id === seriesId
              ? {
                  ...se,
                  subNotebooks: (se.subNotebooks ?? []).filter(
                    (sb) => sb.id !== subId,
                  ),
                  shorts: se.shorts.map((sh) =>
                    sh.subNotebookId === subId
                      ? { ...sh, subNotebookId: undefined }
                      : sh,
                  ),
                }
              : se,
          ),
        })),

      addShort: (sh) =>
        setState((st) => ({
          ...st,
          series: st.series.map((se) =>
            se.id === sh.seriesId
              ? {
                  ...se,
                  shorts: [sh, ...se.shorts],
                  updatedAt: Date.now(),
                }
              : se,
          ),
        })),
      duplicateShort: (seriesId, shortId) => {
        const se = state.series.find((x) => x.id === seriesId);
        const src = se?.shorts.find((x) => x.id === shortId);
        if (!src) return null;
        const now = Date.now();
        const copy: Short = {
          ...JSON.parse(JSON.stringify(src)),
          id: uid(),
          title: `${src.title} (사본)`,
          isDraft: true,
          createdAt: now,
          updatedAt: now,
        };
        setState((st) => ({
          ...st,
          series: st.series.map((s) =>
            s.id === seriesId
              ? { ...s, shorts: [copy, ...s.shorts], updatedAt: now }
              : s,
          ),
        }));
        return copy.id;
      },
      updateShort: (seriesId, shortId, updater) =>
        setState((st) => ({
          ...st,
          series: st.series.map((se) =>
            se.id === seriesId
              ? {
                  ...se,
                  shorts: se.shorts.map((sh) =>
                    sh.id === shortId
                      ? { ...updater(sh), updatedAt: Date.now() }
                      : sh,
                  ),
                  updatedAt: Date.now(),
                }
              : se,
          ),
        })),
      deleteShort: (seriesId, shortId) =>
        setState((st) => ({
          ...st,
          series: st.series.map((se) =>
            se.id === seriesId
              ? { ...se, shorts: se.shorts.filter((sh) => sh.id !== shortId) }
              : se,
          ),
        })),

      addContentLine: (c) =>
        setState((st) => ({
          ...st,
          contentLines: [
            ...st.contentLines,
            { id: uid(), isCustom: true, ...c },
          ],
        })),
      updateContentLine: (id, patch) =>
        setState((st) => ({
          ...st,
          contentLines: st.contentLines.map((c) =>
            c.id === id ? { ...c, ...patch } : c,
          ),
        })),
      deleteContentLine: (id) =>
        setState((st) => ({
          ...st,
          contentLines: st.contentLines.filter((c) => c.id !== id),
          series: st.series.map((se) => ({
            ...se,
            contentLineIds: (se.contentLineIds ?? []).filter((x) => x !== id),
          })),
          formats: st.formats.map((f) => ({
            ...f,
            contentLineIds: f.contentLineIds.filter((x) => x !== id),
          })),
          ideas: st.ideas.map((i) => ({
            ...i,
            contentLineIds: i.contentLineIds.filter((x) => x !== id),
          })),
        })),

      addIdea: (i) =>
        setState((st) => ({
          ...st,
          ideas: [{ id: uid(), createdAt: Date.now(), ...i }, ...st.ideas],
        })),
      updateIdea: (id, patch) =>
        setState((st) => ({
          ...st,
          ideas: st.ideas.map((i) => (i.id === id ? { ...i, ...patch } : i)),
        })),
      deleteIdea: (id) =>
        setState((st) => ({
          ...st,
          ideas: st.ideas.filter((i) => i.id !== id),
        })),

      addFormat: (f) =>
        setState((st) => ({
          ...st,
          formats: [...st.formats, { id: uid(), isCustom: true, ...f }],
        })),
      updateFormat: (id, patch) =>
        setState((st) => ({
          ...st,
          formats: st.formats.map((f) =>
            f.id === id ? { ...f, ...patch } : f,
          ),
        })),
      deleteFormat: (id) =>
        setState((st) => ({
          ...st,
          formats: st.formats.filter((f) => f.id !== id),
        })),
    }),
    [state, saveStatus, setState, persist],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("AppProvider missing");
  return ctx;
}
