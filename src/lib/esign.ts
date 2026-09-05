export const ESIGN_STORAGE_KEY = "nexus-esign-packets";
export const ESIGN_UPDATED_EVENT = "nexus-esign-updated";

export type EsignTemplate = "contract" | "nda" | "asset";
export type EsignStatus = "pending" | "signed";

export type EsignPacket = {
  id: string;
  employee: string;
  template: EsignTemplate;
  status: EsignStatus;
  typedName: string;
  signatureDataUrl: string;
  createdAt: string;
  signedAt: string;
};
