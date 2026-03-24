"use client";

import { ShareButton } from "@/components/action-buttons";
import { PersonalBreakdownCard } from "@/components/cards/personal-breakdown-card";
import SuggestedPaymentsCard from "@/components/cards/suggested-payments-card";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DEFAULT_BILLS, STORAGE_KEYS } from "@/lib/constants";
import { Bill, Person } from "@/lib/types";
import { calculateSuggestedPayments, rupiah } from "@/lib/utils";
import { Calculator, CreditCard, Share2, Users2 } from "lucide-react";
import LZString from "lz-string";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function MultiBillSplitter() {
    const [people, setPeople] = useState<Person[]>([]);
    const [bills, setBills] = useState<Bill[]>([]);
    const [activeBillId, setActiveBillId] = useState("");
    const [isCopied, setIsCopied] = useState(false);
    const [visiblePersonBreakdowns, setVisiblePersonBreakdowns] = useState<
        Record<string, boolean>
    >({});

    const togglePersonBreakdown = (personId: string) => {
        setVisiblePersonBreakdowns((prev) => ({
            ...prev,
            [personId]: !prev[personId],
        }));
    };

    // TODO: refactor, most have same logic as app/page.tsx
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

            if (savedPeople) {
                setPeople(JSON.parse(savedPeople));
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
                setActiveBillId("1");
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

    // Generate Share Link Feature
    const generateShareLink = () => {
        const appState = {
            people,
            bills,
            activeBillId,
        };

        const jsonString = JSON.stringify(appState);
        const compressed = LZString.compressToEncodedURIComponent(jsonString);

        const shareableUrl = `${window.location.origin}${window.location.pathname}#${compressed}`;

        navigator.clipboard
            .writeText(shareableUrl)
            .then(() => {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            })
            .catch((err) => {
                console.error("Failed to copy text: ", err);
                alert("Failed to copy to clipboard.");
            });
    };

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

    const calculateGrandTotals = () => {
        const personTotals: {
            [key: string]: { owes: number; paid: number; balance: number };
        } = {};
        let grandTotal = 0;

        people.forEach((person) => {
            let personOwesTotal = 0;
            let personPaidTotal = 0;

            bills.forEach((bill) => {
                personOwesTotal += calculatePersonOwesForBill(person.id, bill);
                if (bill.paidBy === person.id) {
                    const { effectiveTotal } = calculateBillTotals(bill);
                    personPaidTotal += effectiveTotal;
                }
            });

            personTotals[person.id] = {
                owes: personOwesTotal,
                paid: personPaidTotal,
                balance: personPaidTotal - personOwesTotal,
            };
            grandTotal += personOwesTotal;
        });

        return { personTotals, grandTotal };
    };

    const { personTotals, grandTotal } = calculateGrandTotals();
    const suggestedPayments = calculateSuggestedPayments(people, personTotals);

    return (
        <div className="min-h-screen bg-background p-4">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="text-center space-y-2">
                    <div className="flex flex-col items-center justify-center gap-4">
                        <Link href="/">
                            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2 hover:underline hover:cursor-pointer">
                                split.notwatermango.cc
                            </h1>
                        </Link>
                        <div className="flex items-center gap-2">
                            <ModeToggle />
                            <ShareButton
                                onClick={generateShareLink}
                                isCopied={isCopied}
                            />
                        </div>
                    </div>
                </div>
                <SuggestedPaymentsCard
                    suggestedPayments={suggestedPayments}
                    people={people}
                />

                <Card>
                    <CardHeader>
                        <CardTitle className="font-semibold text-xl flex items-center gap-2">
                            <Users2 className="h-5 w-5" />
                            Detailed Breakdown per Person
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Detailed breakdown per person */}
                        <div>
                            <div className="space-y-6">
                                {people.map((person) => {
                                    return (
                                        <PersonalBreakdownCard
                                            key={person.id}
                                            person={person}
                                            bills={bills}
                                            calculateBillTotals={
                                                calculateBillTotals
                                            }
                                            togglePersonBreakdown={
                                                togglePersonBreakdown
                                            }
                                            visiblePersonBreakdowns={
                                                visiblePersonBreakdowns
                                            }
                                            personTotals={personTotals}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    {/* Per-bill breakdown */}
                    <CardHeader>
                        <CardTitle className="font-semibold text-xl flex items-center gap-2">
                            <Calculator className="h-5 w-5" />
                            All Bills
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div>
                            <div className="space-y-4">
                                {bills.map((bill) => {
                                    const {
                                        subtotal: billSubtotal,
                                        taxAndFees: billTaxAndFees,
                                        effectiveTotal: billEffectiveTotal,
                                    } = calculateBillTotals(bill);
                                    return (
                                        <Card
                                            key={bill.id}
                                            className="border-l-4 border-l-details"
                                        >
                                            <CardContent className="py-4">
                                                <div className="flex justify-between items-center mb-3">
                                                    <h5 className="font-medium">
                                                        {bill.name}
                                                    </h5>
                                                    <span className="font-semibold text-details">
                                                        {rupiah(
                                                            billEffectiveTotal.toFixed(
                                                                2,
                                                            ),
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                                                    <div>
                                                        Paid By:{" "}
                                                        <span className="font-medium text-details">
                                                            {bill.paidBy
                                                                ? people.find(
                                                                      (p) =>
                                                                          p.id ===
                                                                          bill.paidBy,
                                                                  )?.name ||
                                                                  "Unknown"
                                                                : "Not specified"}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="bg-muted/50 rounded-lg p-4">
                                                        <div className="space-y-2">
                                                            {bill.items.map(
                                                                (item) => (
                                                                    <div
                                                                        key={
                                                                            item.id
                                                                        }
                                                                        className="flex justify-between items-center text-sm"
                                                                    >
                                                                        <span className="text-muted-foreground">
                                                                            <span className="text-details">
                                                                                {
                                                                                    item.quantity
                                                                                }{" "}
                                                                            </span>
                                                                            {
                                                                                item.name
                                                                            }
                                                                            <span className="text-xs ml-1">
                                                                                {item.assignedTo.map(
                                                                                    (
                                                                                        person,
                                                                                    ) => {
                                                                                        return (
                                                                                            <span
                                                                                                key={
                                                                                                    person
                                                                                                }
                                                                                                className="text-details"
                                                                                            >
                                                                                                {
                                                                                                    people.find(
                                                                                                        (
                                                                                                            p,
                                                                                                        ) =>
                                                                                                            p.id ===
                                                                                                            person,
                                                                                                    )
                                                                                                        ?.name
                                                                                                }{" "}
                                                                                            </span>
                                                                                        );
                                                                                    },
                                                                                )}
                                                                            </span>
                                                                        </span>
                                                                        <span>
                                                                            {rupiah(
                                                                                (
                                                                                    item.price *
                                                                                    item.quantity
                                                                                ).toFixed(
                                                                                    2,
                                                                                ),
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                ),
                                                            )}
                                                            <div className="flex justify-between items-center text-sm border-t pt-2 mt-2">
                                                                <span className="text-muted-foreground">
                                                                    Subtotal
                                                                </span>
                                                                <span>
                                                                    {rupiah(
                                                                        billSubtotal.toFixed(
                                                                            2,
                                                                        ),
                                                                    )}
                                                                </span>
                                                            </div>
                                                            {billTaxAndFees >
                                                                0 && (
                                                                <div className="flex justify-between items-center text-sm">
                                                                    <span className="text-muted-foreground">
                                                                        Tax &
                                                                        Fees
                                                                    </span>
                                                                    <span>
                                                                        {rupiah(
                                                                            billTaxAndFees.toFixed(
                                                                                2,
                                                                            ),
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                            <div className="flex justify-between items-center mt-6 pt-6 border-t font-semibold text-lg">
                                <h4>Grand Total - All Bills:</h4>
                                <span className="font-bold">
                                    {rupiah(grandTotal.toFixed(2))}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
