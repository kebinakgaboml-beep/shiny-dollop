# BizPilot AI

**Your back-office, now in WhatsApp.**

BizPilot AI is the intelligent co-pilot that runs the back-office for small businesses—plumbers, shop owners, and service providers—allowing them to focus on their craft while the AI handles the paperwork. No complex software, no accountant training. Just chat.

---

## 🚀 Project Overview

Small business owners often spend hours after work on quotes, invoices, and expense tracking. BizPilot AI moves these tasks from the desk to the pocket. By combining a natural language WhatsApp interface with a powerful, "no-training-required" dashboard, BizPilot AI automates the administrative burden of running a business.

### Key Capabilities:
- **WhatsApp-First Workflow:** Generate quotes and invoices while on the job using voice or text.
- **Proactive Intelligence:** Receive real-time alerts for low stock and pending payments.
- **Hands-Free Accounting:** Snap photos of receipts to log expenses and prepare for tax season instantly.
- **Unified Dashboard:** A clear, simple view of business health, revenue, and tax liability.

---

## ✨ Key Features

### 💬 WhatsApp Agent (The "Chat-First" Experience)
The heart of BizPilot is a natural language interface that understands the way business owners actually talk.
- **Invoicing on the Go:** "Invoice Bob $150 for the faucet repair" or "Send a quote to Alice for 3 windows."
- **Voice Note Support:** Handles rough transcriptions of voice notes, making it perfect for "hands-busy" professionals like plumbers or electricians.
- **Interactive Buttons:** Uses WhatsApp's interactive buttons to minimize typing and maximize speed.

### 📸 OCR Expense Tracking
Toss the shoebox of receipts.
- **Snap & Log:** Take a photo of any receipt on WhatsApp.
- **Auto-Extraction:** BizPilot uses high-accuracy OCR to extract the vendor, date, total, and category.
- **Smart Categorization:** Automatically assigns expenses to tax categories like "Supplies," "Fuel," or "Rent."

### 📊 "No-Accountant" Dashboard
A dashboard designed for clarity, not complexity.
- **Business Health at a Glance:** Real-time metrics for Revenue, Pending Invoices, and Open Quotes.
- **Tax Readiness:** High-level summary of Net Profit and Estimated Tax Liability.
- **Proactive Inventory:** Visual alerts when stock levels fall below thresholds, with quick "Restock" buttons.

### ⏰ Proactive Alerts & Follow-ups
BizPilot doesn't wait for you to ask.
- **Stock Alerts:** "⚠️ Heads up! You're down to 2 units of Solar Panels. Should I draft a restock order?"
- **Payment Reminders:** Automatically suggests sending polite nudges for unpaid quotes or invoices.

---

## 🛠 How It Works

1.  **Connect:** Link your WhatsApp Business number to the BizPilot platform.
2.  **Chat:** Describe your tasks naturally. "Create a quote," "Check my stock," or "Log this receipt."
3.  **Grow:** BizPilot handles the data entry, document generation, and tracking. You spend your time on your customers.

---

## 💻 Tech Stack

- **Frontend:** [Next.js](https://nextjs.org/) (App Router), Tailwind CSS
- **Backend:** Node.js (Next.js API Routes)
- **Database:** [Turso](https://turso.tech/) (SQLite / libSQL) at the edge
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Messaging:** [Twilio WhatsApp Business API](https://www.twilio.com/en-us/messaging/channels/whatsapp)
- **AI/LLM:** [OpenAI GPT-4o](https://openai.com/) via [Vercel AI SDK](https://sdk.vercel.ai/)
- **Auth:** [Clerk](https://clerk.com/) / NextAuth.js

---

## 📋 Visual Representation

### WhatsApp Interaction
```text
User: "I just finished at Mike's. Used 2 copper elbows and 15m labor. Quote him including the visit fee."

BizPilot: "Got it! Adding 2x Copper Elbows ($12) and 15m Labor ($25) to Mike's draft. Plus your standard $50 call-out fee. Total: $87.

Ready to send this quote to Mike?
[Send Quote] [View Details] [Add More Items]"
```

### Dashboard View
```text
________________________________________________________________________________
|  BizPilot AI | Sam's Solar                      [Sync: OK] [Profile] |
|______________________________________________________________________________|
|                                                                              |
|  [ REVENUE THIS MONTH ]    [ PENDING INVOICES ]    [ OPEN QUOTES ]           |
|  $12,450 (+15%)            $3,200 (4)              $5,000 (6)                |
|______________________________________________________________________________|
|                                            |                                 |
|  RECENT ACTIVITY                           |  QUICK ACTIONS                  |
|  ---------------------------------------   |  -----------------------------  |
|  (i) Invoice #105 sent to Mary   2m ago    |  [ + NEW QUOTE ]                |
|  ($) Payment from John ($200)    1h ago    |  [ + NEW INVOICE ]              |
|  (+) New Quote for Alice         3h ago    |  [ + ADD CUSTOMER ]             |
|____________________________________________|_________________________________|
```

---

*Copyright © 2026 BizPilot AI. Empowering small businesses through conversational intelligence.*