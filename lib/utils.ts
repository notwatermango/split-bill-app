import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Person, Payment } from "@/lib/types";
import { BALANCE_TOLERANCE } from "@/lib/constants";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const rupiah = (number: any) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
    }).format(number);
};

export { rupiah };

export function calculateSuggestedPayments(
    people: Person[],
    personTotals: Record<
        string,
        { owes: number; paid: number; balance: number }
    >,
): Payment[] {
    const balances = people
        .map((p) => ({ id: p.id, balance: personTotals[p.id]?.balance ?? 0 }))
        .filter((p) => Math.abs(p.balance) > BALANCE_TOLERANCE);

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
