"use client";

import { Button } from "@/components/ui/button";
import { Receipt, RotateCcw, Share2 } from "lucide-react";
import Link from "next/link";

export function ResetButton({ onClick }: { onClick: () => void }) {
    return (
        <Button
            variant="outline"
            size="sm"
            onClick={onClick}
            className="cursor-pointer hover:text-destructive-foreground hover:bg-destructive dark:text-red-500 dark:hover:text-red-100 border-destructive/60 bg-destructive/5 text-destructive transition-all"
        >
            <RotateCcw className="h-4 w-4" />
            Reset Data
        </Button>
    );
}

export function BillSummaryButton() {
    return (
        <Button
            variant="outline"
            size="sm"
            asChild
            className="cursor-pointer border-details-border bg-transparent hover:bg-details text-details hover:text-details-muted hover:border-details-border/20 transition-all"
        >
            <Link href="/summary" passHref>
                <Receipt className="h-4 w-4" />
                Bills Summary
            </Link>
        </Button>
    );
}

export function ShareButton({
    onClick,
    isCopied,
}: {
    onClick: () => void;
    isCopied: boolean;
}) {
    return (
        <Button
            variant="outline"
            size="sm"
            onClick={onClick}
            className="cursor-pointer border-primary/30 hover:text-primary-foreground hover:border-primary bg-primary/5 hover:bg-primary text-primary transition-all"
        >
            <Share2 className="h-4 w-4" />
            {isCopied ? "Copied!" : "Share Bills"}
        </Button>
    );
}
