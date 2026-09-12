export function createProgressSnapshot({
  problems,
  completedIds,
  starredIds,
  notesText,
  completedAt,
}) {
  return {
    problems,
    completedIds: Array.from(completedIds),
    starredIds: Array.from(starredIds),
    notesText,
    completedAt,
  };
}

export function restoreProgressSnapshot(
  snapshot,
  fallbackProblems
) {
  if (
    !snapshot ||
    typeof snapshot !== "object"
  ) {
    return null;
  }

  return {
    problems: Array.isArray(
      snapshot.problems
    )
      ? snapshot.problems
      : fallbackProblems,

    completedIds: new Set(
      Array.isArray(
        snapshot.completedIds
      )
        ? snapshot.completedIds
        : []
    ),

    starredIds: new Set(
      Array.isArray(
        snapshot.starredIds
      )
        ? snapshot.starredIds
        : []
    ),

    notesText:
      snapshot.notesText &&
      typeof snapshot.notesText ===
        "object"
        ? snapshot.notesText
        : {},

    completedAt:
      snapshot.completedAt &&
      typeof snapshot.completedAt ===
        "object"
        ? snapshot.completedAt
        : {},
  };
}