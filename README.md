# CustomGPT.ai Chat UI

A modern, responsive chat interface for CustomGPT.ai's RAG platform built with Next.js, TypeScript, and Tailwind CSS. Supports multiple deployment modes: standalone web app, embeddable widget, and floating chatbot.

**📖 Comprehensive code documentation has been added throughout the codebase to help open source contributors understand, fork, and customize this project.**

## ✨ Features

- **🎨 Claude-Inspired UI**: Clean, minimal interface with CustomGPT.ai branding
- **📱 Multi-Format Deployment**: Standalone app, embeddable widget, or floating chatbot
- **🔄 Real-Time Streaming**: Server-sent events for live message streaming
- **📎 File Upload Support**: Drag-and-drop file uploads with 1400+ supported formats
- **📚 Citation Management**: Interactive source references with expandable details
- **🤖 Agent Management**: Dynamic agent switching and configuration
- **💾 Persistent Storage**: Local storage for conversations and preferences
- **🌓 Theme Support**: Light and dark mode compatibility
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 8+
- CustomGPT.ai API key ([Get yours here](https://app.customgpt.ai))
- An Agent/Project ID from your CustomGPT.ai dashboard

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/customgpt/customgpt-ui
   cd customgpt-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

5. **Enter your API key**
   The app will prompt you to enter your CustomGPT.ai API key on first launch.

### 🎯 Quick Widget Setup

For the fastest setup of a chat widget on your website:

1. **Get your credentials from CustomGPT.ai:**
   - API Key: Found in your account settings
   - Agent ID: Found in your agent/project details

2. **Add to your website (choose one):**

   **Option A - Direct Widget (Simplest):**
   ```html
   <div id="my-chat" style="width: 400px; height: 600px;"></div>
   <script src="https://your-domain.com/widget/customgpt-widget.js"></script>
   <script>
     CustomGPTWidget.init({
       apiKey: 'YOUR_API_KEY_HERE',
       agentId: YOUR_AGENT_ID_HERE,
       containerId: 'my-chat'
     });
   </script>
   ```

   **Option B - Floating Button (Iframe):**
   ```html
   <script src="https://your-domain.com/embed/customgpt-embed.js"></script>
   <script>
     CustomGPTEmbed.init({
       apiKey: 'YOUR_API_KEY_HERE',
       agentId: YOUR_AGENT_ID_HERE,
       mode: 'floating',
       position: 'bottom-right',
       iframeSrc: 'https://your-domain.com/iframe/'
     });
   </script>
   ```

3. **That's it!** Your chat widget is now live on your website.

## 📦 Deployment Options

### 1. Standalone Web Application

Deploy as a full-featured web application:

```bash
# Build for production
npm run build

# Start production server
npm start
```

**Vercel Deployment:**
```bash
# Deploy to Vercel
npm run build
vercel --prod
```

**Docker Deployment:**
```bash
# Build Docker image
docker build -t customgpt-ui .

# Run container
docker run -p 3000:3000 customgpt-ui
```

### 2. Embeddable Widget

Build as a lightweight widget for website integration. The widget requires an API key and agent ID to connect to a specific chatbot.

```bash
# Build widget bundle
npm run build:widget

# Development mode with hot reload
npm run dev:widget
```

**Integration Example:**
```html
<!-- Embedded Widget in a Container -->
<div id="customgpt-chat" style="width: 400px; height: 600px;"></div>
<script src="https://cdn.customgpt.ai/widget/customgpt-widget.js"></script>
<script>
  CustomGPTWidget.init({
    apiKey: 'YOUR_API_KEY',      // Required: Your CustomGPT API key
    agentId: 123,                // Required: Your agent/project ID
    containerId: 'customgpt-chat',
    mode: 'embedded',
    theme: 'light',
    enableCitations: true,
    enableFeedback: true
  });
</script>
```

**Widget Configuration Options:**
- `apiKey` (required): Your CustomGPT.ai API key
- `agentId` (required): The ID of your agent/chatbot
- `containerId`: ID of the HTML element to embed the widget in
- `mode`: 'embedded' | 'floating' | 'widget'
- `theme`: 'light' | 'dark'
- `position`: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' (for floating mode)
- `width`: Widget width (default: '400px')
- `height`: Widget height (default: '600px')
- `enableCitations`: Show/hide citation sources (default: true)
- `enableFeedback`: Show/hide feedback buttons (default: true)
- `onOpen`: Callback function when widget opens
- `onClose`: Callback function when widget closes
- `onMessage`: Callback function when messages are sent/received

### 3. Floating Chatbot (Iframe Embed)

Deploy as a floating chat button using iframe for better security isolation:

```bash
# Build iframe bundle
npm run build:iframe

# Development mode with hot reload
npm run dev:iframe
```

**Integration Example:**
```html
<!-- Floating Chat Button -->
<script>
  (function() {
    const script = document.createElement('script');
    script.src = 'https://cdn.customgpt.ai/embed/customgpt-embed.js';
    script.onload = function() {
      const chatWidget = CustomGPTEmbed.init({
        apiKey: 'YOUR_API_KEY',      // Required: Your CustomGPT API key
        agentId: 123,                // Required: Your agent/project ID
        mode: 'floating',
        position: 'bottom-right',
        theme: 'light',
        iframeSrc: 'https://chat.customgpt.ai/iframe/' // Your iframe URL
      });
      
      // Optional: Programmatic control
      // chatWidget.open();
      // chatWidget.close();
      // chatWidget.toggle();
    };
    document.head.appendChild(script);
  })();
</script>
```

**Iframe Benefits:**
- **Security Isolation**: Chat runs in a sandboxed environment
- **Cross-Domain Compatibility**: No CORS issues
- **CSP Friendly**: Works with strict Content Security Policies
- **Consistent Behavior**: Same experience across all browsers

**Programmatic Control:**
Both widget and iframe implementations support programmatic control:

```javascript
// Get widget instance
const widget = CustomGPTWidget.init(config);
// or
const widget = CustomGPTEmbed.init(config);

// Control methods
widget.open();          // Open the chat
widget.close();         // Close the chat
widget.toggle();        // Toggle open/close
widget.destroy();       // Remove widget completely
widget.updateConfig({   // Update configuration
  theme: 'dark'
});

// Properties
widget.isOpened;        // Check if widget is open
widget.configuration;   // Get current configuration
```

**Finding Your Agent ID:**
1. Log in to your CustomGPT.ai dashboard
2. Navigate to your agents/projects list
3. Click on the agent you want to use
4. The agent ID is shown in the URL or agent details

**Security Notes:**
- Keep your API key secure - for production, consider using a server-side proxy
- The agent ID is safe to expose in client-side code
- Use HTTPS for all production deployments
- Configure appropriate CORS and CSP headers for iframe implementations

## 🚀 Widget Deployment Guide

After building the widget files, you need to host them somewhere accessible. Here are your options:

### Self-Hosting

1. **Build the files:**
   ```bash
   npm run build:widget    # For direct widget
   npm run build:iframe    # For iframe embed
   ```

2. **Upload to your server:**
   - Widget files: `dist/widget/` → `https://your-domain.com/widget/`
   - Iframe files: `dist/iframe/` → `https://your-domain.com/iframe/`
   - Embed script: `src/widget/iframe-embed.js` → `https://your-domain.com/embed/`

3. **Update your integration code** with your URLs

### CDN Hosting Options

**Free Options:**
- **Vercel**: Deploy with `vercel` CLI (free tier)
- **Netlify**: Drag & drop `dist` folder (free tier)
- **GitHub Pages**: If repository is public
- **jsDelivr**: Auto-serves from GitHub (public repos only)

**Paid Options:**
- **AWS S3 + CloudFront**
- **Google Cloud Storage + CDN**
- **Cloudflare Pages/R2**
- **Azure Blob Storage + CDN**

### Quick Deploy with Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Build files
npm run build:all

# Deploy
cd dist
vercel --prod

# Your files will be available at:
# https://your-project.vercel.app/widget/customgpt-widget.js
# https://your-project.vercel.app/iframe/
```

### CORS Configuration

If hosting on a different domain, configure CORS headers:

```nginx
# Nginx example
location /widget/ {
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods "GET, OPTIONS";
}

location /iframe/ {
    add_header X-Frame-Options "";
    add_header Content-Security-Policy "frame-ancestors *;";
}
```

## 🛠️ Development

### Project Structure

```
customgpt-ui/
├── src/
│   ├── components/          # React components
│   │   ├── chat/           # Chat-specific components
│   │   ├── setup/          # Setup and configuration
│   │   └── ui/             # Reusable UI components
│   ├── lib/                # Utility functions and API client
│   │   ├── api/            # CustomGPT.ai API integration
│   │   └── streaming/      # Real-time streaming handlers
│   ├── store/              # Zustand state management
│   ├── types/              # TypeScript type definitions
│   └── styles/             # Global styles and themes
├── app/                    # Next.js app directory
└── public/                 # Static assets
```

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Multi-format builds
npm run build:standalone # Build standalone app
npm run build:widget    # Build embeddable widget
npm run build:embed     # Build floating chatbot
npm run build:all       # Build all formats

# Code quality
npm run lint            # Run ESLint
npm run type-check      # Run TypeScript compiler
npm test               # Run tests
npm run test:watch     # Run tests in watch mode
```

### Environment Variables

Create a `.env.local` file:

```bash
# Optional: Custom API base URL
NEXT_PUBLIC_API_BASE_URL=https://app.customgpt.ai/api/v1

# Optional: App configuration
NEXT_PUBLIC_APP_NAME="CustomGPT Chat"
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

## 🏗️ Architecture

### Core Components

- **ChatContainer**: Main chat interface orchestrator
- **Message**: Individual message component with markdown support
- **ChatInput**: Input field with file upload and drag-and-drop
- **CitationList**: Interactive citation management
- **StreamHandler**: Real-time message streaming

### State Management

Uses Zustand for efficient state management:

- **ConfigStore**: API keys and app configuration
- **AgentStore**: Agent selection and management
- **ConversationStore**: Conversation history and creation
- **MessageStore**: Message state and streaming
- **UIStore**: UI preferences and theme

### API Integration

Comprehensive CustomGPT.ai API integration:

- **Streaming Support**: Real-time Server-Sent Events
- **File Uploads**: Multi-format file processing
- **Error Handling**: Robust error recovery and retry logic
- **Caching**: Intelligent response caching with React Query

## 📚 Code Documentation

The codebase includes extensive documentation to help contributors:

- **JSDoc Comments**: Every component, function, and module is documented
- **Type Definitions**: Full TypeScript coverage with detailed interface documentation
- **Usage Examples**: Code examples in comments showing how to use components
- **Architecture Notes**: Explanations of design decisions and data flow
- **Customization Guides**: Specific notes for common customization scenarios

Key documented areas:
- `src/types/` - All TypeScript interfaces with property descriptions
- `src/components/` - React components with props, features, and usage
- `src/store/` - State management with data flow explanations
- `src/lib/api/` - API client with method documentation
- `src/lib/utils.ts` - Utility functions with examples
- `app/globals.css` - CSS structure and customization guide

## 🤝 Contributing

We welcome contributions! The codebase is thoroughly documented to help you get started.

### Getting Started

1. **Read the Code**: Start by exploring the documented components and understanding the architecture
2. **Check Issues**: Look for issues labeled "good first issue" or "help wanted"
3. **Ask Questions**: Open a discussion if you need clarification

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Follow existing code patterns and conventions
4. Add/update documentation for your changes
5. Test thoroughly: `npm run lint && npm run type-check && npm test`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request with a clear description

### Code Standards

- **TypeScript**: Ensure full type coverage
- **Components**: Use functional components with hooks
- **Styling**: Follow Tailwind CSS conventions
- **Documentation**: Add JSDoc comments for new code
- **Testing**: Write tests for new features
- **Accessibility**: Follow WCAG guidelines

## 📝 License

This project is licensed under the MIT License.

## 🔗 Links

- [CustomGPT.ai](https://customgpt.ai) - Main platform
- [API Documentation](https://docs.customgpt.ai) - API reference
- [Support](https://support.customgpt.ai) - Get help

---

Built with ❤️ by the CustomGPT.ai team
