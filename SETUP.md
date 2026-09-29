# Setup: connect signups and go live

This takes about 15 minutes, and you only do it once. Do every step while signed in to **RiseBeyondHate612@gmail.com**.

---

## 1. Create the Google Sheet

1. Go to [sheets.new](https://sheets.new). A blank spreadsheet opens.
2. Click **Untitled spreadsheet** (top left) and rename it **RBH Waitlist**.

## 2. Add the signup script

1. In the Sheet, click **Extensions → Apps Script**. A new tab opens.
2. Delete everything in the code box.
3. Open `apps-script/Code.gs` from this project, copy **all** of it, and paste it into the code box.
4. Click the **💾 Save** icon.
5. In the dropdown next to **▶ Run**, choose **setup**, then click **▶ Run**.
6. Google asks for permission:
   - Click **Review permissions** and choose the RBH account.
   - You may see a warning that says **"Google hasn't verified this app."** That's normal, because you wrote this script yourself. Click **Advanced → Go to (unsafe)**, then **Allow**.
7. Go back to the Sheet. You should now have two tabs, **Signups** and **Mailing List**.

## 3. Turn it on as a web app

1. In the Apps Script tab, click **Deploy → New deployment**.
2. Click the ⚙️ gear next to "Select type" and choose **Web app**.
3. Fill it in:
   - **Description:** `Waitlist`
   - **Execute as:** **Me**
   - **Who has access:** **Anyone**. This lets the website *send* signups. Nobody can *read* your Sheet through it.
4. Click **Deploy** and copy the **Web app URL**. It starts with `https://script.google.com/macros/s/…`.
5. Open `content.js` in this project and paste the URL between the quotes on the `signupUrl` line:

   ```js
   signupUrl: "https://script.google.com/macros/s/PASTE-YOURS-HERE/exec",
   ```

   > Easiest option: send the URL to Claude and ask it to add it for you.

**To check the URL works:** paste it into a browser. You should see *"Rise Beyond Hate waitlist is connected."*

## 4. Test it

1. Open the website and submit a test signup using your own email.
2. Check that:
   - a new row appears in the **Signups** tab
   - your email appears in the **Mailing List** tab
   - an alert email arrives at RiseBeyondHate612@gmail.com
3. Delete the test rows when you're done.

## 5. Publish the site (GitHub Pages)

1. Go to **github.com/thegarsongroup/Rise-beyond-hate → Settings → Pages**.
2. Under **Build and deployment**, set:
   - **Source:** Deploy from a branch
   - **Branch:** `main`, folder `/ (root)`
3. Click **Save**. After a minute or two the site is live at:
   **https://thegarsongroup.github.io/Rise-beyond-hate/**

Every change saved to `main` after that goes live automatically within a couple of minutes.

---

### If you change `Code.gs` later

Don't create a new deployment, because that gives you a new URL. Instead:
1. Go to **Deploy → Manage deployments → ✏️ Edit**.
2. Set **Version: New version**, then **Deploy**.

The URL stays the same.

### If signups stop working

The form automatically tells families to email RiseBeyondHate612@gmail.com, so nobody gets turned away. Check that `signupUrl` in `content.js` is still correct, and that the deployment is still active under **Deploy → Manage deployments**.
