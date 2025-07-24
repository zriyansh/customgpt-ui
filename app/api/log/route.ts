import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const LOG_FILE = path.join(process.cwd(), 'app-debug.log');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle both single log entry and array of logs
    const logs = Array.isArray(body.logs) ? body.logs : [body];
    
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
      
      fs.appendFileSync(LOG_FILE, logLine);
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to write client log:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!fs.existsSync(LOG_FILE)) {
      return NextResponse.json({ logs: [] });
    }
    
    const content = fs.readFileSync(LOG_FILE, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    const logs = lines.map(line => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    }).filter(Boolean);
    
    // Return last 1000 logs
    const recentLogs = logs.slice(-1000);
    
    return NextResponse.json({ logs: recentLogs });
  } catch (error) {
    console.error('Failed to read logs:', error);
    return NextResponse.json({ logs: [], error: 'Failed to read logs' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (fs.existsSync(LOG_FILE)) {
      fs.unlinkSync(LOG_FILE);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to clear logs:', error);
    return NextResponse.json({ success: false, error: 'Failed to clear logs' }, { status: 500 });
  }
}