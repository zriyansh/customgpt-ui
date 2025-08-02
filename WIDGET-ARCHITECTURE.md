# CustomGPT Widget Architecture - Multi-Instance Support

## Overview

This document describes the architecture changes implemented to support multiple CustomGPT widget instances on the same page without conflicts.

## Problem Statement

Previously, when multiple widgets were initialized on the same page:
- Only the first widget's conversation management worked properly
- The second widget would fail to update its conversation list
- Both widgets shared a global reference `window.__customgpt_widget_instance`, causing the second to overwrite the first

## Solution: React Context-Based Isolation

### 1. WidgetContext (`src/widget/WidgetContext.tsx`)

Created a React Context to provide widget instance to all child components:

```typescript
const WidgetContext = createContext<WidgetInstance | undefined>(undefined);

export const WidgetProvider: React.FC<WidgetProviderProps> = ({ widgetInstance, children }) => {
  return (
    <WidgetContext.Provider value={widgetInstance}>
      {children}
    </WidgetContext.Provider>
  );
};

export const useWidget = (): WidgetInstance => {
  const context = useContext(WidgetContext);
  if (!context) {
    throw new Error('useWidget must be used within a WidgetProvider');
  }
  return context;
};
```

### 2. Widget Initialization Updates

The widget now wraps its React tree with `WidgetProvider`:

```typescript
return (
  <WidgetProvider widgetInstance={widgetRef}>
    <div className={`customgpt-widget-wrapper widget-mode ${this.config.mode}-mode`}>
      <ChatLayout ... />
    </div>
  </WidgetProvider>
);
```

### 3. Component Updates

`ChatContainer` now uses the widget from context instead of global window:

```typescript
const widget = useWidgetSafe();

const handleCreateConversation = () => {
  if (widget) {
    const newConv = widget.createConversation();
    // ...
  }
};
```

### 4. Backward Compatibility

The global `window.__customgpt_widget_instance` is preserved for backward compatibility but only set for the first widget instance to prevent overwriting.

## Benefits

1. **Complete Isolation**: Each widget instance operates independently
2. **No Global Conflicts**: Widgets don't interfere with each other
3. **Scalable**: Supports any number of widgets on a page
4. **Type-Safe**: TypeScript interfaces ensure proper usage
5. **Backward Compatible**: Existing single-widget implementations continue to work

## Usage Example

```javascript
// Create multiple independent widgets
const widget1 = CustomGPTWidget.init({
  apiKey: 'your-api-key',
  agentId: '123',
  mode: 'embedded',
  containerId: 'widget1'
});

const widget2 = CustomGPTWidget.init({
  apiKey: 'your-api-key',
  agentId: '456',
  mode: 'floating'
});

// Both widgets maintain separate conversation lists
```

## Testing

Use `test-multi-widget.html` to verify the isolation works correctly:
1. Open the test page
2. Create conversations in the embedded widget
3. Open the floating widget
4. Verify conversations are not shared between widgets
5. Test creating new conversations in both widgets independently

## Future Improvements

1. **Store Isolation**: Currently, Zustand stores are still global. Future work could isolate these per widget instance.
2. **Message Streaming**: Ensure message streaming works correctly with multiple widgets.
3. **Performance**: Optimize for scenarios with many widgets on a single page.

## Migration Guide

For existing implementations:
1. No changes required for single-widget usage
2. For multi-widget usage, ensure each widget has a unique `containerId` or different `mode`
3. The isolation is automatic - no code changes needed

## Technical Details

- **Session IDs**: Each widget generates a unique session ID including timestamp and random components
- **localStorage**: Conversations are stored with session-specific keys
- **React Context**: Provides instance isolation without prop drilling
- **TypeScript**: Full type safety for widget instances and methods