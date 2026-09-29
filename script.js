(function () {
  "use strict";

  var C = window.RBH || {};
  var V = window.RBHValidate;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var firstSession = new Date(C.firstSession || "2026-10-15T16:30:00-05:00");

  /* ---------- Haptics (Android browsers; iPhones ignore this) ---------- */
  function buzz(pattern) {
    if (reduceMotion || !navigator.vibrate) return;
    if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; // needs a real tap first
    try { navigator.vibrate(pattern); } catch (e) { /* not allowed */ }
  }

  /* ---------- Fill in content from content.js ---------- */
  $$("[data-rbh]").forEach(function (el) {
    var v = C[el.getAttribute("data-rbh")];
    if (v != null && v !== "") el.textContent = v;
  });
  if (C.email) $$("[data-rbh-email]").forEach(function (a) { a.href = "mailto:" + C.email; a.textContent = C.email; });
  if (C.address) $$("[data-map]").forEach(function (a) {
    a.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(C.address + " " + C.cityState);
  });
  var yearEl = $("#year"); if (yearEl) yearEl.textContent = new Date().getFullYear();

  var GUEST_ICONS = [
    '<path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z"/>',
    '<path d="M3 21h18M5 21V10M19 21V10M9 21v-7M15 21v-7M2 10l10-6 10 6"/>',
    '<path d="M4 20l5-5 4 4 7-8M15 11h5v5"/>',
    '<path d="M12 3v6M9 6h6"/><rect x="4" y="9" width="16" height="12" rx="3"/><path d="M9 15h6M12 12v6"/>'
  ];
  var guestList = $("#guest-list");
  if (guestList && C.guests) {
    guestList.innerHTML = "";
    C.guests.forEach(function (g, i) {
      var el = document.createElement("article");
      el.className = "guest reveal";
      el.innerHTML =
        '<div class="guest-ico"><svg viewBox="0 0 24 24" aria-hidden="true">' + GUEST_ICONS[i % GUEST_ICONS.length] + "</svg></div>" +
        "<h3></h3>" + (g.names ? '<p class="names"></p>' : "") + "<p></p>";
      $("h3", el).textContent = g.role;
      if (g.names) $(".names", el).textContent = g.names;
      el.lastElementChild.textContent = g.note || "";
      guestList.appendChild(el);
    });
  }

  var faqList = $("#faq-list");
  if (faqList && C.faq) {
    faqList.innerHTML = "";
    C.faq.forEach(function (f) {
      var d = document.createElement("details");
      d.className = "reveal";
      d.innerHTML = '<summary></summary><div class="answer"><div><p></p></div></div>';
      $("summary", d).textContent = f.q;
      $("p", d).textContent = f.a;
      faqList.appendChild(d);
    });
    faqList.addEventListener("toggle", function () { buzz(8); }, true);
  }

  /* ---------- Scroll reveals ---------- */
  var revealEls = $$(".reveal");
  // Stagger siblings that enter together
  revealEls.forEach(function (el) {
    var sibs = $$(":scope > .reveal", el.parentElement);
    var i = sibs.indexOf(el);
    if (i > 0) el.style.setProperty("--d", Math.min(i * 0.07, 0.42) + "s");
  });
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Nav appears after the hero starts scrolling ---------- */
  var nav = $("#nav");
  function onScroll() { nav.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.55); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Countdown ---------- */
  var cd = $("#countdown"), cdLabel = $("#countdown-label");
  var cdParts = { d: $('[data-cd="d"]'), h: $('[data-cd="h"]'), m: $('[data-cd="m"]'), s: $('[data-cd="s"]') };
  var launched = false;
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function tick() {
    var diff = firstSession - new Date();
    if (isNaN(diff) || diff <= 0) {
      launched = true;
      cd.classList.add("is-live");
      cdLabel.textContent = "Now meeting " + (C.schedule || "every Thursday").toLowerCase() + " · " + (C.time || "");
      return false;
    }
    var s = Math.floor(diff / 1000);
    cdParts.d.textContent = Math.floor(s / 86400);
    cdParts.h.textContent = pad(Math.floor(s / 3600) % 24);
    cdParts.m.textContent = pad(Math.floor(s / 60) % 60);
    cdParts.s.textContent = pad(s % 60);
    return true;
  }
  if (tick()) var cdTimer = setInterval(function () { if (!tick()) clearInterval(cdTimer); }, 1000);

  /* ---------- Press feedback on every button ---------- */
  document.addEventListener("pointerdown", function (e) {
    var b = e.target.closest(".btn, .btn-add, .seg label, .check, .rail-btn, .sheet-close");
    if (b) buzz(6);
  }, { passive: true });

  /* ---------- Guest card spotlight follows the pointer ---------- */
  document.addEventListener("pointermove", function (e) {
    var g = e.target.closest && e.target.closest(".guest");
    if (!g) return;
    var r = g.getBoundingClientRect();
    g.style.setProperty("--mx", (e.clientX - r.left) + "px");
    g.style.setProperty("--my", (e.clientY - r.top) + "px");
  }, { passive: true });

  /* ---------- Pillar rail arrows (desktop) ---------- */
  var rail = $("#pillars");
  var railBtns = $$("[data-rail]");
  function railState() {
    if (!rail) return;
    var max = rail.scrollWidth - rail.clientWidth - 4;
    railBtns.forEach(function (b) {
      b.disabled = b.getAttribute("data-rail") === "-1" ? rail.scrollLeft <= 4 : rail.scrollLeft >= max;
    });
  }
  railBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      rail.scrollBy({ left: Number(b.getAttribute("data-rail")) * 354, behavior: reduceMotion ? "auto" : "smooth" });
    });
  });
  if (rail) { rail.addEventListener("scroll", railState, { passive: true }); window.addEventListener("resize", railState); railState(); }

  /* ======================================================================
     Signup sheet
     ====================================================================== */
  var sheet = $("#signup"), panel = $(".sheet-panel", sheet), form = $("#signup-form");
  var kidsBox = $("#kids"), addKidBtn = $("#add-kid"), adultBox = $("#adult-contacts");
  var kidTpl = $("#kid-template"), adultTpl = $("#adult-template");
  var fill = $("#progress-fill"), stepLabels = $$(".progress-steps span");
  var formError = $("#form-error"), submitBtn = $("#submit-btn");
  var maxKids = C.maxKidsPerSignup || 3;
  var lastFocus = null, currentStep = 1, submitted = false;

  /* --- Participants --- */
  function addKid(focus) {
    var n = kidsBox.children.length;
    if (n >= maxKids) return;
    var node = kidTpl.content.firstElementChild.cloneNode(true);
    kidsBox.appendChild(node);
    wireKid(node);
    renumberKids();
    if (focus) $("input", node).focus();
  }
  function wireKid(node) {
    $(".kid-remove", node).addEventListener("click", function () {
      node.classList.add("is-leaving");
      buzz(10);
      setTimeout(function () {
        node.remove();
        adultBox.innerHTML = ""; // indexes shift; step 2 rebuilds these
        renumberKids();
        $("input", kidsBox).focus();
      }, reduceMotion ? 0 : 280);
    });
  }
  function renumberKids() {
    $$(".kid", kidsBox).forEach(function (k, i) {
      $(".kid-n", k).textContent = i + 1;
      $(".kid-remove", k).hidden = kidsBox.children.length === 1;
      $$("[data-name]", k).forEach(function (inp) {
        var name = inp.getAttribute("data-name");
        if (inp.type === "radio") { inp.name = "kid" + i + "-transport"; return; }
        inp.id = "kid" + i + "-" + name;
        inp.name = "kid" + i + "." + name;
      });
      $$("label[data-for]", k).forEach(function (l) { l.htmlFor = "kid" + i + "-" + l.getAttribute("data-for"); });
      var seg = $(".seg", k), lbl = $("[data-label]", k);
      lbl.id = "kid" + i + "-transport-label";
      seg.setAttribute("aria-labelledby", lbl.id);
    });
    addKidBtn.hidden = kidsBox.children.length >= maxKids;
  }
  addKidBtn.addEventListener("click", function () { addKid(true); });

  function readKids() {
    return $$(".kid", kidsBox).map(function (k, i) {
      var val = function (n) { var el = $('[data-name="' + n + '"]', k); return el ? el.value : ""; };
      var t = $('[data-name="transport"]:checked', k);
      var adult = $('[data-adult="' + i + '"]', adultBox);
      return {
        firstName: val("firstName"), lastName: val("lastName"), age: val("age"), school: val("school"),
        transport: t ? t.value : "",
        adultPhone: adult ? $('[data-name="adultPhone"]', adult).value : "",
        adultEmail: adult ? $('[data-name="adultEmail"]', adult).value : ""
      };
    });
  }
  function readAll() {
    return {
      kids: readKids(),
      parentName: form.parentName.value, parentPhone: form.parentPhone.value, parentEmail: form.parentEmail.value,
      city: form.city.value, updates: form.updates.checked, website: form.website.value
    };
  }

  /* --- Adults (18+) get their own contact block on step 2 --- */
  function renderContactStep() {
    var data = readAll();
    var keep = {};
    $$("[data-adult]", adultBox).forEach(function (b) {
      keep[b.getAttribute("data-adult")] = {
        p: $('[data-name="adultPhone"]', b).value, e: $('[data-name="adultEmail"]', b).value
      };
    });
    adultBox.innerHTML = "";
    data.kids.forEach(function (k, i) {
      if (!V.isAdult(k)) return;
      var node = adultTpl.content.firstElementChild.cloneNode(true);
      node.setAttribute("data-adult", i);
      $(".adult-name", node).textContent = k.firstName.trim() || "Participant " + (i + 1);
      $$("[data-name]", node).forEach(function (inp) {
        var name = inp.getAttribute("data-name");
        inp.id = "kid" + i + "-" + name; inp.name = "kid" + i + "." + name;
        if (keep[i]) inp.value = name === "adultPhone" ? keep[i].p : keep[i].e;
      });
      $$("label[data-for]", node).forEach(function (l) { l.htmlFor = "kid" + i + "-" + l.getAttribute("data-for"); });
      adultBox.appendChild(node);
    });
    updateContactLabels();
  }
  function updateContactLabels() {
    var rules = V.contactRules(readAll());
    var tag = $("#parent-tag");
    tag.textContent = rules.parentRequired ? "Required" : "Optional";
    tag.classList.toggle("is-optional", !rules.parentRequired);
    var anyAdult = adultBox.children.length > 0;
    $$(".tag", adultBox).forEach(function (t) {
      t.textContent = rules.adultRequired ? "Required" : "Optional";
      t.classList.toggle("is-optional", !rules.adultRequired);
    });
    $("#contact-sub").textContent = !rules.parentRequired && anyAdult
      ? "Participants 18+ can use their own contact info. A parent or guardian is optional."
      : "We'll use this to confirm next steps before the first session.";
  }
  $("#parent-group").addEventListener("input", updateContactLabels);

  /* --- Errors --- */
  function clearErrors(scope) {
    $$(".has-error", scope).forEach(function (f) { f.classList.remove("has-error", "shake"); });
    $$(".err", scope).forEach(function (e) { e.remove(); });
    $$("[aria-invalid]", scope).forEach(function (i) { i.removeAttribute("aria-invalid"); i.removeAttribute("aria-describedby"); });
  }
  function fieldFor(key) {
    var id = key.indexOf(".") > -1 ? key.replace(".", "-") : key;
    return document.getElementById(id);
  }
  function showErrors(errs, scope) {
    clearErrors(scope);
    var first = null;
    Object.keys(errs).forEach(function (key) {
      var input = fieldFor(key);
      if (!input) return;
      var field = input.closest(".field");
      field.classList.add("has-error");
      void field.offsetWidth; field.classList.add("shake");
      var msg = document.createElement("span");
      msg.className = "err"; msg.id = input.id + "-err"; msg.textContent = errs[key];
      field.appendChild(msg);
      input.setAttribute("aria-invalid", "true");
      input.setAttribute("aria-describedby", msg.id);
      if (!first) first = input;
    });
    if (first) { first.focus({ preventScroll: true }); first.scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" }); buzz([12, 60, 12]); }
    return !first;
  }
  // Clear a field's error as soon as the person fixes it
  form.addEventListener("input", function (e) {
    var f = e.target.closest(".field.has-error");
    if (!f) return;
    f.classList.remove("has-error", "shake");
    var m = $(".err", f); if (m) m.remove();
    e.target.removeAttribute("aria-invalid");
  });

  /* --- Steps --- */
  function goStep(n, back) {
    currentStep = n;
    $$(".step", form).forEach(function (s) {
      var on = Number(s.getAttribute("data-step")) === n;
      s.classList.toggle("is-active", on);
      s.classList.toggle("from-back", on && !!back);
    });
    fill.style.width = (n / 3 * 100) + "%";
    stepLabels.forEach(function (l, i) { l.classList.toggle("on", i < n); });
    panel.scrollTop = 0;
    var target = n === 3 ? $(".step-done", form) : $('.step[data-step="' + n + '"] input:not([type=radio]):not([type=checkbox])', form);
    if (target) setTimeout(function () { target.focus({ preventScroll: true }); }, 60);
  }
  $("[data-next]", form).addEventListener("click", function () {
    var errs = V.checkKids(readKids(), { minAge: C.minAge || 13, maxAge: C.maxAge || 21 });
    if (!showErrors(errs, $('[data-step="1"]', form))) return;
    buzz(10);
    renderContactStep();
    goStep(2);
  });
  $("[data-back]", form).addEventListener("click", function () { clearErrors(form); formError.hidden = true; goStep(1, true); });

  /* --- Submit --- */
  function fail(msg) {
    var email = C.email || "RiseBeyondHate612@gmail.com";
    formError.innerHTML = "";
    formError.append(msg + " Please try again, or email us at ");
    var a = document.createElement("a"); a.href = "mailto:" + email; a.textContent = email;
    formError.append(a, " and we'll add you.");
    formError.hidden = false;
    buzz([20, 80, 20]);
  }
  function isLocal() { return /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) || location.protocol === "file:"; }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (currentStep !== 2 || submitBtn.classList.contains("is-loading")) return;
    formError.hidden = true;
    var data = readAll();
    if (!showErrors(V.checkContact(data), $('[data-step="2"]', form))) return;

    var payload = V.toPayload(data);
    if (payload.website) { success(); return; } // bot filled the hidden field — pretend it worked

    if (!C.signupUrl) {
      if (isLocal()) { console.warn("[RBH] signupUrl is empty — demo mode, nothing was saved.", payload); success(); }
      else fail("Signups aren't connected yet.");
      return;
    }

    submitBtn.classList.add("is-loading");
    submitBtn.disabled = true;
    fetch(C.signupUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" }, // simple request: no CORS preflight
      body: JSON.stringify(payload),
      redirect: "follow"
    })
      .then(function (r) { return r.json(); })
      .then(function (res) { if (res && res.ok) success(); else fail((res && res.error) || "Something went wrong."); })
      .catch(function () { fail("We couldn't reach our signup list."); })
      .then(function () { submitBtn.classList.remove("is-loading"); submitBtn.disabled = false; });
  });

  function success() {
    submitted = true;
    $("#done-msg").textContent = launched
      ? "Thanks for signing up. We'll reach out soon with next steps."
      : "We'll reach out before October 15 with next steps.";
    goStep(3);
    buzz([18, 50, 30]);
    confetti();
  }

  function resetForm() {
    form.reset();
    kidsBox.innerHTML = ""; adultBox.innerHTML = "";
    clearErrors(form); formError.hidden = true;
    addKid(false);
    submitted = false;
    goStep(1);
  }

  /* --- Open / close --- */
  function focusables() {
    return $$('button:not([disabled]), [href], input:not([tabindex="-1"]):not([type=hidden]), [tabindex]:not([tabindex="-1"])', panel)
      .filter(function (el) { return el.offsetParent !== null; });
  }
  function openSheet() {
    if (!sheet.hidden) return;
    lastFocus = document.activeElement;
    if (submitted) resetForm();
    sheet.hidden = false;
    document.body.classList.add("sheet-open");
    requestAnimationFrame(function () { requestAnimationFrame(function () { sheet.classList.add("is-open"); }); });
    buzz(12);
    goStep(currentStep);
  }
  function closeSheet() {
    if (sheet.hidden) return;
    sheet.classList.remove("is-open");
    sheet.style.removeProperty("--drag");
    document.body.classList.remove("sheet-open");
    setTimeout(function () {
      sheet.hidden = true;
      if (submitted) resetForm();
      if (lastFocus) lastFocus.focus({ preventScroll: true });
    }, reduceMotion ? 0 : 420);
  }
  $$("[data-open-signup]").forEach(function (b) { b.addEventListener("click", openSheet); });
  $$("[data-close-signup]", sheet).forEach(function (b) { b.addEventListener("click", closeSheet); });
  document.addEventListener("keydown", function (e) {
    if (sheet.hidden) return;
    if (e.key === "Escape") { closeSheet(); return; }
    if (e.key === "Tab") {
      var f = focusables(); if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  if (location.hash === "#join") openSheet();

  /* --- Drag the sheet down to dismiss (phones) --- */
  (function () {
    var startY = null, dy = 0;
    function down(e) {
      if (window.innerWidth >= 720) return;
      if (e.target.closest("input, button, label, a")) return;
      if (panel.scrollTop > 0) return;
      startY = e.clientY; dy = 0;
    }
    function move(e) {
      if (startY == null) return;
      dy = Math.max(0, e.clientY - startY);
      if (dy > 6) { sheet.classList.add("is-dragging"); sheet.style.setProperty("--drag", dy + "px"); }
    }
    function up() {
      if (startY == null) return;
      sheet.classList.remove("is-dragging");
      if (dy > 110) closeSheet(); else sheet.style.removeProperty("--drag");
      startY = null;
    }
    panel.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  })();

  /* ---------- Confetti ---------- */
  function confetti() {
    if (reduceMotion) return;
    var cv = $("#confetti"), ctx = cv.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = cv.width = innerWidth * dpr, H = cv.height = innerHeight * dpr;
    var colors = ["#2cb5ae", "#f39a2c", "#ffffff", "#7cc6a0", "#ffb24f"];
    var parts = [];
    for (var i = 0; i < 170; i++) {
      var side = i % 2 ? 1 : -1;
      parts.push({
        x: W / 2 + side * W * 0.05, y: H * 0.55,
        vx: side * (Math.random() * 9 + 2) * dpr, vy: -(Math.random() * 14 + 8) * dpr,
        w: (Math.random() * 7 + 5) * dpr, h: (Math.random() * 10 + 6) * dpr,
        r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.35,
        c: colors[i % colors.length], life: 0
      });
    }
    var t0 = performance.now();
    (function frame(t) {
      ctx.clearRect(0, 0, W, H);
      var alive = false;
      parts.forEach(function (p) {
        p.vy += 0.42 * dpr; p.vx *= 0.985; p.vy *= 0.985;
        p.x += p.vx; p.y += p.vy; p.r += p.vr;
        if (p.y < H + 40) alive = true;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.globalAlpha = Math.max(0, 1 - (t - t0) / 3200);
        ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r * 2)));
        ctx.restore();
      });
      if (alive && t - t0 < 3200) requestAnimationFrame(frame); else ctx.clearRect(0, 0, W, H);
    })(t0);
  }

  addKid(false);
})();
