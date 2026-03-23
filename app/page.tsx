"use client";

import { useState, useEffect, useRef } from "react";
import LZString from "lz-string";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Trash2,
    Plus,
    Users,
    Receipt,
    Calculator,
    FileText,
    Edit2,
    RotateCcw,
    Share2,
    Users2,
} from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { PersonalBreakdownCard } from "@/components/cards/personal-breakdown";
import { Person, Item, Bill } from "@/lib/types";
import { rupiah } from "@/lib/utils";

const STORAGE_KEYS = {
    PEOPLE: "multi-bill-splitter-people",
    BILLS: "multi-bill-splitter-bills",
    ACTIVE_BILL_ID: "multi-bill-splitter-active-bill-id",
};

export default function MultiBillSplitter() {
    const [openTab, setOpenTab] = useState("current");
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
    const [visiblePersonBreakdowns, setVisiblePersonBreakdowns] = useState<
        Record<string, boolean>
    >({});

    const togglePersonBreakdown = (personId: string) => {
        setVisiblePersonBreakdowns((prev) => ({
            ...prev,
            [personId]: !prev[personId],
        }));
    };

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
                            })
                        );
                        setBills(parsedBills);
                    }

                    if (parsedData.activeBillId)
                        setActiveBillId(parsedData.activeBillId);

                    loadedFromHash = true;
                    setOpenTab("summary");

                    // Clean up the URL so it doesn't look messy after loading
                    window.history.replaceState(
                        null,
                        "",
                        window.location.pathname
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
                STORAGE_KEYS.ACTIVE_BILL_ID
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
                        (bill: Bill) => bill.id === savedActiveBillId
                    )
                ) {
                    setActiveBillId(savedActiveBillId);
                } else if (parsedBills.length > 0) {
                    setActiveBillId(parsedBills[0].id);
                }
            } else {
                const defaultBill: Bill = {
                    id: "1",
                    name: "Restaurant Bill",
                    items: [],
                    totalBill: 0,
                    createdAt: new Date(),
                };
                setBills([defaultBill]);
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

    const resetAllData = () => {
        if (
            confirm(
                "Are you sure you want to reset all data? This action cannot be undone."
            )
        ) {
            localStorage.removeItem(STORAGE_KEYS.PEOPLE);
            localStorage.removeItem(STORAGE_KEYS.BILLS);
            localStorage.removeItem(STORAGE_KEYS.ACTIVE_BILL_ID);
            window.history.replaceState(null, "", window.location.pathname); // Clear hash just in case

            setPeople([]);
            const defaultBill: Bill = {
                id: Date.now().toString(),
                name: "Restaurant Bill",
                items: [],
                totalBill: 0,
                createdAt: new Date(),
            };
            setBills([defaultBill]);
            setActiveBillId(defaultBill.id);
            setNewPersonName("");
            setNewBillName("");
            setEditingBillId("");
            setEditBillName("");
            setNewItem({ name: "", price: "", quantity: "1" });
            setOpenTab("current");
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
                        (personId) => personId !== id
                    ),
                })),
                paidBy: bill.paidBy === id ? undefined : bill.paidBy,
            }))
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
                        : bill
                )
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
                        : bill
                )
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
                              (item) => item.id !== itemId
                          ),
                      }
                    : bill
            )
        );
    };

    const updateTotalBill = (amount: number) => {
        setBills(
            bills.map((bill) =>
                bill.id === activeBillId ? { ...bill, totalBill: amount } : bill
            )
        );
    };

    const updateBillPaidBy = (billId: string, personId: string) => {
        setBills(
            bills.map((bill) =>
                bill.id === billId ? { ...bill, paidBy: personId } : bill
            )
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
                                                (id) => id !== personId
                                            )
                                          : [...item.assignedTo, personId],
                                  };
                              }
                              return item;
                          }),
                      }
                    : bill
            )
        );
    };

    const calculateBillTotals = (bill: Bill) => {
        if (!bill) return { subtotal: 0, taxAndFees: 0 };
        const subtotal = bill.items.reduce(
            (sum, item) => sum + item.finalPrice,
            0
        );
        const effectiveTotal = Math.max(bill.totalBill || 0, subtotal);
        const taxAndFees = effectiveTotal - subtotal;
        return { subtotal, taxAndFees };
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
                    const { subtotal } = calculateBillTotals(bill);
                    personPaidTotal += Math.max(bill.totalBill || 0, subtotal);
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

    const { subtotal, taxAndFees } = calculateBillTotals(activeBill);
    const { personTotals, grandTotal } = calculateGrandTotals();

    return (
        <div className="min-h-screen bg-background p-4">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-4">
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                            <Receipt className="h-8 w-8 text-primary" />
                            Multi-Bill Splitter
                        </h1>
                        <div className="flex gap-2">
                            <ModeToggle />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={generateShareLink}
                                className="border-primary/20 hover:text-primary-foreground hover:border-primary bg-primary/5 hover:bg-primary text-primary transition-all"
                            >
                                <Share2 className="h-4 w-4 mr-2" />
                                {isCopied ? "Copied!" : "Share Bill"}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={resetAllData}
                                className="text-destructive-foreground bg-destructive border-destructive/20 hover:bg-destructive/70"
                            >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Reset All
                            </Button>
                        </div>
                    </div>
                    <p className="text-muted-foreground">
                        Split multiple bills easily among friends
                    </p>
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
                            Bills ({bills.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Label htmlFor="bill-name">Add New Bill</Label>
                                <Input
                                    id="bill-name"
                                    placeholder="Enter bill name (e.g., 'Dinner at Restaurant')"
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
                                                        e.target.value
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
                                                            bill.name
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

                {/* Current Bill Content */}
                <Tabs value={openTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger
                            value="current"
                            onClick={() => setOpenTab("current")}
                        >
                            Current Bill: {activeBill?.name}
                        </TabsTrigger>
                        <TabsTrigger
                            value="summary"
                            onClick={() => setOpenTab("summary")}
                        >
                            Overall Summary
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="current" className="space-y-6">
                        {/* Item Management for Current Bill */}
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Items ({activeBill?.items.length})
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
                                                                2
                                                            )
                                                        )}{" "}
                                                        × {item.quantity} ={" "}
                                                        {rupiah(
                                                            item.finalPrice.toFixed(
                                                                2
                                                            )
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
                                                                    person.id
                                                                )
                                                                    ? "default"
                                                                    : "outline"
                                                            }
                                                            className="cursor-pointer"
                                                            onClick={() =>
                                                                togglePersonAssignment(
                                                                    item.id,
                                                                    person.id
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
                                                            ).toFixed(2)
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
                                                        e.target.value
                                                    ) || 0
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
                                                    e.target.value
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
                                    <div className="grid grid-cols-2 gap-4 text-sm">
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
                                        <div className="col-span-2">
                                            <span className="font-semibold">
                                                Total:
                                            </span>
                                            <span className="float-right font-semibold text-lg">
                                                {rupiah(
                                                    Math.max(
                                                        activeBill?.totalBill ||
                                                            0,
                                                        subtotal
                                                    ).toFixed(2)
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
                                                              activeBill.paidBy
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
                                                const owes =
                                                    calculatePersonOwesForBill(
                                                        person.id,
                                                        activeBill
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
                                                                owes.toFixed(2)
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
                    </TabsContent>

                    <TabsContent value="summary" className="space-y-6">
                        <Card>
                            {/* Per-bill breakdown */}
                            <CardHeader>
                                <CardTitle className="font-semibold text-xl mb-4 flex items-center gap-2">
                                    <Calculator className="h-5 w-5" />
                                    Overall Summary - All Bills
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div>
                                    <div className="space-y-4">
                                        {bills.map((bill) => {
                                            const {
                                                subtotal: billSubtotal,
                                                taxAndFees: billTaxAndFees,
                                            } = calculateBillTotals(bill);
                                            return (
                                                <Card
                                                    key={bill.id}
                                                    className="border-l-4 border-l-details"
                                                >
                                                    <CardContent className="pt-4">
                                                        <div className="flex justify-between items-center mb-3">
                                                            <h5 className="font-medium">
                                                                {bill.name}
                                                            </h5>
                                                            <span className="font-semibold text-details">
                                                                {rupiah(
                                                                    Math.max(
                                                                        bill.totalBill ||
                                                                            0,
                                                                        billSubtotal
                                                                    ).toFixed(2)
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                                                            <div>
                                                                Items:{" "}
                                                                {
                                                                    bill.items
                                                                        .length
                                                                }
                                                            </div>
                                                            <div>
                                                                Subtotal:{" "}
                                                                {rupiah(
                                                                    billSubtotal?.toFixed(
                                                                        2
                                                                    )
                                                                )}
                                                            </div>
                                                            <div>
                                                                Tax & Fees:{" "}
                                                                {rupiah(
                                                                    billTaxAndFees.toFixed(
                                                                        2
                                                                    )
                                                                )}
                                                            </div>
                                                            <div>
                                                                Paid By:{" "}
                                                                <span className="font-medium text-details">
                                                                    {bill.paidBy
                                                                        ? people.find(
                                                                              (
                                                                                  p
                                                                              ) =>
                                                                                  p.id ===
                                                                                  bill.paidBy
                                                                          )
                                                                              ?.name ||
                                                                          "Unknown"
                                                                        : "Not specified"}
                                                                </span>
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
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-semibold text-xl mb-4 flex items-center gap-2">
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
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
