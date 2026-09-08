// Value + onChange are backed by localStorage-persisted state in the
// parent. `problemTitle` is used only to build an accessible label —
// a bare textarea with no associated text is invisible to screen readers.
export default function NotesPanel({ problemTitle, value, onChange }) {
  return (
    <div className="px-4 pb-3 pt-1">
      <textarea
        aria-label={problemTitle ? `Notes for ${problemTitle}` : "Notes"}
        className="w-full bg-bg border border-border rounded-lg p-3 text-sm text-text placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent resize-y min-h-[72px]"
        placeholder="Add a note for this problem..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
