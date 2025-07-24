# Debugging Guide - CustomGPT UI

## Overview

A comprehensive logging system has been implemented to help debug authorization issues when viewing chat history and previous conversations.

## How to Use the Logging System

### 1. Access the Debug Logs

- Click on **"Debug Logs"** in the sidebar (bug icon)
- Or navigate directly to `/debug`

### 2. Understanding the Log Viewer

The log viewer provides:
- **Auto-refresh**: Logs refresh every 5 seconds
- **Filtering**: Filter by text or log level (Debug, Info, Warning, Error)
- **Download**: Export logs for further analysis
- **Clear**: Clear all logs to start fresh

### 3. What to Look For

When debugging authorization issues:

1. **Look for 403 errors**:
   - Filter by "error" level
   - Search for "403" or "unauthorized"

2. **Compare API requests**:
   - Look at successful requests (initial chat)
   - Compare with failing requests (loading history)
   - Check for differences in:
     - Headers (especially Authorization)
     - Query parameters
     - Request body

3. **Key information logged**:
   - API request details (URL, headers, body)
   - API response status and data
   - User interactions (conversation selection, message sending)
   - Store operations (fetching conversations, loading messages)

### 4. Log File Location

- Server-side logs are written to: `app-debug.log` in the project root
- This file contains all logs including those from the server

### 5. Debugging Tips

1. **Clear logs before testing** to isolate the issue
2. **Reproduce the error** step by step:
   - Select an agent
   - Try to view previous conversations
   - Check logs immediately
3. **Filter by category**:
   - `API_REQUEST` - Outgoing API calls
   - `API_RESPONSE` - API responses
   - `CONVERSATIONS` - Conversation operations
   - `MESSAGES` - Message operations
   - `UI` - User interface interactions

## Common Issues and Solutions

### 403 Authorization Error

If you see:
```
Your API key does not have permission to access this agent's conversations
```

Check the logs for:
1. The exact API endpoint being called
2. The headers being sent (especially Authorization)
3. Any differences between working and failing requests

### Log Categories

- **API_REQUEST/API_RESPONSE**: All API communication
- **CONVERSATIONS**: Conversation fetching and management
- **MESSAGES**: Message loading and sending
- **UI**: User interactions and component lifecycle
- **AUTH**: Authentication-related operations
- **STORE**: State management operations

## Next Steps

1. Navigate through the app and reproduce the authorization error
2. Check the Debug Logs page
3. Look for 403 errors or authorization failures
4. Compare the failing requests with successful ones
5. Share the relevant log entries for further debugging