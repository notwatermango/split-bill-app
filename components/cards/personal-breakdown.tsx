"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { Person, Item, Bill } from "@/lib/types";
import { rupiah } from "@/lib/utils";

function PersonalBreakdownCard({
    person,
    bills,
    calculateBillTotals,
    togglePersonBreakdown,
    visiblePersonBreakdowns,
    personTotals,
}: {
    person: Person;
    bills: Bill[];
    calculateBillTotals: (bill: Bill) => {
        subtotal: number;
        taxAndFees: number;
    };
    togglePersonBreakdown: (personId: string) => void;
    visiblePersonBreakdowns: Record<string, boolean>;
    personTotals: Record<
        string,
        { paid: number; owes: number; balance: number }
    >;
}) {
    let personGrandTotal = 0;
    const personBillBreakdown = bills
        .map((bill) => {
            const personItems: {
                item: Item;
                share: number;
                taxShare: number;
            }[] = [];
            let billItemsTotal = 0;

            bill.items.forEach((item) => {
                if (item.assignedTo.includes(person.id)) {
                    const splitWays = Math.max(item.assignedTo.length, 1);
                    const share = item.finalPrice / splitWays;
                    billItemsTotal += share;
                    personItems.push({
                        item,
                        share,
                        taxShare: 0,
                    });
                }
            });

            const { subtotal: billSubtotal, taxAndFees: billTaxAndFees } =
                calculateBillTotals(bill);

            const taxShare =
                billItemsTotal > 0
                    ? (billItemsTotal / (billSubtotal || 1)) * billTaxAndFees
                    : 0;

            personItems.forEach((personItem) => {
                personItem.taxShare =
                    billItemsTotal > 0
                        ? (personItem.share / billItemsTotal) * taxShare
                        : 0;
            });

            const billTotal = billItemsTotal + taxShare;
            const amountPaid = bill.paidBy === person.id ? bill.totalBill : 0;
            const netOwesForBill = billTotal - amountPaid;

            personGrandTotal += netOwesForBill;

            return {
                bill,
                items: personItems,
                billTotal,
                taxShare,
                amountPaid,
                netOwesForBill,
            };
        })
        .filter(
            (breakdown) =>
                breakdown.items.length > 0 || breakdown.amountPaid > 0
        );

    return (
        <Card
            className={`border-l cursor-pointer hover:bg-muted/30 transition-colors ${
                personGrandTotal < 0 ? "border-l-income" : "border-l-deficit"
            }`}
            onClick={() => togglePersonBreakdown(person.id)}
        >
            <CardContent className="pt-4">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <h5 className="text-lg font-semibold">{person.name}</h5>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground ml-1">
                            {visiblePersonBreakdowns[person.id] ? (
                                <>
                                    <EyeOff className="h-3 w-3" />
                                    Hide details
                                </>
                            ) : (
                                <>
                                    <Eye className="h-3 w-3" />
                                    Show details
                                </>
                            )}
                        </span>
                    </div>
                    <span
                        className={`text-xl font-bold ${
                            personGrandTotal < 0
                                ? "text-income"
                                : "text-deficit"
                        }`}
                    >
                        {personGrandTotal < 0 ? "" : "("}
                        {rupiah(Math.abs(personGrandTotal).toFixed(2))}
                        {personGrandTotal < 0 ? "" : ")"}
                    </span>
                </div>

                {visiblePersonBreakdowns[person.id] && (
                    <>
                        <div className="flex flex-col sm:flex-row justify-between mb-4 text-sm bg-muted/40 p-4 rounded-lg border mt-2">
                            <div className="text-muted-foreground font-medium mb-1 sm:mb-0">
                                Paid:{" "}
                                <span className="text-foreground">
                                    {rupiah(
                                        personTotals[person.id].paid.toFixed(2)
                                    )}
                                </span>{" "}
                                | Spent:{" "}
                                <span className="text-foreground">
                                    {rupiah(
                                        personTotals[person.id].owes.toFixed(2)
                                    )}
                                </span>
                            </div>
                            <div
                                className={`font-semibold ${
                                    personTotals[person.id].balance > 0
                                        ? "text-income"
                                        : personTotals[person.id].balance < 0
                                        ? "text-deficit"
                                        : "text-muted-foreground"
                                }`}
                            >
                                {personTotals[person.id].balance === 0
                                    ? "Fully settled"
                                    : personTotals[person.id].balance > 0
                                    ? `Gets back ${rupiah(
                                          Math.abs(
                                              personTotals[person.id].balance
                                          ).toFixed(2)
                                      )}`
                                    : `Owes ${rupiah(
                                          Math.abs(
                                              personTotals[person.id].balance
                                          ).toFixed(2)
                                      )}`}
                            </div>
                        </div>

                        {personBillBreakdown.length > 0 ? (
                            <div className="space-y-4">
                                {personBillBreakdown.map(
                                    ({
                                        bill,
                                        items,
                                        billTotal,
                                        taxShare,
                                        amountPaid,
                                        netOwesForBill,
                                    }) => (
                                        <div
                                            key={bill.id}
                                            className="bg-muted/50 rounded-lg p-4"
                                        >
                                            <div className="flex justify-between items-center mb-3">
                                                <h6 className="font-medium text-details">
                                                    {bill.name}
                                                </h6>
                                                <span
                                                    className={`font-semibold ${
                                                        netOwesForBill < 0
                                                            ? "text-income"
                                                            : "text-deficit"
                                                    }`}
                                                >
                                                    {rupiah(
                                                        Math.abs(
                                                            netOwesForBill
                                                        ).toFixed(2)
                                                    )}
                                                </span>
                                            </div>

                                            <div className="space-y-2">
                                                {items.map(
                                                    ({ item, share }) => (
                                                        <div
                                                            key={item.id}
                                                            className="flex justify-between items-center text-sm"
                                                        >
                                                            <span className="text-muted-foreground">
                                                                {item.name}
                                                                {item.assignedTo
                                                                    .length >
                                                                    1 && (
                                                                    <span className="text-xs ml-1">
                                                                        (split{" "}
                                                                        {
                                                                            item
                                                                                .assignedTo
                                                                                .length
                                                                        }{" "}
                                                                        ways)
                                                                    </span>
                                                                )}
                                                            </span>
                                                            <span>
                                                                {rupiah(
                                                                    share.toFixed(
                                                                        2
                                                                    )
                                                                )}
                                                            </span>
                                                        </div>
                                                    )
                                                )}
                                                {taxShare > 0 && (
                                                    <div className="flex justify-between items-center text-sm border-t pt-2 mt-2">
                                                        <span className="text-muted-foreground">
                                                            Tax & Fees Share
                                                        </span>
                                                        <span>
                                                            {rupiah(
                                                                taxShare.toFixed(
                                                                    2
                                                                )
                                                            )}
                                                        </span>
                                                    </div>
                                                )}
                                                {amountPaid > 0 && (
                                                    <div className="flex justify-between items-center text-sm border-t border-details-border pt-2 mt-2 font-semibold">
                                                        <span>
                                                            Paid for bill
                                                        </span>
                                                        <span>
                                                            {rupiah(
                                                                amountPaid.toFixed(
                                                                    2
                                                                )
                                                            )}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm">
                                No activity for this person
                            </p>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}

export { PersonalBreakdownCard };
