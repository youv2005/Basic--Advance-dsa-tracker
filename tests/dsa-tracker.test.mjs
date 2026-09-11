import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PROBLEMS } from  '../src/data/dataset/index.js';
import { LEVELS, CATEGORIES, buildRoadmapLookups } from  '../src/data/roadmap.js';
import { validateDataset, mergeProblemSets, detectImportShape } from  '../src/utils/dataValidation.js';
import { filterProblems, DEFAULT_FILTERS, buildSearchIndex } from  '../src/utils/filterUtils.js';
import { computeStats, countStarred, countSolvedToday, countRevisionProblems, countLevelsCompleted, countTopicsCompleted } from  '../src/utils/trackerUtils.js';
import { getConceptDetails, buildAiPrompt } from '../src/data/conceptNotes.js';
import { AI_PROVIDERS } from '../src/utils/aiLinks.js';

test('dataset is structurally valid and duplicate-free', () => {
  const result = validateDataset(PROBLEMS);
  assert.equal(result.valid, true, result.errors.slice(0, 5).map(e => `${e.id}:${e.field} ${e.message}`).join('\n'));
  assert.equal(new Set(PROBLEMS.map(p => p.id)).size, PROBLEMS.length);
  assert.equal(PROBLEMS.length, 1500);
});

test('dataset exposes extensible platform mappings', () => {
  assert.ok(PROBLEMS.every(p => Array.isArray(p.platforms) && p.platforms.length >= 1));
  assert.ok(PROBLEMS.every(p => p.platforms.some(platform => platform.id === 'leetcode')));
});

test('roadmap categories belong to declared levels', () => {
  const levelIds = new Set(LEVELS.map(l => l.id));
  for (const category of CATEGORIES) assert.ok(levelIds.has(category.level), category.id);
});

test('duplicate ids are rejected inside an import', () => {
  const sample = PROBLEMS[0];
  const result = validateDataset([sample, sample]);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(e => e.field === 'id' && e.message.includes('Duplicate id')));
});

test('merge adds new ids and skips duplicates by default', () => {
  const a = { ...PROBLEMS[0], id: 'test-existing' };
  const b = { ...PROBLEMS[1], id: 'test-new' };
  const result = mergeProblemSets([a], [a, b]);
  assert.equal(result.addedCount, 1);
  assert.equal(result.replacedCount, 0);
  assert.deepEqual(result.duplicateIds, ['test-existing']);
  assert.equal(result.merged.length, 2);
});

test('merge can replace duplicate ids', () => {
  const old = { ...PROBLEMS[0], id: 'test-existing', title: 'old' };
  const incoming = { ...PROBLEMS[0], id: 'test-existing', title: 'new' };
  const result = mergeProblemSets([old], [incoming], { replaceDuplicates: true });
  assert.equal(result.replacedCount, 1);
  assert.equal(result.merged[0].title, 'new');
});

test('all filter dimensions combine with AND semantics', () => {
  const problems = PROBLEMS.slice(0, 20);
  const completed = new Set([problems[0].id]);
  const starred = new Set([problems[0].id]);
  const filters = { ...DEFAULT_FILTERS, status: 'Solved', starredOnly: true, search: problems[0].title };
  const result = filterProblems(problems, filters, completed, starred, buildSearchIndex(problems));
  assert.equal(result.length, 1);
  assert.equal(result[0].id, problems[0].id);
});

test('stats are correct for solved, starred, revision and completion', () => {
  const problems = PROBLEMS.slice(0, 3);
  const completed = new Set([problems[0].id, problems[1].id]);
  const starred = new Set([problems[1].id]);
  assert.deepEqual(computeStats(problems, completed), { solved: 2, total: 3, percent: 67 });
  assert.equal(countStarred(problems, starred), 1);
  assert.equal(countRevisionProblems([{ revisionLevel: 1 }, { revisionLevel: 0 }, { revisionLevel: 2 }]), 2);
});

test('today count uses the supplied local date', () => {
  const now = new Date(2026, 8, 8, 16, 0, 0);
  const today = new Date(2026, 8, 8, 10, 0, 0).toISOString();
  const yesterday = new Date(2026, 8, 7, 23, 59, 0).toISOString();
  assert.equal(countSolvedToday({ a: today, b: yesterday }, now), 1);
});

test('level/topic completion ignores empty sections', () => {
  const problems = [PROBLEMS.find(p => p.level === LEVELS[0].id)];
  const completed = new Set(problems.map(p => p.id));
  assert.equal(countLevelsCompleted(problems, completed, LEVELS), 1);
  assert.equal(countTopicsCompleted(problems, completed, CATEGORIES), 1);
});

test('supported import shapes are detected', () => {
  assert.equal(detectImportShape(PROBLEMS), 'array');
  assert.equal(detectImportShape({ problems: PROBLEMS }), 'dataset');
  assert.equal(detectImportShape({ completed: [], starred: [], notes: {} }), 'progress');
  assert.equal(detectImportShape({ problems: PROBLEMS, completed: [], starred: [], notes: {} }), 'backup');
});


test('every roadmap concept has a quick-learning note and AI prompt', () => {
  for (const category of CATEGORIES) {
    for (const concept of category.concepts) {
      const details = getConceptDetails(category, concept);
      assert.ok(details.summary.length > 20, `${category.id}: ${concept}`);
      assert.ok(details.points.length >= 3, `${category.id}: ${concept}`);
      const prompt = buildAiPrompt(category, concept, LEVELS.find(l => l.id === category.level));
      assert.ok(prompt.includes(concept));
    }
  }
  assert.ok(AI_PROVIDERS.length >= 4);
  assert.ok(AI_PROVIDERS.every(p => p.baseUrl.startsWith('https://')));
});
