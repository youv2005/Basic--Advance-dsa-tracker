import { useMemo, useState } from "react";
import { BookOpen, ChevronDown, ExternalLink, Sparkles, Copy, Check, ChevronUp } from "lucide-react";
import AccordionHeader from "./AccordionHeader";
import ProblemRow from "./ProblemRow";
import { computeStats } from "../utils/trackerUtils";
import { FOCUS_RING } from "../utils/uiConstants";
import { getConceptDetails, buildAiPrompt } from "../data/conceptNotes";
import { AI_PROVIDERS, openAiTutor } from "../utils/aiLinks";

function ConceptCard({ category, concept, level }) {
  const [open, setOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const details = getConceptDetails(category, concept);
  const prompt = buildAiPrompt(category, concept, level);

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      // Ignore clipboard permission errors; AI provider links remain usable.
    }
  };

  const learnWith = async (provider) => {
    setAiOpen(false);
    await openAiTutor(provider, prompt);
  };

  return (
    <div className="border-b border-border last:border-b-0">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className={`flex items-center gap-3 flex-1 min-w-0 text-left rounded-md ${FOCUS_RING}`}
        >
          {open ? <ChevronUp size={15} className="text-accent shrink-0" /> : <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />}
          <span className="flex-1 min-w-0">
            <span className="block text-sm font-medium text-text">{concept}</span>
            {!open && <span className="block text-xs text-text-muted mt-0.5 line-clamp-1">{details.summary}</span>}
          </span>
        </button>

        <div className="flex items-center gap-2 pl-7 sm:pl-0">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            className={`inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-text-muted hover:text-text hover:border-accent/50 transition-colors ${FOCUS_RING}`}
          >
            <BookOpen size={13} aria-hidden="true" />
            {open ? "Hide notes" : "Quick notes"}
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setAiOpen((value) => !value)}
              aria-expanded={aiOpen}
              className={`inline-flex items-center gap-1.5 rounded-md border border-accent/40 bg-accent/10 px-2.5 py-1.5 text-xs font-semibold text-accent hover:bg-accent/15 transition-colors ${FOCUS_RING}`}
            >
              <Sparkles size={13} aria-hidden="true" />
              Learn with AI
              <ChevronDown size={12} aria-hidden="true" />
            </button>

            {aiOpen && (
              <div className="absolute right-0 top-full z-30 mt-1 w-56 rounded-lg border border-border bg-surface shadow-xl p-1">
                <div className="px-2.5 py-2 text-[11px] text-text-muted border-b border-border mb-1">
                  Choose where to learn. The prompt is copied too.
                </div>
                {AI_PROVIDERS.map((provider) => (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => learnWith(provider)}
                    className={`w-full flex items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm hover:bg-surface-hover transition-colors ${FOCUS_RING}`}
                  >
                    <span className="flex-1">{provider.name}</span>
                    <ExternalLink size={12} className="text-text-muted" aria-hidden="true" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={copyPrompt}
                  className={`w-full mt-1 flex items-center gap-2 rounded-md border-t border-border px-2.5 py-2 text-left text-xs text-text-muted hover:text-text transition-colors ${FOCUS_RING}`}
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? "Prompt copied" : "Copy prompt only"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {open && (
        <div className="mx-4 mb-3 rounded-lg border border-border bg-bg/60 px-4 py-3">
          <p className="text-sm text-text leading-6">{details.summary}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            <div>
              <div className="text-[11px] uppercase tracking-wide font-semibold text-text-muted mb-1.5">Key points</div>
              <ul className="space-y-1.5">
                {details.points.map((point) => (
                  <li key={point} className="text-xs text-text-muted flex gap-2">
                    <span className="text-accent">•</span><span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-[11px] uppercase tracking-wide font-semibold text-text-muted mb-1">Prerequisite</div>
                <p className="text-xs text-text-muted">{details.prerequisites}</p>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide font-semibold text-text-muted mb-1">Complexity / target</div>
                <p className="text-xs text-text-muted">{details.complexity}</p>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-border text-[11px] text-text-muted">
            Tip: learn the idea here first, then use <span className="text-accent font-medium">Learn with AI</span> for examples, questions, explanations and deeper discussion.
          </div>
        </div>
      )}
    </div>
  );
}

export default function TopicAccordion({
  category,
  level,
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
  const [expandedGroups, setExpandedGroups] = useState(() => new Set());

  const groupedProblems = useMemo(() => {
    const groups = new Map();
    problems.forEach((problem) => {
      const key = problem.subcategory || "Practice Problems";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(problem);
    });
    return Array.from(groups.entries());
  }, [problems]);

  const toggleGroup = (name) => {
    setExpandedGroups((current) => {
      const next = new Set(current);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

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
        <div id={panelId} className="bg-bg/40">
          {category.concepts?.length > 0 && (
            <section className="border-b border-border">
              <div className="px-4 py-3 flex items-center gap-2 text-sm font-semibold">
                <BookOpen size={15} className="text-accent" aria-hidden="true" />
                <span>Concepts</span>
                <span className="text-xs text-text-muted font-normal">{category.concepts.length}</span>
              </div>
              <div className="mx-4 mb-3 rounded-lg border border-border overflow-visible bg-surface">
                {category.concepts.map((concept) => (
                  <ConceptCard key={concept} category={category} concept={concept} level={level} />
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="px-4 py-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Practice Problems</div>
                <div className="text-xs text-text-muted mt-0.5">{problems.length} problems in this topic</div>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-surface border border-border text-text-muted">
                {stats.solved}/{stats.total}
              </span>
            </div>

            {problems.length === 0 ? (
              <p className="px-4 pb-4 text-sm text-text-muted">No practice problems added yet.</p>
            ) : (
              <div className="px-4 pb-3 flex flex-col gap-2">
                {groupedProblems.map(([groupName, groupProblems]) => {
                  const groupStats = computeStats(groupProblems, completedIds);
                  const open = expandedGroups.has(groupName);
                  return (
                    <div key={groupName} className="rounded-lg border border-border overflow-hidden bg-surface">
                      <button
                        type="button"
                        onClick={() => toggleGroup(groupName)}
                        aria-expanded={open}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-surface-hover transition-colors ${FOCUS_RING}`}
                      >
                        <ChevronDown size={15} className={`shrink-0 transition-transform ${open ? "rotate-0" : "-rotate-90"}`} aria-hidden="true" />
                        <span className="flex-1 text-sm font-medium">{groupName}</span>
                        <span className="text-xs text-text-muted">{groupStats.solved}/{groupStats.total}</span>
                      </button>
                      {open && (
                        <div className="border-t border-border">
                          {groupProblems.map((problem) => (
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
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
