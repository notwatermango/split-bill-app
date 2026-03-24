"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectableBadge } from "@/components/ui/selectable-badge";
import { useLongPress } from "@/hooks/use-long-press";
import { Bill } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
    Check,
    CircleEllipsis,
    Edit2,
    FileText,
    MoreHorizontal,
    Plus,
    Trash2,
    X,
} from "lucide-react";
import { useCallback, useState } from "react";

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
    // Which bill is being edited (full-width input mode)
    const [editingBillId, setEditingBillId] = useState("");
    const [editBillName, setEditBillName] = useState("");
    // Which bill badge is showing the mobile action overlay
    const [activeBillActionId, setActiveBillActionId] = useState<string | null>(
        null,
    );
    // Bill pending deletion (waiting for dialog confirmation)
    const [pendingDeleteBill, setPendingDeleteBill] = useState<Bill | null>(
        null,
    );

    const handleAddBill = () => {
        if (newBillName.trim()) {
            onAddBill(newBillName.trim());
            setNewBillName("");
        }
    };

    const startEditing = (billId: string, currentName: string) => {
        onSetActiveBill(billId);
        setActiveBillActionId(null);
        setEditingBillId(billId);
        setEditBillName(currentName);
    };

    const saveEdit = () => {
        if (editBillName.trim()) {
            onRenameBill(editingBillId, editBillName.trim());
        }
        setEditingBillId("");
        setEditBillName("");
    };

    const cancelEdit = () => {
        setEditingBillId("");
        setEditBillName("");
    };

    const dismissOverlay = useCallback(() => setActiveBillActionId(null), []);

    const longPress = useLongPress<string>((id) => setActiveBillActionId(id));

    return (
        <>
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
                    {/* Add bill row */}
                    {!editingBillId && (
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="flex-1">
                                <Label htmlFor="bill-name">Add New Bill</Label>
                                <Input
                                    id="bill-name"
                                    placeholder="Enter bill name (e.g., Restaurant ABC or Movie Ticket)"
                                    value={newBillName}
                                    onChange={(e) =>
                                        setNewBillName(e.target.value)
                                    }
                                    onKeyDown={(e) =>
                                        e.key === "Enter" && handleAddBill()
                                    }
                                />
                            </div>
                            <Button
                                onClick={handleAddBill}
                                className="sm:mt-6 w-full sm:w-auto"
                            >
                                <Plus className="h-4 w-4 mr-2 sm:mr-0" />
                                <span className="sm:hidden">Add Bill</span>
                            </Button>
                        </div>
                    )}

                    {/* Edit bill row */}
                    {editingBillId && (
                        <div className="flex items-end gap-2 rounded-md bg-muted/40">
                            <div className="flex-1">
                                <Label htmlFor="edit-bill-name">
                                    Rename Bill
                                </Label>
                                <Input
                                    id="edit-bill-name"
                                    className="flex-1 h-8 text-sm"
                                    value={editBillName}
                                    onChange={(e) =>
                                        setEditBillName(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") saveEdit();
                                        if (e.key === "Escape") cancelEdit();
                                    }}
                                    autoFocus
                                />
                            </div>
                            <button
                                onClick={saveEdit}
                                className="p-2 rounded hover:bg-primary/10 text-primary"
                                aria-label="Save"
                            >
                                <Check className="h-4 w-4" />
                            </button>
                            <button
                                onClick={cancelEdit}
                                className="p-2 rounded hover:bg-muted text-muted-foreground"
                                aria-label="Cancel"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    {/* Bill badges */}
                    <div className="flex flex-wrap gap-2">
                        {bills.map((bill) => (
                            <div key={bill.id} className="relative group">
                                {/* Mobile action overlay — shown after long press */}
                                {activeBillActionId === bill.id && (
                                    <>
                                        {/* Backdrop to dismiss */}
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={dismissOverlay}
                                        />
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 flex flex-col items-center gap-1 bg-popover border rounded-lg shadow-lg p-2 min-w-[140px]">
                                            <span className="text-xs text-muted-foreground font-medium px-1 pb-1 border-b w-full text-center truncate max-w-[120px]">
                                                {bill.name}
                                            </span>
                                            <button
                                                onClick={() => {
                                                    startEditing(
                                                        bill.id,
                                                        bill.name,
                                                    );
                                                }}
                                                className="flex items-center gap-2 w-full px-2 py-1.5 text-sm hover:bg-muted rounded"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                                Rename
                                            </button>
                                            {bills.length > 1 && (
                                                <button
                                                    onClick={() => {
                                                        dismissOverlay();
                                                        setPendingDeleteBill(
                                                            bills.find(
                                                                (b) =>
                                                                    b.id ===
                                                                    activeBillActionId,
                                                            ) ?? null,
                                                        );
                                                    }}
                                                    className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-destructive dark:text-red-500 dark:hover:text-red-400 hover:bg-destructive/10 rounded"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Delete
                                                </button>
                                            )}
                                            <button
                                                onClick={dismissOverlay}
                                                className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted rounded"
                                            >
                                                <X className="h-4 w-4" />
                                                Cancel
                                            </button>
                                        </div>
                                    </>
                                )}

                                <SelectableBadge
                                    variant={
                                        bill.id === activeBillId
                                            ? "default"
                                            : "outline"
                                    }
                                    className={cn(
                                        "cursor-pointer pr-0 justify-between min-w-20 flex items-center gap-1 select-none max-w-[180px] min-h-8",
                                    )}
                                    onClick={() => {
                                        if (!editingBillId)
                                            onSetActiveBill(bill.id);
                                    }}
                                    onTouchStart={longPress.start(bill.id)}
                                    onTouchEnd={longPress.cancel}
                                    onTouchMove={longPress.move}
                                >
                                    <span className="truncate">
                                        {bill.name}
                                    </span>

                                    {/* Desktop: hover-to-reveal single options button → same overlay as mobile */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveBillActionId(bill.id);
                                        }}
                                        className="block h-full ml-1 py-1 px-2 rounded sm:opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                        aria-label={`Options for ${bill.name}`}
                                    >
                                        <MoreHorizontal className="h-4 w-4" />
                                    </button>
                                </SelectableBadge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Delete bill confirmation dialog */}
            <DeleteConfirmDialog
                open={!!pendingDeleteBill}
                onOpenChange={(open) => !open && setPendingDeleteBill(null)}
                title={`Delete "${pendingDeleteBill?.name}"?`}
                description={`You are about to permanently delete this bill.`}
                consequences={[
                    `Contains ${pendingDeleteBill?.items.length ?? 0} item(s) — all will be lost`,
                    "All person assignments within this bill will be removed",
                    "This cannot be undone",
                ]}
                confirmLabel="Delete Bill"
                onConfirm={() => {
                    if (pendingDeleteBill) {
                        onRemoveBill(pendingDeleteBill.id);
                        setPendingDeleteBill(null);
                    }
                }}
            />
        </>
    );
}

export { BillsCard };
