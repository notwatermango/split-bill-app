import { Bill, Currency } from "./types";

export const STORAGE_KEYS = {
    PEOPLE: "multi-bill-splitter-people",
    BILLS: "multi-bill-splitter-bills",
    ACTIVE_BILL_ID: "multi-bill-splitter-active-bill-id",
    CURRENCY: "multi-bill-splitter-currency",
};

export const DEFAULT_BILLS: Bill[] = [];

export const SUPPORTED_CURRENCIES: Currency[] = [
    {
        code: "IDR",
        symbol: "Rp",
        locale: "id-ID",
        precision: 0,
        balanceTolerance: 500,
    },
    {
        code: "USD",
        symbol: "$",
        locale: "en-US",
        precision: 2,
        balanceTolerance: 0.05,
    },
    {
        code: "AUD",
        symbol: "A$",
        locale: "en-AU",
        precision: 2,
        balanceTolerance: 0.05,
    },
    {
        code: "CAD",
        symbol: "C$",
        locale: "en-CA",
        precision: 2,
        balanceTolerance: 0.05,
    },
    {
        code: "CHF",
        symbol: "CHF",
        locale: "de-CH",
        precision: 2,
        balanceTolerance: 0.05,
    },
    {
        code: "CNY",
        symbol: "¥",
        locale: "zh-CN",
        precision: 2,
        balanceTolerance: 0.1,
    },
    {
        code: "EUR",
        symbol: "€",
        locale: "en-EU",
        precision: 2,
        balanceTolerance: 0.05,
    },
    {
        code: "GBP",
        symbol: "£",
        locale: "en-GB",
        precision: 2,
        balanceTolerance: 0.05,
    },
    {
        code: "SGD",
        symbol: "S$",
        locale: "en-SG",
        precision: 2,
        balanceTolerance: 0.05,
    },
    {
        code: "INR",
        symbol: "₹",
        locale: "en-IN",
        precision: 2,
        balanceTolerance: 1.0,
    },
    {
        code: "JPY",
        symbol: "¥",
        locale: "ja-JP",
        precision: 0,
        balanceTolerance: 1,
    },
    {
        code: "MYR",
        symbol: "RM",
        locale: "ms-MY",
        precision: 2,
        balanceTolerance: 0.05,
    },
    {
        code: "PHP",
        symbol: "₱",
        locale: "en-PH",
        precision: 2,
        balanceTolerance: 0.25,
    },
    {
        code: "TWD",
        symbol: "NT$",
        locale: "zh-TW",
        precision: 0,
        balanceTolerance: 1,
    },
    {
        code: "RUB",
        symbol: "₽",
        locale: "ru-RU",
        precision: 2,
        balanceTolerance: 1.0,
    },
];

export const DEFAULT_CURRENCY = SUPPORTED_CURRENCIES[1];
