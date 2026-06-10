# 🧾 Thipphachi Billing System (ห้องเช่าทิพพจี)

A lightweight, premium, mobile-first web application for managing monthly utility invoices and tenant move-out damage billing at the Thipphachi Rental Complex (ห้องเช่าทิพพจี).

---

## ✨ Features

### 1. Monthly Utility Billing
*   **Live Inline Calculation:** Dynamic calculation of utility consumption and cost inside the meter reading cards.
*   **Auto-Generating Sequence:** Suggests an automatic sequential invoice billing number (`INV-MMYY-XXX`) to keep records perfectly organized.
*   **Reading Memory:** The system automatically caches current utility readings in local browser storage (`localStorage`). When you enter the room number next month, previous readings and tenant details are auto-populated.
*   Calculate water and electricity bills based on previous and current meter readings, configuring custom rates per unit.

### 2. Move-Out / Damage Report Billing
*   Track security deposit credit refund balances.
*   Itemize damage records with custom repair cost quotes.
*   Automatically calculates net refund values (green) or balance due charges (red).

### 3. Media & Evidence Attachments
*   Capture or upload camera photos of physical meters or damaged fixtures directly.
*   Evidence images are scaled and formatted to print neatly as appendices at the bottom of the bill.

### 4. Cloud History & Vercel Integration (NEW)
*   **Zero-Trust Supabase Storage:** Save finalized invoices directly to a secure Supabase backend to keep historical cloud backups.
*   **Vercel Serverless Architecture:** Utilizes Vercel Edge/Serverless functions (`api/auth.js`, `api/invoices.js`) to process history payloads safely without exposing API keys to the browser.
*   **PIN Authentication:** Administrative action (like saving to the cloud) is securely gated by a customizable encrypted PIN.

### 5. Premium UI / Print Layout
*   **Best-in-Class Aesthetics:** Deep midnight background, vibrant accent gradients, immersive glassmorphism, and subtle micro-animations.
*   **Print & PDF Layout (Half-A4 / A5):** Fully optimized printable stylesheet (`@media print`) that generates a clean black-and-white A5 portrait receipt with company header, logo, pricing breakdown, and lessor/tenant signature lines.

---

## 🛠️ Technical Stack
*   **Frontend:** HTML5 Semantic Markup, Custom responsive CSS3 (Glassmorphism), Vanilla ES6+ JavaScript.
*   **Backend:** Vercel Serverless Functions (`Node.js`).
*   **Database:** Supabase (PostgreSQL).

---

## 🚀 How to Run Locally

Since this app operates heavily in the browser but uses Vercel for the backend, you can test it locally using the Vercel CLI:

1.  Clone this repository.
2.  Install Vercel CLI: `npm i -g vercel`
3.  Run the development server: `vercel dev`
4.  Navigate to `http://localhost:3000` in your browser.

*(Note: To use the cloud features, ensure your local `.env` has the correct `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `THIPPHACHI_PIN`, and `AUTH_SECRET` variables).*
