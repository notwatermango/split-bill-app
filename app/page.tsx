"use client";

import { useState, useEffect, useRef } from "react";
import LZString from "lz-string";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Trash2, Plus, Users, Calculator, FileText, Edit2 } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { Person, Item, Bill } from "@/lib/types";
import { rupiah } from "@/lib/utils";
import Link from "next/link";
import { DEFAULT_BILLS, STORAGE_KEYS } from "@/lib/constants";
import {
    BillSummaryButton,
    ResetButton,
    ShareButton,
} from "@/components/action-buttons";
import { HowToUseCard } from "@/components/cards/how-to-use";

export default function MultiBillSplitter() {
    const [people, setPeople] = useState<Person[]>([]);
    const [bills, setBills] = useState<Bill[]>([]);
    const [activeBillId, setActiveBillId] = useState("");
    const [newPersonName, setNewPersonName] = useState("");
    const [newBillName, setNewBillName] = useState("");
    const [editingBillId, setEditingBillId] = useState("");
    const [editBillName, setEditBillName] = useState("");
    const [newItem, setNewItem] = useState({
        name: "",
        price: "",
        quantity: "1",
    });
    const [isCopied, setIsCopied] = useState(false);

    const itemNameRef = useRef<HTMLInputElement>(null);

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

    // Generate Share Link Feature
    const generateShareLink = () => {
        const appState = {
            people,
            bills,
            activeBillId,
        };

        const jsonString = JSON.stringify(appState);
        const compressed = LZString.compressToEncodedURIComponent(jsonString);

        const shareableUrl = `${window.location.origin}${window.location.pathname}/summary#${compressed}`;

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

    const resetAllData = () => {
        if (
            confirm(
                "Are you sure you want to reset all data? This action cannot be undone.",
            )
        ) {
            localStorage.removeItem(STORAGE_KEYS.PEOPLE);
            localStorage.removeItem(STORAGE_KEYS.BILLS);
            localStorage.removeItem(STORAGE_KEYS.ACTIVE_BILL_ID);
            window.history.replaceState(null, "", window.location.pathname); // Clear hash just in case

            setPeople([]);
            setBills(DEFAULT_BILLS);
            setActiveBillId("");
            setNewPersonName("");
            setNewBillName("");
            setEditingBillId("");
            setEditBillName("");
            setNewItem({ name: "", price: "", quantity: "1" });
        }
    };

    const activeBill =
        bills.find((bill) => bill.id === activeBillId) || bills[0];

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

    const removePerson = (id: string) => {
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

    const addBill = () => {
        if (newBillName.trim()) {
            const bill: Bill = {
                id: Date.now().toString(),
                name: newBillName.trim(),
                items: [],
                totalBill: 0,
                createdAt: new Date(),
            };
            setBills([...bills, bill]);
            setActiveBillId(bill.id);
            setNewBillName("");
        }
    };

    const removeBill = (id: string) => {
        if (bills.length > 1) {
            const newBills = bills.filter((bill) => bill.id !== id);
            setBills(newBills);
            if (activeBillId === id) {
                setActiveBillId(newBills[0].id);
            }
        }
    };

    const startEditingBill = (billId: string, currentName: string) => {
        setEditingBillId(billId);
        setEditBillName(currentName);
    };

    const saveEditBill = () => {
        if (editBillName.trim()) {
            setBills(
                bills.map((bill) =>
                    bill.id === editingBillId
                        ? { ...bill, name: editBillName.trim() }
                        : bill,
                ),
            );
        }
        setEditingBillId("");
        setEditBillName("");
    };

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
            setBills(
                bills.map((bill) =>
                    bill.id === activeBillId
                        ? { ...bill, items: [...bill.items, item] }
                        : bill,
                ),
            );
            setNewItem({ name: "", price: "", quantity: "1" });
        }
        if (itemNameRef.current) itemNameRef.current.focus();
    };

    const removeItem = (itemId: string) => {
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

    const updateTotalBill = (amount: number) => {
        setBills(
            bills.map((bill) =>
                bill.id === activeBillId
                    ? { ...bill, totalBill: amount }
                    : bill,
            ),
        );
    };

    const updateBillPaidBy = (billId: string, personId: string) => {
        setBills(
            bills.map((bill) =>
                bill.id === billId ? { ...bill, paidBy: personId } : bill,
            ),
        );
    };

    const togglePersonAssignment = (itemId: string, personId: string) => {
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
                        <div className="flex gap-2">
                            <ModeToggle />
                            <ResetButton onClick={resetAllData} />
                            <BillSummaryButton />
                            <ShareButton
                                onClick={generateShareLink}
                                isCopied={isCopied}
                            />
                        </div>
                    </div>
                </div>

                {/* People Management */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            People{" "}
                            <span className="ml-1 inline-flex items-center justify-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                {people.length}
                            </span>
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
                                    onChange={(e) =>
                                        setNewPersonName(e.target.value)
                                    }
                                    onKeyPress={(e) =>
                                        e.key === "Enter" && addPerson()
                                    }
                                />
                            </div>
                            <Button onClick={addPerson} className="mt-6">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        {people.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {people.map((person) => (
                                    <Badge
                                        key={person.id}
                                        variant="outline"
                                        className="flex items-center gap-1"
                                    >
                                        {person.name}
                                        <button
                                            onClick={() =>
                                                removePerson(person.id)
                                            }
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

                {/* Bills Management */}
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
                                    onChange={(e) =>
                                        setNewBillName(e.target.value)
                                    }
                                    onKeyPress={(e) =>
                                        e.key === "Enter" && addBill()
                                    }
                                />
                            </div>
                            <Button onClick={addBill} className="mt-6">
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
                                        onClick={() => setActiveBillId(bill.id)}
                                    >
                                        {editingBillId === bill.id ? (
                                            <Input
                                                className="h-4 text-xs"
                                                value={editBillName}
                                                onChange={(e) =>
                                                    setEditBillName(
                                                        e.target.value,
                                                    )
                                                }
                                                onKeyPress={(e) =>
                                                    e.key === "Enter" &&
                                                    saveEditBill()
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
                                                            removeBill(bill.id);
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

                {activeBillId && (
                    <>
                        {/* Item Management for Current Bill */}
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
                                        <Label htmlFor="item-name">
                                            Item Name
                                        </Label>
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
                                        <Label htmlFor="item-price">
                                            Price
                                        </Label>
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
                                        <Label htmlFor="item-quantity">
                                            Quantity
                                        </Label>
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
                                    <Button onClick={addItem} className="mt-6">
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
                                                        {rupiah(
                                                            item.price.toFixed(
                                                                2,
                                                            ),
                                                        )}{" "}
                                                        × {item.quantity} ={" "}
                                                        {rupiah(
                                                            item.finalPrice.toFixed(
                                                                2,
                                                            ),
                                                        )}
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        removeItem(item.id)
                                                    }
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
                                                                togglePersonAssignment(
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
                                                                item.assignedTo
                                                                    .length
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

                        {/* Total Bill for Current Bill */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Total Paid</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-4 items-end flex-wrap sm:flex-nowrap">
                                    <div className="flex-1 w-full sm:w-auto">
                                        <Label htmlFor="total-bill">
                                            How much paid including tax & fees?
                                        </Label>
                                        <Input
                                            id="total-bill"
                                            type="number"
                                            step="0.01"
                                            placeholder={
                                                subtotal
                                                    ? subtotal.toFixed(2)
                                                    : "0.00"
                                            }
                                            value={activeBill?.totalBill || ""}
                                            onChange={(e) =>
                                                updateTotalBill(
                                                    Number.parseFloat(
                                                        e.target.value,
                                                    ) || 0,
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
                                                updateBillPaidBy(
                                                    activeBillId,
                                                    e.target.value,
                                                )
                                            }
                                        >
                                            <option value="" disabled>
                                                Select person
                                            </option>
                                            {people.map((person) => (
                                                <option
                                                    key={person.id}
                                                    value={person.id}
                                                >
                                                    {person.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}

                {/* Current Bill Summary */}
                {people.length > 0 && activeBill?.items.length > 0 && (
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
                                    <span className="font-semibold">
                                        Total:
                                    </span>
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
                                                  (p) =>
                                                      p.id ===
                                                      activeBill.paidBy,
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
                                        const owesForBill =
                                            calculatePersonOwesForBill(
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
                                                    {rupiah(
                                                        owesForBill.toFixed(2),
                                                    )}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
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
