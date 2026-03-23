import { Bill } from "./types";

export const STORAGE_KEYS = {
    PEOPLE: "multi-bill-splitter-people",
    BILLS: "multi-bill-splitter-bills",
    ACTIVE_BILL_ID: "multi-bill-splitter-active-bill-id",
};

export const DEFAULT_BILLS: Bill[] = [];

// TODO: consider refactor on multi currency
export const BALANCE_TOLERANCE = 500;
