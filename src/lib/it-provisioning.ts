export const IT_PROVISION_KEY = "nexus-it-provisioning";
export const IT_PROVISION_EVENT = "nexus-it-provisioning-updated";

export type ItAppId = "google" | "slack" | "zoom";
export type ItAppStatus = "pending" | "invited" | "active";

export type ItAppItem = {
  id: ItAppId;
  status: ItAppStatus;
};

export type ItProvisionRecord = {
  employeeKey: string;
  employeeName: string;
  apps: ItAppItem[];
};

export const IT_APPS: ItAppId[] = ["google", "slack", "zoom"];

export function emptyItRecord(employeeName: string): ItProvisionRecord {
  return {
    employeeKey: employeeName.trim().toLocaleLowerCase("tr"),
    employeeName: employeeName.trim(),
    apps: IT_APPS.map((id) => ({ id, status: "pending" })),
  };
}
