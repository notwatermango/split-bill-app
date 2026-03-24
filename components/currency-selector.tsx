"use client";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SUPPORTED_CURRENCIES } from "@/lib/constants";
import { getCurrency } from "@/lib/utils";
import { Globe } from "lucide-react";
import { useEffect, useState } from "react";

interface CurrencySelectorProps {
    currencyCode: string;
    onCurrencyChange: (code: string) => void;
}

export function CurrencySelector({
    currencyCode,
    onCurrencyChange,
}: CurrencySelectorProps) {
    const [mounted, setMounted] = useState(false);

    const currentCurrency = getCurrency(currencyCode);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Button
                variant="outline"
                size="sm"
                className="gap-2 w-[100px] opacity-60 animate-pulse cursor-not-allowed"
                disabled
            >
                <Globe className="h-4 w-4 shrink-0" />
                <span className="text-muted-foreground">USD ($)</span>
            </Button>
        );
    }
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Globe className="h-4 w-4" />
                    <span>
                        {currentCurrency.code} ({currentCurrency.symbol})
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup
                    value={currencyCode}
                    onValueChange={onCurrencyChange}
                >
                    {SUPPORTED_CURRENCIES.map((currency) => (
                        <DropdownMenuRadioItem
                            key={currency.code}
                            value={currency.code}
                        >
                            {currency.code} ({currency.symbol}) -{" "}
                            {currency.locale}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
