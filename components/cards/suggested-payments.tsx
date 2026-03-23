import {
    CreditCard,
    ArrowRight,
    CheckCircle2,
    Users,
    Copy,
    Check,
    EyeOff,
    Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Person, Payment } from "@/lib/types";
import { cn, rupiah } from "@/lib/utils";
import { useState, useCallback } from "react";

interface SuggestedPaymentsCardProps {
    suggestedPayments: Payment[];
    people: Person[];
}

function CopyAmountButton({ amount }: { amount: number }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(String(amount.toFixed(0)));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // fallback for older browsers
            const el = document.createElement("textarea");
            el.value = String(amount.toFixed(0));
            document.body.appendChild(el);
            el.select();
            document.execCommand("copy");
            document.body.removeChild(el);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }, [amount]);

    return (
        <button
            onClick={handleCopy}
            title={copied ? "Copied!" : "Copy amount"}
            className={`
                ml-2 inline-flex items-center justify-center rounded-md p-1.5
                transition-all duration-200
                ${
                    copied
                        ? "bg-details/10 text-details"
                        : "bg-muted text-muted-foreground hover:bg-details/10 hover:text-details"
                }
            `}
        >
            {copied ? (
                <Check className="h-3.5 w-3.5" />
            ) : (
                <Copy className="h-3.5 w-3.5" />
            )}
        </button>
    );
}

export default function SuggestedPaymentsCard({
    suggestedPayments,
    people,
}: SuggestedPaymentsCardProps) {
    const [showSuggestedPayments, setShowSuggestedPayments] = useState(false);

    return (
        <Card>
            <CardHeader
                className={cn(
                    "pb-3 cursor-pointer",
                    !showSuggestedPayments && "pb-6",
                )}
                onClick={() => setShowSuggestedPayments(!showSuggestedPayments)}
            >
                <CardTitle className="font-semibold text-xl flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Suggested Payments
                    {suggestedPayments.length > 0 && (
                        <span className="ml-1 inline-flex items-center justify-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            {suggestedPayments.length}
                        </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-muted-foreground ml-1 font-normal">
                        {showSuggestedPayments ? (
                            <>
                                <EyeOff className="h-3 w-3" />
                                Hide details
                            </>
                        ) : (
                            <>
                                <Eye className="h-3 w-3" />
                                Show details
                            </>
                        )}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent
                className={cn("px-0 pb-0", !showSuggestedPayments && "hidden")}
            >
                {suggestedPayments.length === 0 ? (
                    <div className="mx-6 mb-6 flex flex-col items-center justify-center py-8 text-center border border-dashed border-border bg-muted/10 rounded-lg">
                        {people.length === 0 ? (
                            <>
                                <Users className="h-8 w-8 text-muted-foreground/50 mb-3" />
                                <p className="text-sm font-medium text-foreground">
                                    No people added yet
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Add participants to see who owes what.
                                </p>
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-8 w-8 text-green-500/50 mb-3" />
                                <p className="text-sm font-medium text-foreground">
                                    Everyone is settled up!
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    No outstanding balances.
                                </p>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-b-lg">
                        {suggestedPayments.map((payment, i) => {
                            const fromPerson = people.find(
                                (p) => p.id === payment.from,
                            );
                            const toPerson = people.find(
                                (p) => p.id === payment.to,
                            );
                            const isEven = i % 2 === 0;

                            return (
                                <div
                                    key={i}
                                    className={`
                                        group flex flex-col sm:flex-row sm:items-center justify-between gap-3
                                        px-6 py-3.5 transition-colors duration-150
                                        ${isEven ? "bg-background" : "bg-muted/30"}
                                        hover:bg-details/5
                                        ${i === suggestedPayments.length - 1 ? "rounded-b-lg" : ""}
                                    `}
                                >
                                    {/* Index + People Flow */}
                                    <div className="flex items-center gap-3">
                                        <span className="flex-shrink-0 w-5 text-xs font-mono text-muted-foreground/50 select-none">
                                            {i + 1}.
                                        </span>

                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-semibold text-foreground">
                                                {fromPerson?.name}
                                            </span>

                                            <div className="flex items-center justify-center rounded-full bg-muted p-1">
                                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                            </div>

                                            <span className="font-semibold text-foreground">
                                                {toPerson?.name}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Amount + Copy */}
                                    <div className="flex items-center justify-end gap-1 pl-8 sm:pl-0">
                                        <span className="font-bold text-lg tracking-tight text-details">
                                            {rupiah(payment.amount.toFixed(0))}
                                        </span>
                                        <CopyAmountButton
                                            amount={payment.amount}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
