# 🧾 Thipphachi Billing System (ห้องเช่าทิพพจี)

A lightweight, premium, mobile-first web application for managing monthly utility invoices and tenant move-out damage billing at the Thipphachi Rental Complex (ห้องเช่าทิพพจี).

---

## ⚡ Features

### 1. Monthly Utility Billing
*   Calculate water and electricity bills based on previous and current meter readings.
*   Configure custom rates per unit for utilities.
*   Record monthly base rent, Wi-Fi service, and miscellaneous or late fees.
*   **Reading Memory:** The system automatically caches current utility readings in local browser storage (`localStorage`). When you enter the room number next month, previous readings and tenant details are auto-populated.

### 2. Move-Out / Damage Report Billing
*   Track security deposit credit refund balances.
*   Itemize damage records with custom repair cost quotes.
*   Rollover unpaid rent or utility bills.
*   Automatically calculates net refund values (green) or balance due charges (red).

### 3. Media & Evidence Attachments
*   Capture or upload camera photos of physical meters or damaged fixtures directly.
*   Evidence images are scaled and formatted to print neatly as appendices at the bottom of the bill.

### 4. Print & PDF Layout (Half-A4 / A5)
*   Fully optimized printable stylesheet (`@media print`) that removes interactive navigation panels, control sidebars, and dark theme colors.
*   Generates a clean black-and-white A5 portrait receipt with company header, logo, pricing breakdown, and lessor/tenant signature lines.

---

## 🛠️ Technical Stack
*   **Structure:** HTML5 Semantic Markup
*   **Styling:** Custom responsive CSS3 (Desktop Split-Screen / Mobile Stack)
*   **Logic:** Vanilla ES6+ JavaScript (zero external dependencies or frameworks required)

---

## 🚀 How to Run Locally

Since this app runs completely in the browser, no installation or compilation is required:
1.  Clone this repository.
2.  Open `index.html` in any web browser.

Alternatively, serve it locally using a simple Python server:
```bash
python3 -m http.server 8080
```
Then navigate to `http://localhost:8080` in your browser.
