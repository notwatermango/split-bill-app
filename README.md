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
- **Calculate payment** – Automatically figures out the balances and suggests the least transfer settlement solution.
- **Share via link** – The shareable URL contains all the data.
- **Local storage** – Saves data to browser.
- **Responsive design** - Mobile friendly.
- **Multi Currencies** - Supports 💸 from 🇺🇸, 🇮🇩, 🇪🇺, 🇬🇧, 🇷🇺, 🇨🇳, and more with timezone detection.
- **Dark mode (BETA)**
- ⏳ **(TBA) Shorter share link URL** - I might create a dedicated worker later, for now please use tinyurl.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Static)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Compression**: [lz-string](https://pieroxy.net/blog/pages/lz-string/index.html) (powers the shareable URLs without a database)
