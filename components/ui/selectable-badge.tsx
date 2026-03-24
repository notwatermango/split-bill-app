import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const selectableBadgeVariants = cva(
    "inline-flex cursor-pointer min-h-8 items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
                secondary:
                    "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
                destructive:
                    "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
                outline:
                    "text-foreground hover:border-primary/40 hover:text-primary",
                details: "border-primary bg-transparent text-primary shadow",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    },
);

export interface BadgeProps
    extends
        React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof selectableBadgeVariants> {}

function SelectableBadge({ className, variant, ...props }: BadgeProps) {
    return (
        <div
            className={cn(selectableBadgeVariants({ variant }), className)}
            {...props}
        />
    );
}

export { SelectableBadge, selectableBadgeVariants };
