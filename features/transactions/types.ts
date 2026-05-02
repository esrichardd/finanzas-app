import type { TxType } from "@/features/dashboard/types";

export interface TxFilters {
  search: string;
  type: TxType | "all";
  account: string; // account id o "all"
  dateFrom: string; // YYYY-MM-DD o ""
  dateTo: string; // YYYY-MM-DD o ""
}

export const DEFAULT_FILTERS: TxFilters = {
  search: "",
  type: "all",
  account: "all",
  dateFrom: "",
  dateTo: "",
};
