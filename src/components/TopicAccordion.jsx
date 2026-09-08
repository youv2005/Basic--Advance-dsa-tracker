import AccordionHeader from "./AccordionHeader";
import ProblemRow from "./ProblemRow";
import { computeStats } from "../utils/trackerUtils";

export default function TopicAccordion({
  category,
  problems,
  completedIds,
  starredIds,
  isExpanded,
  onToggle,
  expandedNotesIds,
  onToggleNotes,
  notesText,
  onNotesChange,
  onToggleComplete,
  onToggleStar,
  onToggleRevision,
}) {
  const stats = computeStats(problems, completedIds);
  const panelId = `category-panel-${category.id}`;

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <AccordionHeader
        id={panelId}
        label={category.name}
        stats={stats}
        accentColor="var(--color-accent)"
        isExpanded={isExpanded}
        onToggle={() => onToggle(category.id)}
        size="sm"
      />

      {isExpanded && (
        <div id={panelId}>
          {problems.length === 0 ? (
            <p className="px-4 py-3 text-sm text-text-muted">No problems added yet.</p>
          ) : (
            problems.map((problem) => (
              <ProblemRow
                key={problem.id}
                problem={problem}
                isCompleted={completedIds.has(problem.id)}
                isStarred={starredIds.has(problem.id)}
                onToggleComplete={onToggleComplete}
                onToggleStar={onToggleStar}
                onToggleRevision={onToggleRevision}
                isNotesOpen={expandedNotesIds.has(problem.id)}
                onToggleNotes={onToggleNotes}
                notesValue={notesText[problem.id] || ""}
                onNotesChange={onNotesChange}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
