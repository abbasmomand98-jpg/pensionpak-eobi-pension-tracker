// PensionPak — pure logic, no DOM here, so it can be unit-tested in Node.
(function (root) {
  // Thousands grouping, matching the figures used in the mockups,
  // slides and copy: 19800 -> "19,800", 11500 -> "11,500".
  function formatPKR(n) {
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  // Raw formula pension: (average wage x years) / 50.
  // 45,000 x 22 / 50 = 19,800. 30,000 x 15 / 50 = 9,000.
  // 60,000 x 30 / 50 = 36,000. 36,000 x 20 / 50 = 14,400.
  function rawPension(wage, years) {
    if (!wage || !years || wage <= 0 || years <= 0) return 0;
    return Math.round(wage * years / 50);
  }

  // The EOBI pension: the formula, with the Rs 11,500 floor.
  // A formula result of Rs 0 stays Rs 0 (no wage, no service);
  // anything above zero but below the floor is lifted to it.
  //   19,800 -> 19,800. 9,000 -> 11,500 (floored). 36,000 -> 36,000.
  //   14,400 -> 14,400. 0 -> 0.
  function calcPension(wage, years, eobi) {
    var raw = rawPension(wage, years);
    if (raw <= 0) return { raw: 0, pension: 0, floored: false };
    var floor = eobi.minPension;
    if (raw < floor) return { raw: raw, pension: floor, floored: true };
    return { raw: raw, pension: raw, floored: false };
  }

  // Arrears for a monthly rise: rise x months.
  // Rs 1,500 x 8 months (Jan-Aug 2025) = Rs 12,000.
  function arrears(monthlyRise, months) {
    if (!monthlyRise || !months || monthlyRise <= 0 || months <= 0) return 0;
    return Math.round(monthlyRise * months);
  }

  // Days between two ISO dates (date-only, UTC so timezones
  // cannot shift the count): 2026-11-20 to 2027-03-01 = 101 days.
  function daysBetween(fromISO, toISO) {
    function parse(iso) {
      var p = iso.split("-");
      return Date.UTC(+p[0], +p[1] - 1, +p[2]);
    }
    return Math.round((parse(toISO) - parse(fromISO)) / 86400000);
  }

  // Next proof-of-life window after a date: windows open 1 March
  // and 1 September each year. From 2026-11-20 the next window
  // is 2027-03-01; from 2026-02-10 it is 2026-03-01; from
  // 2026-03-15 it is 2026-09-01.
  function nextProofWindow(todayISO) {
    var y = +todayISO.slice(0, 4);
    var mar = y + "-03-01";
    var sep = y + "-09-01";
    if (todayISO < mar) return { date: mar, label: "March " + y };
    if (todayISO < sep) return { date: sep, label: "September " + y };
    return { date: (y + 1) + "-03-01", label: "March " + (y + 1) };
  }

  // Days left to the next proof-of-life window, counted from a
  // pinned "today": 101 days from 2026-11-20 to 1 Mar 2027.
  function daysToNextWindow(todayISO) {
    var next = nextProofWindow(todayISO);
    return { days: daysBetween(todayISO, next.date),
             date: next.date, label: next.label };
  }

  // Pension ID format: PNS-YYYY-NNNN, e.g. PNS-2026-4812.
  function validPensionId(raw) {
    return /^PNS-\d{4}-\d{4}$/.test(String(raw || "").trim().toUpperCase());
  }

  // Find a sample pensioner by ID (case-insensitive, trims
  // spaces). "pns-2026-4812" finds Muhammad Bashir;
  // "PNS-2026-2077" finds Fatima Bibi; "PNS-2026-0000" finds
  // nothing; "4812" is not a valid ID.
  function findPensioner(pensioners, raw) {
    var q = String(raw || "").trim().toUpperCase();
    if (!validPensionId(q)) return null;
    var found = null;
    pensioners.forEach(function (p) {
      if (p.id.toUpperCase() === q) found = p;
    });
    return found;
  }

  // Status lookup: distinguishes a valid ID with no sample record
  // from a malformed ID, so the page can say the right thing.
  //   "PNS-2026-4812" -> { kind: "found", pensioner: Bashir }.
  //   "PNS-2026-0000" -> { kind: "not-found" }.
  //   "4812" -> { kind: "invalid" }.
  function lookupStatus(pensioners, raw) {
    var q = String(raw || "").trim();
    if (!q) return { kind: "empty" };
    if (!validPensionId(q)) return { kind: "invalid" };
    var found = findPensioner(pensioners, q);
    if (!found) return { kind: "not-found" };
    return { kind: "found", pensioner: found };
  }

  // Red-flag spotter quiz: each flag has isFlag true/false.
  // Answering "flag" for a real flag (or "safe" for the safe
  // habit) is correct.
  function spotterAnswer(flag, saidFlag) {
    return flag.isFlag === saidFlag;
  }

  function scoreQuiz(flags, answers) {
    var correct = 0;
    flags.forEach(function (f) {
      if (answers[f.id] === f.isFlag) correct++;
    });
    return { correct: correct, total: flags.length,
             perfect: correct === flags.length };
  }

  // Document checklist progress: 3 of 6 done is 50%.
  function checklistProgress(checklist, done) {
    var total = checklist.length;
    var count = 0;
    checklist.forEach(function (item) {
      if (done[item.id]) count++;
    });
    return { done: count, total: total,
             pct: total ? Math.round(count / total * 100) : 0 };
  }

  var api = { formatPKR: formatPKR,
              rawPension: rawPension,
              calcPension: calcPension,
              arrears: arrears,
              daysBetween: daysBetween,
              nextProofWindow: nextProofWindow,
              daysToNextWindow: daysToNextWindow,
              validPensionId: validPensionId,
              findPensioner: findPensioner,
              lookupStatus: lookupStatus,
              spotterAnswer: spotterAnswer,
              scoreQuiz: scoreQuiz,
              checklistProgress: checklistProgress };
  if (typeof module !== "undefined") { module.exports = api; }
  else { root.PensionPakLogic = api; }
})(typeof window !== "undefined" ? window : globalThis);
