// The curriculum shape. Components never hardcode level/category
// names — they always read from here, so adding a level or category
// is a one-line change with zero UI edits.

export const LEVELS = [
  { id: "beginner", name: "Beginner", order: 1 },
  { id: "fundamental-ds", name: "Fundamental Data Structures", order: 2 },
  { id: "searching-sorting", name: "Searching & Sorting", order: 3 },
  { id: "core-patterns", name: "Core Patterns", order: 4 },
  { id: "recursion-backtracking", name: "Recursion & Backtracking", order: 5 },
  { id: "trees", name: "Trees", order: 6 },
  { id: "heaps", name: "Heaps", order: 7 },
  { id: "greedy", name: "Greedy", order: 8 },
  { id: "graphs", name: "Graphs", order: 9 },
  { id: "dynamic-programming", name: "Dynamic Programming", order: 10 },
  { id: "advanced-ds", name: "Advanced Data Structures", order: 11 },
  { id: "advanced-algorithms", name: "Advanced Algorithms", order: 12 },
  { id: "string-algorithms", name: "String Algorithms", order: 13 },
  { id: "cp-interview-prep", name: "Competitive Programming / Interview Prep", order: 14 },
];

export const CATEGORIES = [
  { id: "basics", name: "Basics", level: "beginner", order: 1 },

  { id: "arrays", name: "Arrays", level: "fundamental-ds", order: 1 },
  { id: "linked-list", name: "Linked List", level: "fundamental-ds", order: 2 },
  { id: "stacks-queues", name: "Stack & Queue", level: "fundamental-ds", order: 3 },
  { id: "strings-basics", name: "Strings", level: "fundamental-ds", order: 4 },

  { id: "sorting", name: "Sorting", level: "searching-sorting", order: 1 },
  { id: "binary-search", name: "Binary Search", level: "searching-sorting", order: 2 },

  { id: "sliding-window-two-pointer", name: "Sliding Window / Two Pointer", level: "core-patterns", order: 1 },
  { id: "bit-manipulation", name: "Bit Manipulation", level: "core-patterns", order: 2 },

  { id: "recursion", name: "Recursion", level: "recursion-backtracking", order: 1 },
  { id: "backtracking", name: "Backtracking", level: "recursion-backtracking", order: 2 },

  { id: "binary-trees", name: "Binary Trees", level: "trees", order: 1 },
  { id: "binary-search-trees", name: "Binary Search Trees", level: "trees", order: 2 },

  { id: "heaps", name: "Heaps", level: "heaps", order: 1 },
  { id: "greedy", name: "Greedy", level: "greedy", order: 1 },
  { id: "graphs", name: "Graphs", level: "graphs", order: 1 },
  { id: "dynamic-programming", name: "Dynamic Programming", level: "dynamic-programming", order: 1 },

  { id: "tries", name: "Tries", level: "advanced-ds", order: 1 },
  { id: "segment-trees", name: "Segment Trees & Fenwick Trees", level: "advanced-ds", order: 2 },
  { id: "disjoint-set", name: "Disjoint Set (Union-Find)", level: "advanced-ds", order: 3 },

  { id: "advanced-graphs", name: "Advanced Graph Algorithms", level: "advanced-algorithms", order: 1 },
  { id: "math-number-theory", name: "Math & Number Theory", level: "advanced-algorithms", order: 2 },
  { id: "string-algorithms", name: "String Algorithms", level: "string-algorithms", order: 1 },
  { id: "cp-interview-prep", name: "Interview & CP Practice", level: "cp-interview-prep", order: 1 },
];

// Shared lookup maps, used anywhere a component or util needs to go
// from a level/category id to its full record (name, order, etc.)
// without re-building the same Map in multiple places.
export function buildRoadmapLookups(levels = LEVELS, categories = CATEGORIES) {
  return {
    levelsById: new Map(levels.map((l) => [l.id, l])),
    categoriesById: new Map(categories.map((c) => [c.id, c])),
  };
}
