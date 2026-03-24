export interface Person {
    id: string;
    name: string;
}

export interface Item {
    id: string;
    name: string;
    price: number;
    quantity: number;
    finalPrice: number;
    assignedTo: string[];
}

export interface Currency {
    code: string;
    symbol: string;
    locale: string;
    precision: number;
    balanceTolerance: number;
}

export interface Bill {
    id: string;
    name: string;
    items: Item[];
    totalBill: number;
    createdAt: Date;
    paidBy?: string;
    currency: string;
}

export type Payment = {
    from: string;
    to: string;
    amount: number;
};
