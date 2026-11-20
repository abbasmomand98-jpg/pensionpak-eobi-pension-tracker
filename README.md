# PensionPak — EOBI Pension Tracker & Proof-of-Life Helper (UX Concept)

A working website by Muhammad Abbas Khan — a UX concept demo for the PensionPak case study. Pure HTML, CSS and JavaScript, no frameworks. Open `index.html` in a browser, or visit the live demo:

- **Live demo:** https://abbasmomand98-jpg.github.io/pensionpak-eobi-pension-tracker/
- **Code:** https://github.com/abbasmomand98-jpg/pensionpak-eobi-pension-tracker

## What it does

Retired private-sector workers in Pakistan wait on an EOBI pension with no tracking. Payments are credited 1st–5th of the month but nobody tells you if yours arrived; missing the March or September biometric proof-of-life suspends the pension; widows don't know about the survivors' pension; and agents charge Rs 2,000–5,000 to "release" a pension that is free. PensionPak has five parts:

1. **Pension Status** — enter a pension ID and see the month in plain words. Muhammad Bashir (PNS-2026-4812): October credited 2 Oct 2026 via Bank Alfalah; November suspended — he missed the September 2026 proof-of-life window. Verify once and it resumes in December, with November's Rs 19,800 released with it. Fatima Bibi (PNS-2026-2077): survivors' pension Rs 11,500 a month, ACTIVE, credited 3 Nov 2026.
2. **Proof-of-Life** — biometric verification twice a year, in the March and September windows, at any Bank Alfalah branch. A countdown to the next window (March 2027, 101 days from 20 Nov 2026), a four-step one-visit guide, and a document checklist saved on this device.
3. **Pension Calculator** — (average monthly wage × years of insured service) ÷ 50, with the Rs 11,500 minimum-pension floor. Three worked examples: Rs 45,000 × 22 ÷ 50 = Rs 19,800; Rs 30,000 × 15 ÷ 50 = Rs 9,000, floored to Rs 11,500; Rs 60,000 × 30 ÷ 50 = Rs 36,000. Plus an arrears estimator for the Rs 1,500 rise: 8 months (Jan–Aug 2025) = Rs 12,000.
4. **Survivors' Guide** — who gets the survivors' pension, that a widow's pension continues even if she remarries, how to claim it, and how missing contribution years are fixed free.
5. **Red-Flag Spotter** — a five-question quiz that catches the four pension-agent traps before any money moves.

## How it works

Open `index.html`. The status tab is prefilled with the sample story: Muhammad Bashir, 68, Peshawar — retired textile-mill worker, 22 years insured service, average wage Rs 45,000, so his pension is Rs 19,800 a month. His October pension was credited 2 Oct 2026 via Bank Alfalah. His November pension is suspended because he missed the September 2026 proof-of-life window. The fix is one biometric visit to any Bank Alfalah branch with his original CNIC + pension card — no fee, because EOBI never charges for pension release — and his pension resumes in December, with November's Rs 19,800 released with it.

His record also shows 3 missing contribution years, 2011–2013 — his employer never deposited. The guide says what to do: take salary slips + service book to HR, then the EOBI facilitation centre. Missing years are fixed free with salary slips at the EOBI office.

The code is split the way a small real app would be: `data.js` holds the sample data, `logic.js` holds the pure rules (no DOM, unit-tested in Node), and `app.js` only wires the page. Lookups and the document checklist are saved in `localStorage`, so they survive a reload; "Reset demo data" restores the sample figures. Run the tests with `node test.js` (unit smoke test) and `node dom-smoke.js` (DOM smoke test in a fake DOM).

## What you can learn from this project

- **Separating data, logic and rendering.** `data.js` is just facts; `logic.js` is pure functions you can test without a browser; `app.js` only touches the page. Change a rate in one place and every tab agrees.
- **A status lookup with three honest answers.** A pension ID can be found, valid but unknown, or malformed — the demo answers each one differently instead of showing the same "not found" for all three. Honest edge cases make a product feel trustworthy.
- **Counting days from a pinned "today".** The 101-day countdown to March 2027 is computed from a pinned date (20 Nov 2026), never hardcoded, so the same code gives the right answer for any date.
- **A floor, not just a formula.** The pension formula gives Rs 9,000 for short service — the demo shows the Rs 11,500 floor lifting it, and says so in plain words, instead of hiding the rule.
- **localStorage as a tiny database.** Lookups and checklist ticks persist across reloads with a few lines of `JSON.parse` / `JSON.stringify` — no server, no account, no backend.
- **A fake DOM for testing.** `dom-smoke.js` runs the real `app.js` in Node against a stub `document`, so the page logic is tested without opening a browser.
- **Sample data, labelled everywhere.** Every figure, person and pension ID is invented and says so on the page. A demo that looks real must never pretend to be real.

## Sample-data honesty note

All figures, people and pension IDs in this demo are invented for a UX concept. No real helpline numbers and no real CNIC numbers appear anywhere. The EOBI formula and the Rs 11,500 minimum pension are shown in simplified form; for your real status, check eobi.gov.pk with your CNIC or visit the EOBI facilitation centre. This is an unofficial UX concept by Muhammad Abbas Khan, not EOBI and not a government service.

## Fork it and make it yours

This pattern fits any "did it arrive, how much, and who do I trust?" problem — utility bills, school fees, government allowances, charity giving. Fork the repo, swap the rates and the rules in `data.js`, and adapt the calculator to your own local problem. If you build something with it, I would love to see it — abbasmomand98@gmail.com.
