/**
 * CustomGPT Floating Button Chatbot for React Applications
 * 
 * A fully configurable, production-ready floating button chatbot component that integrates
 * with CustomGPT.ai's chat platform. Features a minimizable floating button that expands
 * into a full chat widget with customizable positioning, theming, and animations.
 * 
 * @author CustomGPT Team
 * @version 2.0.0
 * @license MIT
 */

import { useEffect, useState, useRef } from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION SECTION - Modify these constants to customize the floating button
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
 * Default floating button settings
 * These can be overridden via component props
 */
const DEFAULT_SETTINGS = {
  // Floating button appearance
  BUTTON_SIZE: '60px',
  BUTTON_COLOR: '#007acc',
  BUTTON_HOVER_COLOR: '#005fa3',
  BUTTON_ICON: '💬',
  BUTTON_POSITION: 'bottom-right', // 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  BUTTON_OFFSET: '20px',
  
  // Chat widget settings
  CHAT_WIDTH: '400px',
  CHAT_HEIGHT: '600px',
  CHAT_THEME: 'light', // 'light' | 'dark'
  ENABLE_CITATIONS: true,
  ENABLE_FEEDBACK: true,
  
  // Animation settings
  ANIMATION_DURATION: '0.3s',
  BOUNCE_ANIMATION: true,
  
  // Widget behavior
  INITIAL_STATE: 'closed', // 'open' | 'closed'
  CLOSE_ON_OUTSIDE_CLICK: true,
  SHOW_NOTIFICATION_DOT: false,
  
  // Loading settings
  LOADING_TIMEOUT: 10000, // 10 seconds
  RETRY_INTERVAL: 100, // 100ms between checks
  MAX_RETRY_ATTEMPTS: 100 // Maximum initialization attempts
};

/**
 * Position styles mapping for floating button
 */
const POSITION_STYLES = {
  'bottom-right': {
    position: 'fixed',
    bottom: DEFAULT_SETTINGS.BUTTON_OFFSET,
    right: DEFAULT_SETTINGS.BUTTON_OFFSET,
    zIndex: 1000
  },
  'bottom-left': {
    position: 'fixed',
    bottom: DEFAULT_SETTINGS.BUTTON_OFFSET,
    left: DEFAULT_SETTINGS.BUTTON_OFFSET,
    zIndex: 1000
  },
  'top-right': {
    position: 'fixed',
    top: DEFAULT_SETTINGS.BUTTON_OFFSET,
    right: DEFAULT_SETTINGS.BUTTON_OFFSET,
    zIndex: 1000
  },
  'top-left': {
    position: 'fixed',
    top: DEFAULT_SETTINGS.BUTTON_OFFSET,
    left: DEFAULT_SETTINGS.BUTTON_OFFSET,
    zIndex: 1000
  }
};

/**
 * Chat widget position styles based on button position
 */
const CHAT_POSITION_STYLES = {
  'bottom-right': {
    position: 'fixed',
    bottom: `calc(${DEFAULT_SETTINGS.BUTTON_SIZE} + ${DEFAULT_SETTINGS.BUTTON_OFFSET} + 10px)`,
    right: DEFAULT_SETTINGS.BUTTON_OFFSET,
    zIndex: 999
  },
  'bottom-left': {
    position: 'fixed',
    bottom: `calc(${DEFAULT_SETTINGS.BUTTON_SIZE} + ${DEFAULT_SETTINGS.BUTTON_OFFSET} + 10px)`,
    left: DEFAULT_SETTINGS.BUTTON_OFFSET,
    zIndex: 999
  },
  'top-right': {
    position: 'fixed',
    top: `calc(${DEFAULT_SETTINGS.BUTTON_SIZE} + ${DEFAULT_SETTINGS.BUTTON_OFFSET} + 10px)`,
    right: DEFAULT_SETTINGS.BUTTON_OFFSET,
    zIndex: 999
  },
  'top-left': {
    position: 'fixed',
    top: `calc(${DEFAULT_SETTINGS.BUTTON_SIZE} + ${DEFAULT_SETTINGS.BUTTON_OFFSET} + 10px)`,
    left: DEFAULT_SETTINGS.BUTTON_OFFSET,
    zIndex: 999
  }
};

/**
 * CSS animations and styles
 */
const FLOATING_BUTTON_STYLES = `
  @keyframes customgpt-float-bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }
  
  @keyframes customgpt-fade-in {
    from { opacity: 0; transform: scale(0.8); }
    to { opacity: 1; transform: scale(1); }
  }
  
  @keyframes customgpt-fade-out {
    from { opacity: 1; transform: scale(1); }
    to { opacity: 0; transform: scale(0.8); }
  }
  
  .customgpt-chat-widget {
    transition: opacity ${DEFAULT_SETTINGS.ANIMATION_DURATION} ease;
  }
  
  @keyframes customgpt-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .customgpt-floating-button {
    width: ${DEFAULT_SETTINGS.BUTTON_SIZE};
    height: ${DEFAULT_SETTINGS.BUTTON_SIZE};
    border-radius: 50%;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transition: all ${DEFAULT_SETTINGS.ANIMATION_DURATION} ease;
    user-select: none;
  }
  
  .customgpt-floating-button:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(0,0,0,0.2);
  }
  
  .customgpt-floating-button.bounce {
    animation: customgpt-float-bounce 2s infinite;
  }
  
  .customgpt-chat-widget {
    animation: customgpt-fade-in ${DEFAULT_SETTINGS.ANIMATION_DURATION} ease;
  }
  
  .customgpt-chat-widget.closing {
    animation: customgpt-fade-out ${DEFAULT_SETTINGS.ANIMATION_DURATION} ease;
  }
  
  .customgpt-notification-dot {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 12px;
    height: 12px;
    background-color: #ff4444;
    border-radius: 50%;
    border: 2px solid white;
    animation: customgpt-float-bounce 1s infinite;
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
 * CustomGPT Floating Button Chatbot Component
 * 
 * @param {Object} props - Component properties
 * @param {string} props.apiKey - CustomGPT API key (required)
 * @param {string|number} props.agentId - Agent/Project ID (required)
 * @param {string} [props.agentName] - Agent name to display (optional)
 * @param {string} [props.buttonSize] - Button size (default: '60px')
 * @param {string} [props.buttonColor] - Button background color (default: '#007acc')
 * @param {string} [props.buttonHoverColor] - Button hover color (default: '#005fa3')
 * @param {string} [props.buttonIcon] - Button icon/text (default: '💬')
 * @param {string} [props.position] - Button position (default: 'bottom-right')
 * @param {string} [props.offset] - Distance from screen edge (default: '20px')
 * @param {string} [props.chatWidth] - Chat widget width (default: '400px')
 * @param {string} [props.chatHeight] - Chat widget height (default: '600px')
 * @param {string} [props.theme] - Theme: 'light' or 'dark' (default: 'light')
 * @param {boolean} [props.enableCitations] - Enable citation display (default: true)
 * @param {boolean} [props.enableFeedback] - Enable feedback buttons (default: true)
 * @param {number} [props.maxConversations] - Maximum conversations per session (default: 5)
 * @param {boolean} [props.enableConversationManagement] - Enable conversation management UI (default: true)
 * @param {string} [props.initialState] - Initial state: 'open' or 'closed' (default: 'closed')
 * @param {boolean} [props.closeOnOutsideClick] - Close when clicking outside (default: true)
 * @param {boolean} [props.showNotificationDot] - Show notification dot (default: false)
 * @param {boolean} [props.bounceAnimation] - Enable bounce animation (default: true)
 * @param {string} [props.className] - Additional CSS classes
 * @param {Object} [props.style] - Additional inline styles
 * @param {Function} [props.onToggle] - Callback when chat opens/closes
 * @param {Function} [props.onLoad] - Callback when widget loads successfully
 * @param {Function} [props.onError] - Callback when widget fails to load
 * @param {Function} [props.onMessage] - Callback for message events
 * @param {Function} [props.onConversationChange] - Callback when conversation changes
 */
const CustomGPTFloatingButton = ({
  // Required props
  apiKey,
  agentId,
  agentName,
  
  // Button appearance props
  buttonSize = DEFAULT_SETTINGS.BUTTON_SIZE,
  buttonColor = DEFAULT_SETTINGS.BUTTON_COLOR,
  buttonHoverColor = DEFAULT_SETTINGS.BUTTON_HOVER_COLOR,
  buttonIcon = DEFAULT_SETTINGS.BUTTON_ICON,
  position = DEFAULT_SETTINGS.BUTTON_POSITION,
  offset = DEFAULT_SETTINGS.BUTTON_OFFSET,
  
  // Chat widget props
  chatWidth = DEFAULT_SETTINGS.CHAT_WIDTH,
  chatHeight = DEFAULT_SETTINGS.CHAT_HEIGHT,
  theme = DEFAULT_SETTINGS.CHAT_THEME,
  enableCitations = DEFAULT_SETTINGS.ENABLE_CITATIONS,
  enableFeedback = DEFAULT_SETTINGS.ENABLE_FEEDBACK,
  maxConversations = 5,
  enableConversationManagement = true,
  
  // Behavior props
  initialState = DEFAULT_SETTINGS.INITIAL_STATE,
  closeOnOutsideClick = DEFAULT_SETTINGS.CLOSE_ON_OUTSIDE_CLICK,
  showNotificationDot = DEFAULT_SETTINGS.SHOW_NOTIFICATION_DOT,
  bounceAnimation = DEFAULT_SETTINGS.BOUNCE_ANIMATION,
  
  // Styling props
  className = '',
  style = {},
  
  // Event handlers
  onToggle,
  onLoad,
  onError,
  onMessage,
  onConversationChange
}) => {
  // ═══════════════════════════════════════════════════════════════════════════
  // STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════
  
  const [isOpen, setIsOpen] = useState(initialState === 'open');
  const [isLoading, setIsLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [error, setError] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [widgetLoaded, setWidgetLoaded] = useState(false);
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
  const chatContainerRef = useRef(null);
  const buttonRef = useRef(null);

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPER FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Checks if localStorage is available
   * @returns {boolean} True if localStorage is available
   */
  const isLocalStorageAvailable = () => {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  };

  /**
   * Gets or creates a unique session ID for this browser/device
   * @returns {string} Session ID
   */
  const getOrCreateSessionId = () => {
    if (!isLocalStorageAvailable()) {
      // Fallback to sessionStorage or in-memory
      return `session_memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    const sessionKey = 'customgpt_session_id';
    try {
      let storedSessionId = localStorage.getItem(sessionKey);
      
      if (!storedSessionId) {
        storedSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem(sessionKey, storedSessionId);
      }
      
      return storedSessionId;
    } catch (e) {
      console.error('Error accessing localStorage:', e);
      return `session_error_${Date.now()}`;
    }
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
   * Loads conversations from localStorage with error handling
   * @returns {Object} Conversation data
   */
  const loadConversations = () => {
    if (!isLocalStorageAvailable()) {
      return {
        conversations: [],
        activeConversationId: null,
        conversationCount: 0
      };
    }
    
    const storageKey = getConversationStorageKey();
    try {
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        const parsed = JSON.parse(stored);
        // Validate data structure
        if (parsed && 
            Array.isArray(parsed.conversations) && 
            typeof parsed.conversationCount === 'number') {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse stored conversations:', e);
    }
    
    // Return default structure if nothing stored or error
    return {
      conversations: [],
      activeConversationId: null,
      conversationCount: 0
    };
  };

  /**
   * Saves conversations to localStorage with error handling
   * @param {Object} conversationData - Data to save
   */
  const saveConversations = (conversationData) => {
    if (!isLocalStorageAvailable()) {
      console.warn('localStorage not available, conversations will not persist');
      return;
    }
    
    const storageKey = getConversationStorageKey();
    try {
      localStorage.setItem(storageKey, JSON.stringify(conversationData));
    } catch (e) {
      console.error('Failed to save conversations:', e);
      // Handle quota exceeded error
      if (e.name === 'QuotaExceededError') {
        try {
          // Try to clear old conversations from other sessions
          const keys = Object.keys(localStorage);
          const oldConversationKeys = keys.filter(key => 
            key.startsWith('customgpt_conversations_') && 
            !key.includes(sessionId)
          );
          
          if (oldConversationKeys.length > 0) {
            // Remove oldest conversation data
            localStorage.removeItem(oldConversationKeys[0]);
            // Retry save
            localStorage.setItem(storageKey, JSON.stringify(conversationData));
          }
        } catch (retryError) {
          console.error('Failed to save after cleanup:', retryError);
        }
      }
    }
  };

  /**
   * Creates a new conversation with error handling
   * @returns {Object|null} New conversation object or null if limit reached or error
   */
  const createNewConversation = () => {
    try {
      const currentData = loadConversations();
      
      if (currentData.conversationCount >= maxConversations) {
        return null; // Limit reached
      }
      
      const newConversation = {
        id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        threadId: null, // Will be set by CustomGPT
        createdAt: Date.now(),
        lastActive: Date.now(),
        title: `Conversation ${currentData.conversationCount + 1}`,
        messageCount: 0
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
    } catch (e) {
      console.error('Error creating new conversation:', e);
      setError('Failed to create new conversation');
      return null;
    }
  };

  /**
   * Switches to a different conversation
   * @param {string} conversationId - ID of the conversation to switch to
   */
  const switchConversation = (conversationId) => {
    try {
      const currentData = loadConversations();
      const conversation = currentData.conversations.find(c => c.id === conversationId);
      
      if (conversation) {
        conversation.lastActive = Date.now();
        
        const updatedData = {
          ...currentData,
          activeConversationId: conversationId,
          conversations: currentData.conversations.map(c => 
            c.id === conversationId ? conversation : c
          )
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
    } catch (e) {
      console.error('Error switching conversation:', e);
      setError('Failed to switch conversation');
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
    
    try {
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
    } catch (e) {
      console.error('Error updating conversation title:', e);
    }
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
    const container = document.getElementById('customgpt-floating-chat-container');
    if (container) {
      container.innerHTML = '';
    }
    
    // Reset initialization attempts
    initAttemptsRef.current = 0;
    
    // Reinitialize with new conversation
    setTimeout(() => {
      tryInitializeWidget(conversation);
    }, 100);
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
    
    if (!['bottom-right', 'bottom-left', 'top-right', 'top-left'].includes(position)) {
      return 'Position must be one of: bottom-right, bottom-left, top-right, top-left';
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
      
      console.log('Initializing floating widget with configuration:', {
        apiKey: `${apiKey.substring(0, 8)}...`, // Masked for security
        agentId,
        agentName,
        sessionId,
        threadId: activeConv?.threadId,
        chatWidth,
        chatHeight,
        theme,
        enableCitations,
        enableFeedback
      });

      const widgetConfig = {
        apiKey: apiKey,
        agentId: parseInt(agentId),
        agentName: agentName,
        containerId: 'customgpt-floating-chat-container',
        mode: 'embedded',
        theme: theme,
        width: chatWidth,
        height: chatHeight,
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
        setWidgetLoaded(true);
        console.log('✓ Floating widget initialized successfully');
        
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
      const errorMsg = `Floating widget initialization failed: ${initError.message}`;
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
   * Loads widget resources if not already loaded
   */
  const loadWidgetResources = async () => {
    if (widgetLoaded) {
      return; // Already loaded
    }

    // Validate props first
    const validationError = validateProps();
    if (validationError) {
      setError(validationError);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
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

  /**
   * Toggles the chat widget open/closed state
   */
  const toggleChat = async () => {
    if (isOpen) {
      // Close the chat
      setIsClosing(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false);
        if (onToggle) onToggle(false);
      }, 200); // Match animation duration
    } else {
      // Open the chat
      setIsOpen(true);
      if (onToggle) onToggle(true);
      
      // Initialize widget on first open if not already loaded
      if (!widgetLoaded && !isLoading && !widgetInstanceRef.current) {
        await loadWidgetResources();
      }
    }
  };

  /**
   * Handles outside click to close chat
   */
  const handleOutsideClick = (event) => {
    if (!closeOnOutsideClick || !isOpen) return;
    
    const chatContainer = chatContainerRef.current;
    const button = buttonRef.current;
    
    if (chatContainer && !chatContainer.contains(event.target) && 
        button && !button.contains(event.target)) {
      toggleChat();
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // LIFECYCLE EFFECTS
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    // Add floating button styles to document
    if (!document.querySelector('#customgpt-floating-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'customgpt-floating-styles';
      styleEl.textContent = FLOATING_BUTTON_STYLES;
      document.head.appendChild(styleEl);
    }

    // Initialize session and load conversations
    try {
      const session = getOrCreateSessionId();
      setSessionId(session);
      
      if (enableConversationManagement) {
        const conversationData = loadConversations();
        setConversations(conversationData.conversations);
        
        // Create first conversation if none exist
        if (conversationData.conversations.length === 0) {
          createNewConversation();
        } else {
          setActiveConversationId(conversationData.activeConversationId);
        }
      }
    } catch (e) {
      console.error('Error initializing conversations:', e);
    }

    // Add outside click listener
    if (closeOnOutsideClick) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    // Load widget resources if initially open
    if (initialState === 'open') {
      loadWidgetResources();
    }

    // Cleanup function
    return () => {
      isMountedRef.current = false;
      
      // Remove outside click listener
      document.removeEventListener('mousedown', handleOutsideClick);
      
      // Clear polling interval
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
      
      // Destroy widget instance only on component unmount
      if (widgetInstanceRef.current && widgetInstanceRef.current.destroy) {
        try {
          widgetInstanceRef.current.destroy();
          widgetInstanceRef.current = null;
          console.log('✓ Floating widget instance destroyed');
        } catch (destroyError) {
          console.error('✗ Error destroying floating widget:', destroyError);
        }
      }
    };
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Renders the floating button
   */
  const renderFloatingButton = () => {
    const buttonStyles = {
      ...POSITION_STYLES[position],
      width: buttonSize,
      height: buttonSize,
      backgroundColor: buttonColor,
      bottom: position.includes('bottom') ? offset : undefined,
      top: position.includes('top') ? offset : undefined,
      left: position.includes('left') ? offset : undefined,
      right: position.includes('right') ? offset : undefined,
      ...style
    };

    return (
      <button
        ref={buttonRef}
        className={`customgpt-floating-button ${bounceAnimation ? 'bounce' : ''} ${className}`}
        style={buttonStyles}
        onClick={toggleChat}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = buttonHoverColor;
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = buttonColor;
        }}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        title={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isLoading ? (
          <div className="customgpt-spinner" style={{ width: '24px', height: '24px' }} />
        ) : (
          buttonIcon
        )}
        
        {showNotificationDot && !isOpen && (
          <div className="customgpt-notification-dot" />
        )}
      </button>
    );
  };

  /**
   * Renders the chat widget when open
   */
  const renderChatWidget = () => {
    // Always render the container, but hide it when closed to preserve the widget instance

    const chatStyles = {
      ...CHAT_POSITION_STYLES[position],
      width: chatWidth,
      height: chatHeight,
      bottom: position.includes('bottom') ? `calc(${buttonSize} + ${offset} + 10px)` : undefined,
      top: position.includes('top') ? `calc(${buttonSize} + ${offset} + 10px)` : undefined,
      left: position.includes('left') ? offset : undefined,
      right: position.includes('right') ? offset : undefined,
      // Hide the widget when closed instead of removing from DOM
      display: isOpen ? 'block' : 'none',
    };

    if (error) {
      return (
        <div 
          ref={chatContainerRef}
          className={`customgpt-chat-widget ${isOpen && !isClosing ? '' : isClosing ? 'closing' : ''}`}
          style={{
            ...chatStyles,
            padding: '20px',
            background: '#ffebee',
            border: '1px solid #ef5350',
            borderRadius: '12px',
            color: '#c62828',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            boxSizing: 'border-box',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</div>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: '600' }}>
            Chat Widget Error
          </h3>
          <p style={{ margin: '0 0 15px 0', fontSize: '14px', lineHeight: '1.4' }}>
            {error}
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={() => {
                setError(null);
                setIsLoading(true);
                initAttemptsRef.current = 0;
                loadWidgetResources();
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007acc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Retry
            </button>
            <button
              onClick={toggleChat}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ef5350',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Close
            </button>
          </div>
        </div>
      );
    }

    const currentData = enableConversationManagement ? loadConversations() : null;
    const canCreateNew = enableConversationManagement ? currentData?.conversationCount < maxConversations : false;

    return (
      <div
        ref={chatContainerRef}
        className={`customgpt-chat-widget ${isOpen && !isClosing ? '' : isClosing ? 'closing' : ''}`}
        style={{
          ...chatStyles,
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: '#fff',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          border: '1px solid #e0e0e0',
          display: isOpen ? 'flex' : 'none',
          flexDirection: 'column'
        }}
      >
        {/* Header with conversation management */}
        {enableConversationManagement && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px',
            borderBottom: '1px solid #e0e0e0',
            backgroundColor: '#f5f5f5',
            minHeight: '45px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flex: 1,
              marginRight: '40px' // Space for close button
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
                    maxWidth: '130px',
                    outline: 'none'
                  }}
                  autoFocus
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <select
                    value={activeConversationId || ''}
                    onChange={(e) => switchConversation(e.target.value)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      backgroundColor: 'white',
                      fontSize: '13px',
                      cursor: 'pointer',
                      maxWidth: '110px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
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
                      padding: '1px 4px',
                      border: '1px solid #ddd',
                      borderRadius: '3px',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      fontSize: '10px',
                      color: '#666',
                      lineHeight: '1.2'
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
                {currentData?.conversationCount || 0}/{maxConversations}
              </span>
              
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
                  padding: '2px 6px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  backgroundColor: canCreateNew ? '#007acc' : '#ccc',
                  color: 'white',
                  fontSize: '16px',
                  cursor: canCreateNew ? 'pointer' : 'not-allowed',
                  lineHeight: '1',
                  minWidth: '24px',
                  opacity: canCreateNew ? 1 : 0.5
                }}
                title={canCreateNew ? 'Start new conversation' : 'Conversation limit reached'}
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Close button */}
        <div style={{
          position: 'absolute',
          top: enableConversationManagement ? '10px' : '8px',
          right: '8px',
          zIndex: 1001,
          backgroundColor: 'rgba(255,255,255,0.9)',
          borderRadius: '50%',
          width: '28px',
          height: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <button
            onClick={toggleChat}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              color: '#666',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%'
            }}
            aria-label="Close chat"
            title="Close chat"
          >
            ×
          </button>
        </div>
        
        {/* Chat container */}
        <div 
          id="customgpt-floating-chat-container"
          style={{ 
            width: '100%',
            flex: 1,
            position: 'relative',
            display: widgetLoaded ? 'block' : 'flex',
            alignItems: widgetLoaded ? undefined : 'center',
            justifyContent: widgetLoaded ? undefined : 'center',
            overflow: 'hidden'
          }} 
        >
          {/* Show loading spinner if widget not loaded */}
          {(isLoading || !widgetLoaded) && (
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
                {loadingMessage || 'Loading chat...'}
              </div>
            </div>
          )}
        </div>
        
        {/* Branding Footer */}
        <div style={{
          padding: '5px',
          textAlign: 'center',
          borderTop: '1px solid #f0f0f0',
          backgroundColor: '#fafafa'
        }}>
          <a 
            href="https://customgpt.ai" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              fontSize: '10px',
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
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <>
      {renderFloatingButton()}
      {renderChatWidget()}
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT DOCUMENTATION & EXAMPLES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Usage Examples:
 * 
 * // Basic usage
 * <CustomGPTFloatingButton 
 *   apiKey="your-api-key" 
 *   agentId="123" 
 * />
 * 
 * // With agent name
 * <CustomGPTFloatingButton 
 *   apiKey="your-api-key" 
 *   agentId="123"
 *   agentName="Customer Support Bot"
 * />
 * 
 * // Custom position and colors
 * <CustomGPTFloatingButton 
 *   apiKey="your-api-key" 
 *   agentId="123"
 *   agentName="Sales Assistant"
 *   position="bottom-left"
 *   buttonColor="#ff6b6b"
 *   buttonHoverColor="#ff5252"
 *   buttonIcon="🤖"
 * />
 * 
 * // With event handlers and custom settings
 * <CustomGPTFloatingButton 
 *   apiKey="your-api-key" 
 *   agentId="123"
 *   agentName="Technical Support"
 *   chatWidth="500px"
 *   chatHeight="700px"
 *   theme="dark"
 *   initialState="open"
 *   showNotificationDot={true}
 *   onToggle={(isOpen) => console.log('Chat is:', isOpen ? 'open' : 'closed')}
 *   onLoad={(widget) => console.log('Widget loaded!', widget)}
 *   onError={(error) => console.error('Widget error:', error)}
 *   onMessage={(message) => console.log('New message:', message)}
 * />
 * 
 * // Disabled bounce animation with custom styling
 * <CustomGPTFloatingButton 
 *   apiKey="your-api-key" 
 *   agentId="123"
 *   agentName="Help Bot"
 *   bounceAnimation={false}
 *   closeOnOutsideClick={false}
 *   className="my-custom-button"
 *   style={{ boxShadow: 'none', border: '2px solid #333' }}
 * />
 */

export default CustomGPTFloatingButton;