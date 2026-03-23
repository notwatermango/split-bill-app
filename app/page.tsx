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
    Eye,
    EyeOff,
} from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

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

interface Bill {
    id: string;
    name: string;
    items: Item[];
    totalBill: number;
    createdAt: Date;
    paidBy?: string;
}

const STORAGE_KEYS = {
    PEOPLE: "multi-bill-splitter-people",
    BILLS: "multi-bill-splitter-bills",
    ACTIVE_BILL_ID: "multi-bill-splitter-active-bill-id",
};

const rupiah = (number: any) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
    }).format(number);
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
                        {/* Grand Total Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calculator className="h-5 w-5" />
                                    Overall Summary - All Bills
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Per-bill breakdown */}
                                <div>
                                    <h4 className="font-semibold mb-4">
                                        Bill-by-Bill Breakdown:
                                    </h4>
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
                                </div>

                                <Separator />

                                {/* Detailed breakdown per person */}
                                <div>
                                    <h4 className="font-semibold mb-4">
                                        Detailed Breakdown by Person:
                                    </h4>
                                    <div className="space-y-6">
                                        {people.map((person) => {
                                            let personGrandTotal = 0;
                                            const personBillBreakdown = bills
                                                .map((bill) => {
                                                    const personItems: {
                                                        item: Item;
                                                        share: number;
                                                        taxShare: number;
                                                    }[] = [];
                                                    let billItemsTotal = 0;

                                                    bill.items.forEach(
                                                        (item) => {
                                                            if (
                                                                item.assignedTo.includes(
                                                                    person.id
                                                                )
                                                            ) {
                                                                const share =
                                                                    item.finalPrice /
                                                                    item
                                                                        .assignedTo
                                                                        .length;
                                                                billItemsTotal +=
                                                                    share;
                                                                personItems.push(
                                                                    {
                                                                        item,
                                                                        share,
                                                                        taxShare: 0,
                                                                    }
                                                                );
                                                            }
                                                        }
                                                    );

                                                    const {
                                                        subtotal: billSubtotal,
                                                        taxAndFees:
                                                            billTaxAndFees,
                                                    } =
                                                        calculateBillTotals(
                                                            bill
                                                        );

                                                    const taxShare =
                                                        billItemsTotal > 0
                                                            ? (billItemsTotal /
                                                                  (billSubtotal ||
                                                                      1)) *
                                                              billTaxAndFees
                                                            : 0;

                                                    personItems.forEach(
                                                        (personItem) => {
                                                            personItem.taxShare =
                                                                billItemsTotal >
                                                                0
                                                                    ? (personItem.share /
                                                                          billItemsTotal) *
                                                                      taxShare
                                                                    : 0;
                                                        }
                                                    );

                                                    const billTotal =
                                                        billItemsTotal +
                                                        taxShare;
                                                    const amountPaid =
                                                        bill.paidBy ===
                                                        person.id
                                                            ? bill.totalBill
                                                            : 0;
                                                    const netOwesForBill =
                                                        billTotal - amountPaid;

                                                    personGrandTotal +=
                                                        netOwesForBill;

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
                                                        breakdown.items.length >
                                                            0 ||
                                                        breakdown.amountPaid > 0
                                                );

                                            return (
                                                <Card
                                                    key={person.id}
                                                    className="border-l-4 border-l-details cursor-pointer hover:bg-muted/30 transition-colors"
                                                    onClick={() =>
                                                        togglePersonBreakdown(
                                                            person.id
                                                        )
                                                    }
                                                >
                                                    <CardContent className="pt-4">
                                                        <div className="flex justify-between items-center mb-4">
                                                            <div className="flex items-center gap-3">
                                                                <h5 className="text-lg font-semibold">
                                                                    {
                                                                        person.name
                                                                    }
                                                                </h5>
                                                                <span className="flex items-center gap-1 text-xs text-muted-foreground ml-1">
                                                                    {visiblePersonBreakdowns[
                                                                        person
                                                                            .id
                                                                    ] ? (
                                                                        <>
                                                                            <EyeOff className="h-3 w-3" />
                                                                            Hide
                                                                            details
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Eye className="h-3 w-3" />
                                                                            Show
                                                                            details
                                                                        </>
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <span
                                                                className={`text-xl font-bold ${
                                                                    personGrandTotal <
                                                                    0
                                                                        ? "text-income"
                                                                        : "text-deficit"
                                                                }`}
                                                            >
                                                                {personGrandTotal <
                                                                0
                                                                    ? ""
                                                                    : "("}
                                                                {rupiah(
                                                                    Math.abs(
                                                                        personGrandTotal
                                                                    ).toFixed(2)
                                                                )}
                                                                {personGrandTotal <
                                                                0
                                                                    ? ""
                                                                    : ")"}
                                                            </span>
                                                        </div>

                                                        {visiblePersonBreakdowns[
                                                            person.id
                                                        ] &&
                                                            (personBillBreakdown.length >
                                                            0 ? (
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
                                                                                key={
                                                                                    bill.id
                                                                                }
                                                                                className="bg-muted/50 rounded-lg p-4"
                                                                            >
                                                                                <div className="flex justify-between items-center mb-3">
                                                                                    <h6 className="font-medium text-details">
                                                                                        {
                                                                                            bill.name
                                                                                        }
                                                                                    </h6>
                                                                                    <span
                                                                                        className={`font-semibold ${
                                                                                            netOwesForBill <
                                                                                            0
                                                                                                ? "text-income"
                                                                                                : "text-deficit"
                                                                                        }`}
                                                                                    >
                                                                                        {rupiah(
                                                                                            Math.abs(
                                                                                                netOwesForBill
                                                                                            ).toFixed(
                                                                                                2
                                                                                            )
                                                                                        )}
                                                                                    </span>
                                                                                </div>

                                                                                <div className="space-y-2">
                                                                                    {items.map(
                                                                                        ({
                                                                                            item,
                                                                                            share,
                                                                                        }) => (
                                                                                            <div
                                                                                                key={
                                                                                                    item.id
                                                                                                }
                                                                                                className="flex justify-between items-center text-sm"
                                                                                            >
                                                                                                <span className="text-muted-foreground">
                                                                                                    {
                                                                                                        item.name
                                                                                                    }
                                                                                                    {item
                                                                                                        .assignedTo
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
                                                                                    {taxShare >
                                                                                        0 && (
                                                                                        <div className="flex justify-between items-center text-sm border-t pt-2 mt-2">
                                                                                            <span className="text-muted-foreground">
                                                                                                Tax
                                                                                                &
                                                                                                Fees
                                                                                                Share
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
                                                                                    {amountPaid >
                                                                                        0 && (
                                                                                        <div className="flex justify-between items-center text-sm border-t border-details-border pt-2 mt-2 font-semibold">
                                                                                            <span>
                                                                                                Paid
                                                                                                for
                                                                                                bill
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
                                                                    No activity
                                                                    for this
                                                                    person
                                                                </p>
                                                            ))}
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                </div>

                                <Separator />

                                {/* Grand totals */}
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-semibold text-lg">
                                            Grand Total - All Bills:
                                        </h4>
                                        <span className="text-lg font-bold">
                                            {rupiah(grandTotal.toFixed(2))}
                                        </span>
                                    </div>

                                    <h4 className="font-semibold mb-3">
                                        Final Balance Each Person:
                                    </h4>
                                    <div className="space-y-3">
                                        {people.map((person) => {
                                            const { owes, paid, balance } =
                                                personTotals[person.id];
                                            const isOwed = balance > 0;
                                            const balanceText =
                                                balance === 0
                                                    ? "Fully settled"
                                                    : isOwed
                                                    ? `Gets back ${rupiah(
                                                          Math.abs(
                                                              balance
                                                          ).toFixed(2)
                                                      )}`
                                                    : `Still owes ${rupiah(
                                                          Math.abs(
                                                              balance
                                                          ).toFixed(2)
                                                      )}`;

                                            return (
                                                <div
                                                    key={person.id}
                                                    className={`flex flex-col p-4 rounded-lg border ${
                                                        balance === 0
                                                            ? "bg-muted"
                                                            : isOwed
                                                            ? "bg-income-muted border-income-border"
                                                            : "bg-deficit-muted border-deficit-border"
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-center mb-2">
                                                        <div>
                                                            <span className="font-semibold text-lg">
                                                                {person.name}
                                                            </span>
                                                            <div className="text-sm text-muted-foreground font-medium mt-1">
                                                                Paid:{" "}
                                                                {rupiah(
                                                                    paid.toFixed(
                                                                        2
                                                                    )
                                                                )}{" "}
                                                                | Spent:{" "}
                                                                {rupiah(
                                                                    owes.toFixed(
                                                                        2
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                        <span
                                                            className={`text-2xl font-bold ${
                                                                balance === 0
                                                                    ? "text-muted-foreground"
                                                                    : isOwed
                                                                    ? "text-income"
                                                                    : "text-deficit"
                                                            }`}
                                                        >
                                                            {balance > 0
                                                                ? "+"
                                                                : balance < 0
                                                                ? "-"
                                                                : ""}
                                                            {rupiah(
                                                                Math.abs(
                                                                    balance
                                                                ).toFixed(2)
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div
                                                        className={`text-right text-sm font-semibold ${
                                                            isOwed
                                                                ? "text-income"
                                                                : "text-deficit"
                                                        }`}
                                                    >
                                                        {balanceText}
                                                    </div>
                                                </div>
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
