"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BillSummaryButton,
    ResetButton,
    ShareButton,
} from "@/components/action-buttons";

interface HowToUseCardProps {
    generateShareLink: () => void;
    resetAllData: () => void;
    isCopied: boolean;
    isGeneratingLink?: boolean;
}

function HowToUseCard({
    generateShareLink,
    resetAllData,
    isCopied,
    isGeneratingLink,
}: HowToUseCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>How to use this app?</CardTitle>
            </CardHeader>
            <CardContent>
                <ol className="list-decimal list-inside space-y-2">
                    <li>Add people.</li>
                    <li>Add bills.</li>
                    <li>Select bill and add items.</li>
                    <li>Assign people to items on the bill.</li>
                    <li>Set total payment and paid by for each bill.</li>
                    <li>
                        Review bills and payment in <BillSummaryButton /> page.
                    </li>
                    <li>
                        After all bills are set up, click{" "}
                        <ShareButton
                            onClick={generateShareLink}
                            isCopied={isCopied}
                            isLoading={isGeneratingLink}
                        />{" "}
                        to copy shareable link url.
                    </li>
                    <li>
                        The data will be saved in the browser. To reset click
                        the <ResetButton onClick={resetAllData} /> button.
                    </li>
                    <li>
                        You can find this tutorial at the very bottom of this
                        page
                    </li>
                </ol>
            </CardContent>
        </Card>
    );
}

export { HowToUseCard };
