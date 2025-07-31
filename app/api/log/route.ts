/**
 * Log API Route Handler
 * 
 * Server-side API endpoint for managing application debug logs.
 * Provides endpoints for writing, reading, and clearing log entries.
 * 
 * Features:
 * - Write single or batch log entries
 * - Read recent log entries (last 1000)
 * - Clear all log entries
 * - JSON format for easy parsing
 * - File-based storage
 * - Error handling
 * 
 * Endpoints:
 * - POST /api/log - Write log entries
 * - GET /api/log - Read log entries
 * - DELETE /api/log - Clear log file
 * 
 * Log Entry Structure:
 * - timestamp: ISO date string
 * - level: error|warn|info|debug
 * - category: Log category/source
 * - message: Log message
 * - context: Additional data
 * - error: Error details
 * 
 * Storage:
 * - File: app-debug.log in project root
 * - Format: JSON lines (one JSON object per line)
 * - Append-only for write performance
 * 
 * Security Considerations:
 * - No authentication (dev tool only)
 * - Should be disabled in production
 * - Log file accessible from file system
 * 
 * Customization for contributors:
 * - Add log rotation by size/date
 * - Implement log compression
 * - Add authentication/authorization
 * - Create log indexing for search
 * - Add log streaming (WebSocket)
 * - Implement log aggregation
 * - Add structured logging
 * - Create log analysis endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Log file path - stored in project root
const LOG_FILE = path.join(process.cwd(), 'app-debug.log');

/**
 * POST /api/log
 * 
 * Write log entries to the debug log file.
 * Accepts single log entry or array of entries.
 * 
 * @param request - Contains log entry/entries in JSON body
 * @returns Success/failure response
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle both single log entry and array of logs
    const logs = Array.isArray(body.logs) ? body.logs : [body];
    
    // Process each log entry
    logs.forEach((logEntry: any) => {
      // Store as JSON for easy parsing
      const logLine = JSON.stringify({
        timestamp: logEntry.timestamp,
        level: logEntry.level,
        category: logEntry.category,
        message: logEntry.message,
        context: logEntry.data || logEntry.context,
        error: logEntry.error
      }) + '\n';
      
      // Append to log file
      fs.appendFileSync(LOG_FILE, logLine);
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to write client log:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

/**
 * GET /api/log
 * 
 * Read recent log entries from the debug log file.
 * Returns the last 1000 log entries to prevent memory issues.
 * 
 * @returns Array of log entries or error
 */
export async function GET(request: NextRequest) {
  try {
    // Check if log file exists
    if (!fs.existsSync(LOG_FILE)) {
      return NextResponse.json({ logs: [] });
    }
    
    // Read log file content
    const content = fs.readFileSync(LOG_FILE, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    
    // Parse each line as JSON
    const logs = lines.map(line => {
      try {
        return JSON.parse(line);
      } catch {
        // Skip invalid JSON lines
        return null;
      }
    }).filter(Boolean);
    
    // Return last 1000 logs to prevent excessive data transfer
    const recentLogs = logs.slice(-1000);
    
    return NextResponse.json({ logs: recentLogs });
  } catch (error) {
    console.error('Failed to read logs:', error);
    return NextResponse.json({ logs: [], error: 'Failed to read logs' }, { status: 500 });
  }
}

/**
 * DELETE /api/log
 * 
 * Clear all log entries by deleting the log file.
 * Useful for cleaning up debug logs during development.
 * 
 * @returns Success/failure response
 */
export async function DELETE(request: NextRequest) {
  try {
    // Delete log file if it exists
    if (fs.existsSync(LOG_FILE)) {
      fs.unlinkSync(LOG_FILE);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to clear logs:', error);
    return NextResponse.json({ success: false, error: 'Failed to clear logs' }, { status: 500 });
  }
}