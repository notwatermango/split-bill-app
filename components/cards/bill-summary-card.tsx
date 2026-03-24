"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calculator } from "lucide-react";
import { Person, Bill } from "@/lib/types";
import { rupiah } from "@/lib/utils";

interface BillSummaryCardProps {
    activeBill: Bill;
    people: Person[];
    subtotal: number;
    taxAndFees: number;
    calculatePersonOwesForBill: (personId: string, bill: Bill) => number;
}

function BillSummaryCard({
    activeBill,
    people,
    subtotal,
    taxAndFees,
    calculatePersonOwesForBill,
}: BillSummaryCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Summary of {activeBill?.name}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col sm:grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-muted-foreground">
                            Subtotal:
                        </span>
                        <span className="float-right font-medium">
                            {rupiah(subtotal?.toFixed(2))}
                        </span>
                    </div>
                    <div>
                        <span className="text-muted-foreground">
                            Tax & Fees:
                        </span>
                        <span className="float-right font-medium">
                            {rupiah(taxAndFees.toFixed(2))}
                        </span>
                    </div>
                    <div className="col-span-2">
                        <Separator />
                    </div>
                    <div className="col-span-2 flex items-center justify-between">
                        <span className="font-semibold">Total:</span>
                        <span className="float-right font-semibold text-lg">
                            {rupiah(
                                Math.max(
                                    activeBill?.totalBill || 0,
                                    subtotal,
                                ).toFixed(2),
                            )}
                        </span>
                    </div>
                    <div className="col-span-2">
                        <span className="text-muted-foreground">
                            Paid By:
                        </span>
                        <span className="float-right font-medium text-details">
                            {activeBill?.paidBy
                                ? people.find(
                                      (p) => p.id === activeBill.paidBy,
                                  )?.name || "Unknown"
                                : "Not specified"}
                        </span>
                    </div>
                </div>

                <Separator />

                <div>
                    <h4 className="font-semibold mb-3">
                        Expense per person:
                    </h4>
                    <div className="space-y-2">
                        {people.map((person) => {
                            const owesForBill = calculatePersonOwesForBill(
                                person.id,
                                activeBill,
                            );
                            return (
                                <div
                                    key={person.id}
                                    className="flex justify-between items-center p-3 bg-muted rounded-lg"
                                >
                                    <span className="font-medium">
                                        {person.name}
                                    </span>
                                    <span className="text-lg font-semibold">
                                        {rupiah(owesForBill.toFixed(2))}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export { BillSummaryCard };
