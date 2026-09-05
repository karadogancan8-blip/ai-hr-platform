export const PROFILE_REQUESTS_KEY = "nexus-profile-requests";
export const PROFILE_UPDATED_EVENT = "nexus-profile-updated";

export type ProfileRequestStatus = "pending" | "approved" | "rejected";

export type ProfileRequest = {
  id: string;
  employee: string;
  iban: string;
  address: string;
  emergencyName: string;
  emergencyPhone: string;
  status: ProfileRequestStatus;
  createdAt: string;
};
