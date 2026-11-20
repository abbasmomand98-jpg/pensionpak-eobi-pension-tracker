// PensionPak smoke tests — run with: node test.js
// Every canonical figure used in the mockups, slides and copy is asserted here.
var assert = require("assert");
var fs = require("fs");
var data = require("./data.js");
var L = require("./logic.js");

var n = 0;

function eq(a, b, msg) { assert.strictEqual(a, b, msg); n++; }
function ok(v, msg) { assert.ok(v, msg); n++; }
function deep(a, b, msg) { assert.deepStrictEqual(a, b, msg); n++; }

// 1. EOBI formula constants: Rs 11,500 floor, raised from Rs 10,000 on 1 Jan 2025.
deep(data.EOBI, { minPension: 11500, oldMinPension: 10000, minRise: 1500,
  arrearsMonths: 8, arrearsTotal: 12000, floorEffective: "1 Jan 2025",
  divisor: 50 },
     "EOBI: minimum pension Rs 11,500, raised from Rs 10,000 on 1 Jan 2025, divisor 50");

// 2. Proof-of-life: March and September windows, next window March 2027.
deep(data.PROOF_OF_LIFE.windows, ["March", "September"],
     "proof-of-life runs in March and September");
eq(data.PROOF_OF_LIFE.nextWindow, "March 2027", "next window is March 2027");
eq(data.PROOF_OF_LIFE.nextWindowDate, "2027-03-01", "next window opens 1 Mar 2027");
eq(data.PROOF_OF_LIFE.missedWindow, "September 2026", "the September 2026 window has closed");
eq(data.PROOF_OF_LIFE.steps.length, 4, "proof-of-life is four steps");
eq(data.PROOF_OF_LIFE.branch, "any Bank Alfalah branch", "verification at any Bank Alfalah branch");

// 3. The formula: (wage x years) / 50.
eq(L.rawPension(45000, 22), 19800, "45,000 x 22 / 50 = Rs 19,800");
eq(L.rawPension(30000, 15), 9000, "30,000 x 15 / 50 = Rs 9,000");
eq(L.rawPension(60000, 30), 36000, "60,000 x 30 / 50 = Rs 36,000");
eq(L.rawPension(36000, 20), 14400, "36,000 x 20 / 50 = Rs 14,400");
eq(L.rawPension(0, 22), 0, "no wage means no pension");
eq(L.rawPension(45000, 0), 0, "no service means no pension");

// 4. The floor: Rs 9,000 is lifted to Rs 11,500; Rs 19,800 is not.
deep(L.calcPension(45000, 22, data.EOBI),
  { raw: 19800, pension: 19800, floored: false },
     "Bashir: 45,000 x 22 / 50 = Rs 19,800, above the floor");
deep(L.calcPension(30000, 15, data.EOBI),
  { raw: 9000, pension: 11500, floored: true },
     "30,000 x 15 / 50 = Rs 9,000, floor lifts it to Rs 11,500");
deep(L.calcPension(60000, 30, data.EOBI),
  { raw: 36000, pension: 36000, floored: false },
     "60,000 x 30 / 50 = Rs 36,000, above the floor");
deep(L.calcPension(36000, 20, data.EOBI),
  { raw: 14400, pension: 14400, floored: false },
     "36,000 x 20 / 50 = Rs 14,400, above the floor");
deep(L.calcPension(0, 0, data.EOBI),
  { raw: 0, pension: 0, floored: false },
     "no wage and no service is Rs 0, not the floor");

// 5. Arrears: Rs 1,500 x 8 months = Rs 12,000.
eq(data.EOBI.arrearsTotal, 12000, "arrears total is Rs 12,000");
eq(L.arrears(1500, 8), 12000, "Rs 1,500 x 8 months (Jan-Aug 2025) = Rs 12,000");
eq(L.arrears(1500, 12), 18000, "Rs 1,500 x 12 months = Rs 18,000");
eq(L.arrears(1500, 0), 0, "0 months is Rs 0 arrears");
eq(L.arrears(0, 8), 0, "no rise is Rs 0 arrears");

// 6. Countdown: 101 days from 20 Nov 2026 to 1 Mar 2027.
eq(L.daysBetween("2026-11-20", "2027-03-01"), 101,
   "20 Nov 2026 to 1 Mar 2027 is 101 days");
eq(L.daysBetween("2026-11-20", "2026-11-20"), 0, "same day is 0 days");
eq(L.daysBetween("2026-11-20", "2026-12-20"), 30, "20 Nov to 20 Dec is 30 days");
deep(L.nextProofWindow("2026-11-20"),
  { date: "2027-03-01", label: "March 2027" },
     "from 20 Nov 2026 the next window is March 2027");
deep(L.nextProofWindow("2026-02-10"),
  { date: "2026-03-01", label: "March 2026" },
     "from 10 Feb 2026 the next window is March 2026");
deep(L.nextProofWindow("2026-03-15"),
  { date: "2026-09-01", label: "September 2026" },
     "from 15 Mar 2026 the next window is September 2026");
deep(L.daysToNextWindow("2026-11-20"),
  { days: 101, date: "2027-03-01", label: "March 2027" },
     "101 days to the March 2027 window from 20 Nov 2026");

// 7. Sample pensioners: 3 records, exact figures.
eq(data.PENSIONERS.length, 3, "demo holds 3 sample pensioners");
eq(data.PENSIONERS[0].id, "PNS-2026-4812", "Bashir's ID is PNS-2026-4812");
eq(data.PENSIONERS[0].pension, 19800, "Bashir's pension is Rs 19,800");
eq(data.PENSIONERS[0].status, "SUSPENDED", "Bashir is SUSPENDED");
eq(data.PENSIONERS[0].gapCount, 3, "Bashir has 3 missing contribution years");
eq(data.PENSIONERS[0].gapYears, "2011–2013", "missing years are 2011–2013");
eq(data.PENSIONERS[1].id, "PNS-2026-2077", "Fatima Bibi's ID is PNS-2026-2077");
eq(data.PENSIONERS[1].pension, 11500, "Fatima Bibi's survivors' pension is Rs 11,500");
eq(data.PENSIONERS[1].status, "ACTIVE", "Fatima Bibi is ACTIVE");
eq(data.PENSIONERS[2].id, "PNS-2026-9930", "third sample ID is PNS-2026-9930");
eq(data.PENSIONERS[2].pension, 14400, "third sample pension is Rs 14,400");
eq(data.PENSIONERS[2].status, "ACTIVE", "third sample pensioner is ACTIVE");

// 8. Pension ID lookup: found, not-found, invalid, empty.
eq(L.validPensionId("PNS-2026-4812"), true, "PNS-2026-4812 is a valid ID");
eq(L.validPensionId("pns-2026-4812"), true, "lowercase is valid after upper-casing");
eq(L.validPensionId("4812"), false, "'4812' is not a valid ID");
eq(L.validPensionId(""), false, "an empty string is not a valid ID");
eq(L.findPensioner(data.PENSIONERS, "PNS-2026-4812").name, "Muhammad Bashir",
   "PNS-2026-4812 finds Muhammad Bashir");
eq(L.findPensioner(data.PENSIONERS, "pns-2026-2077").name, "Fatima Bibi",
   "lowercase lookup finds Fatima Bibi");
eq(L.findPensioner(data.PENSIONERS, "PNS-2026-0000"), null,
   "PNS-2026-0000 finds nobody");
eq(L.findPensioner(data.PENSIONERS, "4812"), null, "'4812' finds nobody");
deep(L.lookupStatus(data.PENSIONERS, "PNS-2026-4812"),
  { kind: "found", pensioner: data.PENSIONERS[0] },
     "Bashir's lookup is found");
deep(L.lookupStatus(data.PENSIONERS, "PNS-2026-0000"), { kind: "not-found" },
     "a valid ID with no sample record is not-found");
deep(L.lookupStatus(data.PENSIONERS, "4812"), { kind: "invalid" },
     "a malformed ID is invalid");
deep(L.lookupStatus(data.PENSIONERS, ""), { kind: "empty" },
     "an empty lookup is empty");

// 9. Worked examples match the mockups and slides.
deep(data.WORKED_EXAMPLES, [
  { label: "Muhammad Bashir · 22 years", wage: 45000, years: 22,
    raw: 19800, pension: 19800, floored: false },
  { label: "Shorter service · 15 years", wage: 30000, years: 15,
    raw: 9000, pension: 11500, floored: true },
  { label: "Long service · 30 years", wage: 60000, years: 30,
    raw: 36000, pension: 36000, floored: false }],
     "worked examples: Rs 19,800, Rs 11,500 (floored), Rs 36,000");

// 10. Survivors' guide: 4 items; the remarriage line is present.
eq(data.SURVIVORS_GUIDE.length, 4, "survivors' guide has 4 items");
eq(data.SURVIVORS_GUIDE[1].title, "It continues if she remarries",
   "guide item 2 is the remarriage rule");
ok(data.SURVIVORS_GUIDE[1].detail.indexOf("continues even if she remarries") !== -1,
   "guide says a widow's pension continues even if she remarries");
eq(data.SURVIVORS_GUIDE[3].title, "Missing contribution years",
   "guide item 4 is the missing-years guide");

// 11. Document checklist: 6 items.
eq(data.CHECKLIST.length, 6, "checklist has 6 documents");
eq(data.CHECKLIST[0].id, "cnic", "checklist item 1 is the original CNIC");
eq(data.CHECKLIST[5].id, "biometric", "checklist item 6 is the biometric thumbprint");
deep(L.checklistProgress(data.CHECKLIST, {}), { done: 0, total: 6, pct: 0 },
     "nothing ticked is 0 of 6, 0%");
deep(L.checklistProgress(data.CHECKLIST, { cnic: true, card: true, slips: true }),
  { done: 3, total: 6, pct: 50 }, "3 of 6 ticked is 50%");
deep(L.checklistProgress(data.CHECKLIST,
  { cnic: true, card: true, slips: true, "death-cert": true, branch: true, biometric: true }),
  { done: 6, total: 6, pct: 100 }, "all 6 ticked is 100%");

// 12. Red-flag spotter quiz: 4 red flags + 1 safe habit.
eq(data.SPOTTER_FLAGS.length, 5, "spotter quiz has 5 scenarios");
eq(data.SPOTTER_FLAGS.filter(function (f) { return f.isFlag; }).length, 4,
   "spotter quiz has 4 red flags");
eq(L.spotterAnswer(data.SPOTTER_FLAGS[0], true), true, "the release fee is a red flag");
eq(L.spotterAnswer(data.SPOTTER_FLAGS[0], false), false, "calling the release fee safe is wrong");
eq(L.spotterAnswer(data.SPOTTER_FLAGS[1], true), true, "the PIN ask is a red flag");
eq(L.spotterAnswer(data.SPOTTER_FLAGS[2], true), true, "the SMS fee is a red flag");
eq(L.spotterAnswer(data.SPOTTER_FLAGS[3], true), true, "the cash fix for missing years is a red flag");
eq(L.spotterAnswer(data.SPOTTER_FLAGS[4], false), true, "checking eobi.gov.pk is safe");
eq(L.spotterAnswer(data.SPOTTER_FLAGS[4], true), false, "calling the safe habit a flag is wrong");
var perfect = {};
data.SPOTTER_FLAGS.forEach(function (f) { perfect[f.id] = f.isFlag; });
var sPerfect = L.scoreQuiz(data.SPOTTER_FLAGS, perfect);
eq(sPerfect.correct, 5, "perfect answers score 5 of 5");
eq(sPerfect.perfect, true, "perfect answers are perfect");
var sNone = L.scoreQuiz(data.SPOTTER_FLAGS, {});
eq(sNone.correct, 0, "no answers score 0 of 5");
eq(sNone.perfect, false, "no answers are not perfect");
var sHalf = L.scoreQuiz(data.SPOTTER_FLAGS, { "release-fee": true, "pin-ask": true });
eq(sHalf.correct, 2, "two right answers score 2 of 5");

// 13. Pakistani digit grouping.
eq(L.formatPKR(500), "500", "Rs 500");
eq(L.formatPKR(9000), "9,000", "Rs 9,000");
eq(L.formatPKR(11500), "11,500", "Rs 11,500");
eq(L.formatPKR(12000), "12,000", "Rs 12,000");
eq(L.formatPKR(14400), "14,400", "Rs 14,400");
eq(L.formatPKR(19800), "19,800", "Rs 19,800");
eq(L.formatPKR(36000), "36,000", "Rs 36,000");
eq(L.formatPKR(45000), "45,000", "Rs 45,000");

// 14. Persona: the canonical facts.
deep(data.PERSONA, { name: "Muhammad Bashir", age: 68, city: "Peshawar",
  job: "Retired textile-mill worker", years: 22, wage: 45000,
  pension: 19800, id: "PNS-2026-4812", status: "SUSPENDED",
  october: "Credited 2 Oct 2026 via Bank Alfalah",
  november: "Suspended — missed the September 2026 proof-of-life window" },
     "Muhammad Bashir, 68, Peshawar, retired textile-mill worker, 22 years, Rs 45,000 wage, Rs 19,800 pension, SUSPENDED");

// 15. Every element id referenced by app.js exists in index.html.
var html = fs.readFileSync(__dirname + "/index.html", "utf8");
var appJs = fs.readFileSync(__dirname + "/app.js", "utf8");
var ids = {};
var m;
var idRe = /el\("([^"]+)"\)/g;
while ((m = idRe.exec(appJs)) !== null) ids[m[1]] = true;
var idList = Object.keys(ids);
ok(idList.length >= 20, "app.js references at least 20 element ids (" + idList.length + " found)");
idList.forEach(function (id) {
  ok(html.indexOf('id="' + id + '"') !== -1, "index.html defines id " + id);
});
["data.js", "logic.js", "app.js"].forEach(function (f) {
  ok(html.indexOf('src="' + f + '"') !== -1, "index.html loads " + f);
});
ok(html.indexOf('href="style.css"') !== -1, "index.html loads style.css");
// Tab buttons and sections exist for all five tabs.
["status", "proof", "calculator", "survivors", "spotter"].forEach(function (t) {
  ok(html.indexOf('id="tab-' + t + '"') !== -1, "index.html defines tab " + t);
  ok(html.indexOf('id="section-' + t + '"') !== -1, "index.html defines section " + t);
});
// No phone number and no leftover text from previous projects.
ok(html.indexOf("0342") === -1 && html.indexOf("9011609") === -1, "index.html carries no phone number");
["ZakatPak", "TaxPak", "Adalat", "MobilePak", "NetPak", "Challan", "Kiraya", "Silinder", "RemitPak"].forEach(function (word) {
  ok(html.indexOf(word) === -1, "index.html has no leftover " + word + " text");
});
// The pinned date is 20 Nov 2026.
ok(appJs.indexOf('"2026-11-20"') !== -1, "app.js pins today to 2026-11-20");

// 16. HTML tag balance: every opened tag is closed (void elements excluded).
var voidTags = { meta: 1, link: 1, input: 1, br: 1, hr: 1, img: 1 };
var stack = [];
var tagRe = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*\/?>/g;
while ((m = tagRe.exec(html)) !== null) {
  var tag = m[1].toLowerCase();
  var raw = m[0];
  if (voidTags[tag]) continue;
  if (raw[1] === "/") {
    eq(stack.pop(), tag, "closing tag </" + tag + "> matches the last opened tag");
  } else if (raw[raw.length - 2] !== "/") {
    stack.push(tag);
  }
}
eq(stack.length, 0, "no unclosed tags remain (stack empty)");

console.log("\n" + n + " assertions passed.");
