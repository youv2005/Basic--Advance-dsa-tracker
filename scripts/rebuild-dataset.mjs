import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const raw = JSON.parse(readFileSync(path.join(ROOT, 'scripts/raw-leetcode-metadata.json'), 'utf8'));
const outDir = path.join(ROOT, 'src/data/dataset');
mkdirSync(outDir, { recursive: true });

const levels = [
  ['beginner','Beginner',1],
  ['fundamental-ds','Fundamental Data Structures',2],
  ['searching-sorting','Searching & Sorting',3],
  ['core-patterns','Core Problem-Solving Patterns',4],
  ['recursion-backtracking','Recursion & Backtracking',5],
  ['trees','Trees',6],
  ['heaps','Heaps & Priority Queues',7],
  ['greedy','Greedy Algorithms',8],
  ['graphs','Graphs',9],
  ['dynamic-programming','Dynamic Programming',10],
  ['advanced-ds','Advanced Data Structures',11],
  ['advanced-algorithms','Advanced Algorithms',12],
  ['string-algorithms','String Algorithms',13],
  ['cp-interview-prep','Competitive Programming & Interview Prep',14],
];
const levelMap = new Map(levels.map(x => [x[0], {id:x[0],name:x[1],order:x[2]}]));

const categories = [
 ['basics','Foundations & Basics','beginner',1],
 ['arrays','Arrays','fundamental-ds',1],
 ['hashing','Hashing','fundamental-ds',2],
 ['strings-basics','Strings','fundamental-ds',3],
 ['linked-list','Linked List','fundamental-ds',4],
 ['stacks-queues','Stack & Queue','fundamental-ds',5],
 ['sorting','Important Sorting Techniques','searching-sorting',1],
 ['binary-search','Binary Search','searching-sorting',2],
 ['prefix-sum','Prefix Sum & Difference Arrays','core-patterns',1],
 ['sliding-window','Sliding Window','core-patterns',2],
 ['two-pointers','Two Pointers','core-patterns',3],
 ['bit-manipulation','Bit Manipulation','core-patterns',4],
 ['recursion','Recursion','recursion-backtracking',1],
 ['backtracking','Backtracking','recursion-backtracking',2],
 ['binary-trees','Binary Trees','trees',1],
 ['binary-search-trees','Binary Search Trees','trees',2],
 ['heaps','Heaps & Priority Queues','heaps',1],
 ['greedy','Greedy Algorithms','greedy',1],
 ['graphs','Graph Traversal & Representation','graphs',1],
 ['topological-sort','Topological Sort','graphs',2],
 ['shortest-path','Shortest Path Algorithms','graphs',3],
 ['mst','Minimum Spanning Trees','graphs',4],
 ['advanced-graphs','Advanced Graph Algorithms','graphs',5],
 ['dynamic-programming','Dynamic Programming','dynamic-programming',1],
 ['tries','Tries','advanced-ds',1],
 ['segment-trees','Segment Trees & Fenwick Trees','advanced-ds',2],
 ['disjoint-set','Disjoint Set Union','advanced-ds',3],
 ['string-algorithms','String Algorithms','string-algorithms',1],
 ['math-number-theory','Math & Number Theory','advanced-algorithms',1],
 ['interview-design','Interview & Data-Structure Design','cp-interview-prep',1],
 ['competitive-programming','Competitive Programming','cp-interview-prep',2],
];
const categoryMap = new Map(categories.map(x => [x[0], {id:x[0],name:x[1],level:x[2],order:x[3]}]));

const rules = [
 ['Minimum Spanning Tree','mst'],
 ['Shortest Path','shortest-path'],
 ['Strongly Connected Component','advanced-graphs'],
 ['Eulerian Circuit','advanced-graphs'],
 ['Biconnected Component','advanced-graphs'],
 ['Topological Sort','topological-sort'],
 ['Breadth-First Search','graphs'],
 ['Depth-First Search','graphs'],
 ['Graph','graphs'],
 ['Segment Tree','segment-trees'],
 ['Binary Indexed Tree','segment-trees'],
 ['Union Find','disjoint-set'],
 ['Trie','tries'],
 ['Binary Search Tree','binary-search-trees'],
 ['Binary Tree','binary-trees'],
 ['Tree','binary-trees'],
 ['Dynamic Programming','dynamic-programming'],
 ['Memoization','dynamic-programming'],
 ['Backtracking','backtracking'],
 ['Heap (Priority Queue)','heaps'],
 ['Greedy','greedy'],
 ['Sliding Window','sliding-window'],
 ['Two Pointers','two-pointers'],
 ['Prefix Sum','prefix-sum'],
 ['Bit Manipulation','bit-manipulation'],
 ['Bitmask','bit-manipulation'],
 ['Binary Search','binary-search'],
 ['Sorting','sorting'],
 ['Merge Sort','sorting'],
 ['Counting Sort','sorting'],
 ['Bucket Sort','sorting'],
 ['Radix Sort','sorting'],
 ['Quickselect','sorting'],
 ['Linked List','linked-list'],
 ['Doubly-Linked List','linked-list'],
 ['Monotonic Stack','stacks-queues'],
 ['Monotonic Queue','stacks-queues'],
 ['Stack','stacks-queues'],
 ['Queue','stacks-queues'],
 ['String Matching','string-algorithms'],
 ['Rolling Hash','string-algorithms'],
 ['Suffix Array','string-algorithms'],
 ['Number Theory','math-number-theory'],
 ['Combinatorics','math-number-theory'],
 ['Geometry','math-number-theory'],
 ['Game Theory','math-number-theory'],
 ['Probability and Statistics','math-number-theory'],
 ['Design','interview-design'],
 ['Data Stream','interview-design'],
 ['Iterator','interview-design'],
 ['Interactive','competitive-programming'],
 ['Ordered Set','competitive-programming'],
 ['Randomized','competitive-programming'],
 ['Reservoir Sampling','competitive-programming'],
 ['Rejection Sampling','competitive-programming'],
 ['Recursion','recursion'],
 ['String','strings-basics'],
];
const excluded = new Set(['Database','Shell','Concurrency']);

function classify(q) {
  for (const [tag, cat] of rules) if (q.topics.includes(tag)) return cat;
  if (q.topics.includes('Hash Table')) return 'hashing';
  if (q.topics.includes('Matrix')) return 'arrays';
  if (q.topics.some(t => ['Array','Simulation','Enumeration','Counting','Hash Function'].includes(t))) return 'arrays';
  if (q.topics.includes('Math')) return 'math-number-theory';
  if (q.topics.includes('String')) return 'strings-basics';
  return null;
}

function subcategory(q, cat) {
  const t = new Set(q.topics);
  const by = (a,b) => t.has(a) && t.has(b);
  if (cat === 'arrays') {
    if (t.has('Matrix')) return '2D Arrays & Matrices';
    if (t.has('Prefix Sum')) return 'Prefix / Range Techniques';
    if (t.has('Counting')) return 'Counting & Frequency';
    return '1D Arrays';
  }
  if (cat === 'hashing') return t.has('String') ? 'String Hashing' : 'Hash Maps & Sets';
  if (cat === 'strings-basics') return t.has('Two Pointers') ? 'String Traversal & Two Pointers' : 'String Fundamentals';
  if (cat === 'sorting') return t.has('Merge Sort') ? 'Merge Sort' : t.has('Quickselect') ? 'Quickselect' : 'Comparison & Linear Sorting';
  if (cat === 'binary-search') return q.title.toLowerCase().includes('rotated') ? 'Rotated Arrays' : q.title.toLowerCase().includes('minimum') || q.title.toLowerCase().includes('maximum') ? 'Binary Search on Answer' : '1D Binary Search';
  if (cat === 'dynamic-programming') {
    const s=q.title.toLowerCase();
    if (s.includes('subsequence') || s.includes('subarray')) return 'Subsequence & Subarray DP';
    if (s.includes('stock')) return 'DP on Stocks';
    if (s.includes('string') || s.includes('palindrome') || s.includes('word')) return 'String DP';
    if (s.includes('grid') || t.has('Matrix')) return '2D / Grid DP';
    return 'Core DP & State Transitions';
  }
  if (cat === 'graphs') return t.has('Breadth-First Search') ? 'BFS' : t.has('Depth-First Search') ? 'DFS' : 'Graph Fundamentals';
  if (cat === 'heaps') return t.has('Greedy') ? 'Heap + Greedy' : 'Priority Queue Patterns';
  if (cat === 'greedy') return 'Greedy Patterns';
  if (cat === 'backtracking') return t.has('String') ? 'String / Combination Search' : 'Combinations, Permutations & Search';
  if (cat === 'binary-trees') return t.has('Breadth-First Search') ? 'Level Order & BFS' : 'Traversal & Tree Recursion';
  if (cat === 'math-number-theory') return t.has('Number Theory') ? 'Number Theory' : t.has('Combinatorics') ? 'Combinatorics' : t.has('Geometry') ? 'Geometry' : 'Math Techniques';
  if (cat === 'bit-manipulation') return t.has('Bitmask') ? 'Bitmask / State Compression' : 'Bit Tricks & XOR';
  return categoryMap.get(cat)?.name || cat;
}

// Target counts for a broad, progressive 1,500-problem curriculum.
const targets = {
  basics:45, arrays:125, hashing:50, 'strings-basics':60, 'linked-list':40, 'stacks-queues':45,
  sorting:69, 'binary-search':55, 'prefix-sum':40, 'sliding-window':45, 'two-pointers':45, 'bit-manipulation':55,
  recursion:10, backtracking:40, 'binary-trees':17, 'binary-search-trees':8, heaps:60, greedy:90,
  graphs:100, 'topological-sort':25, 'shortest-path':29, mst:3, 'advanced-graphs':6,
  'dynamic-programming':218, tries:32, 'segment-trees':45, 'disjoint-set':14,
  'string-algorithms':16, 'math-number-theory':90, 'interview-design':20, 'competitive-programming':3,
};

const pool = new Map();
for (const c of Object.keys(targets)) pool.set(c, []);
for (const q of raw) {
  if (!q.title || !q.slug || !['Easy','Medium','Hard'].includes(q.difficulty)) continue;
  if (q.topics.some(t => excluded.has(t))) continue;
  const cat = classify(q);
  if (!cat || !pool.has(cat)) continue;
  pool.get(cat).push(q);
}

// Pull a few genuinely beginner-friendly Easy records into Foundations.
const genericBasicsTopics = new Set(['Array','String','Math','Hash Table','Simulation','Enumeration','Counting','Bit Manipulation','Matrix','Prefix Sum','Two Pointers','Sorting']);
const basicsPreferred = [...raw]
  .filter(q => q.difficulty === 'Easy' && !q.topics.some(t=>excluded.has(t)))
  .filter(q => q.topics.length > 0 && q.topics.every(t => genericBasicsTopics.has(t)))
  .sort((a,b)=>Number(a.frontend_id)-Number(b.frontend_id));
const used = new Set();
const chosen = [];
for (const q of basicsPreferred) {
  if (chosen.length >= targets.basics) break;
  chosen.push(q);
  used.add(q.slug);
}
if (chosen.length < targets.basics) throw new Error(`Could not find enough beginner-friendly Easy problems: ${chosen.length}/${targets.basics}`);
pool.set('basics', chosen);
for (const [cat, arr] of pool) if (cat !== 'basics') arr.sort((a,b)=>Number(a.frontend_id)-Number(b.frontend_id));

const all=[];
for (const [cat,target] of Object.entries(targets)) {
  const arr=pool.get(cat)||[];
  if (arr.length < target) throw new Error(`Not enough candidates for ${cat}: need ${target}, have ${arr.length}`);
  // Prefer a balanced difficulty mix within each category, then fill by id.
  const by={Easy:[],Medium:[],Hard:[]};
  for (const q of arr) if (!used.has(q.slug) || cat==='basics') by[q.difficulty].push(q);
  for (const a of Object.values(by)) a.sort((x,y)=>Number(x.frontend_id)-Number(y.frontend_id));
  const wanted={Easy:Math.round(target*.35),Medium:Math.round(target*.50),Hard:Math.round(target*.15)};
  const take=[];
  for (const d of ['Easy','Medium','Hard']) take.push(...by[d].slice(0,wanted[d]));
  const selectedSlugs=new Set(take.map(q=>q.slug));
  for (const q of arr) if (take.length<target && !selectedSlugs.has(q.slug)) { take.push(q); selectedSlugs.add(q.slug); }
  for (const q of take.slice(0,target)) {
    const levelId = categoryMap.get(cat).level;
    const category = categoryMap.get(cat);
    const tags=q.topics.map(t=>t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''));
    all.push({
      id:q.slug,title:q.title,leetcodeUrl:`https://leetcode.com/problems/${q.slug}/`,difficulty:q.difficulty,
      level:levelId,levelName:levelMap.get(levelId).name,category:cat,categoryName:category.name,
      subcategory:subcategory(q,cat),pattern:q.topics[0]||category.name,tags,companies:[],revisionLevel:0,
      section:'practice',platforms:[{id:'leetcode',name:'LeetCode',url:`https://leetcode.com/problems/${q.slug}/`,problemId:String(q.frontend_id)}]
    });
  }
}

// De-duplicate globally while retaining first occurrence.
const seen=new Set(); const final=[];
for (const p of all) if(!seen.has(p.id)){seen.add(p.id);final.push(p);}

// If a category could not supply its full target after global de-duplication,
// backfill from the remaining real LeetCode metadata rather than inventing
// records. This guarantees a complete 1,500-question curriculum while keeping
// the requested category balance as close as the source data allows.
if (final.length < 1500) {
  const candidates = [];
  for (const q of raw) {
    if (!q.title || !q.slug || !['Easy','Medium','Hard'].includes(q.difficulty)) continue;
    if (seen.has(q.slug) || q.topics.some(t => excluded.has(t))) continue;
    const cat = classify(q);
    if (!cat || !categoryMap.has(cat)) continue;
    candidates.push({ q, cat });
  }
  candidates.sort((a,b)=>Number(a.q.frontend_id)-Number(b.q.frontend_id));
  for (const {q,cat} of candidates) {
    if (final.length >= 1500) break;
    seen.add(q.slug);
    const levelId = categoryMap.get(cat).level;
    const category = categoryMap.get(cat);
    final.push({
      id:q.slug,title:q.title,leetcodeUrl:`https://leetcode.com/problems/${q.slug}/`,difficulty:q.difficulty,
      level:levelId,levelName:levelMap.get(levelId).name,category:cat,categoryName:category.name,
      subcategory:subcategory(q,cat),pattern:q.topics[0]||category.name,
      tags:q.topics.map(t=>t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')),
      companies:[],revisionLevel:0,section:'practice',
      platforms:[{id:'leetcode',name:'LeetCode',url:`https://leetcode.com/problems/${q.slug}/`,problemId:String(q.frontend_id)}]
    });
  }
}
if(final.length!==1500) throw new Error(`Expected 1500, got ${final.length}`);

// Stable curriculum order: level, category order, difficulty, source id.
const diffOrder={Easy:1,Medium:2,Hard:3};
final.sort((a,b)=>levelMap.get(a.level).order-levelMap.get(b.level).order || categoryMap.get(a.category).order-categoryMap.get(b.category).order || diffOrder[a.difficulty]-diffOrder[b.difficulty] || a.title.localeCompare(b.title));

for (const f of (await import('fs')).readdirSync(outDir)) if(/^batch-\d+\.json$/.test(f)) (await import('fs')).unlinkSync(path.join(outDir,f));
for(let i=0;i<final.length;i+=50){
 const batch=final.slice(i,i+50);
 writeFileSync(path.join(outDir,`batch-${String(i/50+1).padStart(2,'0')}.json`),JSON.stringify(batch,null,2)+'\n');
}
const imports=Array.from({length:30},(_,i)=>`import batch${i+1} from "./batch-${String(i+1).padStart(2,'0')}.json" with { type: "json" };`).join('\n');
const spread=Array.from({length:30},(_,i)=>`batch${i+1}`).join(', ');
writeFileSync(path.join(outDir,'index.js'),`// Auto-generated by scripts/rebuild-dataset.mjs — do not hand-edit.\n${imports}\n\nexport const PROBLEMS = [${spread}].flat();\nexport default PROBLEMS;\n`);
console.log(`Generated ${final.length} problems across 30 batches.`);
const counts={}; for(const p of final) counts[p.category]=(counts[p.category]||0)+1;
console.log(counts);
console.log('difficulty',final.reduce((a,p)=>(a[p.difficulty]++,a),{Easy:0,Medium:0,Hard:0}));
