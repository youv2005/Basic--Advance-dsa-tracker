// Pure functions only — no React, no localStorage. Keeps the stats
// logic testable and reusable from any component.

export function computeStats(problems, completedIds) {
  const total = problems.length;
  const solved = problems.reduce(
    (count, p) => (completedIds.has(p.id) ? count + 1 : count),
    0
  );
  const percent = total === 0 ? 0 : Math.round((solved / total) * 100);
  return { solved, total, percent };
}

export function computeDifficultyBreakdown(problems, completedIds) {
  return ["Easy", "Medium", "Hard"].reduce((acc, diff) => {
    acc[diff] = computeStats(
      problems.filter((p) => p.difficulty === diff),
      completedIds
    );
    return acc;
  }, {});
}

export function countStarred(problems, starredIds) {
  return problems.reduce(
    (count, p) => (starredIds.has(p.id) ? count + 1 : count),
    0
  );
}

// Builds { [levelId]: { [categoryId]: Problem[] } }. Every level and
// category from the roadmap is present even with zero problems, so
// the UI can show an empty state instead of skipping sections.
export function groupByLevelAndCategory(problems, levels, categories) {
  const grouped = {};

  levels.forEach((level) => {
    grouped[level.id] = {};
    categories
      .filter((c) => c.level === level.id)
      .forEach((category) => {
        grouped[level.id][category.id] = [];
      });
  });

  problems.forEach((problem) => {
    if (!grouped[problem.level]) grouped[problem.level] = {};
    if (!grouped[problem.level][problem.category]) {
      grouped[problem.level][problem.category] = [];
    }
    grouped[problem.level][problem.category].push(problem);
  });

  return grouped;
}

export function getUniquePatterns(problems) {
  const patterns = new Set();
  problems.forEach((p) => p.pattern && patterns.add(p.pattern));
  return Array.from(patterns).sort();
}

// Blue (just starting) -> amber (advanced), positioned by the level's
// order in the curriculum. Purely presentational, driven by data.
export function levelAccentColor(order, totalLevels) {
  const t = totalLevels <= 1 ? 0 : (order - 1) / (totalLevels - 1);
  const hue = 227 + (38 - 227) * t;
  return `hsl(${hue}, 80%, 65%)`;
}

export function toggleSetItem(set, item) {
  const next = new Set(set);
  next.has(item) ? next.delete(item) : next.add(item);
  return next;
}

export const DIFFICULTY_COLOR = {
  Easy: "var(--color-easy)",
  Medium: "var(--color-medium)",
  Hard: "var(--color-hard)",
};

function isSameLocalDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// `completedAt` is a { [problemId]: isoTimestamp } map. Counts entries
// timestamped today, in the viewer's local timezone.
export function countSolvedToday(completedAt, now = new Date()) {
  return Object.values(completedAt).reduce(
    (count, iso) => (iso && isSameLocalDay(new Date(iso), now) ? count + 1 : count),
    0
  );
}

// A problem is "flagged for revision" when revisionLevel is a positive
// number — the field already exists on the schema, this just counts it.
export function countRevisionProblems(problems) {
  return problems.reduce((count, p) => (Number(p.revisionLevel) > 0 ? count + 1 : count), 0);
}

// A level/category "counts" toward mastery only once it has at least
// one problem AND every one of them is solved — an empty section
// isn't an achievement.
export function countLevelsCompleted(problems, completedIds, levels) {
  return levels.reduce((count, level) => {
    const levelProblems = problems.filter((p) => p.level === level.id);
    if (levelProblems.length === 0) return count;
    const allSolved = levelProblems.every((p) => completedIds.has(p.id));
    return allSolved ? count + 1 : count;
  }, 0);
}

export function countTopicsCompleted(problems, completedIds, categories) {
  return categories.reduce((count, category) => {
    const categoryProblems = problems.filter((p) => p.category === category.id);
    if (categoryProblems.length === 0) return count;
    const allSolved = categoryProblems.every((p) => completedIds.has(p.id));
    return allSolved ? count + 1 : count;
  }, 0);
}
