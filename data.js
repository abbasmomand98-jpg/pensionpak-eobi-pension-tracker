// PensionPak — EOBI Pension Tracker & Proof-of-Life Helper (UX Concept).
// IMPORTANT: every figure, person, pension ID and payment below
// is SAMPLE data invented for this UX concept demo. These are NOT
// real people, real pensioners or real payments. No real helpline
// numbers and no real CNIC numbers appear anywhere. The EOBI
// formula and the Rs 11,500 minimum pension are shown in
// simplified form; for a real ruling, check eobi.gov.pk with
// your CNIC or visit the EOBI facilitation centre.

// THE EOBI FORMULA — (average monthly wage x years of insured
// service) / 50, with the Rs 11,500 floor.
//   Minimum pension: Rs 11,500/month, raised from Rs 10,000,
//   effective 1 Jan 2025. The Rs 1,500/month rise over 8 months
//   (Jan-Aug 2025) is Rs 12,000 in arrears.
//   45,000 x 22 / 50 = Rs 19,800. 30,000 x 15 / 50 = Rs 9,000,
//   so the floor lifts it to Rs 11,500. 60,000 x 30 / 50 = Rs 36,000.
//   36,000 x 20 / 50 = Rs 14,400.
var EOBI = {
  minPension: 11500,
  oldMinPension: 10000,
  minRise: 1500,
  arrearsMonths: 8,
  arrearsTotal: 12000,
  floorEffective: "1 Jan 2025",
  divisor: 50
};

// PROOF-OF-LIFE — biometric verification twice a year, in the
// March and September windows, at any Bank Alfalah branch.
// The September 2026 window has closed. The next window opens
// 1 Mar 2027. Counted from the pinned demo "today", 20 Nov 2026,
// that is 101 days away.
var PROOF_OF_LIFE = {
  windows: ["March", "September"],
  nextWindow: "March 2027",
  nextWindowDate: "2027-03-01",
  missedWindow: "September 2026",
  branch: "any Bank Alfalah branch",
  steps: [
    "Take your original CNIC + pension card",
    "Go to any Bank Alfalah branch",
    "Give your biometric thumbprint",
    "Pension resumes the next month"
  ]
};

// SAMPLE PENSIONERS — invented people and IDs, not real pensioners.
//   PNS-2026-4812 Muhammad Bashir, 68, Peshawar, retired
//   textile-mill worker, 22 years insured service, average wage
//   Rs 45,000 -> pension Rs 19,800/month. October credited
//   2 Oct 2026 via Bank Alfalah. NOVEMBER SUSPENDED — he missed
//   the September 2026 proof-of-life window. Verify once and the
//   pension resumes in December, with November's Rs 19,800
//   released with it. His record shows 3 missing contribution
//   years, 2011-2013 (employer did not deposit).
//   PNS-2026-2077 Fatima Bibi, 64, Lahore, widow — survivors'
//   pension Rs 11,500/month, ACTIVE, credited 3 Nov 2026.
//   A widow's pension continues even if she remarries.
//   PNS-2026-9930 Naseer Ahmed, 65, Rawalpindi, retired factory
//   worker, 20 years, average wage Rs 36,000 -> Rs 14,400/month,
//   ACTIVE, above the Rs 11,500 floor.
var PENSIONERS = [
  { id: "PNS-2026-4812", name: "Muhammad Bashir", age: 68,
    city: "Peshawar", job: "Retired textile-mill worker",
    years: 22, wage: 45000, pension: 19800, status: "SUSPENDED",
    october: "Credited 2 Oct 2026 via Bank Alfalah",
    november: "Suspended — missed the September 2026 proof-of-life window",
    fix: "Biometric verification at any Bank Alfalah branch with original CNIC + pension card. Pension resumes December; November arrears Rs 19,800 released with it.",
    gapYears: "2011–2013",
    gapCount: 3,
    gapNote: "3 missing contribution years, 2011–2013 — employer did not deposit. Take salary slips + service book to HR, then the EOBI facilitation centre. Fixed free — never pay cash." },
  { id: "PNS-2026-2077", name: "Fatima Bibi", age: 64,
    city: "Lahore", job: "Widow — survivors' pension",
    years: null, wage: null, pension: 11500, status: "ACTIVE",
    october: "Credited 3 Oct 2026",
    november: "Credited 3 Nov 2026",
    fix: "Your survivors' pension is active. A widow's pension continues even if she remarries — check the guide, do not take an agent's word.",
    gapYears: null, gapCount: 0, gapNote: "" },
  { id: "PNS-2026-9930", name: "Naseer Ahmed", age: 65,
    city: "Rawalpindi", job: "Retired factory worker",
    years: 20, wage: 36000, pension: 14400, status: "ACTIVE",
    october: "Credited 2 Oct 2026 via Bank Alfalah",
    november: "Credited 3 Nov 2026",
    fix: "Your pension is active and above the Rs 11,500 floor. Keep the March 2027 proof-of-life window in mind.",
    gapYears: null, gapCount: 0, gapNote: "" }
];

// WORKED EXAMPLES — the three calculator examples, shown on the
// calculator tab and in the mockups and slides.
//   (a) Rs 45,000 x 22 yrs / 50 = Rs 19,800.
//   (b) Rs 30,000 x 15 yrs / 50 = Rs 9,000 -> floor -> Rs 11,500.
//   (c) Rs 60,000 x 30 yrs / 50 = Rs 36,000.
var WORKED_EXAMPLES = [
  { label: "Muhammad Bashir · 22 years", wage: 45000, years: 22,
    raw: 19800, pension: 19800, floored: false },
  { label: "Shorter service · 15 years", wage: 30000, years: 15,
    raw: 9000, pension: 11500, floored: true },
  { label: "Long service · 30 years", wage: 60000, years: 30,
    raw: 36000, pension: 36000, floored: false }
];

// SURVIVORS' GUIDE — what a widow (or widower) needs to know.
// A widow's pension continues even if she remarries.
var SURVIVORS_GUIDE = [
  { id: "who", title: "Who gets it",
    detail: "The widow (or widower) of an insured worker gets the survivors' pension — Rs 11,500 a month at the minimum. Fatima Bibi, 64, Lahore, gets Rs 11,500 a month, credited 3 Nov 2026." },
  { id: "remarry", title: "It continues if she remarries",
    detail: "A widow's pension continues even if she remarries. If an agent tells you otherwise, he is lying — check the guide, do not take an agent's word." },
  { id: "apply", title: "How to claim it",
    detail: "Take the death certificate, your CNIC and the pension card to the EOBI facilitation centre. The claim is free — nobody may charge you to file it." },
  { id: "gap", title: "Missing contribution years",
    detail: "Bashir's record is missing 3 years, 2011–2013 — his employer never deposited. Take salary slips + service book to HR, then the EOBI facilitation centre. Missing years are fixed free with salary slips at the EOBI office." }
];

// DOCUMENT CHECKLIST — saved on this device.
var CHECKLIST = [
  { id: "cnic", label: "Original CNIC" },
  { id: "card", label: "Pension card" },
  { id: "slips", label: "Salary slips + service book (for missing years)" },
  { id: "death-cert", label: "Death certificate (for a survivors' claim)" },
  { id: "branch", label: "Visited a Bank Alfalah branch" },
  { id: "biometric", label: "Biometric thumbprint given" }
];

// RED-FLAG SPOTTER: 4 red flags, plus one safe habit as a control.
//   1. Agent asks Rs 2,000–5,000 to "release" your pension —
//      EOBI never charges for pension release.
//   2. "Agent" wants your CNIC + pension card photocopies and
//      your bank PIN — never share a PIN.
//   3. SMS/WhatsApp claiming your pension is blocked unless you
//      pay a fee — EOBI does not collect fees by SMS.
//   4. A "facilitator" offers to fix missing contribution years
//      for cash — missing years are fixed free with salary slips
//      at the EOBI office.
//   Safe habit: check your status free on eobi.gov.pk with your
//   CNIC before you pay anyone anything.
var SPOTTER_FLAGS = [
  { id: "release-fee", scenario: "An agent asks Rs 2,000–5,000 to \u201crelease\u201d your pension.",
    isFlag: true, why: "RED FLAG — EOBI never charges for pension release. A pension is released by biometric verification at a Bank Alfalah branch, free." },
  { id: "pin-ask", scenario: "An \u201cagent\u201d wants your CNIC + pension card photocopies and your bank PIN.",
    isFlag: true, why: "RED FLAG — never share your bank PIN with anyone. No EOBI officer and no bank will ever ask for it." },
  { id: "sms-fee", scenario: "An SMS / WhatsApp says your pension is blocked unless you pay a fee.",
    isFlag: true, why: "RED FLAG — EOBI does not collect fees by SMS. A blocked pension is fixed by biometric verification, not by paying a stranger." },
  { id: "gap-cash", scenario: "A \u201cfacilitator\u201d offers to fix your missing contribution years for cash.",
    isFlag: true, why: "RED FLAG — missing years are fixed free with salary slips at the EOBI office. Anyone charging cash for it is selling you your own right." },
  { id: "check-status", scenario: "You check your status free on eobi.gov.pk with your CNIC before you pay anyone anything.",
    isFlag: false, why: "SAFE — checking your status free on eobi.gov.pk with your CNIC takes a minute and tells you the truth before any money moves. That is exactly what PensionPak\u2019s status board does." }
];

// PERSONA: Muhammad Bashir, 68, Peshawar, retired textile-mill
// worker. His October pension arrived; his November pension did
// not. He missed the September proof-of-life window.
// Illustrative proto-persona — a design hypothesis, not an
// interviewed participant.
var PERSONA = { name: "Muhammad Bashir", age: 68, city: "Peshawar",
  job: "Retired textile-mill worker", years: 22, wage: 45000,
  pension: 19800, id: "PNS-2026-4812", status: "SUSPENDED",
  october: "Credited 2 Oct 2026 via Bank Alfalah",
  november: "Suspended — missed the September 2026 proof-of-life window" };

if (typeof module !== "undefined") {
  module.exports = { EOBI: EOBI, PROOF_OF_LIFE: PROOF_OF_LIFE,
    PENSIONERS: PENSIONERS, WORKED_EXAMPLES: WORKED_EXAMPLES,
    SURVIVORS_GUIDE: SURVIVORS_GUIDE, CHECKLIST: CHECKLIST,
    SPOTTER_FLAGS: SPOTTER_FLAGS, PERSONA: PERSONA };
}
