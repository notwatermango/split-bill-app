"use client";

import {
    BillSummaryButton,
    ResetButton,
    ShareButton,
} from "@/components/action-buttons";
import { BillSummaryCard } from "@/components/cards/bill-summary-card";
import { BillsCard } from "@/components/cards/bills-card";
import { HowToUseCard } from "@/components/cards/how-to-use-card";
import { ItemsCard } from "@/components/cards/items-card";
import { PeopleCard } from "@/components/cards/people-card";
import { TotalPaidCard } from "@/components/cards/total-paid-card";
import { CurrencySelector } from "@/components/currency-selector";
import { ModeToggle } from "@/components/mode-toggle";
import { DEFAULT_BILLS, STORAGE_KEYS } from "@/lib/constants";
import { Bill, Item, Person } from "@/lib/types";
import LZString from "lz-string";
import Link from "next/link";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function MultiBillSplitter() {
    const [people, setPeople] = useState<Person[]>([]);
    const [bills, setBills] = useState<Bill[]>([]);
    const [activeBillId, setActiveBillId] = useState("");
    const [currencyCode, setCurrencyCode] = useState("");
    const [isCopied, setIsCopied] = useState(false);

    // Initial Load: Check URL Hash first, then fallback to LocalStorage
    useEffect(() => {
        const hash = window.location.hash.slice(1);
        let loadedFromHash = false;

        if (hash) {
            try {
                const decompressed =
                    LZString.decompressFromEncodedURIComponent(hash);
                if (decompressed) {
                    const parsedData = JSON.parse(decompressed);

                    if (parsedData.people) setPeople(parsedData.people);
                    if (parsedData.currencyCode)
                        setCurrencyCode(parsedData.currencyCode);

                    if (parsedData.bills) {
                        const parsedBills = parsedData.bills.map(
                            (bill: any) => ({
                                ...bill,
                                createdAt: new Date(bill.createdAt),
                            }),
                        );
                        setBills(parsedBills);
                    }

                    if (parsedData.activeBillId)
                        setActiveBillId(parsedData.activeBillId);

                    loadedFromHash = true;

                    // Clean up the URL so it doesn't look messy after loading
                    window.history.replaceState(
                        null,
                        "",
                        window.location.pathname,
                    );
                }
            } catch (error) {
                console.error("Failed to parse shared link data:", error);
            }
        }

        // Preserve old behavior if no valid link was shared
        if (!loadedFromHash) {
            const savedPeople = localStorage.getItem(STORAGE_KEYS.PEOPLE);
            const savedBills = localStorage.getItem(STORAGE_KEYS.BILLS);
            const savedActiveBillId = localStorage.getItem(
                STORAGE_KEYS.ACTIVE_BILL_ID,
            );
            const savedCurrency = localStorage.getItem(STORAGE_KEYS.CURRENCY);

            if (savedPeople) {
                setPeople(JSON.parse(savedPeople));
            }

            if (savedCurrency) {
                setCurrencyCode(savedCurrency);
            }

            if (savedBills) {
                const parsedBills = JSON.parse(savedBills).map((bill: any) => ({
                    ...bill,
                    createdAt: new Date(bill.createdAt),
                }));
                setBills(parsedBills);

                if (
                    savedActiveBillId &&
                    parsedBills.find(
                        (bill: Bill) => bill.id === savedActiveBillId,
                    )
                ) {
                    setActiveBillId(savedActiveBillId);
                } else if (parsedBills.length > 0) {
                    setActiveBillId(parsedBills[0].id);
                }
            } else {
                setBills(DEFAULT_BILLS);
                setActiveBillId("");
            }
        }
    }, []);

    // Sync to LocalStorage whenever state changes
    useEffect(() => {
        if (people.length > 0) {
            localStorage.setItem(STORAGE_KEYS.PEOPLE, JSON.stringify(people));
        }
    }, [people]);

    useEffect(() => {
        if (bills.length > 0) {
            localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(bills));
        }
    }, [bills]);

    useEffect(() => {
        if (activeBillId) {
            localStorage.setItem(STORAGE_KEYS.ACTIVE_BILL_ID, activeBillId);
        }
    }, [activeBillId]);

    useEffect(() => {
        // Only save if it's different from what's already there to avoid unnecessary writes
        const saved = localStorage.getItem(STORAGE_KEYS.CURRENCY);
        if (currencyCode && currencyCode !== saved) {
            localStorage.setItem(STORAGE_KEYS.CURRENCY, currencyCode);
        }
    }, [currencyCode]);

    // --- Shared state & derived values ---
    const activeBill =
        bills.find((bill) => bill.id === activeBillId) || bills[0];

    const calculateBillTotals = (bill: Bill) => {
        if (!bill) return { subtotal: 0, taxAndFees: 0, effectiveTotal: 0 };
        const subtotal = bill.items.reduce(
            (sum, item) => sum + item.finalPrice,
            0,
        );
        const effectiveTotal = Math.max(bill.totalBill || 0, subtotal);
        const taxAndFees = effectiveTotal - subtotal;
        return { subtotal, taxAndFees, effectiveTotal };
    };

    const calculatePersonOwesForBill = (personId: string, bill: Bill) => {
        let itemTotal = 0;
        let totalAssignedItems = 0;

        bill.items.forEach((item) => {
            if (item.assignedTo.includes(personId)) {
                itemTotal += item.finalPrice / item.assignedTo.length;
                totalAssignedItems += item.finalPrice;
            }
        });

        const { subtotal, taxAndFees } = calculateBillTotals(bill);
        const taxShare =
            totalAssignedItems > 0
                ? (itemTotal / (subtotal ?? 1)) * taxAndFees
                : 0;

        return itemTotal + taxShare;
    };

    const { subtotal, taxAndFees } = calculateBillTotals(activeBill);

    // --- Action handlers (callbacks for child components) ---

    const generateShareLink = async () => {
        const appState = {
            people,
            bills,
            activeBillId,
            currencyCode,
        };

        const jsonString = JSON.stringify(appState);
        const compressed = LZString.compressToEncodedURIComponent(jsonString);

        const shareableUrl = `${window.location.origin}${window.location.pathname}/summary#${compressed}`;

        try {
            let finalUrl = shareableUrl;

            try {
                const response = await fetch(
                    process.env.NEXT_PUBLIC_SHORTENER_API_URL ||
                        "https://link.notwatermango.cc/api/shorten",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ url: shareableUrl }),
                    },
                );

                if (response.ok) {
                    const data = await response.json();
                    if (data.short_url) {
                        finalUrl = data.short_url;
                    }
                } else {
                    console.warn(
                        "Failed to shorten URL, falling back to original",
                    );
                }
            } catch (shortenErr) {
                console.warn(
                    "Error shortening URL, falling back to original",
                    shortenErr,
                );
            }

            await navigator.clipboard.writeText(finalUrl);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy text: ", err);
            alert("Failed to copy to clipboard.");
        }
    };

    const resetAllData = () => {
        if (
            confirm(
                "Are you sure you want to reset all data? This action cannot be undone.",
            )
        ) {
            localStorage.removeItem(STORAGE_KEYS.PEOPLE);
            localStorage.removeItem(STORAGE_KEYS.BILLS);
            localStorage.removeItem(STORAGE_KEYS.ACTIVE_BILL_ID);
            localStorage.removeItem(STORAGE_KEYS.CURRENCY);
            window.history.replaceState(null, "", window.location.pathname);

            setPeople([]);
            setBills(DEFAULT_BILLS);
            setActiveBillId("");
        }
    };

    // People callbacks
    const handleAddPerson = (name: string) => {
        const person: Person = {
            id: uuidv4(),
            name,
        };
        // TODO(error-handling): if person has same name, definitely prompt user to rename it.
        setPeople([...people, person]);
    };

    const handleRemovePerson = (id: string) => {
        setPeople(people.filter((p) => p.id !== id));
        setBills(
            bills.map((bill) => ({
                ...bill,
                items: bill.items.map((item) => ({
                    ...item,
                    assignedTo: item.assignedTo.filter(
                        (personId) => personId !== id,
                    ),
                })),
                paidBy: bill.paidBy === id ? undefined : bill.paidBy,
            })),
        );
    };

    const handleRenamePerson = (id: string, name: string) => {
        setPeople(people.map((p) => (p.id === id ? { ...p, name } : p)));
    };

    // Bills callbacks
    const handleAddBill = (name: string) => {
        const bill: Bill = {
            id: uuidv4(),
            name,
            items: [],
            totalBill: 0,
            createdAt: new Date(),
            currency: "",
        };
        // TODO(error-handling): if bill has same name, maybe we should prompt user to rename it?
        setBills([...bills, bill]);
        setActiveBillId(bill.id);
    };

    const handleRemoveBill = (id: string) => {
        if (bills.length > 1) {
            const newBills = bills.filter((bill) => bill.id !== id);
            setBills(newBills);
            if (activeBillId === id) {
                setActiveBillId(newBills[0].id);
            }
        }
    };

    const handleRenameBill = (id: string, name: string) => {
        setBills(
            bills.map((bill) => (bill.id === id ? { ...bill, name } : bill)),
        );
    };

    // Items callbacks
    const handleAddItem = (newItem: {
        name: string;
        price: string;
        quantity: string;
    }) => {
        const price = Number.parseFloat(newItem.price);
        const quantity = Number.parseInt(newItem.quantity) || 1;
        if (price <= 0 || quantity <= 0) {
            // TODO(error-handling)
            return;
        }
        const item: Item = {
            id: uuidv4(),
            name: newItem.name.trim(),
            price,
            quantity,
            finalPrice: price * quantity,
            assignedTo: [],
        };
        setBills(
            bills.map((bill) =>
                bill.id === activeBillId
                    ? { ...bill, items: [...bill.items, item] }
                    : bill,
            ),
        );
    };

    const handleRemoveItem = (itemId: string) => {
        setBills(
            bills.map((bill) =>
                bill.id === activeBillId
                    ? {
                          ...bill,
                          items: bill.items.filter(
                              (item) => item.id !== itemId,
                          ),
                      }
                    : bill,
            ),
        );
    };

    const handleEditItem = (
        itemId: string,
        updates: Partial<
            Pick<Item, "name" | "price" | "quantity" | "finalPrice">
        >,
    ) => {
        setBills(
            bills.map((bill) =>
                bill.id === activeBillId
                    ? {
                          ...bill,
                          items: bill.items.map((item) =>
                              item.id === itemId
                                  ? { ...item, ...updates }
                                  : item,
                          ),
                      }
                    : bill,
            ),
        );
    };

    const handleTogglePersonAssignment = (itemId: string, personId: string) => {
        setBills(
            bills.map((bill) =>
                bill.id === activeBillId
                    ? {
                          ...bill,
                          items: bill.items.map((item) => {
                              if (item.id === itemId) {
                                  const isAssigned =
                                      item.assignedTo.includes(personId);
                                  return {
                                      ...item,
                                      assignedTo: isAssigned
                                          ? item.assignedTo.filter(
                                                (id) => id !== personId,
                                            )
                                          : [...item.assignedTo, personId],
                                  };
                              }
                              return item;
                          }),
                      }
                    : bill,
            ),
        );
    };

    // Total bill callbacks
    const handleUpdateTotalBill = (amount: number) => {
        setBills(
            bills.map((bill) =>
                bill.id === activeBillId
                    ? { ...bill, totalBill: amount }
                    : bill,
            ),
        );
    };

    const handleUpdateBillPaidBy = (billId: string, personId: string) => {
        setBills(
            bills.map((bill) =>
                bill.id === billId ? { ...bill, paidBy: personId } : bill,
            ),
        );
    };

    return (
        <div className="min-h-screen bg-background p-4">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="flex flex-col items-center justify-center">
                        <Link href="/">
                            <h1 className="text-3xl font-bold text-foreground flex gap-2 hover:underline hover:cursor-pointer items-center">
                                split.notwatermango.cc
                            </h1>
                        </Link>
                        <p className="text-muted-foreground mb-3">
                            Split multiple bills easily among friends
                        </p>
                        <div className="flex flex-wrap justify-center gap-2">
                            <ModeToggle />
                            <ResetButton onClick={resetAllData} />
                            <BillSummaryButton />
                            <ShareButton
                                onClick={generateShareLink}
                                isCopied={isCopied}
                            />
                            <CurrencySelector
                                currencyCode={currencyCode}
                                onCurrencyChange={setCurrencyCode}
                            />
                        </div>
                    </div>
                </div>

                {/* People Management */}
                <PeopleCard
                    people={people}
                    onAddPerson={handleAddPerson}
                    onRemovePerson={handleRemovePerson}
                    onRenamePerson={handleRenamePerson}
                />

                {/* Bills Management */}
                <BillsCard
                    bills={bills}
                    activeBillId={activeBillId}
                    onSetActiveBill={setActiveBillId}
                    onAddBill={handleAddBill}
                    onRemoveBill={handleRemoveBill}
                    onRenameBill={handleRenameBill}
                />

                {activeBillId && (
                    <>
                        {/* Item Management for Current Bill */}
                        <ItemsCard
                            activeBill={activeBill}
                            people={people}
                            currencyCode={currencyCode}
                            onAddItem={handleAddItem}
                            onRemoveItem={handleRemoveItem}
                            onEditItem={handleEditItem}
                            onTogglePersonAssignment={
                                handleTogglePersonAssignment
                            }
                        />

                        {/* Total Bill for Current Bill */}
                        <TotalPaidCard
                            activeBill={activeBill}
                            activeBillId={activeBillId}
                            people={people}
                            subtotal={subtotal}
                            onUpdateTotalBill={handleUpdateTotalBill}
                            onUpdateBillPaidBy={handleUpdateBillPaidBy}
                        />
                    </>
                )}

                {/* Current Bill Summary */}
                {people.length > 0 && activeBill?.items.length > 0 && (
                    <BillSummaryCard
                        activeBill={activeBill}
                        people={people}
                        subtotal={subtotal}
                        taxAndFees={taxAndFees}
                        currencyCode={currencyCode}
                        calculatePersonOwesForBill={calculatePersonOwesForBill}
                    />
                )}

                {/* How to use this app? */}
                <HowToUseCard
                    generateShareLink={generateShareLink}
                    resetAllData={resetAllData}
                    isCopied={isCopied}
                />
            </div>
        </div>
    );
}
