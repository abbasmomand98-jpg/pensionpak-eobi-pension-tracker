// PensionPak DOM smoke test — run with: node dom-smoke.js
// Executes data.js + logic.js + app.js in a tiny fake DOM (vm sandbox)
// and asserts the page renders the canonical figures.
var fs = require("fs");
var vm = require("vm");
var assert = require("assert");

function FakeEl(tag) {
  this.tagName = (tag || "div").toUpperCase();
  this.children = [];
  this._html = "";
  this.textContent = "";
  this.value = "";
  this.checked = false;
  this.disabled = false;
  this.className = "";
  this.style = {};
  this.listeners = {};
  this.attributes = {};
  this.type = "";
}
FakeEl.prototype.addEventListener = function (ev, fn) {
  (this.listeners[ev] = this.listeners[ev] || []).push(fn);
};
FakeEl.prototype.appendChild = function (child) { this.children.push(child); return child; };
FakeEl.prototype.setAttribute = function (k, v) { this.attributes[k] = v; };
FakeEl.prototype.getAttribute = function (k) { return this.attributes[k]; };
Object.defineProperty(FakeEl.prototype, "innerHTML", {
  get: function () { return this._html; },
  set: function (v) { this._html = String(v); this.children = []; }
});

var byId = {};
function el(id) {
  if (!byId[id]) byId[id] = new FakeEl("div");
  return byId[id];
}
var documentStub = {
  getElementById: el,
  createElement: function (tag) { return new FakeEl(tag); }
};
var store = {};
var localStorageStub = {
  getItem: function (k) { return store[k] || null; },
  setItem: function (k, v) { store[k] = String(v); }
};
function fire(id, ev, arg) {
  (byId[id].listeners[ev] || []).forEach(function (fn) { fn(arg || {}); });
}
function fireEl(node, ev, arg) {
  (node.listeners[ev] || []).forEach(function (fn) { fn(arg || {}); });
}

var sandbox = { document: documentStub, localStorage: localStorageStub, console: console,
  Date: Date, setInterval: function () { return 0; }, clearInterval: function () {} };
sandbox.window = sandbox;
vm.createContext(sandbox);
// Pre-seed the fake DOM with the defaults index.html declares in markup
// (the fake DOM does not parse value/selected attributes).
el("pension-id-input").value = "PNS-2026-4812";
el("wage-input").value = "45000";
el("years-input").value = "22";
el("rise-input").value = "1500";
el("months-input").value = "8";
["data.js", "logic.js", "app.js"].forEach(function (f) {
  vm.runInContext(fs.readFileSync(f, "utf8"), sandbox, { filename: f });
});

var n = 0;
function eq(a, b, msg) { assert.strictEqual(a, b, msg); n++; }
function ok(v, msg) { assert.ok(v, msg); n++; }

// 1. Status tab is active on load; Bashir's SUSPENDED record renders.
eq(el("section-status").style.display, "block", "status section shows on load");
ok(el("status-result").innerHTML.indexOf("SUSPENDED") !== -1, "status shows Bashir SUSPENDED");
ok(el("status-result").innerHTML.indexOf("Rs 19,800") !== -1, "status shows Rs 19,800");
ok(el("status-result").innerHTML.indexOf("2 Oct 2026") !== -1, "status names October credited 2 Oct 2026");
ok(el("status-result").innerHTML.indexOf("December") !== -1, "status says the pension resumes in December");
eq(el("pensioner-list").children.length, 3, "sample pensioner list renders 3 records");
ok(el("pensioner-list").children[1].innerHTML.indexOf("Fatima Bibi") !== -1, "second record is Fatima Bibi");
ok(el("pensioner-list").children[1].innerHTML.indexOf("ACTIVE") !== -1, "Fatima Bibi is ACTIVE");
ok((store["pensionpak-lookups"] || "").indexOf("PNS-2026-4812") !== -1, "Bashir's lookup is saved on this device");

// 2. Look up Fatima Bibi by ID.
el("pension-id-input").value = "PNS-2026-2077";
fire("status-btn", "click");
ok(el("status-result").innerHTML.indexOf("Fatima Bibi") !== -1, "PNS-2026-2077 finds Fatima Bibi");
ok(el("status-result").innerHTML.indexOf("Rs 11,500") !== -1, "Fatima Bibi's pension is Rs 11,500");
ok(el("status-result").innerHTML.indexOf("3 Nov 2026") !== -1, "Fatima Bibi credited 3 Nov 2026");
ok(el("status-result").innerHTML.indexOf("remarries") !== -1, "Fatima Bibi's card names the remarriage rule");

// 3. A valid ID with no sample record, and a malformed ID.
el("pension-id-input").value = "PNS-2026-0000";
fire("status-btn", "click");
ok(el("status-result").innerHTML.indexOf("NO SAMPLE PENSIONER") !== -1, "an unknown ID shows no sample pensioner");
el("pension-id-input").value = "4812";
fire("status-btn", "click");
ok(el("status-result").innerHTML.indexOf("NOT A PENSION ID") !== -1, "'4812' is not a pension ID");
el("pension-id-input").value = "PNS-2026-4812";
fire("status-btn", "click");
ok(el("status-result").innerHTML.indexOf("Muhammad Bashir") !== -1, "restoring Bashir's ID restores his record");

// 4. Proof tab: 101 days to March 2027, 4 steps, 6-item checklist.
fire("tab-proof", "click");
eq(el("section-proof").style.display, "block", "proof section shows on tab click");
eq(el("section-status").style.display, "none", "status section hides on tab click");
ok(el("proof-countdown").innerHTML.indexOf("101") !== -1, "countdown shows 101 days");
ok(el("proof-countdown").innerHTML.indexOf("MARCH 2027") !== -1, "countdown names March 2027");
ok(el("proof-countdown").innerHTML.indexOf("20 Nov 2026") !== -1, "countdown is counted from 20 Nov 2026");
eq(el("proof-steps").children.length, 4, "proof-of-life renders 4 steps");
ok(el("proof-steps").children[0].innerHTML.indexOf("original CNIC") !== -1, "step 1 is the original CNIC");
eq(el("checklist-list").children.length, 6, "checklist renders 6 documents");
ok(el("checklist-progress").textContent.indexOf("0 of 6") !== -1, "checklist starts 0 of 6");
var cb = el("checklist-list").children[0].children[0];
cb.checked = true;
fireEl(cb, "change");
ok(el("checklist-progress").textContent.indexOf("1 of 6") !== -1, "ticking the CNIC makes it 1 of 6");
ok((store["pensionpak-checklist"] || "").indexOf("cnic") !== -1, "the ticked CNIC persists in localStorage");

// 5. Calculator tab: Bashir Rs 19,800; floor case Rs 11,500; 3 examples; arrears Rs 12,000.
fire("tab-calculator", "click");
eq(el("section-calculator").style.display, "block", "calculator section shows on tab click");
ok(el("calc-result").innerHTML.indexOf("Rs 19,800") !== -1, "calculator shows Rs 19,800 for Bashir");
ok(el("calc-result").innerHTML.indexOf("45,000") !== -1, "calculator shows the Rs 45,000 wage");
eq(el("examples-list").children.length, 3, "calculator renders 3 worked examples");
ok(el("examples-list").children[1].innerHTML.indexOf("Rs 11,500") !== -1, "second example is floored to Rs 11,500");
ok(el("examples-list").children[2].innerHTML.indexOf("Rs 36,000") !== -1, "third example is Rs 36,000");
ok(el("arrears-result").innerHTML.indexOf("Rs 12,000") !== -1, "arrears estimator shows Rs 12,000");
ok(el("calc-summary").textContent.indexOf("20 Nov 2026") !== -1, "summary names 20 Nov 2026");
// Floor case: Rs 30,000 x 15 years.
el("wage-input").value = "30000";
el("years-input").value = "15";
fire("wage-input", "input");
ok(el("calc-result").innerHTML.indexOf("Rs 11,500") !== -1, "Rs 30,000 x 15 years is floored to Rs 11,500");
ok(el("calc-result").innerHTML.indexOf("FLOOR APPLIES") !== -1, "the floor case says FLOOR APPLIES");
el("wage-input").value = "45000";
el("years-input").value = "22";
fire("wage-input", "input");
ok(el("calc-result").innerHTML.indexOf("Rs 19,800") !== -1, "restoring Bashir restores Rs 19,800");
// Arrears: 12 months at Rs 1,500.
el("months-input").value = "12";
fire("months-input", "input");
ok(el("arrears-result").innerHTML.indexOf("Rs 18,000") !== -1, "12 months at Rs 1,500 is Rs 18,000 arrears");
el("months-input").value = "8";
fire("months-input", "input");
ok(el("arrears-result").innerHTML.indexOf("Rs 12,000") !== -1, "restoring 8 months restores Rs 12,000");

// 6. Survivors tab: 4 guide items, remarriage rule present.
fire("tab-survivors", "click");
eq(el("section-survivors").style.display, "block", "survivors section shows on tab click");
eq(el("survivors-list").children.length, 4, "survivors guide renders 4 items");
ok(el("survivors-list").children[1].innerHTML.indexOf("remarries") !== -1, "guide item 2 names remarriage");
ok(el("survivors-list").children[3].innerHTML.indexOf("2011") !== -1, "guide item 4 names the 2011–2013 gap");

// 7. Spotter tab: 5 questions, perfect score after correct answers.
fire("tab-spotter", "click");
eq(el("section-spotter").style.display, "block", "spotter section shows on tab click");
eq(el("spotter-quiz").children.length, 5, "spotter quiz renders 5 questions");
fire("spotter-btn", "click");
ok(el("spotter-result").innerHTML.indexOf("0 OF 5 CORRECT") !== -1, "no answers score 0 of 5");
var qs = el("spotter-quiz").children;
for (var i = 0; i < 4; i++) {
  fireEl(qs[i].children[1], "click"); // "Red flag" for the 4 real flags
}
fireEl(qs[4].children[2], "click"); // "Safe" for the safe habit
fire("spotter-btn", "click");
ok(el("spotter-result").innerHTML.indexOf("5 OF 5 CORRECT") !== -1, "correct answers score 5 of 5");
ok(el("spotter-result").innerHTML.indexOf("EOBI never charges") !== -1, "spotter result explains the release-fee flag");

// 8. Reset restores the canonical defaults.
fire("reset-demo", "click");
eq(el("section-status").style.display, "block", "reset returns to the status tab");
ok(el("status-result").innerHTML.indexOf("Rs 19,800") !== -1, "reset restores Bashir's Rs 19,800");
ok(el("checklist-progress").textContent.indexOf("0 of 6") !== -1, "reset clears the checklist to 0 of 6");
ok(el("spotter-result").innerHTML === "", "reset clears the spotter result");
eq(el("wage-input").value, "45000", "reset restores wage Rs 45,000");
eq(el("pension-id-input").value, "PNS-2026-4812", "reset restores pension ID PNS-2026-4812");

console.log("\n" + n + " DOM assertions passed.");
