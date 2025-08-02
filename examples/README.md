# CustomGPT Widget Examples

This directory contains examples showing how to integrate the CustomGPT widget in various scenarios.

## Quick Reference

### Basic Integration
- `vanilla-js-widget.html` - Complete JavaScript examples with all features
- `widget-example.html` - Simple widget integration demo

### React Integration
- `react-widget.jsx` - React widget integration patterns
- `react-floating-button.jsx` - Floating button in React apps
- `SimplifiedWidget.jsx` - Lightweight wrapper component (~80 lines)
- `SimplifiedFloatingButton.jsx` - Lightweight floating button (~100 lines)

### Other Frameworks
- `react-integration.jsx` - Advanced React patterns
- `iframe-embed-example.html` - iFrame integration method

### Legacy Examples
- `legacy/` - Old implementations (1400+ lines) - kept for reference only

## Modern API vs Legacy

### ✅ Modern API (Recommended)
```javascript
// Simple and clean - all features built-in
const widget = CustomGPTWidget.init({
  apiKey: 'your-api-key',
  agentId: '123',
  mode: 'floating',
  enableConversationManagement: true
});
```

### ❌ Legacy Approach
The old examples in `legacy/` folder show the previous approach which required 1400+ lines of custom code to implement conversation management. This is no longer needed!

## Getting Started

1. **Choose your integration method:**
   - Vanilla JavaScript: Start with `vanilla-js-widget.html`
   - React: Use `SimplifiedWidget.jsx` or `react-widget.jsx`
   - Vue/Angular: Follow the patterns in the main README

2. **Replace placeholders:**
   - `your-api-key` - Get from CustomGPT dashboard
   - `123` - Your agent/project ID

3. **Customize as needed:**
   - All examples include comments explaining options
   - Refer to main README for full configuration options

## Key Features Demonstrated

- **Conversation Management** - Built into the widget core
- **Session Isolation** - Each browser gets separate conversations
- **Title Editing** - Inline conversation renaming
- **Persistence** - Conversations saved across page reloads
- **Multiple Instances** - Run multiple widgets on same page
- **Custom Controls** - Programmatic widget control

## Best Practices

1. **Use the simplified components** - They handle all the complexity
2. **Don't implement conversation management yourself** - It's built-in
3. **Configure `maxConversations`** - Prevent unlimited conversation creation
4. **Handle errors gracefully** - Check for widget availability
5. **Clean up on unmount** - Call `widget.destroy()` when done