const DEFAULT_MONTH = 11; // december
const DEFAULT_DAY = 20;

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

const endOfDay = (year: number, month: number, day: number) =>
  new Date(year, month, day, 23, 59, 59, 999);

export const nextDefaultDeadline = (now: Date): Date => {
  const thisYear = endOfDay(now.getFullYear(), DEFAULT_MONTH, DEFAULT_DAY);
  return thisYear.getTime() >= now.getTime()
    ? thisYear
    : endOfDay(now.getFullYear() + 1, DEFAULT_MONTH, DEFAULT_DAY);
};

// The stored date is the recurring anchor. Advancing the displayed year never
// changes its month/day or writes a replacement setting back to the server.
export const resolveDeadline = (override: string | null, now: Date): Date => {
  if (override && /^\d{4}-\d{2}-\d{2}$/.test(override)) {
    const [year, month, day] = override.split("-").map(Number);
    const stored = endOfDay(year, month - 1, day);
    if (
      stored.getFullYear() === year &&
      stored.getMonth() === month - 1 &&
      stored.getDate() === day
    ) {
      const occurrence = (targetYear: number) => {
        // Keep 29 February as the anchor; use 28 February in non-leap years.
        const lastDay = new Date(targetYear, month, 0).getDate();
        return endOfDay(targetYear, month - 1, Math.min(day, lastDay));
      };
      const targetYear = Math.max(year, now.getFullYear());
      const custom = occurrence(targetYear);
      return custom.getTime() >= now.getTime()
        ? custom
        : occurrence(targetYear + 1);
    }
  }
  return nextDefaultDeadline(now);
};

export const getTimeLeft = (deadline: Date, now: Date): TimeLeft => {
  const totalMs = Math.max(0, deadline.getTime() - now.getTime());
  const totalSeconds = Math.floor(totalMs / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    totalMs,
  };
};
