"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Users, Receipt, Calculator } from "lucide-react";

interface Person {
    id: string;
    name: string;
}

interface Item {
    id: string;
    name: string;
    price: number;
    quantity: number;
    finalPrice: number;
    assignedTo: string[];
}

export default function SplitBillApp() {
    const [people, setPeople] = useState<Person[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [totalBill, setTotalBill] = useState<number>(0);
    const [newPersonName, setNewPersonName] = useState("");
    const [newItem, setNewItem] = useState({
        name: "",
        price: "",
        quantity: "1",
    });

    // Add person
    const addPerson = () => {
        if (newPersonName.trim()) {
            const person: Person = {
                id: Date.now().toString(),
                name: newPersonName.trim(),
            };
            setPeople([...people, person]);
            setNewPersonName("");
        }
    };

    // Remove person
    const removePerson = (id: string) => {
        setPeople(people.filter((p) => p.id !== id));
        // Remove person from all item assignments
        setItems(
            items.map((item) => ({
                ...item,
                assignedTo: item.assignedTo.filter((personId) => personId !== id),
            }))
        );
    };

    // Add item
    const addItem = () => {
        if (newItem.name.trim() && newItem.price) {
            const price = Number.parseFloat(newItem.price);
            const quantity = Number.parseInt(newItem.quantity) || 1;
            const item: Item = {
                id: Date.now().toString(),
                name: newItem.name.trim(),
                price,
                quantity,
                finalPrice: price * quantity,
                assignedTo: [],
            };
            setItems([...items, item]);
            setNewItem({ name: "", price: "", quantity: "1" });
        }
    };

    // Remove item
    const removeItem = (id: string) => {
        setItems(items.filter((item) => item.id !== id));
    };

    // Toggle person assignment to item
    const togglePersonAssignment = (itemId: string, personId: string) => {
        setItems(
            items.map((item) => {
                if (item.id === itemId) {
                    const isAssigned = item.assignedTo.includes(personId);
                    return {
                        ...item,
                        assignedTo: isAssigned
                            ? item.assignedTo.filter((id) => id !== personId)
                            : [...item.assignedTo, personId],
                    };
                }
                return item;
            })
        );
    };

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.finalPrice, 0);
    const taxAndFees = Math.max(0, totalBill - subtotal);

    // Calculate what each person owes
    const calculatePersonOwes = (personId: string) => {
        let itemTotal = 0;
        let totalAssignedItems = 0;

        items.forEach((item) => {
            if (item.assignedTo.includes(personId)) {
                itemTotal += item.finalPrice / item.assignedTo.length;
                totalAssignedItems += item.finalPrice;
            }
        });

        // Calculate weighted tax/fees
        const taxShare = totalAssignedItems > 0 ? (itemTotal / subtotal) * taxAndFees : 0;

        return itemTotal + taxShare;
    };

    return (
        <div className="min-h-screen bg-background p-4">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
                        <Receipt className="h-8 w-8 text-primary" />
                        Split Bill Calculator
                    </h1>
                    <p className="text-muted-foreground">Easily split restaurant bills among friends</p>
                </div>

                {/* People Management */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            People ({people.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Label htmlFor="person-name">Add Person</Label>
                                <Input
                                    id="person-name"
                                    placeholder="Enter name"
                                    value={newPersonName}
                                    onChange={(e) => setNewPersonName(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && addPerson()}
                                />
                            </div>
                            <Button onClick={addPerson} className="mt-6">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        {people.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {people.map((person) => (
                                    <Badge key={person.id} variant="secondary" className="flex items-center gap-1">
                                        {person.name}
                                        <button
                                            onClick={() => removePerson(person.id)}
                                            className="ml-1 hover:text-destructive"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Item Management */}
                <Card>
                    <CardHeader>
                        <CardTitle>Items ({items.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                            <div>
                                <Label htmlFor="item-name">Item Name</Label>
                                <Input
                                    id="item-name"
                                    placeholder="Item name"
                                    value={newItem.name}
                                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="item-price">Price (IDR)</Label>
                                <Input
                                    id="item-price"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={newItem.price}
                                    onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="item-quantity">Quantity</Label>
                                <Input
                                    id="item-quantity"
                                    type="number"
                                    min="1"
                                    value={newItem.quantity}
                                    onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                                />
                            </div>
                            <Button onClick={addItem} className="mt-6">
                                Add Item
                            </Button>
                        </div>

                        {items.map((item) => (
                            <Card key={item.id} className="border-l-4 border-l-primary">
                                <CardContent className="pt-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="font-semibold">{item.name}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                IDR{item.price.toFixed(2)} × {item.quantity} = IDR
                                                {item.finalPrice.toFixed(2)}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeItem(item.id)}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div>
                                        <Label className="text-sm font-medium">Assigned to:</Label>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {people.map((person) => (
                                                <Badge
                                                    key={person.id}
                                                    variant={
                                                        item.assignedTo.includes(person.id) ? "default" : "outline"
                                                    }
                                                    className="cursor-pointer"
                                                    onClick={() => togglePersonAssignment(item.id, person.id)}
                                                >
                                                    {person.name}
                                                </Badge>
                                            ))}
                                        </div>
                                        {item.assignedTo.length > 0 && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                IDR{(item.finalPrice / item.assignedTo.length).toFixed(2)} per person
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </CardContent>
                </Card>

                {/* Total Bill */}
                <Card>
                    <CardHeader>
                        <CardTitle>Total Bill</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2 items-end">
                            <div className="flex-1">
                                <Label htmlFor="total-bill">Total Amount (IDR)</Label>
                                <Input
                                    id="total-bill"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={totalBill || ""}
                                    onChange={(e) => setTotalBill(Number.parseFloat(e.target.value) || 0)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary */}
                {people.length > 0 && items.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calculator className="h-5 w-5" />
                                Bill Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Subtotal:</span>
                                    <span className="float-right font-medium">IDR{subtotal.toFixed(2)}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Tax & Fees:</span>
                                    <span className="float-right font-medium">IDR{taxAndFees.toFixed(2)}</span>
                                </div>
                                <div className="col-span-2">
                                    <Separator />
                                </div>
                                <div className="col-span-2">
                                    <span className="font-semibold">Total:</span>
                                    <span className="float-right font-semibold text-lg">IDR{totalBill.toFixed(2)}</span>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <h4 className="font-semibold mb-3">What Each Person Owes:</h4>
                                <div className="space-y-2">
                                    {people.map((person) => {
                                        const owes = calculatePersonOwes(person.id);
                                        return (
                                            <div
                                                key={person.id}
                                                className="flex justify-between items-center p-3 bg-muted rounded-lg"
                                            >
                                                <span className="font-medium">{person.name}</span>
                                                <span className="text-lg font-semibold text-primary">
                                                    IDR{owes.toFixed(2)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
