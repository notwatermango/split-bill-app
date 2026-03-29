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
    isLoading,
}: {
    onClick: () => void;
    isCopied: boolean;
    isLoading?: boolean;
}) {
    return (
        <Button
            variant="outline"
            size="sm"
            onClick={onClick}
            disabled={isLoading}
            className="cursor-pointer border-primary/30 hover:text-primary-foreground hover:border-primary bg-primary/5 hover:bg-primary text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
                <Share2 className="h-4 w-4" />
            )}
            {isLoading ? "Generating..." : isCopied ? "Copied!" : "Share Bills"}
        </Button>
    );
}
