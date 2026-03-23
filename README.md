# Split Bill App

Completely static Next.js app for splitting bills. This app can handle items across multiple bills and calculate the total amount each person needs to pay or receive.

This project costs me nothing to build and host in [split.notwatermango.cc](https://split.notwatermango.cc).

## Background

- Some friend groups are lazy to split bills, sometimes they aren't paid for months.
- I want to make it easier for them to split bills and track who owes what.
- I enjoy noting down my expenses too, untracked bill sucks.
- I try not to spend a dime for this 🙏, hence no OCR or database yet (for now).

## Features

- **Split multiple bills** – Manage several receipts and expenses in one single session.
- **Calculate payment** – Automatically figures out the grand totals and suggest least transfer combination.
- **Share via link** – Generates a URL containing all your bill data to easily share with friends.
- **Local storage** – Automatically saves your session data to your browser so you never lose it on refresh.
- **Dark mode**
- 🩴 **(Kinda) Responsive design** - Okay-ish on mobile, but not the best for inputting bills there.
- ⏳ **(TBA) Shorter share link URL**
- ⏳ **(TBA) Currencies** - Now only IDR 🇮🇩

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Static)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Compression**: [lz-string](https://pieroxy.net/blog/pages/lz-string/index.html) (powers the shareable URLs without a database)
