"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

interface DeleteConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    consequences?: string[];
    warning?: string;
    confirmLabel: string;
    onConfirm: () => void;
}

/**
 * Reusable destructive confirmation dialog.
 * - `consequences`: bullet list shown in the red callout box (optional)
 * - `warning`: inline warning text below consequences (optional)
 */
function DeleteConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    consequences,
    warning,
    confirmLabel,
    onConfirm,
}: DeleteConfirmDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <div className="flex items-center gap-2">
                        <Trash2 className="h-5 w-5 text-destructive shrink-0" />
                        <AlertDialogTitle>{title}</AlertDialogTitle>
                    </div>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>

                {consequences && consequences.length > 0 && (
                    <div className="rounded-md bg-destructive/10 p-4 text-sm">
                        <ul className="list-inside list-disc space-y-1 text-destructive dark:text-red-400">
                            {consequences.map((c, i) => (
                                <li key={i}>{c}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {warning && (
                    <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm">
                        <span className="font-medium text-destructive">
                            Warning:{" "}
                        </span>
                        {warning}
                    </div>
                )}

                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="bg-destructive text-white hover:bg-destructive/90"
                    >
                        <Trash2 className="h-4 w-4" />
                        {confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export { DeleteConfirmDialog };
