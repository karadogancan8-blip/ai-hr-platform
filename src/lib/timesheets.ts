import type { LeaveRequest } from "./types";

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

export function normalizeEmployeeName(name: string) {
  return name.trim().replace(/\s+/g, " ").toLocaleLowerCase("tr");
}

export function addDaysIso(iso: string, days: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, (m || 1) - 1, (d || 1) + days);
  return localIso(date);
}

export function isoForWeekDay(weekStart: string, day: WeekDay) {
  return addDaysIso(weekStart, WEEK_DAYS.indexOf(day));
}

export function weekDayFromIso(iso: string): WeekDay | null {
  const [y, m, d] = iso.split("-").map(Number);
  const dow = new Date(y, (m || 1) - 1, d || 1).getDay();
  if (dow === 0 || dow === 6) return null;
  return WEEK_DAYS[dow - 1] ?? null;
}

export function businessDaysInMonth(month: string) {
  const [y, m] = month.split("-").map(Number);
  const last = new Date(y, m, 0).getDate();
  let count = 0;
  for (let day = 1; day <= last; day += 1) {
    const dow = new Date(y, m - 1, day).getDay();
    if (dow !== 0 && dow !== 6) count += 1;
  }
  return count;
}

export function weekdayDatesInMonth(start: string, end: string, month: string) {
  if (!start || !end) return [];
  const [sy, sm, sd] = start.split("-").map(Number);
  const [ey, em, ed] = end.split("-").map(Number);
  const cursor = new Date(sy, (sm || 1) - 1, sd || 1);
  const last = new Date(ey, (em || 1) - 1, ed || 1);
  if (Number.isNaN(cursor.getTime()) || Number.isNaN(last.getTime()) || cursor > last) return [];
  const dates: string[] = [];
  while (cursor <= last) {
    const iso = localIso(cursor);
    const dow = cursor.getDay();
    if (dow !== 0 && dow !== 6 && iso.startsWith(month)) dates.push(iso);
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

export function approvedLeaveDaysInMonth(leaves: LeaveRequest[], month: string, employee?: string) {
  const target = employee ? normalizeEmployeeName(employee) : null;
  const unique = new Set<string>();
  for (const leave of leaves) {
    if (leave.status !== "onaylandi") continue;
    if (target && normalizeEmployeeName(leave.employee) !== target) continue;
    for (const iso of weekdayDatesInMonth(leave.startDate, leave.endDate, month)) {
      unique.add(`${normalizeEmployeeName(leave.employee)}:${iso}`);
    }
  }
  if (target) {
    return [...unique].filter((key) => key.startsWith(`${target}:`)).length;
  }
  return unique.size;
}

export type EmployeePayrollRow = {
  employee: string;
  office: number;
  remote: number;
  leaveDays: number;
  businessDays: number;
  workDays: number;
  missing: number;
  overtime: number;
};

export type MonthPayroll = {
  month: string;
  businessDays: number;
  office: number;
  remote: number;
  leaveDays: number;
  workDays: number;
  missing: number;
  overtime: number;
  employees: EmployeePayrollRow[];
  activeWeeks: TimesheetEntry[];
};

function activeMonthWeeks(entries: TimesheetEntry[], month: string) {
  return entries.filter((item) => {
    if (item.status === "rejected") return false;
    return WEEK_DAYS.some((day) => isoForWeekDay(item.weekStart, day).startsWith(month));
  });
}

export function computeMonthPayroll(entries: TimesheetEntry[], leaves: LeaveRequest[], month: string): MonthPayroll {
  const businessDays = businessDaysInMonth(month);
  const activeWeeks = activeMonthWeeks(entries, month);
  const names = new Set<string>();
  for (const row of activeWeeks) names.add(row.employee.trim() || "—");
  for (const leave of leaves) {
    if (leave.status === "onaylandi" && weekdayDatesInMonth(leave.startDate, leave.endDate, month).length) {
      names.add(leave.employee.trim() || "—");
    }
  }

  const employees: EmployeePayrollRow[] = [...names]
    .sort((a, b) => a.localeCompare(b, "tr"))
    .map((employee) => {
      let office = 0;
      let remote = 0;
      let overtime = 0;
      for (const row of activeWeeks) {
        if (normalizeEmployeeName(row.employee) !== normalizeEmployeeName(employee)) continue;
        overtime += row.overtimeHours;
        for (const day of WEEK_DAYS) {
          const iso = isoForWeekDay(row.weekStart, day);
          if (!iso.startsWith(month)) continue;
          if (row.days[day] === "office") office += 1;
          if (row.days[day] === "remote") remote += 1;
        }
      }
      const leaveDays = approvedLeaveDaysInMonth(leaves, month, employee);
      const workDays = Math.max(0, businessDays - leaveDays);
      const missing = Math.max(0, workDays - office - remote);
      return { employee, office, remote, leaveDays, businessDays, workDays, missing, overtime };
    });

  const office = employees.reduce((sum, row) => sum + row.office, 0);
  const remote = employees.reduce((sum, row) => sum + row.remote, 0);
  const leaveDays = employees.reduce((sum, row) => sum + row.leaveDays, 0);
  const workDays =
    employees.length > 0
      ? employees.reduce((sum, row) => sum + row.workDays, 0)
      : Math.max(0, businessDays - approvedLeaveDaysInMonth(leaves, month));
  const missing = employees.reduce((sum, row) => sum + row.missing, 0);
  const overtime = employees.reduce((sum, row) => sum + row.overtime, 0);

  return {
    month,
    businessDays,
    office,
    remote,
    leaveDays: employees.length ? leaveDays : approvedLeaveDaysInMonth(leaves, month),
    workDays,
    missing,
    overtime,
    employees,
    activeWeeks,
  };
}

/** Marks approved leave weekdays as "off" on matching active timesheet weeks. */
export function syncTimesheetsWithApprovedLeave(
  entries: TimesheetEntry[],
  leaves: LeaveRequest[],
  month: string,
): TimesheetEntry[] {
  const next = entries.map((row) => ({ ...row, days: { ...row.days } }));
  let changed = false;

  for (const leave of leaves) {
    if (leave.status !== "onaylandi") continue;
    for (const iso of weekdayDatesInMonth(leave.startDate, leave.endDate, month)) {
      const day = weekDayFromIso(iso);
      if (!day) continue;
      const weekStart = mondayOf(iso);
      const index = next.findIndex(
        (row) =>
          row.status !== "rejected" &&
          row.weekStart === weekStart &&
          normalizeEmployeeName(row.employee) === normalizeEmployeeName(leave.employee),
      );
      if (index >= 0 && next[index].days[day] !== "off") {
        next[index].days[day] = "off";
        changed = true;
      }
    }
  }

  return changed ? next : entries;
}

export function monthlyReport(entries: TimesheetEntry[], month: string, leaves: LeaveRequest[] = []) {
  const payroll = computeMonthPayroll(entries, leaves, month);
  return {
    rows: payroll.activeWeeks.filter((item) => item.status === "approved"),
    office: payroll.office,
    remote: payroll.remote,
    overtime: payroll.overtime,
    leaveDays: payroll.leaveDays,
    workDays: payroll.workDays,
    businessDays: payroll.businessDays,
    missing: payroll.missing,
    employees: payroll.employees,
  };
}
