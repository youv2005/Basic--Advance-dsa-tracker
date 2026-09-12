import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Settings, AlertTriangle, X } from "lucide-react";
import { LEVELS, CATEGORIES } from "../data/roadmap";
import { PROBLEMS as datasetProblems } from "../data/dataset/index.js";
import DashboardStats from "./DashboardStats";
import GlobalFilters from "./GlobalFilters";
import LevelSection from "./LevelSection";
import DataSettings from "./DataSettings";
import ProfileMenu from "./ProfileMenu";


import {
  groupByLevelAndCategory,
  getUniquePatterns,
  toggleSetItem,
  computeStats,
} from "../utils/trackerUtils";

import { mergeProblemSets } from "../utils/dataValidation";

import {
  DEFAULT_FILTERS,
  buildSearchIndex,
  filterProblems,
  isFiltersActive,
  clearFilterKey,
} from "../utils/filterUtils";

import {
  FOCUS_RING,
  FOCUS_RING_ON_SURFACE,
} from "../utils/uiConstants";

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

import {
  createProgressSnapshot,
  restoreProgressSnapshot,
} from "../utils/progressSnapshot";

import {
  loadCloudProgress,
  saveCloudProgress,
} from "../utils/progressSync";


export default function DsaTracker({ session }) {

  // ---------------------------------------------------------
  // AUTH / USER
  // ---------------------------------------------------------

  const userId = session?.user?.id || null;

  const [cloudLoading, setCloudLoading] = useState(Boolean(userId));
  const [syncStatus, setSyncStatus] = useState("idle");


  // ---------------------------------------------------------
  // LOCAL STATE
  // ---------------------------------------------------------

  const [problems, setProblems] = useState(() =>
    loadProblems(datasetProblems, userId)
  );

  const [completedIds, setCompletedIds] = useState(() =>
    loadIdSet(STORAGE_KEYS.COMPLETED, userId)
  );

  const [starredIds, setStarredIds] = useState(() =>
    loadIdSet(STORAGE_KEYS.STARRED, userId)
  );

  const [notesText, setNotesText] = useState(() =>
    loadNotes(userId)
  );

  const [completedAt, setCompletedAt] = useState(() =>
    loadCompletedAt(userId)
  );


  // ---------------------------------------------------------
  // UI STATE
  // ---------------------------------------------------------

  const [expandedLevelIds, setExpandedLevelIds] = useState(
    () => new Set([LEVELS[0].id])
  );

  const [expandedCategoryIds, setExpandedCategoryIds] = useState(
    () => new Set()
  );

  const [expandedNotesIds, setExpandedNotesIds] = useState(
    () => new Set()
  );

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [dismissedStorageWarning, setDismissedStorageWarning] =
    useState(false);

  const settingsButtonRef = useRef(null);


  // ---------------------------------------------------------
  // STORAGE CHECK
  // ---------------------------------------------------------

  const storageAvailable = useMemo(
    () => isStorageAvailable(),
    []
  );


  // ---------------------------------------------------------
  // FILTERS
  // ---------------------------------------------------------

  const [filters, setFilters] = useState(
    () => DEFAULT_FILTERS
  );


  // ---------------------------------------------------------
  // CLOUD LOAD
  // ---------------------------------------------------------

  useEffect(() => {

    if (!userId) {
      setCloudLoading(false);
      setSyncStatus("local");
      return undefined;
    }

    let cancelled = false;

    async function loadUserProgress() {

      try {

        setCloudLoading(true);
        setSyncStatus("loading");

        const snapshot =
          await loadCloudProgress(userId);

        if (cancelled) return;

        if (snapshot) {

          const restored =
            restoreProgressSnapshot(
              snapshot,
              datasetProblems
            );

          if (restored) {

            setProblems(restored.problems);

            setCompletedIds(
              restored.completedIds
            );

            setStarredIds(
              restored.starredIds
            );

            setNotesText(
              restored.notesText
            );

            setCompletedAt(
              restored.completedAt
            );
          }
        }

        setSyncStatus("synced");

      } catch (error) {

        console.error(
          "Cloud progress load failed:",
          error
        );

        setSyncStatus("error");

      } finally {

        if (!cancelled) {
          setCloudLoading(false);
        }

      }
    }

    loadUserProgress();

    return () => {
      cancelled = true;
    };

  }, [userId]);


  // ---------------------------------------------------------
  // LOCAL STORAGE SAVE
  // ---------------------------------------------------------

  useEffect(() => {
    saveProblems(problems, userId);
  }, [problems, userId]);


  useEffect(() => {
    saveIdSet(
      STORAGE_KEYS.COMPLETED,
      completedIds,
      userId
    );
  }, [completedIds, userId]);


  useEffect(() => {
    saveIdSet(
      STORAGE_KEYS.STARRED,
      starredIds,
      userId
    );
  }, [starredIds, userId]);


  useEffect(() => {
    saveNotes(notesText, userId);
  }, [notesText, userId]);


  useEffect(() => {
    saveCompletedAt(
      completedAt,
      userId
    );
  }, [completedAt, userId]);


  // ---------------------------------------------------------
  // CLOUD SAVE
  // ---------------------------------------------------------

  useEffect(() => {

    if (
      !userId ||
      cloudLoading ||
      syncStatus !== "synced"
    ) {
      return;
    }

    const snapshot =
      createProgressSnapshot({
        problems,
        completedIds,
        starredIds,
        notesText,
        completedAt,
      });

    saveCloudProgress(
      userId,
      snapshot
    ).catch((error) => {

      console.error(
        "Cloud progress save failed:",
        error
      );

      setSyncStatus("error");

    });

  }, [
    userId,
    cloudLoading,
    syncStatus,
    problems,
    completedIds,
    starredIds,
    notesText,
    completedAt,
  ]);


  // ---------------------------------------------------------
  // SORTED LEVELS
  // ---------------------------------------------------------

  const sortedLevels = useMemo(
    () =>
      [...LEVELS].sort(
        (a, b) => a.order - b.order
      ),
    []
  );


  // ---------------------------------------------------------
  // SEARCH / FILTER DATA
  // ---------------------------------------------------------

  const searchIndex = useMemo(
    () => buildSearchIndex(problems),
    [problems]
  );

  const availablePatterns = useMemo(
    () => getUniquePatterns(problems),
    [problems]
  );

  const filteredProblems = useMemo(
    () =>
      filterProblems(
        problems,
        filters,
        completedIds,
        starredIds,
        searchIndex
      ),
    [
      problems,
      filters,
      completedIds,
      starredIds,
      searchIndex,
    ]
  );

  const activeFiltersOn = useMemo(
    () => isFiltersActive(filters),
    [filters]
  );


  // ---------------------------------------------------------
  // GROUP PROBLEMS
  // ---------------------------------------------------------

  const grouped = useMemo(
    () =>
      groupByLevelAndCategory(
        filteredProblems,
        LEVELS,
        CATEGORIES
      ),
    [filteredProblems]
  );


  // ---------------------------------------------------------
  // COMPLETE PROBLEM
  // ---------------------------------------------------------

  const toggleComplete = useCallback(
    (id) => {

      const willComplete =
        !completedIds.has(id);

      setCompletedIds(
        (prev) =>
          toggleSetItem(prev, id)
      );

      setCompletedAt((prev) => {

        if (willComplete) {

          return {
            ...prev,
            [id]:
              new Date().toISOString(),
          };
        }

        const {
          [id]: _removed,
          ...rest
        } = prev;

        return rest;
      });

    },
    [completedIds]
  );


  // ---------------------------------------------------------
  // STAR
  // ---------------------------------------------------------

  const toggleStar = useCallback(
    (id) =>
      setStarredIds(
        (prev) =>
          toggleSetItem(prev, id)
      ),
    []
  );


  // ---------------------------------------------------------
  // LEVEL / CATEGORY / NOTES
  // ---------------------------------------------------------

  const toggleLevel = useCallback(
    (id) =>
      setExpandedLevelIds(
        (prev) =>
          toggleSetItem(prev, id)
      ),
    []
  );

  const toggleCategory = useCallback(
    (id) =>
      setExpandedCategoryIds(
        (prev) =>
          toggleSetItem(prev, id)
      ),
    []
  );

  const toggleNotes = useCallback(
    (id) =>
      setExpandedNotesIds(
        (prev) =>
          toggleSetItem(prev, id)
      ),
    []
  );

  const handleNotesChange = useCallback(
    (id, value) =>
      setNotesText(
        (prev) => ({
          ...prev,
          [id]: value,
        })
      ),
    []
  );


  // ---------------------------------------------------------
  // REVISION
  // ---------------------------------------------------------

  const toggleRevision = useCallback(
    (id) => {

      setProblems((prev) =>
        prev.map((problem) =>
          problem.id === id
            ? {
                ...problem,
                revisionLevel:
                  Number(
                    problem.revisionLevel
                  ) > 0
                    ? 0
                    : 1,
              }
            : problem
        )
      );

    },
    []
  );


  // ---------------------------------------------------------
  // FILTER ACTIONS
  // ---------------------------------------------------------

  const handleClearAllFilters =
    useCallback(
      () =>
        setFilters(DEFAULT_FILTERS),
      []
    );

  const handleClearFilterKey =
    useCallback(
      (key) =>
        setFilters(
          (prev) =>
            clearFilterKey(prev, key)
        ),
      []
    );


  // ---------------------------------------------------------
  // DATA SETTINGS
  // ---------------------------------------------------------

  const handleMergeProblems =
    useCallback(
      (incoming, options) => {

        const result =
          mergeProblemSets(
            problems,
            incoming,
            options
          );

        setProblems(result.merged);

        return result;
      },
      [problems]
    );


  const handleReplaceProblems =
    useCallback(
      (incoming) =>
        setProblems(incoming),
      []
    );


  const handleRestoreBackup =
    useCallback(
      ({
        problems: newProblems,
        completed,
        starred,
        notes,
        completedAt:
          restoredCompletedAt,
      }) => {

        setProblems(newProblems);

        setCompletedIds(
          new Set(completed)
        );

        setStarredIds(
          new Set(starred)
        );

        setNotesText(notes);

        setCompletedAt(
          restoredCompletedAt &&
          typeof restoredCompletedAt ===
            "object"
            ? restoredCompletedAt
            : {}
        );

      },
      []
    );


  const handleClearProgress =
    useCallback(
      () => {

        setCompletedIds(
          new Set()
        );

        setStarredIds(
          new Set()
        );

        setNotesText({});

        setCompletedAt({});

        clearProgressStorage(
          userId
        );

      },
      [userId]
    );


  // ---------------------------------------------------------
  // EMPTY DATASET
  // ---------------------------------------------------------

  const isDatasetEmpty =
    problems.length === 0;


  // ---------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6">

      {!storageAvailable &&
        !dismissedStorageWarning && (

          <div
            role="alert"
            className="flex items-start gap-3 bg-hard/10 border border-hard/30 rounded-xl px-4 py-3 text-sm text-hard"
          >

            <AlertTriangle
              size={16}
              className="shrink-0 mt-0.5"
              aria-hidden="true"
            />

            <p className="flex-1">
              Your browser is blocking local
              storage (private browsing, or
              storage disabled). Progress will
              work during this visit but won't
              be saved after you leave.
            </p>

            <button
              onClick={() =>
                setDismissedStorageWarning(
                  true
                )
              }
              aria-label="Dismiss warning"
              className={`shrink-0 rounded ${FOCUS_RING}`}
            >
              <X
                size={16}
                aria-hidden="true"
              />
            </button>

          </div>
        )}


      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
  <div>
    <h1 className="text-2xl font-bold tracking-tight">
      DSA Master
    </h1>

    <p className="text-sm text-text-muted font-mono">
      Beginner → Advanced ·{" "}
      {problems.length} problems
    </p>

    {session && (
      <p className="text-xs text-text-muted mt-1">
        {cloudLoading
          ? "Loading cloud progress..."
          : syncStatus === "synced"
          ? "Cloud synced"
          : syncStatus === "error"
          ? "Cloud sync error"
          : "Local progress"}
      </p>
    )}
  </div>

  <div className="flex items-center gap-2 self-start sm:self-auto">
    <button
      ref={settingsButtonRef}
      onClick={() => setIsSettingsOpen(true)}
      className={`flex items-center gap-2 text-sm font-medium border border-border hover:bg-surface-hover rounded-lg px-3 py-1.5 transition-colors ${FOCUS_RING}`}
    >
      <Settings size={14} aria-hidden="true" />
      Data Settings
    </button>

    <ProfileMenu session={session} />
  </div>
</header>


      {isDatasetEmpty ? (

        <div className="bg-surface border border-border rounded-2xl p-10 flex flex-col items-center gap-3 text-center">

          <p className="text-sm text-text-muted">
            Your tracker is empty — import a
            dataset to get started.
          </p>

          <button
            onClick={() =>
              setIsSettingsOpen(true)
            }
            className={`text-sm font-medium bg-accent text-bg rounded-lg px-4 py-2 hover:opacity-90 transition-opacity ${FOCUS_RING_ON_SURFACE}`}
          >
            Open Data Settings
          </button>

        </div>

      ) : (

        <>

          <DashboardStats
            problems={problems}
            completedIds={completedIds}
            starredIds={starredIds}
            completedAt={completedAt}
          />


          <GlobalFilters
            filters={filters}
            onChange={setFilters}
            onClearAll={
              handleClearAllFilters
            }
            onClearKey={
              handleClearFilterKey
            }
            patterns={availablePatterns}
            resultCount={
              filteredProblems.length
            }
            totalCount={
              problems.length
            }
          />


          <div className="flex flex-col gap-4">

            {sortedLevels.map(
              (level) => {

                const levelCategories =
                  CATEGORIES
                    .filter(
                      (category) =>
                        category.level ===
                        level.id
                    )
                    .sort(
                      (a, b) =>
                        a.order - b.order
                    );


                const visibleCategories =
                  activeFiltersOn
                    ? levelCategories.filter(
                        (category) =>
                          (
                            grouped[
                              level.id
                            ]?.[
                              category.id
                            ] || []
                          ).length > 0
                      )
                    : levelCategories;


                if (activeFiltersOn) {

                  const levelTotal =
                    computeStats(
                      levelCategories.flatMap(
                        (category) =>
                          grouped[
                            level.id
                          ]?.[
                            category.id
                          ] || []
                      ),
                      completedIds
                    ).total;

                  if (levelTotal === 0) {
                    return null;
                  }
                }


                return (
                  <LevelSection
                    key={level.id}
                    level={level}
                    totalLevels={
                      sortedLevels.length
                    }
                    categories={
                      visibleCategories
                    }
                    problemsByCategory={
                      grouped[
                        level.id
                      ] || {}
                    }
                    completedIds={
                      completedIds
                    }
                    starredIds={
                      starredIds
                    }
                    isExpanded={
                      activeFiltersOn
                        ? true
                        : expandedLevelIds.has(
                            level.id
                          )
                    }
                    onToggleLevel={
                      toggleLevel
                    }
                    expandedCategoryIds={
                      activeFiltersOn
                        ? new Set(
                            visibleCategories.map(
                              (category) =>
                                category.id
                            )
                          )
                        : expandedCategoryIds
                    }
                    onToggleCategory={
                      toggleCategory
                    }
                    expandedNotesIds={
                      expandedNotesIds
                    }
                    onToggleNotes={
                      toggleNotes
                    }
                    notesText={notesText}
                    onNotesChange={
                      handleNotesChange
                    }
                    onToggleComplete={
                      toggleComplete
                    }
                    onToggleStar={
                      toggleStar
                    }
                    onToggleRevision={
                      toggleRevision
                    }
                  />
                );
              }
            )}


            {activeFiltersOn &&
              filteredProblems.length ===
                0 && (

                <div className="bg-surface border border-border rounded-2xl p-8 flex flex-col items-center gap-3 text-center">

                  <p className="text-sm text-text-muted">
                    No problems match your
                    filters.
                  </p>

                  <button
                    onClick={
                      handleClearAllFilters
                    }
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
        onClose={() =>
          setIsSettingsOpen(false)
        }
        triggerRef={settingsButtonRef}
        problems={problems}
        completedIds={completedIds}
        starredIds={starredIds}
        notesText={notesText}
        completedAt={completedAt}
        onMergeProblems={
          handleMergeProblems
        }
        onReplaceProblems={
          handleReplaceProblems
        }
        onRestoreBackup={
          handleRestoreBackup
        }
        onClearProgress={
          handleClearProgress
        }
      />

    </main>
  );
}