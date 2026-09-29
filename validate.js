/* Signup rules — pure functions, no page access, so they can be tested on their own.
   Used by script.js. Server-side checks in apps-script/Code.gs mirror these. */
(function (root) {
  "use strict";

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function clean(v) { return String(v == null ? "" : v).trim(); }

  function phoneDigits(v) {
    var d = clean(v).replace(/\D/g, "");
    if (d.length === 11 && d.charAt(0) === "1") d = d.slice(1);
    return d;
  }
  function isPhone(v) { return phoneDigits(v).length === 10; }
  function isEmail(v) { return EMAIL_RE.test(clean(v)); }

  function parseAge(v) {
    var s = clean(v);
    if (!/^\d{1,2}$/.test(s)) return NaN;
    return parseInt(s, 10);
  }

  function isAdult(kid) { var a = parseAge(kid.age); return !isNaN(a) && a >= 18; }

  /* Step 1: participants. Returns { "kid0.firstName": "message", ... } */
  function checkKids(kids, opts) {
    var e = {};
    kids.forEach(function (k, i) {
      var p = "kid" + i + ".";
      if (!clean(k.firstName)) e[p + "firstName"] = "Enter a first name.";
      if (!clean(k.lastName)) e[p + "lastName"] = "Enter a last name.";
      var a = parseAge(k.age);
      if (!clean(k.age)) e[p + "age"] = "Enter an age.";
      else if (isNaN(a) || a < opts.minAge || a > opts.maxAge)
        e[p + "age"] = "This program is for ages " + opts.minAge + "–" + opts.maxAge + ".";
    });
    return e;
  }

  /* Who must give what, given the participants entered. */
  function contactRules(data) {
    var kids = data.kids || [];
    var anyMinor = kids.some(function (k) { return !isAdult(k); });
    var parentComplete = !!(clean(data.parentName) && isPhone(data.parentPhone) && isEmail(data.parentEmail));
    return {
      parentRequired: anyMinor,
      // Adults give their own contact unless a parent/guardian contact is already complete.
      adultRequired: !anyMinor && !parentComplete
    };
  }

  /* Step 2: contact details. */
  function checkContact(data) {
    var e = {};
    var rules = contactRules(data);
    var pn = clean(data.parentName), pp = clean(data.parentPhone), pe = clean(data.parentEmail);

    if (rules.parentRequired) {
      if (!pn) e.parentName = "Enter the parent or guardian's name.";
      if (!pp) e.parentPhone = "Enter a phone number.";
      if (!pe) e.parentEmail = "Enter an email address.";
    }
    if (pp && !isPhone(pp)) e.parentPhone = "Enter a 10-digit phone number.";
    if (pe && !isEmail(pe)) e.parentEmail = "Enter a valid email, like name@example.com.";

    (data.kids || []).forEach(function (k, i) {
      if (!isAdult(k)) return;
      var p = "kid" + i + ".", ph = clean(k.adultPhone), em = clean(k.adultEmail);
      if (rules.adultRequired) {
        if (!ph) e[p + "adultPhone"] = "Enter a phone number.";
        if (!em) e[p + "adultEmail"] = "Enter an email address.";
      }
      if (ph && !isPhone(ph)) e[p + "adultPhone"] = "Enter a 10-digit phone number.";
      if (em && !isEmail(em)) e[p + "adultEmail"] = "Enter a valid email, like name@example.com.";
    });

    if (!clean(data.city)) e.city = "Enter your city.";
    return e;
  }

  /* Shape sent to the Google Sheet. */
  function toPayload(data) {
    return {
      kids: (data.kids || []).map(function (k) {
        var adult = isAdult(k);
        return {
          firstName: clean(k.firstName), lastName: clean(k.lastName), age: parseAge(k.age),
          school: clean(k.school), transport: clean(k.transport),
          adultPhone: adult ? clean(k.adultPhone) : "", adultEmail: adult ? clean(k.adultEmail) : ""
        };
      }),
      parentName: clean(data.parentName), parentPhone: clean(data.parentPhone), parentEmail: clean(data.parentEmail),
      city: clean(data.city), updates: !!data.updates, website: clean(data.website)
    };
  }

  root.RBHValidate = {
    checkKids: checkKids, checkContact: checkContact, contactRules: contactRules,
    toPayload: toPayload, isAdult: isAdult, isPhone: isPhone, isEmail: isEmail, parseAge: parseAge
  };
})(typeof window !== "undefined" ? window : this);
