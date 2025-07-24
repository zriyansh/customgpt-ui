import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import DOMPurify from 'dompurify';

/**
 * Utility function for combining Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Format file size in bytes to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file icon based on file type
 */
export function getFileIcon(fileType: string): string {
  const type = fileType.toLowerCase();
  
  if (type.includes('pdf')) return '📄';
  if (type.includes('image')) return '🖼️';
  if (type.includes('video')) return '🎥';
  if (type.includes('audio')) return '🎵';
  if (type.includes('text') || type.includes('txt')) return '📝';
  if (type.includes('word') || type.includes('doc')) return '📄';
  if (type.includes('excel') || type.includes('sheet')) return '📊';
  if (type.includes('powerpoint') || type.includes('presentation')) return '📈';
  if (type.includes('zip') || type.includes('rar')) return '🗜️';
  if (type.includes('json')) return '📋';
  if (type.includes('csv')) return '📊';
  
  return '📎';
}

/**
 * Validate file type against allowed types
 */
export function isFileTypeAllowed(fileType: string, allowedTypes: readonly string[]): boolean {
  return allowedTypes.some(type => fileType.toLowerCase().includes(type.toLowerCase()));
}

/**
 * Format timestamp to human readable format
 */
export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString();
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Sanitize HTML content
 */
export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') {
    return html; // Skip sanitization on server side
  }
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'code', 'pre', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
  });
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Validate CustomGPT API key format
 * Format: digits|alphanumeric_string with various allowed characters
 */
export function isValidApiKey(apiKey: string): boolean {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }
  
  // Trim whitespace
  apiKey = apiKey.trim();
  
  // CustomGPT API key format: starts with digits followed by | then alphanumeric string
  // Example: 7727|QxxxpM5Dxxxxz9CI3lGwyOBNoRav7oMdgFMxxxxefded9d9x
  // Must have at least 3 digits, pipe, and at least 20 characters after pipe
  return /^\d{3,}\|[a-zA-Z0-9]{20,}$/.test(apiKey);
}

/**
 * Parse streaming response chunk
 */
export function parseStreamChunk(chunk: string): any | null {
  try {
    // Handle SSE format
    if (chunk.startsWith('data: ')) {
      const data = chunk.slice(6).trim();
      if (data === '[DONE]') return { type: 'done' };
      
      // Parse JSON data
      const parsed = JSON.parse(data);
      
      // Handle different response formats
      if (typeof parsed === 'object') {
        // If it already has a type, return as is
        if (parsed.type) {
          return parsed;
        }
        
        // Handle CustomGPT format where content might be a direct property
        if (parsed.content !== undefined) {
          return { type: 'content', content: parsed.content, citations: parsed.citations };
        }
        
        // Handle citation-only responses
        if (parsed.citations && !parsed.content) {
          return { type: 'citation', citations: parsed.citations };
        }
      }
      
      // Return the parsed data as is if we can't determine the format
      return parsed;
    }
    
    // Also try to parse direct JSON (in case there's no "data: " prefix)
    try {
      const parsed = JSON.parse(chunk.trim());
      if (parsed.content !== undefined || parsed.citations !== undefined) {
        return { 
          type: parsed.content ? 'content' : 'citation', 
          content: parsed.content,
          citations: parsed.citations 
        };
      }
      return parsed;
    } catch {
      // Not JSON, ignore
    }
    
    return null;
  } catch (error) {
    console.error('Failed to parse stream chunk:', chunk, error);
    return null;
  }
}

/**
 * Extract inline citations from text
 */
export function extractInlineCitations(text: string): { text: string; citations: number[] } {
  const citationRegex = /\[(\d+)\]/g;
  const citations: number[] = [];
  let match;
  
  while ((match = citationRegex.exec(text)) !== null) {
    citations.push(parseInt(match[1]));
  }
  
  return { text, citations };
}

/**
 * Create a delay promise
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      const delayTime = baseDelay * Math.pow(2, attempt - 1);
      await delay(delayTime);
    }
  }
  
  throw lastError!;
}

/**
 * Check if device is mobile
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
}

/**
 * Check if device is tablet
 */
export function isTablet(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= 768 && window.innerWidth < 1024;
}

/**
 * Check if device is desktop
 */
export function isDesktop(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= 1024;
}

/**
 * Get responsive container class
 */
export function getResponsiveContainer(): string {
  if (isMobile()) return 'w-full h-full';
  if (isTablet()) return 'w-full max-w-2xl mx-auto';
  return 'w-full max-w-4xl mx-auto';
}

/**
 * Format conversation name from first message
 */
export function generateConversationName(firstMessage: string): string {
  const words = firstMessage.trim().split(/\s+/);
  const title = words.slice(0, 6).join(' ');
  return title.length > 50 ? title.substring(0, 50).trim() + '...' : title;
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Check if file is an image
 */
export function isImageFile(fileType: string): boolean {
  return fileType.startsWith('image/');
}

/**
 * Check if file is a document
 */
export function isDocumentFile(fileType: string): boolean {
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/csv',
    'application/json',
    'application/xml',
  ];
  return documentTypes.includes(fileType);
}

/**
 * Create download link for file
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Escape HTML entities
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Constants for file uploads and API
 */
export const CONSTANTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ACCEPTED_FILE_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/csv',
    'application/json',
    'application/xml',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ],
  MAX_MESSAGE_LENGTH: 4000,
  API_TIMEOUT: 30000,
  STREAM_TIMEOUT: 60000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;