# Google Sheets Database Setup Guide

This application uses Google Sheets as a database. Follow these steps to set up your Google Cloud credentials.

## Prerequisites

- Google Cloud account (free tier available)
- A Google Sheet to use as your database

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project ID

## Step 2: Enable Google Sheets API

1. In the Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google Sheets API"
3. Click **Enable**

## Step 3: Create Service Account

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **Service Account**
3. Fill in the service account details:
   - Name: `sheets-manager` (or any name you prefer)
   - Description: "Service account for Manager app"
4. Click **Create and Continue**
5. Skip the optional steps and click **Done**

## Step 4: Download Credentials

1. In the **Credentials** page, find your newly created service account
2. Click on the service account email
3. Go to the **Keys** tab
4. Click **Add Key** > **Create New Key**
5. Select **JSON** format
6. Click **Create**
7. The credentials JSON file will be downloaded to your computer
8. **Save this file as `credentials.json` in your server directory**

## Step 5: Create Your Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it (e.g., "Manager Clients Database")
4. Note the **Sheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit
   ```
5. The first sheet tab should be named "Clients" (or update GOOGLE_SHEET_NAME in .env)

## Step 6: Share Sheet with Service Account

1. Open your Google Sheet
2. Click the **Share** button
3. Copy the service account email from your `credentials.json` file
   - It looks like: `sheets-manager@your-project.iam.gserviceaccount.com`
4. Paste it in the share dialog
5. Give it **Editor** permissions
6. Uncheck "Notify people"
7. Click **Share**

## Step 7: Configure Environment Variables

Update your `.env` file with:

```env
# Google Sheets Configuration
GOOGLE_SHEET_ID=your_sheet_id_here
GOOGLE_SHEET_NAME=Clients
GOOGLE_CREDENTIALS_PATH=./credentials.json

# Server Configuration
PORT=3003
```

## Step 8: Install Dependencies and Run

```bash
npm install
npm run dev
```

## Verification

1. The server should start and log:
   ```
   Google Sheets connected ✅
   Sheet ID: your_sheet_id
   Sheet Name: Clients
   Server running on port 3003
   ```

2. Check your Google Sheet - it should now have headers in the first row:
   - id, clientName, imei, gpsNumber, installationDate, duration, expirationDate, remainingDays, status, phone, created_at

3. Test the API:
   ```bash
   curl http://localhost:3003/api/health
   ```

## Security Notes

⚠️ **Important:**
- Never commit `credentials.json` to version control
- Add it to `.gitignore`
- Keep your service account credentials secure
- Only share the Google Sheet with the service account email

## Troubleshooting

### "Failed to initialize Google Sheets"
- Check that `credentials.json` exists in the server directory
- Verify the file is valid JSON
- Ensure the Google Sheets API is enabled

### "The caller does not have permission"
- Make sure you shared the Google Sheet with the service account email
- Verify the service account has Editor permissions

### "Unable to parse range"
- Check that GOOGLE_SHEET_NAME matches your sheet tab name
- Default is "Clients" - update if your tab has a different name
