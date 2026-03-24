"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Users } from "lucide-react";
import { Person } from "@/lib/types";

interface PeopleCardProps {
    people: Person[];
    onAddPerson: (name: string) => void;
    onRemovePerson: (id: string) => void;
}

function PeopleCard({ people, onAddPerson, onRemovePerson }: PeopleCardProps) {
    const [newPersonName, setNewPersonName] = useState("");

    const handleAddPerson = () => {
        if (newPersonName.trim()) {
            onAddPerson(newPersonName.trim());
            setNewPersonName("");
        }
    };

    return (
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
                            onChange={(e) => setNewPersonName(e.target.value)}
                            onKeyPress={(e) =>
                                e.key === "Enter" && handleAddPerson()
                            }
                        />
                    </div>
                    <Button onClick={handleAddPerson} className="mt-6">
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
                                    onClick={() => onRemovePerson(person.id)}
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
    );
}

export { PeopleCard };
