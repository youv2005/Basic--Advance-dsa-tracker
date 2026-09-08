import { Search, Star, X } from "lucide-react";
import { LEVELS, CATEGORIES, buildRoadmapLookups } from "../data/roadmap";
import { describeActiveFilters, isFiltersActive } from "../utils/filterUtils";
import { FOCUS_RING_FIELD as FOCUS_RING } from "../utils/uiConstants";

const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"];
const STATUSES = ["All", "Solved", "Unsolved"];
const DIFFICULTY_ACCENT = { Easy: "var(--color-easy)", Medium: "var(--color-medium)", Hard: "var(--color-hard)" };

function PillButton({ active, onClick, children, activeColor }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${FOCUS_RING} ${
        active ? "border-transparent text-bg" : "border-border text-text-muted hover:text-text hover:bg-surface-hover"
      }`}
      style={active ? { backgroundColor: activeColor || "var(--color-accent)" } : undefined}
    >
      {children}
    </button>
  );
}

export default function GlobalFilters({ filters, onChange, onClearAll, onClearKey, patterns, resultCount, totalCount }) {
  const { levelsById, categoriesById } = buildRoadmapLookups();
  const activeFiltersOn = isFiltersActive(filters);
  const pills = describeActiveFilters(filters, { levelsById, categoriesById });

  const availableCategories =
    filters.level === "all"
      ? [...CATEGORIES].sort((a, b) => a.order - b.order)
      : CATEGORIES.filter((c) => c.level === filters.level).sort((a, b) => a.order - b.order);

  function setField(key, value) {
    onChange((prev) => {
      if (key === "level") {
        const categoryStillValid =
          prev.category === "all" || CATEGORIES.find((c) => c.id === prev.category)?.level === value;
        return { ...prev, level: value, category: categoryStillValid ? prev.category : "all" };
      }
      return { ...prev, [key]: value };
    });
  }

  return (
    <section className="bg-surface border border-border rounded-2xl p-4 flex flex-col gap-3" aria-label="Filter problems">
      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" aria-hidden="true" />
        <label htmlFor="problem-search" className="sr-only">
          Search problems
        </label>
        <input
          id="problem-search"
          type="text"
          value={filters.search}
          onChange={(e) => setField("search", e.target.value)}
          placeholder="Search title, id, pattern, tags, category, subcategory, company..."
          className={`w-full bg-bg border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-text placeholder:text-text-muted ${FOCUS_RING}`}
        />
      </div>

      {/* Difficulty / Starred / Status */}
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Difficulty, starred, and status filters">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by difficulty">
          {DIFFICULTIES.map((d) => (
            <PillButton
              key={d}
              active={filters.difficulty === d}
              activeColor={DIFFICULTY_ACCENT[d]}
              onClick={() => setField("difficulty", d)}
            >
              {d}
            </PillButton>
          ))}
        </div>

        <span className="w-px h-4 bg-border" aria-hidden="true" />

        <button
          onClick={() => setField("starredOnly", !filters.starredOnly)}
          aria-pressed={filters.starredOnly}
          className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${FOCUS_RING} ${
            filters.starredOnly
              ? "border-transparent text-bg bg-star"
              : "border-border text-text-muted hover:text-text hover:bg-surface-hover"
          }`}
        >
          <Star size={12} fill={filters.starredOnly ? "var(--color-bg)" : "none"} aria-hidden="true" /> Starred
        </button>

        <span className="w-px h-4 bg-border" aria-hidden="true" />

        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
          {STATUSES.map((s) => (
            <PillButton key={s} active={filters.status === s} onClick={() => setField("status", s)}>
              {s}
            </PillButton>
          ))}
        </div>
      </div>

      {/* Level / Category / Pattern dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div>
          <label htmlFor="filter-level" className="sr-only">
            Filter by level
          </label>
          <select
            id="filter-level"
            value={filters.level}
            onChange={(e) => setField("level", e.target.value)}
            className={`w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text ${FOCUS_RING}`}
          >
            <option value="all">All Levels</option>
            {[...LEVELS]
              .sort((a, b) => a.order - b.order)
              .map((level) => (
                <option key={level.id} value={level.id}>
                  {level.name}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-category" className="sr-only">
            Filter by category
          </label>
          <select
            id="filter-category"
            value={filters.category}
            onChange={(e) => setField("category", e.target.value)}
            className={`w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text ${FOCUS_RING}`}
          >
            <option value="all">All Categories</option>
            {availableCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-pattern" className="sr-only">
            Filter by pattern
          </label>
          <select
            id="filter-pattern"
            value={filters.pattern}
            onChange={(e) => setField("pattern", e.target.value)}
            className={`w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text ${FOCUS_RING}`}
          >
            <option value="all">All Patterns</option>
            {patterns.map((pattern) => (
              <option key={pattern} value={pattern}>
                {pattern}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active filter pills + result count */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs font-mono text-text-muted" aria-live="polite">
          {resultCount} / {totalCount} shown
        </span>

        {pills.map((pill) => (
          <button
            key={pill.key}
            onClick={() => onClearKey(pill.key)}
            className={`flex items-center gap-1 text-xs bg-accent/15 text-accent rounded-full pl-2.5 pr-1.5 py-1 hover:bg-accent/25 transition-colors ${FOCUS_RING}`}
            aria-label={`Remove filter: ${pill.label}`}
          >
            {pill.label}
            <X size={11} aria-hidden="true" />
          </button>
        ))}

        {activeFiltersOn && (
          <button onClick={onClearAll} className={`text-xs font-medium text-hard hover:underline ml-auto ${FOCUS_RING}`}>
            Clear All Filters
          </button>
        )}
      </div>
    </section>
  );
}
