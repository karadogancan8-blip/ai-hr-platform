export const ANNOUNCEMENTS_KEY = "nexus-announcements";
export const PULSE_VOTES_KEY = "nexus-enps-votes";
export const PULSE_UPDATED_EVENT = "nexus-pulse-updated";

export type CompanyAnnouncement = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
};

export type PulseVote = {
  id: string;
  month: string;
  score: number;
  createdAt: string;
};

export function currentPulseMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function averagePulse(votes: PulseVote[]) {
  if (!votes.length) return 0;
  const sum = votes.reduce((acc, item) => acc + item.score, 0);
  return Math.round((sum / votes.length) * 10) / 10;
}
