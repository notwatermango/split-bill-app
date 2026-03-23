import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
    title: "Split Bill App | split.notwatermango.cc",
    description: "Split multiple bills easily among friends",
    keywords: [
        "Split Bill",
        "Split Multiple Bills",
        "Split Bills Calculator",
        "Split Bill Offline",
    ],
    authors: [
        {
            name: "Danzel Artamadja",
            url: "https://notwatermango.cc",
        },
    ],
    creator: "notwatermango",
    publisher: "notwatermango",
    openGraph: {
        title: "Split Bill App | split.notwatermango.cc",
        description: "Split multiple bills easily among friends",
        url: "https://split.notwatermango.cc",
        siteName: "Split Bill App",
        images: [
            {
                url: "https://split.notwatermango.cc/og-image.png",
                width: 1200,
                height: 630,
                alt: "Split Bill App",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Split Bill App | split.notwatermango.cc",
        description: "Split multiple bills easily among friends",
        creator: "@notwatermango",
        images: ["https://split.notwatermango.cc/og-image.png"],
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <main className="flex-1">{children}</main>
                    <footer className="w-full text-center text-sm text-muted-foreground py-8">
                        <p>
                            &copy; {new Date().getFullYear()} notwatermango.{" "}
                            <a
                                href="https://notwatermango.cc"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-foreground transition-colors"
                            >
                                notwatermango.cc
                            </a>
                        </p>
                    </footer>
                </ThemeProvider>
            </body>
        </html>
    );
}
