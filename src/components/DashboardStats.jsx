import { useMemo } from "react";
import { LEVELS, CATEGORIES } from "../data/roadmap";
import {
  computeStats,
  computeDifficultyBreakdown,
  countStarred,
  countSolvedToday,
  countRevisionProblems,
  countLevelsCompleted,
  countTopicsCompleted,
  DIFFICULTY_COLOR,
} from "../utils/trackerUtils";

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-1">
      <span className="text-text-muted text-xs uppercase tracking-wide">{label}</span>
      <span className="font-mono text-2xl font-semibold">{value}</span>
      {sub && <span className="text-text-muted text-xs">{sub}</span>}
    </div>
  );
}

function DifficultyCard({ label, stats }) {
  const color = DIFFICULTY_COLOR[label];
  return (
    <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium" style={{ color }}>{label}</span>
        <span className="font-mono text-sm text-text-muted">{stats.solved}/{stats.total}</span>
      </div>
      <div
        className="h-1.5 bg-border rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={stats.percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label} problems solved`}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${stats.percent}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function DashboardStats({ problems, completedIds, starredIds, completedAt }) {
  const overall = useMemo(() => computeStats(problems, completedIds), [problems, completedIds]);
  const byDifficulty = useMemo(() => computeDifficultyBreakdown(problems, completedIds), [problems, completedIds]);
  const starred = useMemo(() => countStarred(problems, starredIds), [problems, starredIds]);
  const solvedToday = useMemo(() => countSolvedToday(completedAt), [completedAt]);
  const revisionCount = useMemo(() => countRevisionProblems(problems), [problems]);
  const levelsCompleted = useMemo(() => countLevelsCompleted(problems, completedIds, LEVELS), [problems, completedIds]);
  const topicsCompleted = useMemo(() => countTopicsCompleted(problems, completedIds, CATEGORIES), [problems, completedIds]);

  return (
    <section className="bg-surface/60 border border-border rounded-2xl p-6 flex flex-col gap-5" aria-label="Progress dashboard">
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Overall Progress</h2>
          <span className="font-mono text-sm text-text-muted">
            {overall.solved} / {overall.total} solved
          </span>
        </div>
        <div
          className="h-2.5 bg-border rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={overall.percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Overall problems solved"
        >
          <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${overall.percent}%` }} />
        </div>
        <span className="font-mono text-sm text-accent">{overall.percent}%</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Problems" value={overall.total} />
        <StatCard label="Solved" value={overall.solved} />
        <StatCard label="Remaining" value={overall.total - overall.solved} />
        <StatCard label="Starred" value={starred} />
        <StatCard label="Solved Today" value={solvedToday} />
        <StatCard label="Revision Problems" value={revisionCount} />
        <StatCard label="Levels Completed" value={`${levelsCompleted}/${LEVELS.length}`} />
        <StatCard label="Topics Mastered" value={`${topicsCompleted}/${CATEGORIES.length}`} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <DifficultyCard label="Easy" stats={byDifficulty.Easy} />
        <DifficultyCard label="Medium" stats={byDifficulty.Medium} />
        <DifficultyCard label="Hard" stats={byDifficulty.Hard} />
      </div>
    </section>
  );
}
