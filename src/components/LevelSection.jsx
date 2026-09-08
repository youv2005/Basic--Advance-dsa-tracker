import AccordionHeader from "./AccordionHeader";
import TopicAccordion from "./TopicAccordion";
import { computeStats, levelAccentColor } from "../utils/trackerUtils";

export default function LevelSection({
  level,
  totalLevels,
  categories,
  problemsByCategory,
  completedIds,
  starredIds,
  isExpanded,
  onToggleLevel,
  expandedCategoryIds,
  onToggleCategory,
  ...rowHandlers
}) {
  const allProblems = categories.flatMap((c) => problemsByCategory[c.id] || []);
  const stats = computeStats(allProblems, completedIds);
  const accent = levelAccentColor(level.order, totalLevels);
  const panelId = `level-panel-${level.id}`;

  return (
    <section
      className="rounded-2xl border border-border overflow-hidden"
      style={{ borderLeftWidth: 3, borderLeftColor: accent }}
    >
      <AccordionHeader
        id={panelId}
        label={level.name}
        stats={stats}
        accentColor={accent}
        isExpanded={isExpanded}
        onToggle={() => onToggleLevel(level.id)}
        size="lg"
      />

      {isExpanded && (
        <div id={panelId} className="p-3 flex flex-col gap-2 bg-bg">
          {categories.length === 0 ? (
            <p className="px-2 py-3 text-sm text-text-muted">No categories in this level yet.</p>
          ) : (
            categories.map((category) => (
              <TopicAccordion
                key={category.id}
                category={category}
                problems={problemsByCategory[category.id] || []}
                completedIds={completedIds}
                starredIds={starredIds}
                isExpanded={expandedCategoryIds.has(category.id)}
                onToggle={onToggleCategory}
                {...rowHandlers}
              />
            ))
          )}
        </div>
      )}
    </section>
  );
}
