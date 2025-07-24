# CustomGPT.ai Chat UI

A modern, responsive chat interface for CustomGPT.ai's RAG platform built with Next.js, TypeScript, and Tailwind CSS. Supports multiple deployment modes: standalone web app, embeddable widget, and floating chatbot.

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

Build as a lightweight widget for website integration:

```bash
# Build widget bundle
npm run build:widget
```

**Integration Example:**
```html
<div id="customgpt-chat" style="width: 400px; height: 600px;"></div>
<script src="https://cdn.customgpt.ai/widget/customgpt-widget.js"></script>
<script>
  CustomGPT.init({
    apiKey: 'YOUR_API_KEY',
    projectId: 123,
    containerId: 'customgpt-chat'
  });
</script>
```

### 3. Floating Chatbot

Deploy as a floating chat button for websites:

```bash
# Build embed bundle
npm run build:embed
```

**Integration Example:**
```html
<script>
  (function() {
    const script = document.createElement('script');
    script.src = 'https://cdn.customgpt.ai/embed/customgpt-embed.js';
    script.onload = function() {
      CustomGPTEmbed.init({
        apiKey: 'YOUR_API_KEY',
        projectId: 123,
        position: 'bottom-right',
        theme: 'light'
      });
    };
    document.head.appendChild(script);
  })();
</script>
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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🔗 Links

- [CustomGPT.ai](https://customgpt.ai) - Main platform
- [API Documentation](https://docs.customgpt.ai) - API reference
- [Support](https://support.customgpt.ai) - Get help

---

Built with ❤️ by the CustomGPT.ai team
