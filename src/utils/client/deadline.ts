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
  return thisYear.getTime() > now.getTime()
    ? thisYear
    : endOfDay(now.getFullYear() + 1, DEFAULT_MONTH, DEFAULT_DAY);
};

// An admin-set date (yyyy-MM-dd) wins until it has passed, then the countdown
// rolls over to the next default deadline.
export const resolveDeadline = (override: string | null, now: Date): Date => {
  if (override) {
    const [year, month, day] = override.split("-").map(Number);
    if (year && month && day) {
      const custom = endOfDay(year, month - 1, day);
      if (custom.getTime() > now.getTime()) return custom;
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
