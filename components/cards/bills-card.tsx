"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, FileText, Edit2 } from "lucide-react";
import { Bill } from "@/lib/types";

interface BillsCardProps {
    bills: Bill[];
    activeBillId: string;
    onSetActiveBill: (id: string) => void;
    onAddBill: (name: string) => void;
    onRemoveBill: (id: string) => void;
    onRenameBill: (id: string, name: string) => void;
}

function BillsCard({
    bills,
    activeBillId,
    onSetActiveBill,
    onAddBill,
    onRemoveBill,
    onRenameBill,
}: BillsCardProps) {
    const [newBillName, setNewBillName] = useState("");
    const [editingBillId, setEditingBillId] = useState("");
    const [editBillName, setEditBillName] = useState("");

    const handleAddBill = () => {
        if (newBillName.trim()) {
            onAddBill(newBillName.trim());
            setNewBillName("");
        }
    };

    const startEditingBill = (billId: string, currentName: string) => {
        setEditingBillId(billId);
        setEditBillName(currentName);
    };

    const saveEditBill = () => {
        if (editBillName.trim()) {
            onRenameBill(editingBillId, editBillName.trim());
        }
        setEditingBillId("");
        setEditBillName("");
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Bills{" "}
                    <span className="ml-1 inline-flex items-center justify-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {bills.length}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <div className="flex-1">
                        <Label htmlFor="bill-name">Add New Bill</Label>
                        <Input
                            id="bill-name"
                            placeholder="Enter bill name (e.g., Restaurant ABC or Movie Ticket)"
                            value={newBillName}
                            onChange={(e) => setNewBillName(e.target.value)}
                            onKeyPress={(e) =>
                                e.key === "Enter" && handleAddBill()
                            }
                        />
                    </div>
                    <Button onClick={handleAddBill} className="mt-6">
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                    {bills.map((bill) => (
                        <div
                            key={bill.id}
                            className="flex items-center gap-1"
                        >
                            <Badge
                                variant={
                                    bill.id === activeBillId
                                        ? "default"
                                        : "outline"
                                }
                                className="cursor-pointer flex items-center gap-1"
                                onClick={() => onSetActiveBill(bill.id)}
                            >
                                {editingBillId === bill.id ? (
                                    <Input
                                        className="h-4 text-xs"
                                        value={editBillName}
                                        onChange={(e) =>
                                            setEditBillName(e.target.value)
                                        }
                                        onKeyPress={(e) =>
                                            e.key === "Enter" && saveEditBill()
                                        }
                                        onBlur={saveEditBill}
                                        autoFocus
                                    />
                                ) : (
                                    <>
                                        {bill.name}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                startEditingBill(
                                                    bill.id,
                                                    bill.name,
                                                );
                                            }}
                                            className="ml-1 hover:text-details"
                                        >
                                            <Edit2 className="h-3 w-3" />
                                        </button>
                                        {bills.length > 1 && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onRemoveBill(bill.id);
                                                }}
                                                className="ml-1 hover:text-destructive"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        )}
                                    </>
                                )}
                            </Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export { BillsCard };
