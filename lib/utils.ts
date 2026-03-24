import { DEFAULT_CURRENCY, SUPPORTED_CURRENCIES } from "@/lib/constants";
import { Currency, Payment, Person } from "@/lib/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { getTimezone } from "countries-and-timezones";
import countryToCurrency from "country-to-currency";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getCurrency(code?: string): Currency {
    if (!code) return getCurrency(detectTimezoneCurrencyCode());
    return (
        SUPPORTED_CURRENCIES.find((c) => c.code === code) ?? DEFAULT_CURRENCY
    );
}

export function formatCurrency(amount: number | string, currencyCode: string) {
    const currency = getCurrency(currencyCode);
    const numValue = typeof amount === "string" ? parseFloat(amount) : amount;

    return new Intl.NumberFormat(currency.locale, {
        style: "currency",
        currency: currency.code,
        minimumFractionDigits: currency.precision,
        maximumFractionDigits: currency.precision,
    }).format(numValue);
}

export function calculateSuggestedPayments(
    people: Person[],
    personTotals: Record<
        string,
        { owes: number; paid: number; balance: number }
    >,
    balanceTolerance: number = DEFAULT_CURRENCY.balanceTolerance,
): Payment[] {
    const balances = people
        .map((p) => ({ id: p.id, balance: personTotals[p.id]?.balance ?? 0 }))
        .filter((p) => Math.abs(p.balance) > balanceTolerance);

    const debtors = balances
        .filter((p) => p.balance < 0)
        .sort((a, b) => a.balance - b.balance); // most negative first
    const creditors = balances
        .filter((p) => p.balance > 0)
        .sort((a, b) => b.balance - a.balance); // most positive first

    if (creditors.length === 0 || debtors.length === 0) return [];

    const hub = creditors[0]; // highest net balance = hub
    const otherCreditors = creditors.slice(1);
    const payments: Payment[] = [];

    // Step 1: all debtors pay the hub
    for (const debtor of debtors) {
        payments.push({
            from: debtor.id,
            to: hub.id,
            amount: -debtor.balance,
        });
    }

    // Step 2: hub pays all other creditors
    for (const creditor of otherCreditors) {
        payments.push({
            from: hub.id,
            to: creditor.id,
            amount: creditor.balance,
        });
    }

    return payments;
}

export function detectTimezoneCurrencyCode(): string {
    if (typeof window === "undefined" || !Intl) {
        return DEFAULT_CURRENCY.code;
    }

    try {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        const tzInfo = getTimezone(timeZone);

        if (!tzInfo || tzInfo.countries.length === 0) {
            return DEFAULT_CURRENCY.code;
        }

        const countryCode = tzInfo.countries[0];

        const currencyCode = countryToCurrency[countryCode];

        return currencyCode;
    } catch (error) {
        console.warn(
            "Failed to detect currency from timezone, using default.",
            error,
        );
    }

    return DEFAULT_CURRENCY.code;
}
