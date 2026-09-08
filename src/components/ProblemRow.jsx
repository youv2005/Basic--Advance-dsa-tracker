import { Star, StickyNote, ExternalLink, RotateCcw } from "lucide-react";
import NotesPanel from "./NotesPanel";
import { DIFFICULTY_COLOR } from "../utils/trackerUtils";
import { FOCUS_RING_ON_SURFACE as FOCUS_RING } from "../utils/uiConstants";

export default function ProblemRow({
  problem,
  isCompleted,
  isStarred,
  onToggleComplete,
  onToggleStar,
  onToggleRevision,
  isNotesOpen,
  onToggleNotes,
  notesValue,
  onNotesChange,
}) {
  const color = DIFFICULTY_COLOR[problem.difficulty];
  const isMarkedForRevision = (problem.revisionLevel || 0) > 0;

  return (
    <div
      className={`border-b border-border last:border-b-0 transition-colors ${
        isCompleted ? "bg-easy/5" : "hover:bg-surface-hover"
      }`}
    >
      <div className="flex items-center gap-3 px-4 py-2.5">
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={() => onToggleComplete(problem.id)}
          aria-label={`Mark ${problem.title} as ${isCompleted ? "incomplete" : "complete"}`}
          className={`h-4 w-4 rounded border-border accent-accent shrink-0 cursor-pointer ${FOCUS_RING}`}
        />

        <span
          className={`flex-1 truncate text-sm ${isCompleted ? "text-text-muted line-through" : "text-text"}`}
        >
          {problem.title}
        </span>

        <a
          href={problem.leetcodeUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${problem.title} on LeetCode (opens in a new tab)`}
          className={`text-text-muted hover:text-accent transition-colors shrink-0 rounded ${FOCUS_RING}`}
        >
          <ExternalLink size={15} aria-hidden="true" />
        </a>

        {/* Full pill on sm+ screens; a compact color dot on narrow phones
            so the row doesn't get cramped next to the title + icons. */}
        <span
          className="hidden sm:inline-flex text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
          style={{ color, backgroundColor: `${color}1A` }}
        >
          {problem.difficulty}
        </span>
        <span
          className="sm:hidden w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: color }}
          role="img"
          aria-label={`Difficulty: ${problem.difficulty}`}
        />

        <button
          onClick={() => onToggleRevision(problem.id)}
          aria-pressed={isMarkedForRevision}
          aria-label={isMarkedForRevision ? "Unmark for revision" : "Mark for revision"}
          className={`shrink-0 rounded transition-colors ${FOCUS_RING} ${
            isMarkedForRevision ? "text-accent" : "text-text-muted hover:text-accent"
          }`}
        >
          <RotateCcw size={15} aria-hidden="true" />
        </button>

        <button
          onClick={() => onToggleStar(problem.id)}
          aria-pressed={isStarred}
          aria-label={isStarred ? "Unstar problem" : "Star problem"}
          className={`shrink-0 rounded text-text-muted hover:text-star transition-colors ${FOCUS_RING}`}
        >
          <Star
            size={16}
            fill={isStarred ? "var(--color-star)" : "none"}
            color={isStarred ? "var(--color-star)" : "currentColor"}
            aria-hidden="true"
          />
        </button>

        <button
          onClick={() => onToggleNotes(problem.id)}
          aria-expanded={isNotesOpen}
          aria-label={isNotesOpen ? "Hide notes" : "Add or view notes"}
          className={`shrink-0 rounded transition-colors ${FOCUS_RING} ${
            isNotesOpen ? "text-accent" : "text-text-muted hover:text-accent"
          }`}
        >
          <StickyNote size={16} aria-hidden="true" />
        </button>
      </div>

      {isNotesOpen && (
        <NotesPanel
          problemTitle={problem.title}
          value={notesValue}
          onChange={(val) => onNotesChange(problem.id, val)}
        />
      )}
    </div>
  );
}
