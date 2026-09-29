/* ==========================================================================
   RISE BEYOND HATE — SITE CONTENT
   --------------------------------------------------------------------------
   This is the file to edit when details change (dates, speakers, FAQ, etc).
   Rules:
     • Only change the words between "quotes".
     • Keep every quote mark, comma, and bracket where it is.
     • See EDITING.md for step-by-step examples.
   ========================================================================== */

window.RBH = {

  /* --- Where signups are sent -------------------------------------------
     Paste the Google Apps Script "Web app URL" here (see SETUP.md, step 3).
     Leave it as "" until then — the form will show your email instead.   */
  signupUrl: "https://script.google.com/macros/s/AKfycbym7Px5FEzC9GtbqB6xIpn408LPyOBsebH7vAehvEXjxNJ4tXEmTvHlBxg3IIuxzIg/exec",

  /* --- Program basics --------------------------------------------------- */
  // First session. Format: YYYY-MM-DDTHH:MM:00-05:00  (-05:00 = Minnesota time in fall)
  firstSession: "2026-10-15T16:30:00-05:00",
  schedule:     "Every Thursday",
  time:         "4:30–6:30 PM",
  startLabel:   "Starts Oct 15",
  ages:         "Ages 13–21",
  minAge: 13,
  maxAge: 21,
  maxKidsPerSignup: 3,

  address:      "7520 Brunswick Ave N",
  cityState:    "Brooklyn Park, MN",
  email:        "RiseBeyondHate612@gmail.com",
  ein:          "99-3804492",

  /* --- Who they'll meet ---------------------------------------------------
     Add a confirmed person's name to "names", e.g.
       names: "Mayor Jane Doe",
     Leave names: "" to show the role only.                                */
  guests: [
    { role: "Licensed counselors",       names: "", note: "Trained professionals who make it safe to talk about hard things." },
    { role: "Local elected officials",   names: "", note: "City and state leaders who listen — and answer questions." },
    { role: "Entrepreneurial mentors",   names: "", note: "Business owners who show what's possible, and how to get there." },
    { role: "Certified CPR instructors", names: "", note: "Hands-on training toward real CPR / First Aid certification." }
  ],

  /* --- FAQ ----------------------------------------------------------------
     Add, remove, or reword questions. Each one is { q: "...", a: "..." },  */
  faq: [
    { q: "Is it really free?",
      a: "Yes. Thursday sessions are free for every family, and food is provided at every session." },
    { q: "Who can join?",
      a: "Young people ages 13–21. Parents or guardians sign up anyone under 18. Young adults 18–21 can sign themselves up." },
    { q: "What happens at a session?",
      a: "It's a safe community space to talk about how violence has affected you, guided by licensed counselors — plus guest leaders, mentors, and hands-on skills like CPR." },
    { q: "How does transportation work?",
      a: "Rides are available on request. Let us know on the form, and our team will reach out to confirm whether we can provide one." },
    { q: "Does joining the waitlist guarantee a spot?",
      a: "Joining puts you first in line. We'll contact you before the first session with next steps. You're also first in line for the full Academy." },
    { q: "Who sees my information?",
      a: "Only the Rise Beyond Hate team. We never share or sell it, and we only use it to contact you about the program." }
  ]
};
