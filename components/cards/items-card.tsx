"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectableBadge } from "@/components/ui/selectable-badge";
import { Bill, Item, Person } from "@/lib/types";
import { rupiah } from "@/lib/utils";
import {
    Check,
    ClipboardList,
    MoreHorizontal,
    Pencil,
    Plus,
    Trash2,
    X,
} from "lucide-react";
import { useRef, useState } from "react";

interface ItemsCardProps {
    activeBill: Bill;
    people: Person[];
    onAddItem: (item: {
        name: string;
        price: string;
        quantity: string;
    }) => void;
    onRemoveItem: (itemId: string) => void;
    onEditItem: (
        itemId: string,
        updates: Partial<
            Pick<Item, "name" | "price" | "quantity" | "finalPrice">
        >,
    ) => void;
    onTogglePersonAssignment: (itemId: string, personId: string) => void;
}

function ItemsCard({
    activeBill,
    people,
    onAddItem,
    onRemoveItem,
    onEditItem,
    onTogglePersonAssignment,
}: ItemsCardProps) {
    const [newItem, setNewItem] = useState({
        name: "",
        price: "",
        quantity: "1",
    });
    const itemNameRef = useRef<HTMLInputElement>(null);

    // Which item is showing its action overlay (⋯ or long-press)
    const [activeActionItemId, setActiveActionItemId] = useState<string | null>(
        null,
    );
    // Which item is in inline-edit mode
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState({
        name: "",
        price: "",
        quantity: "",
    });

    // Item pending deletion (waiting for dialog confirmation)
    const [pendingDeleteItem, setPendingDeleteItem] = useState<Item | null>(
        null,
    );

    const handleAddItem = () => {
        if (newItem.name.trim() && newItem.price) {
            onAddItem(newItem);
            setNewItem({ name: "", price: "", quantity: "1" });
        }
        if (itemNameRef.current) itemNameRef.current.focus();
    };

    const startEditing = (item: Item) => {
        setActiveActionItemId(null);
        setEditingItemId(item.id);
        setEditValues({
            name: item.name,
            price: String(item.price),
            quantity: String(item.quantity),
        });
    };

    const saveEdit = () => {
        if (!editingItemId || !editValues.name.trim() || !editValues.price)
            return;
        const price = Number.parseFloat(editValues.price);
        const quantity = Number.parseInt(editValues.quantity) || 1;
        onEditItem(editingItemId, {
            name: editValues.name.trim(),
            price,
            quantity,
            finalPrice: price * quantity,
        });
        setEditingItemId(null);
    };

    const cancelEdit = () => setEditingItemId(null);

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5" />
                        {activeBill?.name} Items{" "}
                        <span className="ml-1 inline-flex items-center justify-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            {activeBill?.items.length}
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Add item form */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                        <div>
                            <Label htmlFor="item-name">Item Name</Label>
                            <Input
                                ref={itemNameRef}
                                id="item-name"
                                placeholder="Item name"
                                value={newItem.name}
                                onChange={(e) =>
                                    setNewItem({
                                        ...newItem,
                                        name: e.target.value,
                                    })
                                }
                                onKeyDown={(e) =>
                                    e.key === "Enter" && handleAddItem()
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="item-price">Price</Label>
                            <Input
                                id="item-price"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={newItem.price}
                                onChange={(e) =>
                                    setNewItem({
                                        ...newItem,
                                        price: e.target.value,
                                    })
                                }
                                onKeyDown={(e) =>
                                    e.key === "Enter" && handleAddItem()
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="item-quantity">Quantity</Label>
                            <Input
                                id="item-quantity"
                                type="number"
                                min="1"
                                value={newItem.quantity}
                                onChange={(e) =>
                                    setNewItem({
                                        ...newItem,
                                        quantity: e.target.value,
                                    })
                                }
                                onKeyDown={(e) =>
                                    e.key === "Enter" && handleAddItem()
                                }
                            />
                        </div>
                        <Button
                            onClick={handleAddItem}
                            className="sm:mt-6 w-full md:w-auto"
                        >
                            <Plus className="h-4 w-4 mr-2 md:mr-0" />
                            Add Item
                        </Button>
                    </div>

                    {/* Item cards */}
                    {activeBill?.items.map((item) => (
                        <Card
                            key={item.id}
                            className="border-l-4 border-l-primary relative group"
                        >
                            {/* Action overlay (shared by desktop ⋯ click and mobile long-press) */}
                            {activeActionItemId === item.id && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() =>
                                            setActiveActionItemId(null)
                                        }
                                    />
                                    <div className="absolute top-2 right-2 z-20 flex flex-col gap-1 bg-popover border rounded-lg shadow-lg p-2 min-w-[140px]">
                                        <span className="text-xs text-muted-foreground font-medium px-1 pb-1 border-b w-full truncate max-w-[120px]">
                                            {item.name}
                                        </span>
                                        <button
                                            onClick={() => startEditing(item)}
                                            className="flex items-center gap-2 w-full px-2 py-1.5 text-sm hover:bg-muted rounded"
                                        >
                                            <Pencil className="h-4 w-4" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => {
                                                setActiveActionItemId(null);
                                                setPendingDeleteItem(item);
                                            }}
                                            className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-destructive dark:text-red-500 dark:hover:text-red-400 hover:bg-destructive/10 rounded"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Delete
                                        </button>
                                        <button
                                            onClick={() =>
                                                setActiveActionItemId(null)
                                            }
                                            className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted rounded"
                                        >
                                            <X className="h-4 w-4" />
                                            Cancel
                                        </button>
                                    </div>
                                </>
                            )}

                            <CardContent className="pt-4">
                                {editingItemId === item.id ? (
                                    /* Inline edit mode — replaces the item header in-place */
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                            <div>
                                                <Label
                                                    htmlFor={`edit-name-${item.id}`}
                                                    className="text-xs"
                                                >
                                                    Name
                                                </Label>
                                                <Input
                                                    id={`edit-name-${item.id}`}
                                                    className="h-8 text-sm"
                                                    value={editValues.name}
                                                    onChange={(e) =>
                                                        setEditValues({
                                                            ...editValues,
                                                            name: e.target
                                                                .value,
                                                        })
                                                    }
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter")
                                                            saveEdit();
                                                        if (e.key === "Escape")
                                                            cancelEdit();
                                                    }}
                                                    autoFocus
                                                />
                                            </div>
                                            <div>
                                                <Label
                                                    htmlFor={`edit-price-${item.id}`}
                                                    className="text-xs"
                                                >
                                                    Price
                                                </Label>
                                                <Input
                                                    id={`edit-price-${item.id}`}
                                                    type="number"
                                                    step="0.01"
                                                    className="h-8 text-sm"
                                                    value={editValues.price}
                                                    onChange={(e) =>
                                                        setEditValues({
                                                            ...editValues,
                                                            price: e.target
                                                                .value,
                                                        })
                                                    }
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter")
                                                            saveEdit();
                                                        if (e.key === "Escape")
                                                            cancelEdit();
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <Label
                                                    htmlFor={`edit-qty-${item.id}`}
                                                    className="text-xs"
                                                >
                                                    Quantity
                                                </Label>
                                                <Input
                                                    id={`edit-qty-${item.id}`}
                                                    type="number"
                                                    min="1"
                                                    className="h-8 text-sm"
                                                    value={editValues.quantity}
                                                    onChange={(e) =>
                                                        setEditValues({
                                                            ...editValues,
                                                            quantity:
                                                                e.target.value,
                                                        })
                                                    }
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter")
                                                            saveEdit();
                                                        if (e.key === "Escape")
                                                            cancelEdit();
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <button
                                                onClick={saveEdit}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded hover:bg-primary/10 text-primary"
                                            >
                                                <Check className="h-4 w-4" />
                                                Save
                                            </button>
                                            <button
                                                onClick={cancelEdit}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded hover:bg-muted text-muted-foreground"
                                            >
                                                <X className="h-4 w-4" />
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* Normal display mode */
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="font-semibold">
                                                {item.name}
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                                {rupiah(item.price.toFixed(2))}{" "}
                                                × {item.quantity} ={" "}
                                                {rupiah(
                                                    item.finalPrice.toFixed(2),
                                                )}
                                            </p>
                                        </div>
                                        {/* ⋯ button — desktop hover-to-reveal; on mobile this is opacity-100 always for discoverability */}
                                        <button
                                            onClick={() =>
                                                setActiveActionItemId(item.id)
                                            }
                                            className="p-1.5 rounded hover:bg-muted cursor-pointer sm:opacity-0 sm:group-hover:opacity-100 sm:transition-opacity"
                                            aria-label={`Options for ${item.name}`}
                                        >
                                            <MoreHorizontal className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}

                                {/* Person assignment — always visible */}
                                {editingItemId !== item.id && (
                                    <div>
                                        <Label className="text-sm font-medium">
                                            Assigned to:
                                        </Label>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {people.map((person) => (
                                                <SelectableBadge
                                                    key={person.id}
                                                    variant={
                                                        item.assignedTo.includes(
                                                            person.id,
                                                        )
                                                            ? "default"
                                                            : "outline"
                                                    }
                                                    className="cursor-pointer"
                                                    onClick={() =>
                                                        onTogglePersonAssignment(
                                                            item.id,
                                                            person.id,
                                                        )
                                                    }
                                                >
                                                    {person.name}
                                                </SelectableBadge>
                                            ))}
                                        </div>
                                        {item.assignedTo.length > 0 && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {rupiah(
                                                    (
                                                        item.finalPrice /
                                                        item.assignedTo.length
                                                    ).toFixed(2),
                                                )}{" "}
                                                per person
                                            </p>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </CardContent>
            </Card>
            <DeleteConfirmDialog
                open={!!pendingDeleteItem}
                onOpenChange={(open) => !open && setPendingDeleteItem(null)}
                title={`Delete "${pendingDeleteItem?.name}"?`}
                description={`This item will be removed from the bill.`}
                warning="All person assignments for this item will be lost and this action cannot be undone."
                confirmLabel="Delete Item"
                onConfirm={() => {
                    if (pendingDeleteItem) {
                        onRemoveItem(pendingDeleteItem.id);
                        setPendingDeleteItem(null);
                    }
                }}
            />
        </>
    );
}

export { ItemsCard };
