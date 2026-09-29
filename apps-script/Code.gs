/**
 * Rise Beyond Hate — waitlist receiver (Google Apps Script)
 *
 * Paste this into Extensions → Apps Script on the "RBH Waitlist" Google Sheet.
 * Full steps: SETUP.md in the website project.
 *
 * What it does:
 *   • Adds one row per participant to the "Signups" tab
 *   • Adds new opted-in emails to the "Mailing List" tab (no duplicates)
 *   • Emails the team about each new signup
 * The website can only ADD rows here — it can never read the Sheet.
 */

var ALERT_EMAIL = "RiseBeyondHate612@gmail.com";
var MIN_AGE = 13;
var MAX_AGE = 21;
var MAX_KIDS = 3;

var SIGNUP_HEADERS = [
  "Submitted", "Signup #", "First name", "Last name", "Age", "School", "Needs ride",
  "Participant phone (18+)", "Participant email (18+)",
  "Parent / guardian", "Parent phone", "Parent email", "City", "Wants updates"
];
var LIST_HEADERS = ["Email", "Name", "Type", "Added"];

/** Run this once from the editor (select "setup" → Run) to create the tabs. */
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  sheetWithHeaders_(ss, "Signups", SIGNUP_HEADERS);
  sheetWithHeaders_(ss, "Mailing List", LIST_HEADERS);
  var extra = ss.getSheetByName("Sheet1");
  if (extra && extra.getLastRow() === 0 && ss.getSheets().length > 2) ss.deleteSheet(extra);
}

function doPost(e) {
  try {
    var data = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    if (data.website) return json_({ ok: true }); // spam trap

    var problem = validate_(data);
    if (problem) return json_({ ok: false, error: problem });

    var lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      save_(data);
    } finally {
      lock.releaseLock();
    }
    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: "Something went wrong on our end." });
  }
}

/** Visiting the Web app URL in a browser shows this — handy to check it's live. */
function doGet() {
  return ContentService.createTextOutput("Rise Beyond Hate waitlist is connected.");
}

/* ---------------------------------------------------------------------- */

function validate_(d) {
  var kids = Array.isArray(d.kids) ? d.kids : [];
  if (!kids.length || kids.length > MAX_KIDS) return "Please add 1 to " + MAX_KIDS + " participants.";
  var anyMinor = false;
  for (var i = 0; i < kids.length; i++) {
    var k = kids[i], age = Number(k.age);
    if (!str_(k.firstName) || !str_(k.lastName)) return "Each participant needs a first and last name.";
    if (!(age >= MIN_AGE && age <= MAX_AGE) || Math.floor(age) !== age) return "Ages must be " + MIN_AGE + "–" + MAX_AGE + ".";
    if (age < 18) anyMinor = true;
  }
  var parentComplete = str_(d.parentName) && isPhone_(d.parentPhone) && isEmail_(d.parentEmail);
  if (anyMinor && !parentComplete) return "A parent or guardian's name, phone, and email are required for participants under 18.";
  if (!anyMinor && !parentComplete) {
    for (var j = 0; j < kids.length; j++) {
      if (!isPhone_(kids[j].adultPhone) || !isEmail_(kids[j].adultEmail)) return "Please add a phone and email for each participant 18+.";
    }
  }
  if (!str_(d.city)) return "Please add your city.";
  return "";
}

function save_(d) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var signups = sheetWithHeaders_(ss, "Signups", SIGNUP_HEADERS);
  var list = sheetWithHeaders_(ss, "Mailing List", LIST_HEADERS);
  var now = new Date();
  var id = nextSignupId_(signups);
  var wants = d.updates ? "Yes" : "No";

  var rows = d.kids.map(function (k) {
    var adult = Number(k.age) >= 18;
    return [
      now, id, k.firstName, k.lastName, Number(k.age), k.school, k.transport,
      adult ? k.adultPhone : "", adult ? k.adultEmail : "",
      d.parentName, d.parentPhone, d.parentEmail, d.city, wants
    ].map(safe_);
  });
  signups.getRange(signups.getLastRow() + 1, 1, rows.length, SIGNUP_HEADERS.length).setValues(rows);

  if (d.updates) {
    var have = {};
    if (list.getLastRow() > 1) {
      list.getRange(2, 1, list.getLastRow() - 1, 1).getValues().forEach(function (r) { have[String(r[0]).toLowerCase()] = true; });
    }
    var add = [];
    function push(email, name, type) {
      email = str_(email).toLowerCase();
      if (!isEmail_(email) || have[email]) return;
      have[email] = true;
      add.push([email, name, type, now].map(safe_));
    }
    push(d.parentEmail, d.parentName, "Parent / guardian");
    d.kids.forEach(function (k) { if (Number(k.age) >= 18) push(k.adultEmail, k.firstName + " " + k.lastName, "Participant 18+"); });
    if (add.length) list.getRange(list.getLastRow() + 1, 1, add.length, LIST_HEADERS.length).setValues(add);
  }

  try {
    var names = d.kids.map(function (k) { return k.firstName + " " + k.lastName + " (" + k.age + ")"; }).join(", ");
    var rides = d.kids.filter(function (k) { return k.transport === "Yes"; }).length;
    MailApp.sendEmail({
      to: ALERT_EMAIL,
      subject: "New waitlist signup: " + names,
      body:
        "New signup #" + id + "\n\n" +
        "Participants: " + names + "\n" +
        (d.parentName ? "Parent / guardian: " + d.parentName + " · " + d.parentPhone + " · " + d.parentEmail + "\n" : "") +
        "City: " + d.city + "\n" +
        (rides ? "Ride requested for " + rides + " participant(s) — please follow up.\n" : "") +
        "\nOpen the sheet: " + ss.getUrl()
    });
  } catch (mailErr) {
    console.warn("Alert email failed", mailErr); // the signup is still saved
  }
}

function nextSignupId_(sheet) {
  var last = sheet.getLastRow();
  if (last < 2) return 1;
  var v = Number(sheet.getRange(last, 2).getValue());
  return isNaN(v) ? last : v + 1;
}

function sheetWithHeaders_(ss, name, headers) {
  var sh = ss.getSheetByName(name) || ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold").setBackground("#0b1526").setFontColor("#ffffff");
    sh.setFrozenRows(1);
  }
  return sh;
}

function str_(v) { return String(v == null ? "" : v).trim().slice(0, 200); }
function isEmail_(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(str_(v)); }
function isPhone_(v) { var d = str_(v).replace(/\D/g, ""); if (d.length === 11 && d[0] === "1") d = d.slice(1); return d.length === 10; }

/** Stop anyone from sneaking spreadsheet formulas in through the form. */
function safe_(v) {
  if (v instanceof Date || typeof v === "number") return v;
  var s = str_(v);
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
