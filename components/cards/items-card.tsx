"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Person, Bill } from "@/lib/types";
import { rupiah } from "@/lib/utils";

interface ItemsCardProps {
    activeBill: Bill;
    people: Person[];
    onAddItem: (item: { name: string; price: string; quantity: string }) => void;
    onRemoveItem: (itemId: string) => void;
    onTogglePersonAssignment: (itemId: string, personId: string) => void;
}

function ItemsCard({
    activeBill,
    people,
    onAddItem,
    onRemoveItem,
    onTogglePersonAssignment,
}: ItemsCardProps) {
    const [newItem, setNewItem] = useState({
        name: "",
        price: "",
        quantity: "1",
    });
    const itemNameRef = useRef<HTMLInputElement>(null);

    const handleAddItem = () => {
        if (newItem.name.trim() && newItem.price) {
            onAddItem(newItem);
            setNewItem({ name: "", price: "", quantity: "1" });
        }
        if (itemNameRef.current) itemNameRef.current.focus();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {activeBill?.name} Items{" "}
                    <span className="ml-1 inline-flex items-center justify-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {activeBill?.items.length}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
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
                        />
                    </div>
                    <Button onClick={handleAddItem} className="mt-6">
                        Add Item
                    </Button>
                </div>

                {activeBill?.items.map((item) => (
                    <Card
                        key={item.id}
                        className="border-l-4 border-l-primary"
                    >
                        <CardContent className="pt-4">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h4 className="font-semibold">
                                        {item.name}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        {rupiah(item.price.toFixed(2))}{" "}
                                        × {item.quantity} ={" "}
                                        {rupiah(item.finalPrice.toFixed(2))}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onRemoveItem(item.id)}
                                    className="text-destructive hover:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>

                            <div>
                                <Label className="text-sm font-medium">
                                    Assigned to:
                                </Label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {people.map((person) => (
                                        <Badge
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
                                        </Badge>
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
                        </CardContent>
                    </Card>
                ))}
            </CardContent>
        </Card>
    );
}

export { ItemsCard };
