// Curriculum configuration. The UI reads levels/categories from here, so the
// roadmap can grow without hardcoding category names into React components.

export const LEVELS = [
  { id: "beginner", name: "Beginner", order: 1, description: "Programming foundations and first problem-solving patterns." },
  { id: "fundamental-ds", name: "Fundamental Data Structures", order: 2, description: "Arrays, hashing, strings, linked lists, stacks and queues." },
  { id: "searching-sorting", name: "Searching & Sorting", order: 3, description: "The core techniques that make brute force solutions efficient." },
  { id: "core-patterns", name: "Core Problem-Solving Patterns", order: 4, description: "Reusable patterns that appear across interview and contest problems." },
  { id: "recursion-backtracking", name: "Recursion & Backtracking", order: 5, description: "State-space exploration, combinations, permutations and constraint search." },
  { id: "trees", name: "Trees", order: 6, description: "Tree traversal, construction, recursion and search trees." },
  { id: "heaps", name: "Heaps & Priority Queues", order: 7, description: "Ordering, top-k, scheduling and streaming problems." },
  { id: "greedy", name: "Greedy Algorithms", order: 8, description: "Local-choice strategies, intervals, scheduling and optimization." },
  { id: "graphs", name: "Graphs", order: 9, description: "Traversal, DAGs, shortest paths, spanning trees and advanced graph ideas." },
  { id: "dynamic-programming", name: "Dynamic Programming", order: 10, description: "State design, transitions, optimization and classic DP families." },
  { id: "advanced-ds", name: "Advanced Data Structures", order: 11, description: "Tries, range-query structures and disjoint-set union." },
  { id: "advanced-algorithms", name: "Advanced Algorithms", order: 12, description: "Number theory, combinatorics, geometry and higher-level techniques." },
  { id: "string-algorithms", name: "String Algorithms", order: 13, description: "String matching, hashing and specialized string processing." },
  { id: "cp-interview-prep", name: "Competitive Programming & Interview Prep", order: 14, description: "Design-heavy questions and contest-oriented practice." },
];

export const CATEGORIES = [
  { id: "basics", name: "Foundations & Basics", level: "beginner", order: 1, concepts: ["Time & space complexity", "Input/output and implementation discipline", "Basic math, arrays and frequency counting"] },

  { id: "arrays", name: "Arrays", level: "fundamental-ds", order: 1, concepts: ["Array traversal and indexing", "1D vs 2D arrays", "In-place operations and frequency techniques"] },
  { id: "hashing", name: "Hashing", level: "fundamental-ds", order: 2, concepts: ["Hash maps and hash sets", "Frequency maps", "Lookup, counting and complement patterns"] },
  { id: "strings-basics", name: "Strings", level: "fundamental-ds", order: 3, concepts: ["String traversal", "Character frequency and normalization", "String construction and parsing"] },
  { id: "linked-list", name: "Linked List", level: "fundamental-ds", order: 4, concepts: ["Singly and doubly linked lists", "Slow/fast pointers", "Reversal, merging and cycle detection"] },
  { id: "stacks-queues", name: "Stack & Queue", level: "fundamental-ds", order: 5, concepts: ["Stack and queue operations", "Monotonic stacks and queues", "Expression, simulation and next-greater patterns"] },

  { id: "sorting", name: "Important Sorting Techniques", level: "searching-sorting", order: 1, concepts: ["Selection, bubble and insertion sort", "Merge sort and divide & conquer", "Quickselect and linear-time sorting ideas"] },
  { id: "binary-search", name: "Binary Search", level: "searching-sorting", order: 2, concepts: ["Binary search on sorted arrays", "Rotated arrays and boundary finding", "Binary search on the answer"] },

  { id: "prefix-sum", name: "Prefix Sum & Difference Arrays", level: "core-patterns", order: 1, concepts: ["Prefix sums", "Range-sum queries", "Difference arrays and cumulative updates"] },
  { id: "sliding-window", name: "Sliding Window", level: "core-patterns", order: 2, concepts: ["Fixed-size windows", "Variable-size windows", "Frequency maps inside windows"] },
  { id: "two-pointers", name: "Two Pointers", level: "core-patterns", order: 3, concepts: ["Opposite-direction pointers", "Same-direction pointers", "Sorted-array pair and triplet patterns"] },
  { id: "bit-manipulation", name: "Bit Manipulation", level: "core-patterns", order: 4, concepts: ["Binary representation", "XOR and bit tricks", "Bitmask state representation"] },

  { id: "recursion", name: "Recursion", level: "recursion-backtracking", order: 1, concepts: ["Base case and recursive state", "Recursion trees", "Divide & conquer and recursive data structures"] },
  { id: "backtracking", name: "Backtracking", level: "recursion-backtracking", order: 2, concepts: ["Choose → explore → undo", "Combinations and permutations", "Constraint pruning"] },

  { id: "binary-trees", name: "Binary Trees", level: "trees", order: 1, concepts: ["DFS traversals", "BFS and level order", "Tree height, diameter and path problems"] },
  { id: "binary-search-trees", name: "Binary Search Trees", level: "trees", order: 2, concepts: ["BST ordering invariant", "Search, insert and delete", "Predecessor, successor and validation"] },

  { id: "heaps", name: "Heaps & Priority Queues", level: "heaps", order: 1, concepts: ["Min-heap and max-heap", "Top-k patterns", "Scheduling and streaming data"] },
  { id: "greedy", name: "Greedy Algorithms", level: "greedy", order: 1, concepts: ["Greedy-choice reasoning", "Intervals and scheduling", "Sorting + local optimization"] },

  { id: "graphs", name: "Graph Traversal & Representation", level: "graphs", order: 1, concepts: ["Adjacency lists and matrices", "DFS and BFS", "Connected components and grid graphs"] },
  { id: "topological-sort", name: "Topological Sort", level: "graphs", order: 2, concepts: ["DAGs", "Kahn's algorithm", "DFS topological ordering"] },
  { id: "shortest-path", name: "Shortest Path Algorithms", level: "graphs", order: 3, concepts: ["Unweighted shortest path", "Dijkstra-style positive-weight graphs", "Shortest paths with special constraints"] },
  { id: "mst", name: "Minimum Spanning Trees", level: "graphs", order: 4, concepts: ["Spanning trees", "Kruskal's algorithm", "Prim's algorithm"] },
  { id: "advanced-graphs", name: "Advanced Graph Algorithms", level: "graphs", order: 5, concepts: ["Strongly connected components", "Eulerian structures", "Advanced connectivity techniques"] },

  { id: "dynamic-programming", name: "Dynamic Programming", level: "dynamic-programming", order: 1, concepts: ["State + transition + base case", "1D and 2D DP", "Subsequence, string, grid, knapsack and optimization DP"] },

  { id: "tries", name: "Tries", level: "advanced-ds", order: 1, concepts: ["Trie nodes and prefixes", "Word insertion/search", "Prefix-based optimization"] },
  { id: "segment-trees", name: "Segment Trees & Fenwick Trees", level: "advanced-ds", order: 2, concepts: ["Range queries", "Point/range updates", "Fenwick tree vs segment tree"] },
  { id: "disjoint-set", name: "Disjoint Set Union", level: "advanced-ds", order: 3, concepts: ["Union and find", "Path compression", "Union by rank/size"] },

  { id: "math-number-theory", name: "Math & Number Theory", level: "advanced-algorithms", order: 1, concepts: ["GCD, primes and modular arithmetic", "Combinatorics and counting", "Geometry, probability and game ideas"] },
  { id: "string-algorithms", name: "String Algorithms", level: "string-algorithms", order: 1, concepts: ["Pattern matching", "Rolling hash", "Advanced string representations"] },

  { id: "interview-design", name: "Interview & Data-Structure Design", level: "cp-interview-prep", order: 1, concepts: ["API and data-structure design", "Invariants and edge cases", "Streaming and stateful systems"] },
  { id: "competitive-programming", name: "Competitive Programming", level: "cp-interview-prep", order: 2, concepts: ["Contest implementation speed", "Constraint-driven problem selection", "Advanced problem-solving practice"] },
];

export function buildRoadmapLookups(levels = LEVELS, categories = CATEGORIES) {
  return {
    levelsById: new Map(levels.map((l) => [l.id, l])),
    categoriesById: new Map(categories.map((c) => [c.id, c])),
  };
}
