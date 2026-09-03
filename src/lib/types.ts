export type CandidateStatus = "yeni" | "incelemede" | "mulakat" | "red";

export type Candidate = {
  id: string;
  name: string;
  role: string;
  experience: string;
  location: string;
  matchScore: number;
  skills: string[];
  status: CandidateStatus;
  uploadedAt: string;
};

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  time: string;
};

export type LeaveType = "yillik" | "mazeret" | "hastalik" | "ucretsiz";

export type LeaveStatus = "beklemede" | "onaylandi" | "reddedildi";

export type LeaveRequest = {
  id: string;
  employee: string;
  department: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
};

export type DashboardStat = {
  id: string;
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
  hint: string;
};
