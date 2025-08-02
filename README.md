# CustomGPT Chat UI

A modern, feature-rich chat interface for CustomGPT.ai with multiple deployment options including embedded widgets, floating buttons, and standalone applications.

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Widget Integration](#widget-integration)
  - [Embedded Widget](#embedded-widget)
  - [Floating Button](#floating-button)
  - [React Integration](#react-integration)
  - [Vue Integration](#vue-integration)
- [Configuration Options](#configuration-options)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Development](#development)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

## Features

- 🚀 **Multiple Deployment Modes**: Embedded widget, floating button, iframe, or standalone
- 💬 **Conversation Management**: Session-based conversations with persistence
- 🎨 **Customizable UI**: Themes, colors, positioning, and branding options
- 🔄 **Real-time Streaming**: Live message streaming with typing indicators
- 📎 **Rich Media Support**: File uploads, citations, and markdown rendering
- 🌐 **Multi-language**: Internationalization support
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 🔒 **Secure**: API key authentication and session isolation
- ⚡ **Performance**: Optimized bundle size and lazy loading

## Quick Start

### CDN Integration (Easiest)

```html
<!-- Add to your HTML -->
<script src="https://cdn.customgpt.ai/widget/latest/customgpt-widget.js"></script>
<link rel="stylesheet" href="https://cdn.customgpt.ai/widget/latest/customgpt-widget.css">

<!-- Initialize widget -->
<div id="chat-widget"></div>
<script>
  CustomGPTWidget.init({
    apiKey: 'your-api-key',
    agentId: '123',
    containerId: 'chat-widget',
    mode: 'embedded'
  });
</script>
```

### NPM Installation

```bash
npm install @customgpt/chat-widget
# or
yarn add @customgpt/chat-widget
```

## Installation

### Local Development Setup

1. Clone the repository:
```bash
git clone https://github.com/customgpt/customgpt-ui.git
cd customgpt-ui
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Add your API credentials:
```env
NEXT_PUBLIC_API_BASE_URL=https://app.customgpt.ai/api/v1
NEXT_PUBLIC_API_KEY=your-api-key-here
```

5. Start development server:
```bash
npm run dev
```

## Widget Integration

### Embedded Widget

The embedded widget integrates directly into your webpage:

```javascript
const widget = CustomGPTWidget.init({
  apiKey: 'your-api-key',
  agentId: '123',
  agentName: 'Support Assistant',
  containerId: 'chat-container',
  mode: 'embedded',
  width: '400px',
  height: '600px',
  enableConversationManagement: true,
  maxConversations: 10
});
```

HTML Setup:
```html
<div id="chat-container"></div>
```

### Floating Button

Add a floating chat button to any page:

```javascript
const floatingWidget = CustomGPTWidget.init({
  apiKey: 'your-api-key',
  agentId: '123',
  agentName: 'Assistant',
  mode: 'floating',
  position: 'bottom-right',
  enableConversationManagement: true,
  onOpen: () => console.log('Chat opened'),
  onClose: () => console.log('Chat closed')
});
```

### React Integration

#### Prerequisites - Loading the Widget Files

Before using the React component, you **MUST** load the widget JavaScript files. There are three ways to do this:

**Option 1: Load in your HTML (Recommended)**
```html
<!-- In your index.html before your React app -->
<script src="/dist/widget/vendors.js"></script>
<script src="/dist/widget/customgpt-widget.js"></script>
<link rel="stylesheet" href="/dist/widget/customgpt-widget.css">
```

**Option 2: Use CDN**
```html
<script src="https://cdn.customgpt.ai/widget/latest/vendors.js"></script>
<script src="https://cdn.customgpt.ai/widget/latest/customgpt-widget.js"></script>
<link rel="stylesheet" href="https://cdn.customgpt.ai/widget/latest/customgpt-widget.css">
```

**Option 3: Auto-load in the component**
Set `autoLoad={true}` and specify the paths (see example below).

#### Using the Wrapper Component

```jsx
import SimplifiedCustomGPTWidget from './examples/SimplifiedWidget';

function App() {
  return (
    <SimplifiedCustomGPTWidget
      apiKey="your-api-key"
      agentId="123"
      agentName="Support Bot"
      width="100%"
      height="600px"
      maxConversations={10}
      enableConversationManagement={true}
      // For auto-loading scripts (optional)
      autoLoad={true}
      vendorsPath="/dist/widget/vendors.js"
      widgetPath="/dist/widget/customgpt-widget.js"
      cssPath="/dist/widget/customgpt-widget.css"
      onMessage={(message) => console.log('New message:', message)}
      onConversationChange={(conv) => console.log('Changed to:', conv)}
    />
  );
}
```

#### Direct API Usage

```jsx
import { useEffect, useRef } from 'react';

function ChatWidget() {
  const widgetRef = useRef(null);

  useEffect(() => {
    const widget = window.CustomGPTWidget.init({
      apiKey: 'your-api-key',
      agentId: '123',
      containerId: 'my-chat',
      mode: 'embedded',
      enableConversationManagement: true
    });

    widgetRef.current = widget;

    return () => widget.destroy();
  }, []);

  return <div id="my-chat" style={{ height: '600px' }} />;
}
```

### Vue Integration

```vue
<template>
  <div id="customgpt-chat" ref="chatContainer"></div>
</template>

<script>
export default {
  mounted() {
    this.widget = window.CustomGPTWidget.init({
      apiKey: 'your-api-key',
      agentId: '123',
      containerId: 'customgpt-chat',
      mode: 'embedded',
      enableConversationManagement: true
    });
  },
  
  beforeDestroy() {
    if (this.widget) {
      this.widget.destroy();
    }
  }
}
</script>
```

## Configuration Options

### Required Options

| Option | Type | Description |
|--------|------|-------------|
| `apiKey` | string | Your CustomGPT API key |
| `agentId` | string \| number | Agent/Project ID from dashboard |

### Display Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `mode` | string | 'embedded' | Widget mode: 'embedded', 'floating', 'widget' |
| `agentName` | string | - | Custom name to display |
| `containerId` | string | - | DOM element ID for embedded mode |
| `theme` | string | 'light' | Color theme: 'light' or 'dark' |
| `position` | string | 'bottom-right' | Floating position |
| `width` | string | '400px' | Widget width |
| `height` | string | '600px' | Widget height |

### Feature Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enableConversationManagement` | boolean | false | Enable conversation switching |
| `maxConversations` | number | - | Maximum conversations per session |
| `sessionId` | string | auto | Custom session identifier |
| `threadId` | string | - | Specific conversation to load |
| `enableCitations` | boolean | true | Show citation sources |
| `enableFeedback` | boolean | true | Show feedback buttons |

### Event Callbacks

| Callback | Description |
|----------|-------------|
| `onOpen()` | Called when widget opens |
| `onClose()` | Called when widget closes |
| `onMessage(message)` | Called on new message |
| `onConversationChange(conversation)` | Called on conversation switch |

## API Reference

### Widget Methods

#### `init(config)`
Initialize a new widget instance.

```javascript
const widget = CustomGPTWidget.init({
  apiKey: 'your-api-key',
  agentId: '123'
});
```

#### `open()`
Open the widget (floating mode).

```javascript
widget.open();
```

#### `close()`
Close the widget (floating mode).

```javascript
widget.close();
```

#### `toggle()`
Toggle widget open/closed state.

```javascript
widget.toggle();
```

#### `destroy()`
Remove widget and cleanup resources.

```javascript
widget.destroy();
```

### Conversation Management

#### `getConversations()`
Get all conversations for current session.

```javascript
const conversations = widget.getConversations();
// Returns: [{ id, title, createdAt, messages }, ...]
```

#### `createConversation(title?)`
Create a new conversation.

```javascript
const newConv = widget.createConversation('Support Chat');
// Returns: { id, title, createdAt, messages: [] }
```

#### `switchConversation(conversationId)`
Switch to a different conversation.

```javascript
widget.switchConversation('conv_123');
```

#### `updateConversationTitle(conversationId, newTitle)`
Update conversation title.

```javascript
widget.updateConversationTitle('conv_123', 'Order #12345');
```

#### `deleteConversation(conversationId)`
Delete a conversation.

```javascript
widget.deleteConversation('conv_123');
```

#### `refresh()`
Force refresh the widget UI.

```javascript
widget.refresh();
```

## Deployment

### Production Build

#### Build All Components (Recommended)
```bash
npm run build:all
```

This command builds all three deployment formats:
1. **Standalone App** (`.next/`) - Full Next.js application
2. **Widget Bundle** (`dist/widget/`) - Embeddable chat widget
3. **Iframe Bundle** (`dist/iframe/`) - Iframe-based integration

Build time: ~30 seconds  
Output: See `dist/BUILD_INFO.txt` for detailed file information

#### Build Individual Components

Build only the widget:
```bash
npm run build:widget
```

Build only the iframe app:
```bash
npm run build:iframe
```

Build only the standalone app:
```bash
npm run build:standalone
# or
npm run build
```

### When to Use Each Build

| Build Type | Use Case | File Size | Best For |
|------------|----------|-----------|----------|
| **Widget** | Direct embedding in websites | ~1.34 MB | Most integrations, full API access |
| **Iframe** | Isolated embedding | ~1.33 MB | Style isolation, cross-domain |
| **Standalone** | Full application | ~2 MB | Self-hosting, custom features |

### Self-Hosting

1. Build the widget:
```bash
npm run build:widget
```

2. Host the files from `dist/widget/`:
   - `customgpt-widget.js`
   - `customgpt-widget.css`
   - `vendors.js`

3. Update your integration to point to your hosted files:
```html
<script src="https://your-domain.com/widget/vendors.js"></script>
<script src="https://your-domain.com/widget/customgpt-widget.js"></script>
<link rel="stylesheet" href="https://your-domain.com/widget/customgpt-widget.css">
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t customgpt-widget .
docker run -p 3000:3000 customgpt-widget
```

### Cloud Deployment

#### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

#### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

#### AWS S3 + CloudFront
```bash
# Build files
npm run build:widget

# Upload to S3
aws s3 sync dist/widget/ s3://your-bucket/ --acl public-read

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

## Development

### Project Structure

```
customgpt-ui/
├── src/
│   ├── widget/           # Widget source code
│   │   ├── index.tsx     # Main widget class
│   │   ├── floating-wrapper.tsx
│   │   └── widget-styles.css
│   ├── components/       # React components
│   │   └── chat/
│   │       ├── ChatContainer.tsx
│   │       ├── ChatLayout.tsx
│   │       └── ConversationManager.tsx
│   ├── store/           # State management
│   │   └── conversations.ts
│   └── lib/             # Utilities
├── examples/            # Integration examples
├── dist/               # Build output
└── public/             # Static assets
```

### Development Commands

```bash
# Start development server
npm run dev

# Run widget dev server
npm run dev:widget

# Run tests
npm run test

# Lint code
npm run lint

# Type check
npm run type-check
```

### Creating Custom Builds

Modify `webpack.widget.js` for custom builds:

```javascript
module.exports = {
  entry: {
    'custom-widget': './src/widget/index.tsx',
  },
  // ... custom configuration
};
```

## Examples

Check the `examples/` directory for:

- `vanilla-js-widget.html` - Pure JavaScript examples
- `react-widget.jsx` - React integration patterns
- `react-floating-button.jsx` - Floating button in React
- `SimplifiedWidget.jsx` - Simplified wrapper component
- `SimplifiedFloatingButton.jsx` - Simplified floating button

### Basic Example

```html
<!DOCTYPE html>
<html>
<head>
    <script src="path/to/customgpt-widget.js"></script>
    <link rel="stylesheet" href="path/to/customgpt-widget.css">
</head>
<body>
    <div id="chat"></div>
    <script>
        CustomGPTWidget.init({
            apiKey: 'your-api-key',
            agentId: '123',
            containerId: 'chat',
            mode: 'embedded'
        });
    </script>
</body>
</html>
```

## Troubleshooting

### Common Issues

#### Widget not loading
- Check console for errors
- Verify API key and agent ID
- Ensure container element exists
- Check network requests

#### Blank screen on floating button
- Update to latest version
- Clear browser cache
- Check for CSS conflicts

#### Conversation persistence issues
- Check localStorage availability
- Verify session ID configuration
- Check for quota errors

### Debug Mode

Enable debug logging:
```javascript
window.CUSTOMGPT_DEBUG = true;
```

### Support

- Documentation: https://docs.customgpt.ai
- Issues: https://github.com/customgpt/customgpt-ui/issues
- Email: support@customgpt.ai

## License

MIT License - see LICENSE file for details.