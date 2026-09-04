export const TIMESHEET_STORAGE_KEY = "nexus-timesheets";
export const TIMESHEET_UPDATED_EVENT = "nexus-timesheets-updated";

export const WEEK_DAYS = ["mon", "tue", "wed", "thu", "fri"] as const;
export type WeekDay = (typeof WEEK_DAYS)[number];
export type WorkMode = "office" | "remote" | "off";
export type TimesheetStatus = "pending" | "approved" | "rejected";

export type DayMap = Record<WeekDay, WorkMode>;

export type TimesheetEntry = {
  id: string;
  employee: string;
  weekStart: string;
  days: DayMap;
  overtimeHours: number;
  note: string;
  status: TimesheetStatus;
  createdAt: string;
};

export function emptyDays(): DayMap {
  return { mon: "office", tue: "office", wed: "office", thu: "office", fri: "office" };
}

function localIso(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function mondayOf(isoDate: string) {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(y, (m || 1) - 1, d || 1);
  if (Number.isNaN(date.getTime())) return mondayOf(localIso(new Date()));
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return localIso(date);
}

export function currentMonday() {
  return mondayOf(localIso(new Date()));
}

export function weekLabel(weekStart: string) {
  const [y, m, d] = weekStart.split("-").map(Number);
  const start = new Date(y, (m || 1) - 1, d || 1);
  const end = new Date(start);
  end.setDate(start.getDate() + 4);
  return `${localIso(start)} → ${localIso(end)}`;
}

export function monthKeyFromWeek(weekStart: string) {
  return weekStart.slice(0, 7);
}

export function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function createTimesheetEntry(input: {
  employee: string;
  weekStart: string;
  days: DayMap;
  overtimeHours: number;
  note: string;
}): TimesheetEntry {
  return {
    id: crypto.randomUUID(),
    employee: input.employee.trim(),
    weekStart: mondayOf(input.weekStart),
    days: input.days,
    overtimeHours: Math.max(0, Number(input.overtimeHours) || 0),
    note: input.note.trim(),
    status: "pending",
    createdAt: new Date().toISOString(),
  };
}

export function monthlyReport(entries: TimesheetEntry[], month: string) {
  const rows = entries.filter((item) => item.status === "approved" && monthKeyFromWeek(item.weekStart) === month);
  let office = 0;
  let remote = 0;
  let overtime = 0;
  for (const row of rows) {
    overtime += row.overtimeHours;
    for (const day of WEEK_DAYS) {
      if (row.days[day] === "office") office += 1;
      if (row.days[day] === "remote") remote += 1;
    }
  }
  return { rows, office, remote, overtime };
}
