"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLongPress } from "@/hooks/use-long-press";
import { Person } from "@/lib/types";
import {
    Check,
    CircleEllipsis,
    Edit2,
    MoreHorizontal,
    Plus,
    Trash2,
    Users,
    X,
} from "lucide-react";
import { useCallback, useState } from "react";

interface PeopleCardProps {
    people: Person[];
    onAddPerson: (name: string) => void;
    onRemovePerson: (id: string) => void;
    onRenamePerson: (id: string, name: string) => void;
}

function PeopleCard({
    people,
    onAddPerson,
    onRemovePerson,
    onRenamePerson,
}: PeopleCardProps) {
    const [newPersonName, setNewPersonName] = useState("");
    // Which person is being edited (full-width input mode)
    const [editingPersonId, setEditingPersonId] = useState("");
    const [editPersonName, setEditPersonName] = useState("");
    // Which person badge is showing the action overlay
    const [activePersonId, setActivePersonId] = useState<string | null>(null);
    // Person pending deletion (waiting for dialog confirmation)
    const [pendingDeletePerson, setPendingDeletePerson] = useState<{
        id: string;
        name: string;
    } | null>(null);

    const handleAddPerson = () => {
        if (newPersonName.trim()) {
            onAddPerson(newPersonName.trim());
            setNewPersonName("");
        }
    };

    const startEditing = (personId: string, currentName: string) => {
        setActivePersonId(null);
        setEditingPersonId(personId);
        setEditPersonName(currentName);
    };

    const saveEdit = () => {
        if (editPersonName.trim()) {
            onRenamePerson(editingPersonId, editPersonName.trim());
        }
        setEditingPersonId("");
        setEditPersonName("");
    };

    const cancelEdit = () => {
        setEditingPersonId("");
        setEditPersonName("");
    };

    const dismissOverlay = useCallback(() => setActivePersonId(null), []);

    const longPress = useLongPress<string>((id) => setActivePersonId(id));

    return (
        <>
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
                    {/* Add person row */}
                    {!editingPersonId && (
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="flex-1">
                                <Label htmlFor="person-name">Add Person</Label>
                                <Input
                                    id="person-name"
                                    placeholder="Enter name"
                                    value={newPersonName}
                                    onChange={(e) =>
                                        setNewPersonName(e.target.value)
                                    }
                                    onKeyDown={(e) =>
                                        e.key === "Enter" && handleAddPerson()
                                    }
                                    enterKeyHint="send"
                                />
                            </div>
                            <Button
                                onClick={handleAddPerson}
                                className="sm:mt-6 w-full sm:w-auto"
                            >
                                <Plus className="h-4 w-4 mr-2 sm:mr-0" />
                                <span className="sm:hidden">Add Person</span>
                            </Button>
                        </div>
                    )}

                    {/* Edit person row */}
                    {editingPersonId && (
                        <div className="flex items-end gap-2 rounded-md bg-muted/40">
                            <div className="flex-1">
                                <Label htmlFor="edit-person-name">
                                    Rename Person
                                </Label>
                                <Input
                                    id="edit-person-name"
                                    className="flex-1 h-8 text-sm"
                                    value={editPersonName}
                                    onChange={(e) =>
                                        setEditPersonName(e.target.value)
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

                    {/* Person badges */}
                    {people.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {people.map((person) => (
                                <div key={person.id} className="relative group">
                                    {/* Action overlay — long-press (mobile) or ⋯ click (desktop) */}
                                    {activePersonId === person.id && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={dismissOverlay}
                                            />
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 flex flex-col items-center gap-1 bg-popover border rounded-lg shadow-lg p-2 min-w-[140px]">
                                                <span className="text-xs text-muted-foreground font-medium px-1 pb-1 border-b w-full text-center truncate max-w-[120px]">
                                                    {person.name}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        startEditing(
                                                            person.id,
                                                            person.name,
                                                        )
                                                    }
                                                    className="flex items-center gap-2 w-full px-2 py-1.5 text-sm hover:bg-muted rounded"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                    Rename
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        dismissOverlay();
                                                        setPendingDeletePerson({
                                                            id: person.id,
                                                            name: person.name,
                                                        });
                                                    }}
                                                    className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-destructive dark:text-red-500 dark:hover:text-red-400 hover:bg-destructive/10 rounded"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Remove
                                                </button>
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

                                    <Badge
                                        variant="primary"
                                        className="flex items-center justify-between gap-1 select-none min-h-8 min-w-20 pr-0"
                                        onTouchStart={longPress.start(
                                            person.id,
                                        )}
                                        onTouchEnd={longPress.cancel}
                                        onTouchMove={longPress.move}
                                    >
                                        {person.name}
                                        {/* Desktop: hover-to-reveal single options button → same overlay as mobile */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActivePersonId(person.id);
                                            }}
                                            className="block h-full ml-1 py-1 px-2 rounded sm:opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-primary"
                                            aria-label={`Options for ${person.name}`}
                                        >
                                            <MoreHorizontal className="h-4 w-4" />
                                        </button>
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete person confirmation dialog */}
            <DeleteConfirmDialog
                open={!!pendingDeletePerson}
                onOpenChange={(open) => !open && setPendingDeletePerson(null)}
                title={`Remove "${pendingDeletePerson?.name}"?`}
                description={`You are about to remove ${pendingDeletePerson?.name} from the group.`}
                consequences={[
                    "They will be unassigned from all items across every bill",
                    "Their payment records (paid by) will be cleared",
                    "This cannot be undone",
                ]}
                confirmLabel="Remove Person"
                onConfirm={() => {
                    if (pendingDeletePerson) {
                        onRemovePerson(pendingDeletePerson.id);
                        setPendingDeletePerson(null);
                    }
                }}
            />
        </>
    );
}

export { PeopleCard };
