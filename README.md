# Variety Golf – static registration form

This version uses only `index.html`, `styles.css`, and `script.js`. It does not need React, Vite, npm, or a `dist` folder, so Vercel can serve it as a simple static site.

## Fix the current Vercel error

The error happens because the current `index.html` still contains:

```html
<script type="module" src="/src/index.tsx"></script>
```

That file does not exist in your plain HTML/CSS/JS portfolio repository. This static version correctly uses:

```html
<script src="script.js" defer></script>
```

Upload the files in this folder directly to the root of the GitHub repository. Do not upload only the ZIP file. Remove the old Vite `vercel.json` if it contains `buildCommand` or `outputDirectory: "dist"`; a static site has no build step and no `dist` folder.

In Vercel, use a blank build command and a blank output directory. The root directory should be the folder containing `index.html`.

## Connect submissions to Google Sheets

1. Create a Google Sheet and create a tab named `Registrations`.
2. Copy the spreadsheet ID from the URL: `docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`.
3. Open **Extensions → Apps Script**, paste `google-apps-script/Code.gs`, and replace `PASTE_YOUR_GOOGLE_SHEET_ID_HERE`.
4. Click **Deploy → New deployment**, select **Web app**, choose **Execute as me**, and allow access for anyone who needs to submit the form.
5. Copy the deployed URL ending in `/exec`.
6. Paste that URL into `GOOGLE_APPS_SCRIPT_URL` at the top of `script.js`.
7. Commit the files to GitHub and redeploy Vercel.

The Apps Script `doPost` function receives the registration and appends one row to the sheet. The form sends entry, team, player, payment-method, and optional typed-signature information. It deliberately does not send or store card numbers, expiry dates, or CVC codes.

When Credit card is selected, the page reveals cardholder name, card number, expiry, CVC, and signature fields. Only the typed signature is included in the Google Sheets payload. Card number, expiry, and CVC are intentionally excluded. Connect the card section to a secure provider such as Stripe Checkout before accepting real card details.

If your `Registrations` sheet already exists, add a `Signature` header immediately after `Payment Method` so the column order matches `Code.gs`.

Google Apps Script web apps use `doPost` for POST requests and can write to Sheets with `appendRow`; see the [official web apps guide](https://developers.google.com/apps-script/guides/web) and [Content Service guide](https://developers.google.com/apps-script/guides/content).
