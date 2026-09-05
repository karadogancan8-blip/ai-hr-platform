export const EXPENSE_STORAGE_KEY = "nexus-expenses";
export const EXPENSE_UPDATED_EVENT = "nexus-expenses-updated";

export type ExpenseCategory = "taxi" | "meal" | "entertainment";
export type ExpenseStatus = "pending" | "approved" | "rejected";

export type ExpenseRow = {
  id: string;
  employee: string;
  category: ExpenseCategory;
  amount: number;
  receipt: string;
  status: ExpenseStatus;
  createdAt: string;
};
