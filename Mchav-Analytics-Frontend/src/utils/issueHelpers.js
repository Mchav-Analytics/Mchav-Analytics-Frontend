// ─────────────────────────────────────────────────────────
// Fuente única de verdad para clasificar issues.
// Centraliza los estados/prioridades y las funciones que
// los usan, para que todos los componentes queden sincronizados.
// ─────────────────────────────────────────────────────────

export const DONE_STATUSES = ['Done', 'Finalizado', 'Cerrado'];

export const IN_PROGRESS_STATUSES = ['In Progress', 'En curso', 'En revisión'];

export const CRITICAL_PRIORITIES = ['Highest', 'Critical'];

export const BOTTLENECK_CYCLE_TIME_DAYS = 5;

export const isCompleted = (issue) => DONE_STATUSES.includes(issue.status);

export const isActive = (issue) => IN_PROGRESS_STATUSES.includes(issue.status);

export const isCriticalBug = (issue) =>
  issue && issue.type === 'Bug' && !isCompleted(issue) && CRITICAL_PRIORITIES.includes(issue.priority);

export const isBottleneck = (issue) =>
  issue && isActive(issue) && issue.cycle_time >= BOTTLENECK_CYCLE_TIME_DAYS;

// Calcula variación porcentual entre dos valores, redondeada a entero.
// Devuelve null si no hay valor previo disponible.
export const percentChange = (current, previous) => {
  if (previous === null || previous === undefined || previous === 0) return null;
  if (current === null || current === undefined) return null;
  return Math.round(((current - previous) / previous) * 100);
};
