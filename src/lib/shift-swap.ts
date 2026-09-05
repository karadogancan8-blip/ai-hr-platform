export const SHIFT_SWAP_KEY = "nexus-shift-swaps";
export const SHIFT_SWAP_EVENT = "nexus-shift-swaps-updated";

export type ShiftSlot = "morning" | "evening" | "night";
export type ShiftSwapStatus = "pending" | "approved" | "rejected";

export type ShiftSwapRequest = {
  id: string;
  fromEmployee: string;
  toEmployee: string;
  date: string;
  shift: ShiftSlot;
  note: string;
  status: ShiftSwapStatus;
  createdAt: string;
};
