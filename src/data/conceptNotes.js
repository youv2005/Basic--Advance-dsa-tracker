// Lightweight learning notes for roadmap concepts.
// Keep these intentionally short: the roadmap teaches the idea, while the
// linked AI tutor can provide a deeper explanation when the learner asks.

const CATEGORY_CONTEXT = {
  basics: {
    intro: "Build the habits that make every later DSA topic easier: reading constraints, choosing representations, and reasoning about complexity.",
    prerequisites: "None — this is the starting point."
  },
  arrays: {
    intro: "Learn how to reason about contiguous data, indices, mutation, traversal and common array invariants.",
    prerequisites: "Variables, loops and basic functions"
  },
  hashing: {
    intro: "Use hash tables to trade memory for fast lookup, counting and membership checks.",
    prerequisites: "Arrays, strings and basic complexity"
  },
  "strings-basics": {
    intro: "Treat strings as structured sequences: traverse them, count characters, parse them and build results safely.",
    prerequisites: "Arrays and basic loops"
  },
  "linked-list": {
    intro: "Understand pointer-based sequences and the pointer movements behind reversal, merging and cycle problems.",
    prerequisites: "Pointers/references and basic recursion"
  },
  "stacks-queues": {
    intro: "Master FIFO/LIFO structures and recognize when a problem is really asking for controlled access to the next or previous item.",
    prerequisites: "Arrays and basic data structures"
  },
  sorting: {
    intro: "Learn why ordering data can expose structure and make later searching, greedy and two-pointer solutions possible.",
    prerequisites: "Arrays and loops"
  },
  "binary-search": {
    intro: "Learn to eliminate half of a search space at a time, including boundary finding and binary search on an answer.",
    prerequisites: "Arrays, sorting and loop invariants"
  },
  "prefix-sum": {
    intro: "Precompute cumulative information so repeated range queries or updates can be answered efficiently.",
    prerequisites: "Arrays and basic arithmetic"
  },
  "sliding-window": {
    intro: "Maintain a moving contiguous window while updating only what enters and leaves it.",
    prerequisites: "Arrays/strings, two pointers and frequency counting"
  },
  "two-pointers": {
    intro: "Use two indices whose movement is justified by an invariant instead of checking every pair or subarray.",
    prerequisites: "Arrays, sorting and loop reasoning"
  },
  "bit-manipulation": {
    intro: "Represent and transform state at the bit level for compact, fast operations and subset-style techniques.",
    prerequisites: "Binary numbers and basic arithmetic"
  },
  recursion: {
    intro: "Learn to define a problem in terms of smaller versions of itself, with a precise base case and state.",
    prerequisites: "Functions, call stacks and basic data structures"
  },
  backtracking: {
    intro: "Systematically explore choices, undo them, and prune branches that cannot lead to a valid answer.",
    prerequisites: "Recursion and state representation"
  },
  "binary-trees": {
    intro: "Build tree intuition through recursive DFS, iterative traversal, BFS and path-based invariants.",
    prerequisites: "Recursion, queues and stacks"
  },
  "binary-search-trees": {
    intro: "Exploit the BST ordering invariant to search, insert, delete and reason about predecessor/successor relationships.",
    prerequisites: "Binary trees and recursion"
  },
  heaps: {
    intro: "Use a heap when you repeatedly need the smallest/largest item while new data arrives or priorities change.",
    prerequisites: "Arrays and logarithmic complexity"
  },
  greedy: {
    intro: "Learn when a locally optimal choice can be proved to lead to a globally optimal solution.",
    prerequisites: "Sorting, invariants and proof-style reasoning"
  },
  graphs: {
    intro: "Model relationships as vertices and edges, then choose traversal and representation based on the constraints.",
    prerequisites: "Queues, stacks and basic complexity"
  },
  "topological-sort": {
    intro: "Order dependencies in a directed acyclic graph so every prerequisite appears before what depends on it.",
    prerequisites: "Graphs, DFS/BFS and indegrees"
  },
  "shortest-path": {
    intro: "Choose a shortest-path algorithm by inspecting edge weights, constraints and whether negative edges exist.",
    prerequisites: "Graphs, heaps and BFS"
  },
  mst: {
    intro: "Connect every vertex with minimum total edge weight without creating cycles.",
    prerequisites: "Graphs, sorting and DSU/heaps"
  },
  "advanced-graphs": {
    intro: "Move beyond basic traversal into connectivity structure, Eulerian paths and strongly connected components.",
    prerequisites: "DFS/BFS and graph representations"
  },
  "dynamic-programming": {
    intro: "Turn overlapping recursive choices into reusable states: define the state, transition, base cases and evaluation order.",
    prerequisites: "Recursion, arrays and complexity analysis"
  },
  tries: {
    intro: "Represent strings by shared prefixes so prefix queries and dictionary operations become efficient.",
    prerequisites: "Trees, strings and hash maps"
  },
  "segment-trees": {
    intro: "Support range queries and updates by storing aggregate information in a hierarchical structure.",
    prerequisites: "Arrays, recursion and prefix sums"
  },
  "disjoint-set": {
    intro: "Maintain connected components under merges with near-constant amortized find/union operations.",
    prerequisites: "Graphs and trees"
  },
  "math-number-theory": {
    intro: "Use mathematical structure to reduce computation: divisibility, modular arithmetic, counting, geometry and probability.",
    prerequisites: "Basic algebra and arithmetic"
  },
  "string-algorithms": {
    intro: "Solve large-scale string matching and comparison tasks without repeatedly scanning the same characters.",
    prerequisites: "Strings, hashing and arrays"
  },
  "interview-design": {
    intro: "Practice designing robust data structures and APIs while defending trade-offs, invariants and edge cases.",
    prerequisites: "Core data structures and OOP"
  },
  "competitive-programming": {
    intro: "Train constraint reading, implementation speed, pattern recognition and algorithm selection under contest pressure.",
    prerequisites: "Core DSA and complexity analysis"
  }
};

const SPECIFIC = {
  "Time & space complexity": {
    summary: "Estimate how runtime and memory grow as input size increases; use Big-O to compare scalable approaches.",
    points: ["Count dominant operations", "Ignore constant factors for asymptotic analysis", "Consider both worst-case time and auxiliary space"],
    complexity: "Think in O(1), O(log n), O(n), O(n log n), O(n²) and beyond."
  },
  "Input/output and implementation discipline": {
    summary: "Write predictable code: parse input correctly, isolate logic, handle edge cases and keep the implementation easy to verify.",
    points: ["Match the input format exactly", "Separate input, algorithm and output", "Test empty, smallest and boundary cases"],
    complexity: "Depends on the problem; prioritize correctness before micro-optimization."
  },
  "Basic math, arrays and frequency counting": {
    summary: "Use arithmetic, indexing and frequency tables to solve small problems without unnecessary data structures.",
    points: ["Use integer types deliberately", "Track counts with arrays/maps", "Look for simple invariants before brute force"],
    complexity: "Often O(n) time with O(1) or O(k) extra space."
  },
  "Array traversal and indexing": {
    summary: "Treat an array as indexed memory and make every index movement explicit.",
    points: ["Know valid index bounds", "Separate read and write indices when needed", "Watch off-by-one errors"],
    complexity: "Single traversal is usually O(n) time and O(1) extra space."
  },
  "Hash maps and hash sets": {
    summary: "Store keys so membership and lookup are typically constant-time on average.",
    points: ["Map key → value when information is needed", "Use a set for membership", "Remember average-case vs worst-case behavior"],
    complexity: "Typical lookup/insert/delete: O(1) average."
  },
  "Slow/fast pointers": {
    summary: "Move pointers at different speeds to detect cycles or locate middle/relative positions without extra memory.",
    points: ["Fast usually moves twice as far", "Check null before dereferencing", "Use pointer movement to encode distance"],
    complexity: "Usually O(n) time and O(1) extra space."
  },
  "Merge sort and divide & conquer": {
    summary: "Split a problem into smaller parts, solve them recursively, then combine the results efficiently.",
    points: ["Define the split", "Define the merge/combine step", "Track recursion depth and temporary memory"],
    complexity: "Merge sort: O(n log n) time, O(n) auxiliary space."
  },
  "Binary search on the answer": {
    summary: "Binary-search a numeric answer when feasibility changes monotonically as the candidate answer increases or decreases.",
    points: ["Define the answer range", "Write a monotonic feasibility check", "Move bounds based on feasible/infeasible"],
    complexity: "O(log range × check-cost)."
  },
  "Fixed-size windows": {
    summary: "Maintain exactly k consecutive elements while updating the aggregate as the window moves.",
    points: ["Add the incoming element", "Remove the outgoing element", "Keep window size invariant"],
    complexity: "Usually O(n) instead of O(nk)."
  },
  "Choose → explore → undo": {
    summary: "Backtracking builds one decision at a time, explores the branch, then restores state before trying the next choice.",
    points: ["Choose", "Recurse/explore", "Undo before the next branch"],
    complexity: "Often exponential; pruning is what makes many practical cases manageable."
  },
  "State + transition + base case": {
    summary: "The DP state describes the smallest information needed; the transition derives the current answer from previous states.",
    points: ["Define exactly what dp[i] means", "Write the transition before coding", "Set base cases and evaluation order"],
    complexity: "Usually number of states × transition cost."
  },
  "Union and find": {
    summary: "DSU tracks which elements belong to the same connected component and merges components efficiently.",
    points: ["find(x) returns a representative", "union(a,b) merges components", "Use compression/rank or size"],
    complexity: "Near O(1) amortized per operation with standard optimizations."
  },
  "Pattern matching": {
    summary: "Find occurrences of a pattern without restarting the comparison from scratch after every mismatch.",
    points: ["Preprocess the pattern or text", "Reuse information from previous matches", "Choose the algorithm based on constraints"],
    complexity: "Can be linear with algorithms such as KMP."
  }
};

function genericDetails(concept, category) {
  const lower = concept.toLowerCase();
  let summary = `Understand ${concept.toLowerCase()} as a reusable technique inside ${category.name}. Focus on the invariant, when to use it, and what changes at each step.`;
  let points = ["Understand the core idea before memorizing code", "Identify the invariant or state you maintain", "Practice on a small example by hand"];
  let complexity = "Determine complexity from the number of states/operations and the extra data you store.";

  if (lower.includes("frequency")) {
    summary = `Use counting to replace repeated searching with direct frequency information while working with ${category.name.toLowerCase()}.`;
    points = ["Choose an array or hash map for counts", "Update counts as data is processed", "Compare frequencies instead of repeatedly scanning"];
    complexity = "Usually O(n) time with O(k) extra space, where k is the key/value domain."
  } else if (lower.includes("traversal")) {
    summary = `Learn a systematic way to visit every relevant element in ${category.name.toLowerCase()} without missing or revisiting work unnecessarily.`;
    points = ["Define the starting state", "Decide when a node/element is processed", "Track visited or processed state when necessary"];
    complexity = "A full traversal is typically O(n) or O(V+E), depending on the structure."
  } else if (lower.includes("range") || lower.includes("query")) {
    summary = `Precompute or organize data so repeated ${concept.toLowerCase()} operations do not rescan the entire input.`;
    points = ["Identify what information a query needs", "Separate preprocessing from query work", "Compare preprocessing cost with the number of queries"];
    complexity = "Aim to trade preprocessing/space for faster repeated queries."
  } else if (lower.includes("sorting") || lower.includes("sort")) {
    summary = `Use ordering to expose structure and simplify the ${category.name.toLowerCase()} problem.`;
    points = ["Know the required ordering", "Check whether sorting destroys useful information", "Use sorted order to justify pointer or greedy moves"];
    complexity = "Common comparison sorts are O(n log n); specialized cases can be faster."
  } else if (lower.includes("graph") || lower.includes("connect")) {
    summary = `Model the relationship as a graph concept and choose the traversal or connectivity tool that matches the constraints.`;
    points = ["Define vertices and edges", "Choose directed/undirected and weighted/unweighted models", "Track visited state and components"];
    complexity = "Many graph algorithms are O(V+E) or O((V+E) log V)."
  } else if (lower.includes("recursion") || lower.includes("recursive")) {
    summary = `Break the task into a smaller instance of the same problem and make the recursive state explicit.`;
    points = ["Write the base case first", "Define what one call is responsible for", "Ensure every recursive path makes progress"];
    complexity = "Depends on branching and work per call; draw the recursion tree when unsure."
  } else if (lower.includes("pointer")) {
    summary = `Move indices or references according to a clear invariant instead of exploring every combination.`;
    points = ["Define what each pointer represents", "Justify every pointer movement", "Check boundaries before access"];
    complexity = "Many pointer techniques reduce nested loops to O(n) time and O(1) space."
  }

  return { summary, points, complexity };
}

export function getConceptDetails(category, concept) {
  const context = CATEGORY_CONTEXT[category.id] || {
    intro: `Build a strong understanding of ${category.name}.`,
    prerequisites: "Review the previous roadmap topics."
  };
  const specific = SPECIFIC[concept] || genericDetails(concept, category);
  return {
    ...specific,
    categoryIntro: context.intro,
    prerequisites: context.prerequisites
  };
}

export function buildAiPrompt(category, concept, level) {
  const details = getConceptDetails(category, concept);
  return `Act as my DSA tutor.\n\nI am learning: ${concept}\nCategory: ${category.name}\nRoadmap level: ${level.name}\n\nContext: ${details.categoryIntro}\nPrerequisites: ${details.prerequisites}\nQuick note: ${details.summary}\n\nTeach me this concept from my current level. Start with intuition, then a small example, then the algorithm/pattern, C++ implementation guidance, time and space complexity, common mistakes, and 3 practice questions that increase in difficulty. Ask me a short check-for-understanding question at the end. Do not dump the full solution to practice questions unless I ask for it.`;
}
