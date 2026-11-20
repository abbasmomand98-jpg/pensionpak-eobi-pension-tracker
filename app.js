// PensionPak — page wiring. All rules live in logic.js; this file only renders.
// "Today" is pinned to 2026-11-20 so the sample figures (Bashir's
// pension Rs 19,800, October credited 2 Oct 2026, November
// suspended; Fatima Bibi's survivors' pension Rs 11,500, credited
// 3 Nov 2026; the March 2027 window 101 days away) stay stable
// no matter when you open it.
(function () {
  var L = window.PensionPakLogic;
  var TODAY = "2026-11-20";
  var TODAY_LABEL = "20 Nov 2026";
  var STORE_LOOKUPS = "pensionpak-lookups";
  var STORE_CHECKLIST = "pensionpak-checklist";
  var STORE_SPOTTER = "pensionpak-spotter-answers";

  function el(id) { return document.getElementById(id); }
  function rs(n) { return "Rs " + L.formatPKR(n); }

  function loadJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || "null") || fallback; }
    catch (e) { return fallback; }
  }
  function saveJSON(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }
  function clone(obj) { return JSON.parse(JSON.stringify(obj)); }
  var lookups = loadJSON(STORE_LOOKUPS, []);
  var checklistDone = loadJSON(STORE_CHECKLIST, {});
  var spotterAnswers = loadJSON(STORE_SPOTTER, {});

  // ---- Tabs ----
  var TABS = ["status", "proof", "calculator", "survivors", "spotter"];
  function showTab(name) {
    TABS.forEach(function (t) {
      el("section-" + t).style.display = (t === name) ? "block" : "none";
      el("tab-" + t).className = "tab-btn" + (t === name ? " active" : "");
    });
  }
  TABS.forEach(function (t) {
    el("tab-" + t).addEventListener("click", function () { showTab(t); });
  });
  showTab("status");

  // ---- Pension status ----
  function pensionerCard(p) {
    var div = document.createElement("div");
    div.className = "bundle" + (p.status === "ACTIVE" ? "" : "");
    var badge = p.status === "ACTIVE"
      ? '<span class="badge-ok">\u2713 ACTIVE</span>'
      : '<span class="badge-risk">\u2717 SUSPENDED</span>';
    div.innerHTML = "<div><h3>" + p.name + ", " + p.age + " \u00b7 " + p.city + "</h3>" +
      "<p>" + p.id + " \u00b7 " + rs(p.pension) + " / month \u00b7 " + p.job + "</p>" +
      "<p>" + p.november + "</p></div>" +
      '<div class="recv">' + badge + "<span>" + p.status + "</span></div>";
    return div;
  }
  function renderPensionerList() {
    var box = el("pensioner-list");
    box.innerHTML = "";
    PENSIONERS.forEach(function (p) { box.appendChild(pensionerCard(p)); });
  }
  renderPensionerList();

  function renderSavedLookups() {
    var box = el("saved-lookups");
    box.innerHTML = "";
    if (!lookups.length) {
      box.innerHTML = "<p>No lookups saved yet on this device.</p>";
      return;
    }
    lookups.forEach(function (id) {
      var div = document.createElement("div");
      div.className = "bundle";
      var p = L.findPensioner(PENSIONERS, id);
      div.innerHTML = "<div><h3>" + id + "</h3><p>" +
        (p ? p.name + " \u00b7 " + p.status + " \u00b7 " + rs(p.pension) + " / month"
           : "No sample pensioner with this ID") + "</p></div>";
      box.appendChild(div);
    });
  }
  renderSavedLookups();

  function renderStatus() {
    var raw = el("pension-id-input").value || "";
    var box = el("status-result");
    var lookup = L.lookupStatus(PENSIONERS, raw);
    if (lookup.kind === "empty") { box.innerHTML = ""; return; }
    if (lookup.kind === "invalid") {
      box.innerHTML = '<div class="alert notfound"><strong>THAT IS NOT A PENSION ID</strong>' +
        "<p>Pension IDs look like PNS-2026-4812. Try a sample ID: PNS-2026-4812, PNS-2026-2077 or PNS-2026-9930.</p></div>";
      return;
    }
    if (lookup.kind === "not-found") {
      box.innerHTML = '<div class="alert notfound"><strong>NO SAMPLE PENSIONER WITH ID ' +
        raw.trim().toUpperCase() + "</strong>" +
        "<p>This demo only holds three sample pensioners: PNS-2026-4812, PNS-2026-2077 and PNS-2026-9930. For your real status, check eobi.gov.pk with your CNIC.</p></div>";
      return;
    }
    var p = lookup.pensioner;
    var cls = p.status === "ACTIVE" ? "ok" : "risk";
    var gap = p.gapNote ? "<p>" + p.gapNote + "</p>" : "";
    box.innerHTML = '<div class="alert ' + cls + '"><strong>' +
      (p.status === "ACTIVE" ? "\u2713 ACTIVE \u2014 " : "\u2717 SUSPENDED \u2014 ") +
      p.name + " \u00b7 " + rs(p.pension) + " / MONTH</strong>" +
      "<p>" + p.id + " \u00b7 " + p.city + " \u00b7 " + p.job + ".</p>" +
      "<p>October: " + p.october + ". November: " + p.november + ".</p>" +
      "<p>" + p.fix + "</p>" + gap + "</div>";
    var id = p.id;
    if (lookups.indexOf(id) === -1) {
      lookups.push(id);
      saveJSON(STORE_LOOKUPS, lookups);
      renderSavedLookups();
    }
  }
  el("pension-id-input").addEventListener("input", renderStatus);
  el("status-btn").addEventListener("click", renderStatus);
  renderStatus();

  // ---- Proof-of-life ----
  function renderProof() {
    var next = L.daysToNextWindow(TODAY);
    el("proof-countdown").innerHTML =
      '<div class="total"><strong>NEXT WINDOW \u2014 ' + next.label.toUpperCase() +
      " \u00b7 " + next.days + " DAYS LEFT</strong>" +
      "<p>Counted from " + TODAY_LABEL + ". Windows run twice a year \u2014 March and September \u2014 at any Bank Alfalah branch. The September 2026 window has closed.</p></div>";
    var box = el("proof-steps");
    box.innerHTML = "";
    PROOF_OF_LIFE.steps.forEach(function (step, i) {
      var div = document.createElement("div");
      div.className = "bundle";
      div.innerHTML = "<div><h3>" + (i + 1) + ". " + step + "</h3>" +
        "<p>" + PROOF_OF_LIFE.branch + "</p></div>" +
        '<div class="recv">STEP ' + (i + 1) + "<span>one visit</span></div>";
      box.appendChild(div);
    });
  }
  renderProof();

  function renderChecklist() {
    var prog = L.checklistProgress(CHECKLIST, checklistDone);
    el("checklist-progress").textContent = prog.done + " of " + prog.total +
      " documents ready \u00b7 " + prog.pct + "%." +
      (prog.pct === 100 ? " You are ready for the branch." : "");
    var box = el("checklist-list");
    box.innerHTML = "";
    CHECKLIST.forEach(function (item) {
      var div = document.createElement("div");
      div.className = "checklist-item" + (checklistDone[item.id] ? " done" : "");
      var cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = !!checklistDone[item.id];
      cb.addEventListener("change", function () {
        if (cb.checked) checklistDone[item.id] = true;
        else delete checklistDone[item.id];
        saveJSON(STORE_CHECKLIST, checklistDone);
        renderChecklist();
      });
      var label = document.createElement("label");
      label.textContent = item.label;
      div.appendChild(cb);
      div.appendChild(label);
      box.appendChild(div);
    });
  }
  renderChecklist();

  // ---- Pension calculator ----
  function readCalc() {
    function num(id) {
      var v = parseInt(el(id).value, 10);
      return (isNaN(v) || v < 0) ? 0 : v;
    }
    return { wage: num("wage-input"), years: num("years-input") };
  }
  function renderCalc() {
    var c = readCalc();
    var r = L.calcPension(c.wage, c.years, EOBI);
    el("calc-result").innerHTML =
      '<div class="total"><strong>PENSION ' + rs(r.pension) + " / MONTH" +
      (r.floored ? " \u00b7 FLOOR APPLIES" : "") + "</strong>" +
      "<p>" + rs(c.wage) + " \u00d7 " + c.years + " years \u00f7 50 = " + rs(r.raw) +
      (r.floored ? " \u2014 below the Rs 11,500 floor, so the floor lifts it to Rs 11,500."
                 : " \u2014 above the Rs 11,500 floor, so the formula rules.") +
      " Minimum pension Rs 11,500 / month, raised from Rs 10,000 on 1 Jan 2025.</p></div>";
    var box = el("examples-list");
    box.innerHTML = "";
    WORKED_EXAMPLES.forEach(function (ex) {
      var div = document.createElement("div");
      div.className = "bundle best";
      div.innerHTML = "<div><h3>" + ex.label + "</h3>" +
        "<p>" + rs(ex.wage) + " \u00d7 " + ex.years + " \u00f7 50 = " + rs(ex.raw) +
        (ex.floored ? " \u2014 below the floor" : "") + "</p></div>" +
        '<div class="recv">PENSION ' + rs(ex.pension) +
        "<span>" + (ex.floored ? "floor lifts it" : "formula rules") + "</span></div>";
      box.appendChild(div);
    });
    el("calc-summary").textContent = "Checked " + TODAY_LABEL +
      " \u00b7 sample figures — for your real pension, check eobi.gov.pk with your CNIC.";
  }
  ["wage-input", "years-input"].forEach(function (id) {
    el(id).addEventListener("input", renderCalc);
  });
  el("calc-btn").addEventListener("click", renderCalc);
  renderCalc();

  function renderArrears() {
    function num(id) {
      var v = parseInt(el(id).value, 10);
      return (isNaN(v) || v < 0) ? 0 : v;
    }
    var total = L.arrears(num("rise-input"), num("months-input"));
    el("arrears-result").innerHTML =
      '<div class="total"><strong>ARREARS ' + rs(total) + "</strong>" +
      "<p>" + rs(num("rise-input")) + " a month \u00d7 " + num("months-input") +
      " months = " + rs(total) + ". The real rise: Rs 1,500 \u00d7 8 months (Jan\u2013Aug 2025) = Rs 12,000.</p></div>";
  }
  ["rise-input", "months-input"].forEach(function (id) {
    el(id).addEventListener("input", renderArrears);
  });
  el("arrears-btn").addEventListener("click", renderArrears);
  renderArrears();

  // ---- Survivors' guide ----
  function renderSurvivors() {
    var box = el("survivors-list");
    box.innerHTML = "";
    SURVIVORS_GUIDE.forEach(function (g, i) {
      var div = document.createElement("div");
      div.className = "bundle";
      div.innerHTML = "<div><h3>" + (i + 1) + ". " + g.title + "</h3>" +
        "<p>" + g.detail + "</p></div>";
      box.appendChild(div);
    });
  }
  renderSurvivors();

  // ---- Red-flag spotter quiz ----
  function renderSpotter() {
    var box = el("spotter-quiz");
    box.innerHTML = "";
    SPOTTER_FLAGS.forEach(function (flag, i) {
      var div = document.createElement("div");
      div.className = "spotter-q";
      var chosen = spotterAnswers[flag.id];
      var btnFlag = document.createElement("button");
      btnFlag.textContent = "Red flag";
      btnFlag.className = chosen === true ? "flag-btn chosen" : "flag-btn";
      btnFlag.addEventListener("click", function () {
        spotterAnswers[flag.id] = true;
        saveJSON(STORE_SPOTTER, spotterAnswers);
        renderSpotter();
      });
      var btnSafe = document.createElement("button");
      btnSafe.textContent = "Safe";
      btnSafe.className = "secondary" + (chosen === false ? " chosen" : "");
      btnSafe.addEventListener("click", function () {
        spotterAnswers[flag.id] = false;
        saveJSON(STORE_SPOTTER, spotterAnswers);
        renderSpotter();
      });
      var p = document.createElement("p");
      p.innerHTML = "<strong>" + (i + 1) + ". </strong>" + flag.scenario;
      div.appendChild(p);
      div.appendChild(btnFlag);
      div.appendChild(btnSafe);
      box.appendChild(div);
    });
  }
  renderSpotter();

  el("spotter-btn").addEventListener("click", function () {
    var score = L.scoreQuiz(SPOTTER_FLAGS, spotterAnswers);
    var html = '<div class="alert ' + (score.perfect ? "ok" : "warn") + '"><strong>' +
      score.correct + " OF " + score.total + " CORRECT" + "</strong><p>" +
      (score.perfect ? "Perfect — you spot all four pension-agent traps and the safe habit."
                     : "Check the ones you missed below — the spotter catches them before the money moves.") +
      "</p></div>";
    SPOTTER_FLAGS.forEach(function (flag) {
      var right = L.spotterAnswer(flag, spotterAnswers[flag.id]);
      var answered = spotterAnswers.hasOwnProperty(flag.id);
      html += '<div class="alert ' + (!answered ? "notfound" : (right ? "ok" : "risk")) + '"><strong>' +
        (answered ? (right ? "✓ CORRECT — " : "✗ MISSED — ") : "NOT ANSWERED — ") +
        (flag.isFlag ? "RED FLAG" : "SAFE") + "</strong><p>" + flag.why + "</p></div>";
    });
    el("spotter-result").innerHTML = html;
  });

  el("reset-demo").addEventListener("click", function () {
    lookups = [];
    checklistDone = {};
    spotterAnswers = {};
    saveJSON(STORE_LOOKUPS, lookups);
    saveJSON(STORE_CHECKLIST, checklistDone);
    saveJSON(STORE_SPOTTER, spotterAnswers);
    el("pension-id-input").value = "PNS-2026-4812";
    el("wage-input").value = "45000";
    el("years-input").value = "22";
    el("rise-input").value = "1500";
    el("months-input").value = "8";
    el("spotter-result").innerHTML = "";
    showTab("status");
    renderStatus();
    renderSavedLookups();
    renderProof();
    renderChecklist();
    renderCalc();
    renderArrears();
    renderSurvivors();
    renderSpotter();
  });
})();
