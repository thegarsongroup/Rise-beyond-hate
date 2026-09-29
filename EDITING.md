# How to edit the site

Almost everything you'll want to change is in **one file: `content.js`**.

## Easiest: ask Claude

Open Claude Code in this project and say what you want. For example:

- "Add Mayor Jane Doe to the elected officials."
- "Change the time to 5:00–7:00 PM."
- "Add an FAQ: *Do they need to bring anything?* Answer: *Just themselves.*"

Claude will make the change, show it to you, and publish it once you say yes.

## Doing it yourself on GitHub

1. Go to **github.com/thegarsongroup/Rise-beyond-hate** and click **content.js**.
2. Click the ✏️ **pencil** icon (top right of the file).
3. Change the words **between the quote marks**. Leave every `"`, `,`, `{` and `}` exactly where it is.
4. Click **Commit changes…**, then **Commit changes** again.

The live site updates in about two minutes.

### Examples

**Add a confirmed guest's name:**

```js
{ role: "Local elected officials", names: "Mayor Jane Doe", note: "…" },
```

To show more than one name, separate them with commas inside the quotes: `names: "Mayor Jane Doe, Rep. John Smith"`.

**Change the time:**

```js
time: "5:00–7:00 PM",
```

**Add an FAQ.** Copy an existing line and change the words:

```js
{ q: "Do they need to bring anything?",
  a: "Just themselves! Food is provided." },
```

**Move the first session date.** Keep the same format. `-05:00` means Minnesota time in the fall:

```js
firstSession: "2026-10-22T16:30:00-05:00",
startLabel:   "Starts Oct 22",
```

After the first session, the countdown switches itself to *"Now meeting every Thursday."*

## Things that live in other files

| To change… | Edit |
|---|---|
| Headlines and section text | `index.html` (ask Claude, since it's easy to break) |
| Colors, spacing, animations | `styles.css` |
| Logo | Replace `assets/logo.png` and `assets/logo-mark.png` with files of the same name |
| Where signups go | `signupUrl` in `content.js` (see SETUP.md) |

If something looks broken after an edit, every version is saved on GitHub. Ask Claude to "undo my last change," or open **History** on the file and restore the earlier version.
