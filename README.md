# Rise Beyond Hate — Waitlist Website

The waitlist page for Rise Beyond Hate's free Thursday youth program in Brooklyn Park, MN, for ages 13–21. Parents sign up their kids, young adults 18–21 can sign themselves up, and every signup lands in a private Google Sheet that also builds the mailing list.

- **Live site:** https://thegarsongroup.github.io/Rise-beyond-hate/ (after SETUP.md step 5)
- **First-time setup:** [SETUP.md](SETUP.md)
- **Editing text, dates and names:** [EDITING.md](EDITING.md)

## Files

| File | What it is |
|---|---|
| `index.html` | The page |
| `content.js` | **Editable details**: dates, time, address, guests, FAQ, signup URL |
| `styles.css` | Look, colors and animations |
| `script.js` | Signup pop-up, countdown, scroll effects, haptics, confetti |
| `validate.js` | Signup rules: ages 13–21, parent required under 18, and so on |
| `apps-script/Code.gs` | Script that runs on the Google Sheet and receives signups |
| `assets/` | Logo files |
| `tests/validate.html` | Open in a browser to check the signup rules |

There's no build step and nothing to install. The files are served as they are.
