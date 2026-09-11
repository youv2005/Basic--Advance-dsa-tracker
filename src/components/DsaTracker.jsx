import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Settings, AlertTriangle, X } from "lucide-react";
import { LEVELS, CATEGORIES } from "../data/roadmap";
import { PROBLEMS as datasetProblems } from "../data/dataset/index.js";
import DashboardStats from "./DashboardStats";
import GlobalFilters from "./GlobalFilters";
import LevelSection from "./LevelSection";
import DataSettings from "./DataSettings";
import { groupByLevelAndCategory, getUniquePatterns, toggleSetItem, computeStats } from "../utils/trackerUtils";
import { mergeProblemSets } from "../utils/dataValidation";
import { DEFAULT_FILTERS, buildSearchIndex, filterProblems, isFiltersActive, clearFilterKey } from "../utils/filterUtils";
import { FOCUS_RING, FOCUS_RING_ON_SURFACE } from "../utils/uiConstants";
import {
  loadProblems,
  saveProblems,
  loadIdSet,
  saveIdSet,
  loadNotes,
  saveNotes,
  loadCompletedAt,
  saveCompletedAt,
  clearProgressStorage,
  isStorageAvailable,
  STORAGE_KEYS,
} from "../utils/storage";

export default function DsaTracker() {
  // Phase 2: dataset + progress are seeded from localStorage on first
  // render (lazy initializer, so this only runs once), falling back
  // to the bundled starter set the very first time the app is opened.
  const [problems, setProblems] = useState(() => loadProblems(datasetProblems));
  const [completedIds, setCompletedIds] = useState(() => loadIdSet(STORAGE_KEYS.COMPLETED));
  const [starredIds, setStarredIds] = useState(() => loadIdSet(STORAGE_KEYS.STARRED));
  const [notesText, setNotesText] = useState(() => loadNotes());
  // Phase 4: when each currently-completed problem was marked done,
  // so the dashboard can show a real "solved today" count.
  const [completedAt, setCompletedAt] = useState(() => loadCompletedAt());

  const [expandedLevelIds, setExpandedLevelIds] = useState(() => new Set([LEVELS[0].id]));
  const [expandedCategoryIds, setExpandedCategoryIds] = useState(() => new Set());
  const [expandedNotesIds, setExpandedNotesIds] = useState(() => new Set());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [dismissedStorageWarning, setDismissedStorageWarning] = useState(false);
  const settingsButtonRef = useRef(null);

  // Checked once — this doesn't change during a session — rather than
  // re-probing localStorage on every render.
  const storageAvailable = useMemo(() => isStorageAvailable(), []);

  // Phase 3: all filter dimensions live in one object so every
  // filter can combine with every other one (see filterUtils.js).
  const [filters, setFilters] = useState(() => DEFAULT_FILTERS);

  // Persist on every change. Fine at this dataset size; if it grows
  // into the thousands this write can be debounced later without
  // touching any of the state shape above it.
  useEffect(() => { saveProblems(problems); }, [problems]);
  useEffect(() => { saveIdSet(STORAGE_KEYS.COMPLETED, completedIds); }, [completedIds]);
  useEffect(() => { saveIdSet(STORAGE_KEYS.STARRED, starredIds); }, [starredIds]);
  useEffect(() => { saveNotes(notesText); }, [notesText]);
  useEffect(() => { saveCompletedAt(completedAt); }, [completedAt]);

  const sortedLevels = useMemo(() => [...LEVELS].sort((a, b) => a.order - b.order), []);

  // Precompute once per dataset change — not on every filter/keystroke.
  const searchIndex = useMemo(() => buildSearchIndex(problems), [problems]);
  const availablePatterns = useMemo(() => getUniquePatterns(problems), [problems]);

  // The one place the dataset is actually scanned for filtering.
  // Recomputed only when something that affects the result changes.
  const filteredProblems = useMemo(
    () => filterProblems(problems, filters, completedIds, starredIds, searchIndex),
    [problems, filters, completedIds, starredIds, searchIndex]
  );
  const activeFiltersOn = useMemo(() => isFiltersActive(filters), [filters]);

  // Grouped once from the filtered set — every level/category section
  // below reads from this instead of re-filtering the full dataset.
  const grouped = useMemo(
    () => groupByLevelAndCategory(filteredProblems, LEVELS, CATEGORIES),
    [filteredProblems]
  );

  // Reading current state at call time (not inside the setCompletedIds
  // updater) avoids the double-invocation-in-StrictMode footgun that
  // comes from nesting one setState call inside another's updater.
  const toggleComplete = useCallback(
    (id) => {
      const willComplete = !completedIds.has(id);
      setCompletedIds((prev) => toggleSetItem(prev, id));
      setCompletedAt((prev) => {
        if (willComplete) return { ...prev, [id]: new Date().toISOString() };
        const { [id]: _removed, ...rest } = prev;
        return rest;
      });
    },
    [completedIds]
  );

  const toggleStar = useCallback((id) => setStarredIds((s) => toggleSetItem(s, id)), []);
  const toggleLevel = useCallback((id) => setExpandedLevelIds((s) => toggleSetItem(s, id)), []);
  const toggleCategory = useCallback((id) => setExpandedCategoryIds((s) => toggleSetItem(s, id)), []);
  const toggleNotes = useCallback((id) => setExpandedNotesIds((s) => toggleSetItem(s, id)), []);
  const handleNotesChange = useCallback(
    (id, value) => setNotesText((prev) => ({ ...prev, [id]: value })),
    []
  );

  // revisionLevel is a field on the problem itself (per the schema),
  // not a separate id set — toggling it updates the dataset, which
  // already persists via the saveProblems effect above.
  const toggleRevision = useCallback((id) => {
    setProblems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, revisionLevel: Number(p.revisionLevel) > 0 ? 0 : 1 } : p))
    );
  }, []);

  const handleClearAllFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);
  const handleClearFilterKey = useCallback(
    (key) => setFilters((prev) => clearFilterKey(prev, key)),
    []
  );

  // Dataset now lives entirely in state, driven by user action
  // (starter set, merge, replace, or backup restore) rather than a
  // fixed import — levels/categories/counts/progress all recompute
  // from `problems` via the memoized values above, automatically.
  const handleMergeProblems = useCallback(
    (incoming, options) => {
      const result = mergeProblemSets(problems, incoming, options);
      setProblems(result.merged);
      return result;
    },
    [problems]
  );

  const handleReplaceProblems = useCallback((incoming) => setProblems(incoming), []);

  const handleRestoreBackup = useCallback(({ problems: newProblems, completed, starred, notes, completedAt: restoredCompletedAt }) => {
    setProblems(newProblems);
    setCompletedIds(new Set(completed));
    setStarredIds(new Set(starred));
    setNotesText(notes);
    setCompletedAt(restoredCompletedAt && typeof restoredCompletedAt === "object" ? restoredCompletedAt : {});
  }, []);

  const handleClearProgress = useCallback(() => {
    setCompletedIds(new Set());
    setStarredIds(new Set());
    setNotesText({});
    setCompletedAt({});
    clearProgressStorage();
  }, []);

  const isDatasetEmpty = problems.length === 0;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6">
      {!storageAvailable && !dismissedStorageWarning && (
        <div
          role="alert"
          className="flex items-start gap-3 bg-hard/10 border border-hard/30 rounded-xl px-4 py-3 text-sm text-hard"
        >
          <AlertTriangle size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
          <p className="flex-1">
            Your browser is blocking local storage (private browsing, or storage disabled). Progress will work during
            this visit but won't be saved after you leave.
          </p>
          <button
            onClick={() => setDismissedStorageWarning(true)}
            aria-label="Dismiss warning"
            className={`shrink-0 rounded ${FOCUS_RING}`}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}

      <header className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">DSA Master</h1>
          <p className="text-sm text-text-muted font-mono">Beginner → Advanced · {problems.length} problems</p>
        </div>
        <button
          ref={settingsButtonRef}
          onClick={() => setIsSettingsOpen(true)}
          className={`flex items-center gap-2 text-sm font-medium border border-border hover:bg-surface-hover rounded-lg px-3 py-1.5 transition-colors self-start sm:self-auto ${FOCUS_RING}`}
        >
          <Settings size={14} aria-hidden="true" /> Data Settings
        </button>
      </header>

      {isDatasetEmpty ? (
        <div className="bg-surface border border-border rounded-2xl p-10 flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-text-muted">Your tracker is empty — import a dataset to get started.</p>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className={`text-sm font-medium bg-accent text-bg rounded-lg px-4 py-2 hover:opacity-90 transition-opacity ${FOCUS_RING_ON_SURFACE}`}
          >
            Open Data Settings
          </button>
        </div>
      ) : (
        <>
          {/* Dashboard always reflects the full dataset, regardless of
              filters — it's "overall progress", not "filtered progress". */}
          <DashboardStats problems={problems} completedIds={completedIds} starredIds={starredIds} completedAt={completedAt} />

          <GlobalFilters
            filters={filters}
            onChange={setFilters}
            onClearAll={handleClearAllFilters}
            onClearKey={handleClearFilterKey}
            patterns={availablePatterns}
            resultCount={filteredProblems.length}
            totalCount={problems.length}
          />

          <div className="flex flex-col gap-4">
            {sortedLevels.map((level) => {
              const levelCategories = CATEGORIES.filter((c) => c.level === level.id).sort(
                (a, b) => a.order - b.order
              );
              const visibleCategories = activeFiltersOn
                ? levelCategories.filter((c) => (grouped[level.id]?.[c.id] || []).length > 0)
                : levelCategories;

              if (activeFiltersOn) {
                const levelTotal = computeStats(
                  levelCategories.flatMap((c) => grouped[level.id]?.[c.id] || []),
                  completedIds
                ).total;
                if (levelTotal === 0) return null;
              }

              return (
                <LevelSection
                  key={level.id}
                  level={level}
                  totalLevels={sortedLevels.length}
                  categories={visibleCategories}
                  problemsByCategory={grouped[level.id] || {}}
                  completedIds={completedIds}
                  starredIds={starredIds}
                  isExpanded={activeFiltersOn ? true : expandedLevelIds.has(level.id)}
                  onToggleLevel={toggleLevel}
                  expandedCategoryIds={activeFiltersOn ? new Set(visibleCategories.map((c) => c.id)) : expandedCategoryIds}
                  onToggleCategory={toggleCategory}
                  expandedNotesIds={expandedNotesIds}
                  onToggleNotes={toggleNotes}
                  notesText={notesText}
                  onNotesChange={handleNotesChange}
                  onToggleComplete={toggleComplete}
                  onToggleStar={toggleStar}
                  onToggleRevision={toggleRevision}
                />
              );
            })}

            {activeFiltersOn && filteredProblems.length === 0 && (
              <div className="bg-surface border border-border rounded-2xl p-8 flex flex-col items-center gap-3 text-center">
                <p className="text-sm text-text-muted">No problems match your filters.</p>
                <button
                  onClick={handleClearAllFilters}
                  className={`text-sm font-medium text-accent hover:underline rounded ${FOCUS_RING_ON_SURFACE}`}
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </>
      )}

      <DataSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        triggerRef={settingsButtonRef}
        problems={problems}
        completedIds={completedIds}
        starredIds={starredIds}
        notesText={notesText}
        completedAt={completedAt}
        onMergeProblems={handleMergeProblems}
        onReplaceProblems={handleReplaceProblems}
        onRestoreBackup={handleRestoreBackup}
        onClearProgress={handleClearProgress}
      />
    </main>
  );
}
