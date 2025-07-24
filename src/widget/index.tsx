import React from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';

import '../../app/globals.css';
import { WidgetConfig } from '../types';
import { useConfigStore } from '../store';
import { ChatLayout } from '../components/chat/ChatLayout';

// Widget configuration interface
export interface CustomGPTWidgetConfig {
  apiKey: string;
  containerId?: string;
  mode?: 'embedded' | 'floating' | 'widget';
  theme?: 'light' | 'dark';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  width?: string;
  height?: string;
  enableCitations?: boolean;
  enableFeedback?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  onMessage?: (message: any) => void;
}

// Widget class for managing instances
class CustomGPTWidget {
  private container: HTMLElement | null = null;
  private root: any = null;
  private config: CustomGPTWidgetConfig;
  private isOpen: boolean = false;

  constructor(config: CustomGPTWidgetConfig) {
    this.config = {
      mode: 'embedded',
      theme: 'light',
      position: 'bottom-right',
      width: '400px',
      height: '600px',
      enableCitations: true,
      enableFeedback: true,
      ...config,
    };

    this.init();
  }

  private init() {
    // Set up the API key in the config store
    useConfigStore.getState().setApiKey(this.config.apiKey);

    // Create container based on mode
    this.createContainer();
    
    // Render the widget
    this.render();
  }

  private createContainer() {
    const { mode, containerId } = this.config;

    if (mode === 'embedded' && containerId) {
      // Use provided container
      this.container = document.getElementById(containerId);
      if (!this.container) {
        throw new Error(`Container with id "${containerId}" not found`);
      }
    } else if (mode === 'floating') {
      // Create floating container
      this.container = document.createElement('div');
      this.container.id = 'customgpt-floating-widget';
      this.setupFloatingStyles();
      document.body.appendChild(this.container);
    } else {
      // Create default container
      this.container = document.createElement('div');
      this.container.id = 'customgpt-widget';
      document.body.appendChild(this.container);
    }
  }

  private setupFloatingStyles() {
    if (!this.container || this.config.mode !== 'floating') return;

    const { position, width, height } = this.config;
    
    // Base floating styles
    Object.assign(this.container.style, {
      position: 'fixed',
      zIndex: '9999',
      width: width || '400px',
      height: height || '600px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
      borderRadius: '12px',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
    });

    // Position-specific styles
    switch (position) {
      case 'bottom-right':
        Object.assign(this.container.style, {
          bottom: '20px',
          right: '20px',
        });
        break;
      case 'bottom-left':
        Object.assign(this.container.style, {
          bottom: '20px',
          left: '20px',
        });
        break;
      case 'top-right':
        Object.assign(this.container.style, {
          top: '20px',
          right: '20px',
        });
        break;
      case 'top-left':
        Object.assign(this.container.style, {
          top: '20px',
          left: '20px',
        });
        break;
    }

    // Initially hidden for floating mode
    this.container.style.display = 'none';
  }

  private render() {
    if (!this.container) return;

    this.root = createRoot(this.container);
    
    const WidgetApp = () => {
      const handleClose = () => {
        this.close();
        this.config.onClose?.();
      };

      return (
        <>
          <ChatLayout
            mode={this.config.mode === 'embedded' ? 'widget' : 'floating'}
            onClose={this.config.mode === 'floating' ? handleClose : undefined}
            showSidebar={false} // Disable sidebar for widget mode
          />
          <Toaster 
            position="top-center" 
            toastOptions={{
              style: { zIndex: 10000 }
            }}
          />
        </>
      );
    };

    this.root.render(<WidgetApp />);

    // Auto-open for embedded mode
    if (this.config.mode === 'embedded') {
      this.open();
    }
  }

  // Public methods
  public open() {
    if (!this.container) return;

    this.isOpen = true;
    
    if (this.config.mode === 'floating') {
      this.container.style.display = 'block';
      // Trigger animation
      setTimeout(() => {
        if (this.container) {
          this.container.style.transform = 'translateY(0)';
          this.container.style.opacity = '1';
        }
      }, 10);
    }

    this.config.onOpen?.();
  }

  public close() {
    if (!this.container) return;

    this.isOpen = false;

    if (this.config.mode === 'floating') {
      this.container.style.transform = 'translateY(20px)';
      this.container.style.opacity = '0';
      
      setTimeout(() => {
        if (this.container) {
          this.container.style.display = 'none';
        }
      }, 300);
    }
  }

  public toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  public destroy() {
    if (this.root) {
      this.root.unmount();
    }
    
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    
    this.container = null;
    this.root = null;
  }

  public updateConfig(newConfig: Partial<CustomGPTWidgetConfig>) {
    this.config = { ...this.config, ...newConfig };
    
    // Re-render with new config
    this.render();
  }

  // Getters
  public get isOpened() {
    return this.isOpen;
  }

  public get configuration() {
    return { ...this.config };
  }
}

// Global API for the widget
declare global {
  interface Window {
    CustomGPTWidget: {
      init: (config: CustomGPTWidgetConfig) => CustomGPTWidget;
      create: (config: CustomGPTWidgetConfig) => CustomGPTWidget;
    };
  }
}

// Export for UMD build
const CustomGPTWidgetAPI = {
  init: (config: CustomGPTWidgetConfig): CustomGPTWidget => {
    return new CustomGPTWidget(config);
  },
  
  create: (config: CustomGPTWidgetConfig): CustomGPTWidget => {
    return new CustomGPTWidget(config);
  },
};

// Global assignment for browser usage
if (typeof window !== 'undefined') {
  window.CustomGPTWidget = CustomGPTWidgetAPI;
}

// For module usage
export { CustomGPTWidget, CustomGPTWidgetAPI };
export default CustomGPTWidgetAPI;