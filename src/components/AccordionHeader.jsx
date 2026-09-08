import { ChevronDown, ChevronRight } from "lucide-react";
import { FOCUS_RING_INSET } from "../utils/uiConstants";

// Shared by LevelSection and TopicAccordion so the disclosure button,
// progress bar, and percent readout exist in exactly one place instead
// of two near-identical copies.
export default function AccordionHeader({ id, label, stats, accentColor, isExpanded, onToggle, size = "md" }) {
  const chevronSize = size === "lg" ? 18 : 16;
  const barSize = size === "lg" ? "w-28 h-2" : "w-20 h-1.5";
  const labelClass = size === "lg" ? "font-semibold text-sm" : "font-medium text-sm";
  const padding = size === "lg" ? "px-5 py-4" : "px-4 py-3";

  return (
    <button
      onClick={onToggle}
      aria-expanded={isExpanded}
      aria-controls={id}
      className={`w-full flex items-center gap-3 ${padding} hover:bg-surface-hover transition-colors text-left ${FOCUS_RING_INSET}`}
    >
      {isExpanded ? (
        <ChevronDown size={chevronSize} className="shrink-0" style={{ color: accentColor }} aria-hidden="true" />
      ) : (
        <ChevronRight size={chevronSize} className="shrink-0" style={{ color: accentColor }} aria-hidden="true" />
      )}

      <span className={`${labelClass} flex-1 truncate`}>{label}</span>
      <span className="font-mono text-xs text-text-muted shrink-0">
        {stats.solved}/{stats.total}
      </span>

      <div
        className={`${barSize} bg-border rounded-full overflow-hidden hidden sm:block shrink-0`}
        role="progressbar"
        aria-valuenow={stats.percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label} progress`}
      >
        <div className="h-full rounded-full" style={{ width: `${stats.percent}%`, backgroundColor: accentColor }} />
      </div>

      <span className="font-mono text-xs w-9 text-right shrink-0" style={{ color: accentColor }}>
        {stats.percent}%
      </span>
    </button>
  );
}
