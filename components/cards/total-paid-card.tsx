"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bill, Person } from "@/lib/types";

interface TotalPaidCardProps {
    activeBill: Bill;
    activeBillId: string;
    people: Person[];
    subtotal: number;
    onUpdateTotalBill: (amount: number) => void;
    onUpdateBillPaidBy: (billId: string, personId: string) => void;
}

function TotalPaidCard({
    activeBill,
    activeBillId,
    people,
    subtotal,
    onUpdateTotalBill,
    onUpdateBillPaidBy,
}: TotalPaidCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Total Paid</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex gap-4 items-end flex-col sm:flex-row">
                    <div className="flex-1 w-full sm:w-auto">
                        <Label htmlFor="total-bill">
                            How much paid including tax & fees?
                        </Label>
                        <Input
                            id="total-bill"
                            type="number"
                            step="0.01"
                            placeholder={
                                subtotal ? subtotal.toFixed(2) : "0.00"
                            }
                            value={activeBill?.totalBill || ""}
                            onChange={(e) =>
                                onUpdateTotalBill(
                                    Number.parseFloat(e.target.value) || 0,
                                )
                            }
                        />
                    </div>
                    <div className="flex-1 w-full sm:w-auto">
                        <Label htmlFor="paid-by">Paid By</Label>
                        <select
                            id="paid-by"
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={activeBill?.paidBy || ""}
                            onChange={(e) =>
                                onUpdateBillPaidBy(activeBillId, e.target.value)
                            }
                        >
                            <option value="" disabled>
                                Select person
                            </option>
                            {people.map((person) => (
                                <option key={person.id} value={person.id}>
                                    {person.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export { TotalPaidCard };
