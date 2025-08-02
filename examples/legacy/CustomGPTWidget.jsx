/**
 * CustomGPT Chat Widget for React Applications
 * 
 * A fully configurable, production-ready chat widget component that integrates
 * with CustomGPT.ai's chat platform. Supports embedded mode with customizable
 * dimensions, theming, and positioning.
 * 
 * @author CustomGPT Team
 * @version 2.0.0
 * @license MIT
 */

import { useEffect, useState, useRef } from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION SECTION - Modify these constants to customize the widget
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Widget file paths configuration
 * Update BASE_PATH to match where you've placed the widget files in your project
 */
const WIDGET_CONFIG = {
  // Base path where widget files are located (relative to your public folder)
  BASE_PATH: '/dist/widget',
  
  // Widget file names (usually don't need to change these)
  FILES: {
    CSS: 'customgpt-widget.css',
    VENDORS: 'vendors.js',
    WIDGET: 'customgpt-widget.js'
  }
};

/**
 * Default widget settings
 * These can be overridden via component props
 */
const DEFAULT_SETTINGS = {
  WIDTH: '400px',
  HEIGHT: '600px',
  THEME: 'light', // 'light' | 'dark'
  ALIGNMENT: 'center', // 'left' | 'center' | 'right'
  ENABLE_CITATIONS: true,
  ENABLE_FEEDBACK: true,
  BORDER_RADIUS: '8px',
  BORDER_COLOR: '#e0e0e0',
  SHADOW: '0 2px 8px rgba(0,0,0,0.1)',
  LOADING_TIMEOUT: 10000, // 10 seconds
  RETRY_INTERVAL: 100, // 100ms between checks
  MAX_RETRY_ATTEMPTS: 100 // Maximum initialization attempts
};

/**
 * Alignment styles mapping
 */
const ALIGNMENT_STYLES = {
  left: { margin: '0' },
  center: { margin: '0 auto' },
  right: { margin: '0 0 0 auto' }
};

/**
 * Loading spinner CSS animation
 */
const SPINNER_STYLES = `
  @keyframes customgpt-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .customgpt-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #3498db;
    border-radius: 50%;
    animation: customgpt-spin 1s linear infinite;
  }
`;

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * CustomGPT Chat Widget Component
 * 
 * @param {Object} props - Component properties
 * @param {string} props.apiKey - CustomGPT API key (required)
 * @param {string|number} props.agentId - Agent/Project ID (required)
 * @param {string} [props.agentName] - Agent name to display (optional)
 * @param {string} [props.width] - Widget width (default: '400px')
 * @param {string} [props.height] - Widget height (default: '600px')
 * @param {string} [props.theme] - Theme: 'light' or 'dark' (default: 'light')
 * @param {string} [props.alignment] - Alignment: 'left', 'center', 'right' (default: 'center')
 * @param {boolean} [props.enableCitations] - Enable citation display (default: true)
 * @param {boolean} [props.enableFeedback] - Enable feedback buttons (default: true)
 * @param {number} [props.maxConversations] - Maximum conversations per session (default: 5)
 * @param {boolean} [props.enableConversationManagement] - Enable conversation management UI (default: true)
 * @param {string} [props.className] - Additional CSS classes
 * @param {Object} [props.style] - Additional inline styles
 * @param {Function} [props.onLoad] - Callback when widget loads successfully
 * @param {Function} [props.onError] - Callback when widget fails to load
 * @param {Function} [props.onMessage] - Callback for message events
 * @param {Function} [props.onConversationChange] - Callback when conversation changes
 */
const CustomGPTWidget = ({
  // Required props
  apiKey,
  agentId,
  agentName,
  
  // Appearance props
  width = DEFAULT_SETTINGS.WIDTH,
  height = DEFAULT_SETTINGS.HEIGHT,
  theme = DEFAULT_SETTINGS.THEME,
  alignment = DEFAULT_SETTINGS.ALIGNMENT,
  
  // Feature props
  enableCitations = DEFAULT_SETTINGS.ENABLE_CITATIONS,
  enableFeedback = DEFAULT_SETTINGS.ENABLE_FEEDBACK,
  maxConversations = 5,
  enableConversationManagement = true,
  
  // Styling props
  className = '',
  style = {},
  
  // Event handlers
  onLoad,
  onError,
  onMessage,
  onConversationChange
}) => {
  // ═══════════════════════════════════════════════════════════════════════════
  // STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState('Initializing...');
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [editingConversationId, setEditingConversationId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  
  // Refs for managing widget lifecycle
  const widgetInstanceRef = useRef(null);
  const initAttemptsRef = useRef(0);
  const checkIntervalRef = useRef(null);
  const isMountedRef = useRef(true);

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPER FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Gets or creates a unique session ID for this browser/device
   * @returns {string} Session ID
   */
  const getOrCreateSessionId = () => {
    const sessionKey = 'customgpt_session_id';
    let storedSessionId = localStorage.getItem(sessionKey);
    
    if (!storedSessionId) {
      storedSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(sessionKey, storedSessionId);
    }
    
    return storedSessionId;
  };

  /**
   * Gets the storage key for conversations
   * @returns {string} Storage key
   */
  const getConversationStorageKey = () => {
    const currentSessionId = sessionId || getOrCreateSessionId();
    return `customgpt_conversations_${agentId}_${currentSessionId}`;
  };

  /**
   * Loads conversations from localStorage
   * @returns {Object} Conversation data
   */
  const loadConversations = () => {
    const storageKey = getConversationStorageKey();
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse stored conversations:', e);
      }
    }
    
    // Return default structure if nothing stored
    return {
      conversations: [],
      activeConversationId: null,
      conversationCount: 0
    };
  };

  /**
   * Saves conversations to localStorage
   * @param {Object} conversationData - Data to save
   */
  const saveConversations = (conversationData) => {
    const storageKey = getConversationStorageKey();
    localStorage.setItem(storageKey, JSON.stringify(conversationData));
  };

  /**
   * Creates a new conversation
   * @returns {Object|null} New conversation object or null if limit reached
   */
  const createNewConversation = () => {
    const currentData = loadConversations();
    
    if (currentData.conversationCount >= maxConversations) {
      return null; // Limit reached
    }
    
    const newConversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      threadId: null, // Will be set by CustomGPT
      createdAt: Date.now(),
      lastActive: Date.now(),
      title: `Conversation ${currentData.conversationCount + 1}`
    };
    
    const updatedData = {
      conversations: [...currentData.conversations, newConversation],
      activeConversationId: newConversation.id,
      conversationCount: currentData.conversationCount + 1
    };
    
    saveConversations(updatedData);
    setConversations(updatedData.conversations);
    setActiveConversationId(newConversation.id);
    
    if (onConversationChange) {
      onConversationChange(newConversation);
    }
    
    return newConversation;
  };

  /**
   * Switches to a different conversation
   * @param {string} conversationId - ID of the conversation to switch to
   */
  const switchConversation = (conversationId) => {
    const currentData = loadConversations();
    const conversation = currentData.conversations.find(c => c.id === conversationId);
    
    if (conversation) {
      conversation.lastActive = Date.now();
      
      const updatedData = {
        ...currentData,
        activeConversationId: conversationId
      };
      
      saveConversations(updatedData);
      setActiveConversationId(conversationId);
      
      if (onConversationChange) {
        onConversationChange(conversation);
      }
      
      // Reinitialize widget with new conversation
      if (widgetInstanceRef.current) {
        reinitializeWidget(conversation);
      }
    }
  };

  /**
   * Updates the title of a conversation
   * @param {string} conversationId - ID of the conversation to update
   * @param {string} newTitle - New title for the conversation
   */
  const updateConversationTitle = (conversationId, newTitle) => {
    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle) return;
    
    const currentData = loadConversations();
    const updatedConversations = currentData.conversations.map(conv => 
      conv.id === conversationId 
        ? { ...conv, title: trimmedTitle, lastActive: Date.now() }
        : conv
    );
    
    const updatedData = {
      ...currentData,
      conversations: updatedConversations
    };
    
    saveConversations(updatedData);
    setConversations(updatedConversations);
    
    // Notify about change if it's the active conversation
    if (conversationId === activeConversationId && onConversationChange) {
      const updatedConv = updatedConversations.find(c => c.id === conversationId);
      onConversationChange(updatedConv);
    }
  };

  /**
   * Validates required props
   * @returns {string|null} Error message if validation fails, null if valid
   */
  const validateProps = () => {
    if (!apiKey || typeof apiKey !== 'string') {
      return 'API key is required and must be a string';
    }
    
    if (!agentId || (typeof agentId !== 'string' && typeof agentId !== 'number')) {
      return 'Agent ID is required and must be a string or number';
    }
    
    if (!['light', 'dark'].includes(theme)) {
      return 'Theme must be either "light" or "dark"';
    }
    
    if (!['left', 'center', 'right'].includes(alignment)) {
      return 'Alignment must be "left", "center", or "right"';
    }
    
    return null;
  };

  /**
   * Loads a CSS file if not already loaded
   * @param {string} href - CSS file path
   */
  const loadCSS = (href) => {
    const existingLink = document.querySelector(`link[href="${href}"]`);
    if (existingLink) {
      console.log(`✓ CSS already loaded: ${href}`);
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
    console.log(`✓ CSS loaded: ${href}`);
  };

  /**
   * Loads a JavaScript file asynchronously
   * @param {string} src - JavaScript file path
   * @returns {Promise} Promise that resolves when script loads
   */
  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      // Check if script is already loaded
      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript) {
        console.log(`✓ Script already loaded: ${src}`);
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = false; // Ensure proper loading order
      
      script.onload = () => {
        console.log(`✓ Script loaded successfully: ${src}`);
        resolve();
      };
      
      script.onerror = () => {
        const errorMsg = `Failed to load script: ${src}`;
        console.error(`✗ ${errorMsg}`);
        reject(new Error(errorMsg));
      };
      
      document.body.appendChild(script);
    });
  };

  /**
   * Reinitializes the widget with a new conversation
   * @param {Object} conversation - The conversation to switch to
   */
  const reinitializeWidget = (conversation) => {
    if (widgetInstanceRef.current && widgetInstanceRef.current.destroy) {
      try {
        widgetInstanceRef.current.destroy();
        widgetInstanceRef.current = null;
      } catch (err) {
        console.error('Error destroying widget:', err);
      }
    }
    
    // Clear the container and reinitialize
    const container = document.getElementById('customgpt-chat-container');
    if (container) {
      container.innerHTML = '';
    }
    
    // Reinitialize with new conversation
    setTimeout(() => {
      tryInitializeWidget(conversation);
    }, 100);
  };

  /**
   * Attempts to find and initialize the CustomGPT widget
   * @param {Object} conversation - Optional conversation to initialize with
   * @returns {boolean} True if initialization successful, false otherwise
   */
  const tryInitializeWidget = (conversation = null) => {
    initAttemptsRef.current++;
    const attemptMsg = `Attempt ${initAttemptsRef.current}: Checking for CustomGPTWidget...`;
    console.log(attemptMsg);
    setLoadingMessage(`${attemptMsg}`);

    // Check multiple possible widget locations
    const widgetAPI = window.CustomGPTWidget || 
                     window.customGPTWidget || 
                     window.CustomGptWidget ||
                     (window.CustomGPT && window.CustomGPT.Widget);

    if (!widgetAPI) {
      return false;
    }

    console.log('✓ Widget API found:', widgetAPI);
    
    if (typeof widgetAPI.init !== 'function') {
      console.error('✗ Widget API found but init method is missing');
      console.log('Available methods:', Object.keys(widgetAPI));
      return false;
    }

    try {
      // Use conversation's threadId if available, or sessionId for new conversations
      const activeConv = conversation || conversations.find(c => c.id === activeConversationId);
      
      console.log('Initializing widget with configuration:', {
        apiKey: `${apiKey.substring(0, 8)}...`, // Masked for security
        agentId,
        agentName,
        sessionId,
        threadId: activeConv?.threadId,
        width,
        height,
        theme,
        enableCitations,
        enableFeedback
      });

      const widgetConfig = {
        apiKey: apiKey,
        agentId: parseInt(agentId),
        agentName: agentName,
        containerId: 'customgpt-chat-container',
        mode: 'embedded',
        theme: theme,
        width: width,
        height: height,
        enableCitations: enableCitations,
        enableFeedback: enableFeedback,
        onMessage: onMessage,
        // Add session/thread configuration
        sessionId: sessionId,
      };
      
      // Add threadId if we have one
      if (activeConv?.threadId) {
        widgetConfig.threadId = activeConv.threadId;
      }

      const widgetInstance = widgetAPI.init(widgetConfig);

      if (isMountedRef.current) {
        widgetInstanceRef.current = widgetInstance;
        setIsLoading(false);
        setLoadingMessage('');
        console.log('✓ Widget initialized successfully');
        
        // Call onLoad callback if provided
        if (onLoad && typeof onLoad === 'function') {
          onLoad(widgetInstance);
        }
        
        // Update conversation's threadId if we got one from the widget
        if (activeConv && widgetInstance.threadId) {
          const currentData = loadConversations();
          const updatedConversations = currentData.conversations.map(c => 
            c.id === activeConv.id ? { ...c, threadId: widgetInstance.threadId } : c
          );
          saveConversations({
            ...currentData,
            conversations: updatedConversations
          });
        }
      }
      
      return true;
    } catch (initError) {
      const errorMsg = `Widget initialization failed: ${initError.message}`;
      console.error('✗', errorMsg);
      
      if (isMountedRef.current) {
        // Don't set error state immediately if we have more attempts
        if (initAttemptsRef.current < DEFAULT_SETTINGS.MAX_RETRY_ATTEMPTS) {
          console.log('Will retry initialization...');
        } else {
          setError(errorMsg);
          setIsLoading(false);
          
          // Call onError callback if provided
          if (onError && typeof onError === 'function') {
            onError(initError);
          }
        }
      }
      
      return false;
    }
  };

  /**
   * Main widget initialization function
   */
  const initializeWidget = async () => {
    // Validate props first
    const validationError = validateProps();
    if (validationError) {
      setError(validationError);
      setIsLoading(false);
      return;
    }

    try {
      setLoadingMessage('Loading styles...');
      
      // Load CSS first
      const cssPath = `${WIDGET_CONFIG.BASE_PATH}/${WIDGET_CONFIG.FILES.CSS}`;
      loadCSS(cssPath);

      setLoadingMessage('Loading dependencies...');
      
      // Load JavaScript files in the correct order
      const vendorsPath = `${WIDGET_CONFIG.BASE_PATH}/${WIDGET_CONFIG.FILES.VENDORS}`;
      const widgetPath = `${WIDGET_CONFIG.BASE_PATH}/${WIDGET_CONFIG.FILES.WIDGET}`;
      
      await loadScript(vendorsPath);
      await loadScript(widgetPath);

      setLoadingMessage('Initializing widget...');

      // Try immediate initialization
      if (tryInitializeWidget()) {
        return; // Success!
      }

      // If not immediately available, poll for it
      console.log('Widget not immediately available, starting polling...');
      setLoadingMessage('Waiting for widget to be ready...');
      
      checkIntervalRef.current = setInterval(() => {
        if (tryInitializeWidget() || initAttemptsRef.current >= DEFAULT_SETTINGS.MAX_RETRY_ATTEMPTS) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
          
          if (initAttemptsRef.current >= DEFAULT_SETTINGS.MAX_RETRY_ATTEMPTS && isMountedRef.current) {
            const timeoutMsg = `Widget failed to load after ${DEFAULT_SETTINGS.LOADING_TIMEOUT/1000} seconds`;
            setError(timeoutMsg);
            setIsLoading(false);
            
            console.error('✗ Widget loading timeout. Debug information:', {
              hasCustomGPTWidget: 'CustomGPTWidget' in window,
              customKeys: Object.keys(window).filter(key => 
                key.toLowerCase().includes('custom') || 
                key.toLowerCase().includes('widget')
              ),
              attempts: initAttemptsRef.current
            });
            
            if (onError && typeof onError === 'function') {
              onError(new Error(timeoutMsg));
            }
          }
        }
      }, DEFAULT_SETTINGS.RETRY_INTERVAL);
      
    } catch (err) {
      const errorMsg = `Widget loading error: ${err.message}`;
      console.error('✗', errorMsg);
      
      if (isMountedRef.current) {
        setError(errorMsg);
        setIsLoading(false);
        
        if (onError && typeof onError === 'function') {
          onError(err);
        }
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // LIFECYCLE EFFECTS
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    // Add spinner styles to document
    if (!document.querySelector('#customgpt-spinner-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'customgpt-spinner-styles';
      styleEl.textContent = SPINNER_STYLES;
      document.head.appendChild(styleEl);
    }

    // Initialize session and load conversations
    const session = getOrCreateSessionId();
    setSessionId(session);
    
    const conversationData = loadConversations();
    setConversations(conversationData.conversations);
    
    // Create first conversation if none exist
    if (conversationData.conversations.length === 0) {
      createNewConversation();
    } else {
      setActiveConversationId(conversationData.activeConversationId);
    }

    // Initialize widget with retry on failure
    const initWithRetry = async () => {
      try {
        await initializeWidget();
      } catch (error) {
        console.error('Initial widget load failed, will retry:', error);
        // Retry after a delay
        setTimeout(() => {
          if (isMountedRef.current && !widgetInstanceRef.current) {
            initializeWidget();
          }
        }, 2000);
      }
    };
    
    initWithRetry();

    // Cleanup function
    return () => {
      isMountedRef.current = false;
      
      // Clear polling interval
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
      
      // Destroy widget instance
      if (widgetInstanceRef.current && widgetInstanceRef.current.destroy) {
        try {
          widgetInstanceRef.current.destroy();
          console.log('✓ Widget instance destroyed');
        } catch (destroyError) {
          console.error('✗ Error destroying widget:', destroyError);
        }
      }
    };
  }, []); // Empty dependency array - only run on mount

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Renders error state
   */
  const renderError = () => (
    <div 
      className={`customgpt-error ${className}`}
      style={{
        width,
        height,
        ...ALIGNMENT_STYLES[alignment],
        padding: '20px',
        background: '#ffebee',
        border: '1px solid #ef5350',
        borderRadius: DEFAULT_SETTINGS.BORDER_RADIUS,
        color: '#c62828',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        boxSizing: 'border-box',
        ...style
      }}
    >
      <div style={{ fontSize: '24px', marginBottom: '10px' }}>⚠️</div>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: '600' }}>
        Widget Loading Error
      </h3>
      <p style={{ margin: '0 0 15px 0', fontSize: '14px', lineHeight: '1.4' }}>
        {error}
      </p>
      <button
        onClick={() => {
          setError(null);
          setIsLoading(true);
          initAttemptsRef.current = 0;
          initializeWidget();
        }}
        style={{
          padding: '8px 16px',
          backgroundColor: '#007acc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          marginBottom: '15px'
        }}
      >
        Retry Loading
      </button>
      <details style={{ fontSize: '12px', opacity: 0.8, textAlign: 'left' }}>
        <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
          Troubleshooting Steps
        </summary>
        <ol style={{ margin: '0', paddingLeft: '20px', lineHeight: '1.6' }}>
          <li>Check browser console for detailed error messages</li>
          <li>Verify widget files are in <code>{WIDGET_CONFIG.BASE_PATH}/</code></li>
          <li>Check Network tab for 404 or CORS errors</li>
          <li>Ensure vendors.js loads before customgpt-widget.js</li>
          <li>Verify API key and Agent ID are correct</li>
          <li>Try refreshing the page</li>
        </ol>
      </details>
    </div>
  );

  /**
   * Renders loading state
   */
  const renderLoading = () => (
    <div
      className={`customgpt-loading ${className}`}
      style={{
        position: 'relative',
        width,
        height,
        ...ALIGNMENT_STYLES[alignment],
        border: `1px solid ${DEFAULT_SETTINGS.BORDER_COLOR}`,
        borderRadius: DEFAULT_SETTINGS.BORDER_RADIUS,
        backgroundColor: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        ...style
      }}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div className="customgpt-spinner" />
        <div style={{
          fontSize: '14px',
          color: '#666',
          fontWeight: '500'
        }}>
          {loadingMessage || 'Loading chat widget...'}
        </div>
        <div style={{
          fontSize: '12px',
          color: '#999',
          maxWidth: '200px',
          lineHeight: '1.4'
        }}>
          This may take a few seconds
        </div>
      </div>
    </div>
  );

  /**
   * Renders the main widget container
   */
  const renderWidget = () => {
    const currentData = loadConversations();
    const canCreateNew = currentData.conversationCount < maxConversations;
    
    return (
      <div
        className={`customgpt-widget-wrapper ${className}`}
        style={{
          position: 'relative',
          width,
          height,
          ...ALIGNMENT_STYLES[alignment],
          boxSizing: 'border-box',
          ...style
        }}
      >
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          border: `1px solid ${DEFAULT_SETTINGS.BORDER_COLOR}`,
          borderRadius: DEFAULT_SETTINGS.BORDER_RADIUS,
          overflow: 'hidden',
          backgroundColor: '#fff',
          boxShadow: DEFAULT_SETTINGS.SHADOW,
        }}>
          {/* Conversation Management Header */}
          {enableConversationManagement && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderBottom: `1px solid ${DEFAULT_SETTINGS.BORDER_COLOR}`,
              backgroundColor: '#f5f5f5',
              minHeight: '40px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flex: 1
              }}>
                {/* Conversation Selector */}
                {editingConversationId === activeConversationId ? (
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onBlur={() => {
                      updateConversationTitle(editingConversationId, editingTitle);
                      setEditingConversationId(null);
                      setEditingTitle('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        updateConversationTitle(editingConversationId, editingTitle);
                        setEditingConversationId(null);
                        setEditingTitle('');
                      } else if (e.key === 'Escape') {
                        setEditingConversationId(null);
                        setEditingTitle('');
                      }
                    }}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: '1px solid #007acc',
                      fontSize: '13px',
                      maxWidth: '200px',
                      outline: 'none'
                    }}
                    autoFocus
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <select
                      value={activeConversationId}
                      onChange={(e) => switchConversation(e.target.value)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        backgroundColor: 'white',
                        fontSize: '13px',
                        cursor: 'pointer',
                        maxWidth: '150px'
                      }}
                    >
                      {conversations.map((conv) => (
                        <option key={conv.id} value={conv.id}>
                          {conv.title}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        const activeConv = conversations.find(c => c.id === activeConversationId);
                        if (activeConv) {
                          setEditingConversationId(activeConversationId);
                          setEditingTitle(activeConv.title);
                        }
                      }}
                      style={{
                        padding: '2px 6px',
                        border: '1px solid #ddd',
                        borderRadius: '3px',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        fontSize: '11px',
                        color: '#666'
                      }}
                      title="Edit conversation title"
                    >
                      ✏️
                    </button>
                  </div>
                )}
                
                {/* Conversation Counter */}
                <span style={{
                  fontSize: '12px',
                  color: '#666',
                  whiteSpace: 'nowrap'
                }}>
                  {currentData.conversationCount}/{maxConversations}
                </span>
              </div>
              
              {/* New Conversation Button */}
              <button
                onClick={() => {
                  const newConv = createNewConversation();
                  if (newConv) {
                    reinitializeWidget(newConv);
                  } else {
                    alert(`You've reached the maximum of ${maxConversations} conversations.`);
                  }
                }}
                disabled={!canCreateNew}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  backgroundColor: canCreateNew ? '#007acc' : '#ccc',
                  color: 'white',
                  fontSize: '20px',
                  cursor: canCreateNew ? 'pointer' : 'not-allowed',
                  lineHeight: '1',
                  minWidth: '30px',
                  opacity: canCreateNew ? 1 : 0.5
                }}
                title={canCreateNew ? 'Start new conversation' : 'Conversation limit reached'}
              >
                +
              </button>
            </div>
          )}
          
          {/* Chat Container */}
          <div 
            id="customgpt-chat-container"
            style={{ 
              width: '100%',
              flex: 1,
              overflow: 'hidden',
              transition: 'opacity 0.3s ease'
            }} 
          />
          
          {/* Branding Footer */}
          <div style={{
            padding: '6px',
            textAlign: 'center',
            borderTop: '1px solid #f0f0f0',
            backgroundColor: '#fafafa'
          }}>
            <a 
              href="https://customgpt.ai" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                fontSize: '11px',
                color: '#999',
                textDecoration: 'none',
                fontWeight: '400',
                opacity: 0.8,
                transition: 'opacity 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.opacity = '1'}
              onMouseLeave={(e) => e.target.style.opacity = '0.8'}
            >
              Powered by CustomGPT.ai
            </a>
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  if (error) {
    return renderError();
  }

  if (isLoading) {
    return renderLoading();
  }

  return renderWidget();
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT DOCUMENTATION & EXAMPLES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Usage Examples:
 * 
 * // Basic usage
 * <CustomGPTWidget 
 *   apiKey="your-api-key" 
 *   agentId="123" 
 * />
 * 
 * // With agent name
 * <CustomGPTWidget 
 *   apiKey="your-api-key" 
 *   agentId="123"
 *   agentName="Customer Support Bot"
 * />
 * 
 * // With custom dimensions and alignment
 * <CustomGPTWidget 
 *   apiKey="your-api-key" 
 *   agentId="123"
 *   agentName="Sales Assistant"
 *   width="600px"
 *   height="800px" 
 *   alignment="left"
 * />
 * 
 * // With event handlers
 * <CustomGPTWidget 
 *   apiKey="your-api-key" 
 *   agentId="123"
 *   agentName="Technical Support"
 *   theme="dark"
 *   onLoad={(widget) => console.log('Widget loaded!', widget)}
 *   onError={(error) => console.error('Widget error:', error)}
 *   onMessage={(message) => console.log('New message:', message)}
 * />
 * 
 * // With custom styling
 * <CustomGPTWidget 
 *   apiKey="your-api-key" 
 *   agentId="123"
 *   agentName="Help Bot"
 *   className="my-custom-widget"
 *   style={{ margin: '20px 0', boxShadow: 'none' }}
 * />
 */

export default CustomGPTWidget;