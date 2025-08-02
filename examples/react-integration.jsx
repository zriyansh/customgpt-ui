// React Component Example for CustomGPT Widget Integration
// This example shows how to properly load and initialize the widget in a React app

import React, { useEffect, useState } from 'react';

// Option 1: Basic React Component
export function ChatWidget({ apiKey, agentId }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Helper function to load scripts
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.body.appendChild(script);
      });
    };

    // Initialize the widget
    const initializeWidget = async () => {
      try {
        // 1. Load CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/static/customgpt-widget.css'; // Adjust path as needed
        document.head.appendChild(link);

        // 2. Load vendors.js first (contains React and dependencies)
        await loadScript('/static/vendors.js');
        
        // 3. Load the main widget script
        await loadScript('/static/customgpt-widget.js');
        
        // 4. Initialize the widget
        if (window.CustomGPTWidget) {
          window.CustomGPTWidget.init({
            apiKey: apiKey,
            agentId: parseInt(agentId),
            containerId: 'chat-widget-container',
            mode: 'embedded',
            theme: 'light'
          });
          setIsLoaded(true);
        } else {
          throw new Error('CustomGPTWidget not found on window object');
        }
      } catch (err) {
        setError(err.message);
        console.error('Widget initialization error:', err);
      }
    };

    initializeWidget();

    // Cleanup on unmount
    return () => {
      // Remove scripts
      const scripts = document.querySelectorAll('script[src*="customgpt"], script[src*="vendors"]');
      scripts.forEach(script => script.remove());
      
      // Remove CSS
      const links = document.querySelectorAll('link[href*="customgpt"]');
      links.forEach(link => link.remove());
      
      // Destroy widget if it exists
      if (window.CustomGPTWidget && window.CustomGPTWidget.destroy) {
        window.CustomGPTWidget.destroy();
      }
    };
  }, [apiKey, agentId]);

  if (error) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#fee', borderRadius: '8px' }}>
        <h3>Error loading chat widget</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      {!isLoaded && <p>Loading chat widget...</p>}
      <div 
        id="chat-widget-container" 
        style={{ 
          width: '400px', 
          height: '600px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          overflow: 'hidden'
        }} 
      />
    </div>
  );
}

// Option 2: Floating Chat Button
export function FloatingChatButton({ apiKey, agentId }) {
  const [widget, setWidget] = useState(null);

  useEffect(() => {
    const loadWidget = async () => {
      try {
        // Load CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/static/customgpt-widget.css';
        document.head.appendChild(link);

        // Load scripts in order
        const loadScript = (src) => {
          return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
          });
        };

        await loadScript('/static/vendors.js');
        await loadScript('/static/customgpt-widget.js');

        // Initialize floating widget
        if (window.CustomGPTWidget) {
          const widgetInstance = window.CustomGPTWidget.init({
            apiKey: apiKey,
            agentId: parseInt(agentId),
            mode: 'floating',
            position: 'bottom-right',
            theme: 'light'
          });
          setWidget(widgetInstance);
        }
      } catch (error) {
        console.error('Failed to load floating widget:', error);
      }
    };

    loadWidget();

    return () => {
      if (widget && widget.destroy) {
        widget.destroy();
      }
    };
  }, [apiKey, agentId]);

  return null; // Floating widget renders itself
}

// Option 3: Next.js App Router Component
export function NextJsChatWidget({ apiKey, agentId }) {
  useEffect(() => {
    // For Next.js, ensure this only runs on client
    if (typeof window === 'undefined') return;

    const loadWidget = async () => {
      try {
        // Use Next.js public directory
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/widget/customgpt-widget.css';
        document.head.appendChild(link);

        const loadScript = (src) => {
          return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
          });
        };

        await loadScript('/widget/vendors.js');
        await loadScript('/widget/customgpt-widget.js');

        if (window.CustomGPTWidget) {
          window.CustomGPTWidget.init({
            apiKey: apiKey || process.env.NEXT_PUBLIC_CUSTOMGPT_API_KEY,
            agentId: parseInt(agentId || process.env.NEXT_PUBLIC_CUSTOMGPT_AGENT_ID),
            containerId: 'nextjs-chat-widget',
            mode: 'embedded'
          });
        }
      } catch (error) {
        console.error('Widget loading error:', error);
      }
    };

    loadWidget();
  }, [apiKey, agentId]);

  return <div id="nextjs-chat-widget" style={{ width: '100%', height: '600px' }} />;
}

// Usage Examples:
/*
// In your React app:
import { ChatWidget } from './ChatWidget';

function App() {
  return (
    <div>
      <h1>My App</h1>
      <ChatWidget 
        apiKey="your-api-key-here" 
        agentId="123" 
      />
    </div>
  );
}

// For floating button:
import { FloatingChatButton } from './ChatWidget';

function App() {
  return (
    <div>
      <h1>My App</h1>
      <FloatingChatButton 
        apiKey="your-api-key-here" 
        agentId="123" 
      />
    </div>
  );
}

// In Next.js:
import { NextJsChatWidget } from './ChatWidget';

export default function Page() {
  return (
    <div>
      <h1>Chat Support</h1>
      <NextJsChatWidget />
    </div>
  );
}
*/