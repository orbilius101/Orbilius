# Debugging Guide

## How to See Errors in Real-Time

### 1. Browser Console

Open your browser's Developer Tools to see console logs:

- **Chrome/Edge**: Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
- **Firefox**: Press `F12` or `Cmd+Option+K` (Mac) / `Ctrl+Shift+K` (Windows)
- **Safari**: Enable Developer menu in Preferences, then press `Cmd+Option+C`

Navigate to the **Console** tab to see all error messages and logs.

### 2. Network Tab

To see API call failures:

1. Open Developer Tools (F12)
2. Go to **Network** tab
3. Try the action that's failing
4. Look for failed requests (red status codes)
5. Click on the failed request to see details:
   - **Headers**: request/response headers
   - **Response**: error message from server
   - **Payload**: data sent to server

### 3. Running the Application Locally

For full functionality, you need BOTH services running:

#### Terminal 1 - Frontend (Vite)

```bash
pnpm dev
```

Runs on: http://localhost:5173

#### Terminal 2 - Firebase Emulators

```bash
pnpm firebase:emulators
```

Runs on: http://localhost:5001 (Functions), http://localhost:4000 (Emulator UI)

**Important**: Cloud Functions won't work without the emulators running!

### 4. Common Errors

| Error Message              | Cause                           | Solution                             |
| -------------------------- | ------------------------------- | ------------------------------------ |
| "Failed to fetch"          | Firebase emulators not running  | Run `pnpm firebase:emulators`        |
| "Cannot connect to server" | Backend not available           | Start Firebase emulators             |
| "CORS error"               | Cross-origin request blocked    | Check Firebase Functions CORS config |
| "Permission denied"        | Firestore rules blocking access | Check firestore.rules                |

### 5. Checking Logs

#### Frontend Logs

All frontend errors appear in the browser console. Look for:

- Red error messages
- Network failures
- Console.log statements we added

#### Backend Logs

When running Firebase emulators, check the terminal where you ran `pnpm firebase:emulators`:

- Function invocations appear with timestamps
- Errors in Cloud Functions show full stack traces
- HTTP response codes (200, 400, 500, etc.)

### 6. Sharing Errors with AI Assistant

Instead of screenshots, you can share:

1. **Browser Console Output**:
   - Right-click in console > "Save as..."
   - Or copy/paste text directly

2. **Network Request Details**:
   - Click failed request in Network tab
   - Copy as cURL or HAR file

3. **Terminal Output**:
   - Copy/paste the error text from terminal

4. **Error Details**:
   ```
   Error: [error message]
   URL: [the endpoint that failed]
   Status: [HTTP status code if available]
   ```

### 7. Quick Troubleshooting

If invitations aren't working:

1. ✅ Check Firebase emulators are running (`http://localhost:4000`)
2. ✅ Check browser console for errors (F12)
3. ✅ Check Network tab for failed requests
4. ✅ Verify .env file has correct values
5. ✅ Check terminal for backend errors

### 8. Development Workflow

```bash
# Terminal 1: Start frontend
pnpm dev

# Terminal 2: Start Firebase emulators
pnpm firebase:emulators

# Terminal 3: Run other commands as needed
# (git, tests, scripts, etc.)
```

Access:

- Frontend: http://localhost:5173
- Emulator UI: http://localhost:4000
- Firestore Emulator: http://localhost:8080
- Functions Emulator: http://localhost:5001
