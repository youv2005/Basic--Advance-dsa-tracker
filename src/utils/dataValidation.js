// Field-level validation + merge logic for imported problem data.
// Pure functions — no DOM, no localStorage — so they're easy to unit
// test in isolation from the UI.

import { buildRoadmapLookups } from "../data/roadmap.js";

const DIFFICULTIES = ["Easy", "Medium", "Hard"];
const REQUIRED_FIELDS = [
  "id",
  "title",
  "leetcodeUrl",
  "difficulty",
  "level",
  "levelName",
  "category",
  "categoryName",
];

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidHttpUrl(value) {
  if (!isNonEmptyString(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateProblemShape(problem, lookups = buildRoadmapLookups()) {
  const { levelsById, categoriesById } = lookups;
  const errors = [];
  const id = problem && isNonEmptyString(problem.id) ? problem.id : "(missing id)";
  const fieldError = (field, message) => errors.push({ id, field, message });

  if (!problem || typeof problem !== "object" || Array.isArray(problem)) {
    return [{ id, field: "(root)", message: "Problem entry is not a valid object." }];
  }

  REQUIRED_FIELDS.forEach((field) => {
    if (!isNonEmptyString(problem[field])) {
      fieldError(field, `Missing or empty required field "${field}".`);
    }
  });

  if (isNonEmptyString(problem.leetcodeUrl) && !isValidHttpUrl(problem.leetcodeUrl)) {
    fieldError("leetcodeUrl", `"${problem.leetcodeUrl}" is not a valid http(s) URL.`);
  }

  if (isNonEmptyString(problem.difficulty) && !DIFFICULTIES.includes(problem.difficulty)) {
    fieldError("difficulty", `"${problem.difficulty}" must be one of Easy, Medium, Hard.`);
  }

  const level = isNonEmptyString(problem.level) ? levelsById.get(problem.level) : null;
  if (isNonEmptyString(problem.level) && !level) {
    fieldError("level", `Level id "${problem.level}" does not exist in roadmap.js.`);
  }

  const category = isNonEmptyString(problem.category) ? categoriesById.get(problem.category) : null;
  if (isNonEmptyString(problem.category) && !category) {
    fieldError("category", `Category id "${problem.category}" does not exist in roadmap.js.`);
  }

  if (level && category && category.level !== level.id) {
    fieldError(
      "category",
      `Category "${problem.category}" belongs to level "${category.level}", not "${problem.level}".`
    );
  }

  if (level && isNonEmptyString(problem.levelName) && problem.levelName !== level.name) {
    fieldError(
      "levelName",
      `"${problem.levelName}" does not match roadmap name "${level.name}" for level "${problem.level}".`
    );
  }

  if (category && isNonEmptyString(problem.categoryName) && problem.categoryName !== category.name) {
    fieldError(
      "categoryName",
      `"${problem.categoryName}" does not match roadmap name "${category.name}" for category "${problem.category}".`
    );
  }

  if (problem.tags !== undefined && !Array.isArray(problem.tags)) {
    fieldError("tags", `"tags" must be an array if provided.`);
  }
  if (problem.companies !== undefined && !Array.isArray(problem.companies)) {
    fieldError("companies", `"companies" must be an array if provided.`);
  }

  return errors;
}

// Validates an entire imported batch: per-problem shape errors plus
// duplicate id detection *within the batch itself*.
export function validateDataset(problems) {
  if (!Array.isArray(problems)) {
    return {
      valid: false,
      errors: [{ id: "(root)", field: "(root)", message: "Import must be an array of problems." }],
    };
  }

  const lookups = buildRoadmapLookups();
  const errors = [];
  const seenIds = new Set();

  problems.forEach((problem) => {
    errors.push(...validateProblemShape(problem, lookups));
    if (isNonEmptyString(problem?.id)) {
      if (seenIds.has(problem.id)) {
        errors.push({
          id: problem.id,
          field: "id",
          message: `Duplicate id "${problem.id}" appears more than once in this import.`,
        });
      }
      seenIds.add(problem.id);
    }
  });

  return { valid: errors.length === 0, errors };
}

// Detects which of the supported shapes a parsed JSON payload matches:
// a raw array, a { problems } dataset export, a { completed/starred/
// notes } progress export, or a full backup with both.
export function detectImportShape(parsed) {
  if (Array.isArray(parsed)) return "array";
  if (parsed && typeof parsed === "object") {
    const hasProblems = Array.isArray(parsed.problems);
    const hasProgress =
      parsed.completed !== undefined || parsed.starred !== undefined || parsed.notes !== undefined;
    if (hasProblems && hasProgress) return "backup";
    if (hasProblems) return "dataset";
    if (hasProgress) return "progress";
  }
  return "unknown";
}

// Pulls the problems array out of any supported import shape.
export function extractProblems(parsed) {
  if (Array.isArray(parsed)) return parsed;
  if (parsed && Array.isArray(parsed.problems)) return parsed.problems;
  return [];
}

// Merges an incoming batch into the existing dataset by id. New ids
// are appended; duplicate ids are reported, and only overwritten
// when replaceDuplicates is true.
export function mergeProblemSets(existingProblems, incomingProblems, { replaceDuplicates = false } = {}) {
  const merged = [...existingProblems];
  const indexById = new Map(merged.map((p, i) => [p.id, i]));
  const duplicateIds = [];
  let addedCount = 0;
  let replacedCount = 0;

  incomingProblems.forEach((problem) => {
    if (indexById.has(problem.id)) {
      duplicateIds.push(problem.id);
      if (replaceDuplicates) {
        merged[indexById.get(problem.id)] = problem;
        replacedCount += 1;
      }
    } else {
      indexById.set(problem.id, merged.length);
      merged.push(problem);
      addedCount += 1;
    }
  });

  return { merged, duplicateIds, addedCount, replacedCount };
}
