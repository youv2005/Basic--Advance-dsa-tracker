// scripts/build-dataset.mjs
//
// Reusable, reproducible pipeline:
//   raw metadata -> normalize -> dedupe -> map to roadmap.js -> our schema
//   -> select per-category targets -> split into batches -> validate
//
// Source data: scripts/raw-leetcode-metadata.json — a metadata-only strip
// (frontend_id, title, difficulty, slug, topics) of the free-tier problem
// list published at github.com/neenza/leetcode-problems. No problem
// descriptions, examples, hints, or solutions are stored anywhere in this
// project — only bibliographic metadata (id/title/difficulty/URL/topics).
//
// Re-run with: node scripts/build-dataset.mjs [--dry-run]
//
// --dry-run prints the topic-mapping pool sizes per category without
// writing any files — useful for tuning CATEGORY_TARGETS before commit.

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { LEVELS, CATEGORIES } from "../src/data/roadmap.js";
import { validateDataset } from "../src/utils/dataValidation.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DATASET_DIR = path.join(ROOT, "src/data/dataset");
const DRY_RUN = process.argv.includes("--dry-run");

const levelsById = new Map(LEVELS.map((l) => [l.id, l]));
const categoriesById = new Map(CATEGORIES.map((c) => [c.id, c]));

// ---------------------------------------------------------------------
// 1. Load raw metadata + the existing, already-validated Batch 1.
// ---------------------------------------------------------------------
const raw = JSON.parse(readFileSync(path.join(__dirname, "raw-leetcode-metadata.json"), "utf8"));
const batch01 = JSON.parse(readFileSync(path.join(DATASET_DIR, "batch-01.json"), "utf8"));

const existingIds = new Set(batch01.map((p) => p.id));
const existingTitles = new Set(batch01.map((p) => p.title.toLowerCase().trim()));

console.log(`Loaded ${raw.length} raw metadata records.`);
console.log(`Preserving ${batch01.length} existing validated problems from Batch 1.`);

// ---------------------------------------------------------------------
// 2. Off-curriculum topics — these are entirely different problem types
// (SQL, shell scripting, multithreading), not DSA. Exclude outright
// rather than force them into any category.
// ---------------------------------------------------------------------
const EXCLUDED_TOPICS = new Set(["Database", "Shell", "Concurrency"]);

// ---------------------------------------------------------------------
// 3. Priority-ordered topic -> (level, category) rules. Evaluated in
// order; first match wins. This is deliberately NOT a 1:1 mapping of
// LeetCode's tags to our categories — generic tags like "Array" or
// "Math" are pushed to the bottom because they co-occur with almost
// everything, so a more specific structural tag (if present) should
// win the classification.
// ---------------------------------------------------------------------
const RULES = [
  { tag: "Segment Tree", level: "advanced-ds", category: "segment-trees" },
  { tag: "Binary Indexed Tree", level: "advanced-ds", category: "segment-trees" },
  { tag: "Union Find", level: "advanced-ds", category: "disjoint-set" },
  { tag: "Minimum Spanning Tree", level: "advanced-algorithms", category: "advanced-graphs" },
  { tag: "Shortest Path", level: "advanced-algorithms", category: "advanced-graphs" },
  { tag: "Strongly Connected Component", level: "advanced-algorithms", category: "advanced-graphs" },
  { tag: "Eulerian Circuit", level: "advanced-algorithms", category: "advanced-graphs" },
  { tag: "Biconnected Component", level: "advanced-algorithms", category: "advanced-graphs" },
  { tag: "Topological Sort", level: "graphs", category: "graphs" },
  { tag: "Graph", level: "graphs", category: "graphs" },
  { tag: "String Matching", level: "string-algorithms", category: "string-algorithms" },
  { tag: "Rolling Hash", level: "string-algorithms", category: "string-algorithms" },
  { tag: "Suffix Array", level: "string-algorithms", category: "string-algorithms" },
  // Dynamic Programming and Backtracking are checked before Trie: a
  // handful of problems (Word Break, Concatenated Words, Palindrome
  // Pairs) carry a secondary "Trie" tag as an alternate optimization,
  // but their curriculum-defining technique is DP/backtracking, not
  // the trie data structure itself.
  { tag: "Dynamic Programming", level: "dynamic-programming", category: "dynamic-programming" },
  { tag: "Backtracking", level: "recursion-backtracking", category: "backtracking" },
  { tag: "Trie", level: "advanced-ds", category: "tries" },
  { tag: "Binary Search Tree", level: "trees", category: "binary-search-trees" },
  { tag: "Binary Tree", level: "trees", category: "binary-trees" },
  { tag: "Tree", level: "trees", category: "binary-trees" },
  { tag: "Heap (Priority Queue)", level: "heaps", category: "heaps" },
  { tag: "Greedy", level: "greedy", category: "greedy" },
  { tag: "Sliding Window", level: "core-patterns", category: "sliding-window-two-pointer" },
  { tag: "Two Pointers", level: "core-patterns", category: "sliding-window-two-pointer" },
  { tag: "Bit Manipulation", level: "core-patterns", category: "bit-manipulation" },
  { tag: "Bitmask", level: "core-patterns", category: "bit-manipulation" },
  { tag: "Binary Search", level: "searching-sorting", category: "binary-search" },
  { tag: "Sorting", level: "searching-sorting", category: "sorting" },
  { tag: "Merge Sort", level: "searching-sorting", category: "sorting" },
  { tag: "Counting Sort", level: "searching-sorting", category: "sorting" },
  { tag: "Bucket Sort", level: "searching-sorting", category: "sorting" },
  { tag: "Radix Sort", level: "searching-sorting", category: "sorting" },
  { tag: "Quickselect", level: "searching-sorting", category: "sorting" },
  // Linked List (a structural data-structure signal) is checked before
  // Recursion: many linked-list problems (Reverse Linked List, Merge
  // Two Sorted Lists) are also tagged "Recursion" because one *solution
  // approach* is recursive, but the curriculum slot that teaches them
  // is Linked List, not "how recursion works."
  { tag: "Linked List", level: "fundamental-ds", category: "linked-list" },
  { tag: "Doubly-Linked List", level: "fundamental-ds", category: "linked-list" },
  { tag: "Monotonic Stack", level: "fundamental-ds", category: "stacks-queues" },
  { tag: "Monotonic Queue", level: "fundamental-ds", category: "stacks-queues" },
  { tag: "Stack", level: "fundamental-ds", category: "stacks-queues" },
  { tag: "Queue", level: "fundamental-ds", category: "stacks-queues" },
  { tag: "Design", level: "cp-interview-prep", category: "cp-interview-prep" },
  { tag: "Data Stream", level: "cp-interview-prep", category: "cp-interview-prep" },
  { tag: "Iterator", level: "cp-interview-prep", category: "cp-interview-prep" },
  { tag: "Interactive", level: "cp-interview-prep", category: "cp-interview-prep" },
  { tag: "Ordered Set", level: "cp-interview-prep", category: "cp-interview-prep" },
  { tag: "Randomized", level: "cp-interview-prep", category: "cp-interview-prep" },
  { tag: "Reservoir Sampling", level: "cp-interview-prep", category: "cp-interview-prep" },
  { tag: "Rejection Sampling", level: "cp-interview-prep", category: "cp-interview-prep" },
  { tag: "Divide and Conquer", level: "advanced-algorithms", category: "math-number-theory" },
  { tag: "Game Theory", level: "advanced-algorithms", category: "math-number-theory" },
  { tag: "Number Theory", level: "advanced-algorithms", category: "math-number-theory" },
  { tag: "Combinatorics", level: "advanced-algorithms", category: "math-number-theory" },
  { tag: "Geometry", level: "advanced-algorithms", category: "math-number-theory" },
  { tag: "Probability and Statistics", level: "advanced-algorithms", category: "math-number-theory" },
  { tag: "Memoization", level: "dynamic-programming", category: "dynamic-programming" },
  // Recursion sits near the bottom deliberately: it's an implementation
  // detail of huge swaths of the curriculum (trees, linked lists,
  // backtracking, DP, divide & conquer all commonly carry this tag
  // too), so it should only decide classification for problems with no
  // stronger structural signal at all — e.g. Fibonacci Number, Pow(x,n).
  { tag: "Recursion", level: "recursion-backtracking", category: "recursion" },
  { tag: "String", level: "fundamental-ds", category: "strings-basics" },
];

// Easy problems whose *only* real signal is generic "Math" (no other
// rule above matched) read as beginner fundamentals, not advanced
// number theory — capped so Basics doesn't run away from its target.
const BASICS_CAP = 30;
let basicsAdded = 0;

function classify(topics) {
  for (const rule of RULES) {
    if (topics.includes(rule.tag)) {
      return { level: rule.level, category: rule.category, drivingTag: rule.tag };
    }
  }
  if (topics.includes("Math") && basicsAdded < BASICS_CAP) {
    return { level: "beginner", category: "basics", drivingTag: "Math" };
  }
  if (topics.includes("Math")) {
    return { level: "advanced-algorithms", category: "math-number-theory", drivingTag: "Math" };
  }
  // Final generic catch-all: Array / Matrix / Prefix Sum / Hash Table /
  // Counting / Simulation / Enumeration all read as core array practice
  // in this curriculum.
  const genericArraySignals = ["Array", "Matrix", "Prefix Sum", "Hash Table", "Counting", "Simulation", "Enumeration", "Hash Function"];
  if (topics.some((t) => genericArraySignals.includes(t))) {
    return { level: "fundamental-ds", category: "arrays", drivingTag: topics.find((t) => genericArraySignals.includes(t)) };
  }
  return null; // genuinely unmappable — excluded, not forced
}

// ---------------------------------------------------------------------
// 4. Normalize + dedupe + classify every raw record.
// ---------------------------------------------------------------------
const seenSlugs = new Set();
const candidatesByCategory = new Map(); // "level/category" -> array

let excludedOffCurriculum = 0;
let excludedDuplicate = 0;
let excludedUnmapped = 0;
let excludedMalformed = 0;

for (const q of raw) {
  if (!q.title || !q.slug || !q.difficulty || !Array.isArray(q.topics)) {
    excludedMalformed++;
    continue;
  }
  if (!["Easy", "Medium", "Hard"].includes(q.difficulty)) {
    excludedMalformed++;
    continue;
  }
  if (q.topics.some((t) => EXCLUDED_TOPICS.has(t))) {
    excludedOffCurriculum++;
    continue;
  }
  const titleLower = q.title.toLowerCase().trim();
  if (existingIds.has(q.slug) || existingTitles.has(titleLower) || seenSlugs.has(q.slug)) {
    excludedDuplicate++;
    continue;
  }

  const classification = classify(q.topics);
  if (!classification) {
    excludedUnmapped++;
    continue;
  }

  const level = levelsById.get(classification.level);
  const category = categoriesById.get(classification.category);
  if (!level || !category || category.level !== level.id) {
    // Should never happen given the rule table above, but guard anyway
    // rather than ever emit a broken level/category pair.
    excludedUnmapped++;
    continue;
  }

  if (classification.level === "beginner" && classification.category === "basics") {
    basicsAdded++;
  }

  seenSlugs.add(q.slug);
  const key = `${classification.level}/${classification.category}`;
  if (!candidatesByCategory.has(key)) candidatesByCategory.set(key, []);

  const secondaryTags = q.topics.filter((t) => t !== classification.drivingTag).slice(0, 2);
  candidatesByCategory.get(key).push({
    id: q.slug,
    title: q.title,
    leetcodeUrl: `https://leetcode.com/problems/${q.slug}/`,
    difficulty: q.difficulty,
    level: level.id,
    levelName: level.name,
    category: category.id,
    categoryName: category.name,
    subcategory: secondaryTags.length > 0 ? secondaryTags.join(" / ") : classification.drivingTag,
    pattern: classification.drivingTag,
    tags: q.topics.map((t) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")),
    companies: [], // not present in this source — left empty rather than fabricated
    revisionLevel: 0,
    _frontendId: Number(q.frontend_id) || 999999,
  });
}

console.log(`\nExcluded — off-curriculum (SQL/shell/concurrency): ${excludedOffCurriculum}`);
console.log(`Excluded — duplicate of Batch 1: ${excludedDuplicate}`);
console.log(`Excluded — malformed record: ${excludedMalformed}`);
console.log(`Excluded — no confident category mapping: ${excludedUnmapped}`);

console.log("\n--- Candidate pool sizes per category (before target selection) ---");
const poolReport = [...candidatesByCategory.entries()]
  .map(([key, arr]) => ({ key, count: arr.length }))
  .sort((a, b) => b.count - a.count);
poolReport.forEach(({ key, count }) => console.log(`${String(count).padStart(5)}  ${key}`));

if (DRY_RUN) {
  console.log("\n--dry-run: stopping before selection/writing.");
  process.exit(0);
}

// ---------------------------------------------------------------------
// 5. Per-category targets. Informed by the curriculum's suggested
// level-level ranges, minus what Batch 1 already contributes (basics:
// 25, arrays: 25), and never exceeding the real candidate pool found
// above — several land a little under the suggested range rather than
// force in weakly-mapped or duplicate-flavored extras.
// ---------------------------------------------------------------------
const TARGETS = {
  "beginner/basics": 4,
  "fundamental-ds/arrays": 9,
  "fundamental-ds/linked-list": 15,
  "fundamental-ds/stacks-queues": 13,
  "fundamental-ds/strings-basics": 13,
  "searching-sorting/sorting": 17,
  "searching-sorting/binary-search": 18,
  "core-patterns/sliding-window-two-pointer": 18,
  "core-patterns/bit-manipulation": 16,
  "recursion-backtracking/recursion": 9,
  "recursion-backtracking/backtracking": 16,
  "trees/binary-trees": 26,
  "trees/binary-search-trees": 14,
  "heaps/heaps": 15,
  "greedy/greedy": 20,
  "graphs/graphs": 46,
  "dynamic-programming/dynamic-programming": 55,
  "advanced-ds/tries": 9,
  "advanced-ds/segment-trees": 8,
  "advanced-ds/disjoint-set": 8,
  "advanced-algorithms/advanced-graphs": 12,
  "advanced-algorithms/math-number-theory": 8,
  "string-algorithms/string-algorithms": 15,
  "cp-interview-prep/cp-interview-prep": 16,
};

// Global difficulty target ~35% Easy / 50% Medium / 15% Hard. Applied
// per-category against whatever that category's pool can actually
// support — never invented, just prioritized within what exists.
const DIFFICULTY_RATIO = { Easy: 0.35, Medium: 0.5, Hard: 0.15 };

function selectForCategory(pool, target) {
  const byDifficulty = { Easy: [], Medium: [], Hard: [] };
  pool.forEach((p) => byDifficulty[p.difficulty].push(p));
  Object.values(byDifficulty).forEach((arr) => arr.sort((a, b) => a._frontendId - b._frontendId));

  const wanted = {
    Easy: Math.round(target * DIFFICULTY_RATIO.Easy),
    Medium: Math.round(target * DIFFICULTY_RATIO.Medium),
    Hard: Math.round(target * DIFFICULTY_RATIO.Hard),
  };

  const selected = [];
  const remainder = { Easy: [], Medium: [], Hard: [] };
  ["Easy", "Medium", "Hard"].forEach((d) => {
    const take = Math.min(wanted[d], byDifficulty[d].length);
    selected.push(...byDifficulty[d].slice(0, take));
    remainder[d] = byDifficulty[d].slice(take);
  });

  // If a difficulty bucket came up short (pool didn't have enough),
  // backfill from whatever's left in the other *scarce* buckets first;
  // only reach for Medium's (usually large) surplus as a last resort,
  // or every shortfall would get patched with Medium and skew the
  // whole dataset away from the target ratio.
  let backfill = [...remainder.Easy, ...remainder.Hard, ...remainder.Medium];
  while (selected.length < target && backfill.length > 0) {
    selected.push(backfill.shift());
  }

  return selected.slice(0, target);
}

const generated = [];
for (const [key, target] of Object.entries(TARGETS)) {
  const pool = candidatesByCategory.get(key) || [];
  const picked = selectForCategory(pool, target);
  picked.forEach((p) => {
    const { _frontendId, ...clean } = p;
    generated.push(clean);
  });
}

console.log(`\nGenerated ${generated.length} new problems from the raw dataset.`);
console.log(`Combined with Batch 1's ${batch01.length} = ${generated.length + batch01.length} total.`);

// ---------------------------------------------------------------------
// 6. Assemble full dataset (Batch 1 first, untouched) and validate.
// ---------------------------------------------------------------------
const fullDataset = [...batch01, ...generated];

function report(title, value) {
  console.log(`${title}: ${JSON.stringify(value)}`);
}

console.log("\n=== VALIDATION ===");

// Duplicate checks (script-level, independent of the app validator)
const idCounts = {};
fullDataset.forEach((p) => (idCounts[p.id] = (idCounts[p.id] || 0) + 1));
const dupIds = Object.entries(idCounts).filter(([, c]) => c > 1).map(([id]) => id);

const urlCounts = {};
fullDataset.forEach((p) => (urlCounts[p.leetcodeUrl] = (urlCounts[p.leetcodeUrl] || 0) + 1));
const dupUrls = Object.entries(urlCounts).filter(([, c]) => c > 1).map(([u]) => u);

const titleCounts = {};
fullDataset.forEach((p) => {
  const t = p.title.toLowerCase().trim();
  titleCounts[t] = (titleCounts[t] || 0) + 1;
});
const dupTitles = Object.entries(titleCounts).filter(([, c]) => c > 1).map(([t]) => t);

report("Total problems", fullDataset.length);
report("Duplicate IDs", dupIds);
report("Duplicate URLs", dupUrls);
report("Duplicate titles", dupTitles);

// Reuse the app's own schema/roadmap validator — the same code path
// the running app uses on import — rather than a second hand-rolled
// implementation of the same rules.
const appValidation = validateDataset(fullDataset);
report("App validator result", { valid: appValidation.valid, errorCount: appValidation.errors.length });
if (appValidation.errors.length > 0) {
  console.log("First 20 app-validator errors:");
  appValidation.errors.slice(0, 20).forEach((e) => console.log(`  [${e.id}] ${e.field}: ${e.message}`));
}

const diffCounts = { Easy: 0, Medium: 0, Hard: 0 };
fullDataset.forEach((p) => diffCounts[p.difficulty]++);
const diffPct = Object.fromEntries(
  Object.entries(diffCounts).map(([k, v]) => [k, `${v} (${((v / fullDataset.length) * 100).toFixed(1)}%)`])
);
report("Difficulty distribution", diffPct);

console.log("\nProblems per level:");
const perLevel = {};
fullDataset.forEach((p) => (perLevel[p.levelName] = (perLevel[p.levelName] || 0) + 1));
LEVELS.sort((a, b) => a.order - b.order).forEach((l) => console.log(`  ${String(perLevel[l.name] || 0).padStart(3)}  ${l.name}`));

console.log("\nProblems per category:");
const perCategory = {};
fullDataset.forEach((p) => (perCategory[`${p.levelName} / ${p.categoryName}`] = (perCategory[`${p.levelName} / ${p.categoryName}`] || 0) + 1));
Object.entries(perCategory)
  .sort((a, b) => b[1] - a[1])
  .forEach(([k, v]) => console.log(`  ${String(v).padStart(3)}  ${k}`));

const overallValid =
  dupIds.length === 0 && dupUrls.length === 0 && dupTitles.length === 0 && appValidation.valid && fullDataset.length >= 400;

console.log(`\nOVERALL VALIDATION: ${overallValid ? "PASS" : "FAIL"}`);

if (!overallValid) {
  console.log("\nStopping before writing files — fix the issues above and re-run.");
  process.exit(1);
}

// ---------------------------------------------------------------------
// 7. Split into ~50-problem batch files + index.js. Batch 1 is written
// back out unchanged (same 50 problems, same order).
// ---------------------------------------------------------------------
mkdirSync(DATASET_DIR, { recursive: true });
const BATCH_SIZE = 50;
const batches = [];
for (let i = 0; i < fullDataset.length; i += BATCH_SIZE) {
  batches.push(fullDataset.slice(i, i + BATCH_SIZE));
}

batches.forEach((batch, i) => {
  const num = String(i + 1).padStart(2, "0");
  writeFileSync(path.join(DATASET_DIR, `batch-${num}.json`), JSON.stringify(batch, null, 2) + "\n");
});

const indexContent =
  `// Auto-generated by scripts/build-dataset.mjs — do not hand-edit.\n` +
  `// Combines every batch file into one dataset the app imports as a\n` +
  `// single array, so components never need the raw batch files.\n\n` +
  batches.map((_, i) => `import batch${i + 1} from "./batch-${String(i + 1).padStart(2, "0")}.json" with { type: "json" };`).join("\n") +
  `\n\nexport const PROBLEMS = [${batches.map((_, i) => `...batch${i + 1}`).join(", ")}];\n` +
  `\nexport default PROBLEMS;\n`;

writeFileSync(path.join(DATASET_DIR, "index.js"), indexContent);

console.log(`\nWrote ${batches.length} batch files + index.js to ${path.relative(ROOT, DATASET_DIR)}/`);

