# DSA Master — Beginner to Advanced

A local-first DSA roadmap designed to take a learner from programming fundamentals to advanced algorithms, with a curated 1,500-problem LeetCode practice dataset and a schema ready for multi-platform coding profiles.

## Curriculum

- Beginner foundations
- Arrays, hashing, strings, linked lists, stacks and queues
- Sorting and binary search
- Prefix sums, sliding window, two pointers and bit manipulation
- Recursion and backtracking
- Trees, BSTs and heaps
- Greedy algorithms
- Graph traversal, topological sort, shortest paths and MST
- Dynamic programming
- Tries, segment trees, Fenwick trees and DSU
- Math, number theory and string algorithms
- Competitive programming and interview-oriented design

Every topic is presented as **Concepts → Practice Problems**, with practice further grouped by problem subtopic.

## Dataset

- 1,500 real LeetCode problem records
- 30 batches × 50 problems
- Difficulty: Easy / Medium / Hard
- Metadata only: title, URL, difficulty, curriculum mapping, tags and platform mapping
- No problem statements, solutions, hints or copied editorial content
- `platforms` is an extensible array so future records can link to Codeforces, CodeChef, AtCoder and other platforms.

## Run locally

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

Regenerate the 1,500-problem dataset from the bundled metadata source:

```bash
npm run data:build
```

Tests:

```bash
npm test
```

## Important architecture note

Progress remains local-first for now. The dataset schema is being prepared for a later backend/auth layer so users can connect coding-platform handles and synchronize progress across devices.
