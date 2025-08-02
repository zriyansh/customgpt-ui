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

## 🎯 Quick Start for Widget Users

### Which Option Should I Choose?

```
Do you want to customize the widget code?
├─ No → Use Option 1 (Pre-built from CDN)
└─ Yes
   ├─ Minor customization → Use Option 2 (Download and self-host)
   └─ Major customization 
      ├─ One-time changes → Use Option 3 (Build from source)
      └─ Ongoing development → Use Option 4 (Fork and deploy)
```

If you just want to add the CustomGPT chat widget to your website, here are your options:

### Option 1: Use Pre-built Files (Simplest - No Build Required)

**For GitHub hosted version:**
```html
<!-- Embedded Chat Widget -->
<div id="my-chat" style="width: 400px; height: 600px;"></div>
<script src="https://cdn.jsdelivr.net/gh/customgpt/customgpt-ui@main/dist/widget/customgpt-widget.js"></script>
<script>
  CustomGPTWidget.init({
    apiKey: 'YOUR_API_KEY',
    agentId: 123,  // Your agent ID
    containerId: 'my-chat'
  });
</script>
```

### Option 2: Download and Self-Host (More Control)

1. **Download the pre-built files** from GitHub:
   - Go to [Releases](https://github.com/customgpt/customgpt-ui/releases)
   - Download `widget-bundle.zip` or `iframe-bundle.zip`
   - Extract and upload to your web server

2. **Or download directly:**
   ```bash
   # Download widget files
   wget https://github.com/customgpt/customgpt-ui/archive/refs/heads/main.zip
   unzip main.zip
   cp -r customgpt-ui-main/dist/widget/* /path/to/your/webserver/
   ```

3. **Include in your website:**
   ```html
   <script src="/path/to/customgpt-widget.js"></script>
   ```

### Option 3: Build From Source (Full Customization)

1. **Clone and build:**
   ```bash
   git clone https://github.com/customgpt/customgpt-ui.git
   cd customgpt-ui
   npm install
   npm run build:widget  # or build:iframe for iframe version
   ```

2. **Copy the built files:**
   - Widget: Copy everything from `dist/widget/` to your server
   - Iframe: Copy `dist/iframe/` directory and `src/widget/iframe-embed.js`

3. **Host on your server or CDN**

### Option 4: Fork and Deploy (Recommended for Production)

1. **Fork the repository** on GitHub

2. **Deploy to Vercel (Free):**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Clone your fork
   git clone https://github.com/YOUR_USERNAME/customgpt-ui.git
   cd customgpt-ui
   npm install
   npm run build:all
   
   # Deploy
   vercel --prod
   ```

3. **Or deploy to Netlify:**
   - Connect your GitHub fork to Netlify
   - Build command: `npm run build:all`
   - Publish directory: `dist`

4. **Use your deployment URL:**
   ```html
   <script src="https://your-app.vercel.app/widget/customgpt-widget.js"></script>
   ```

### Option 5: NPM Package (Coming Soon)

```bash
# Future implementation
npm install @customgpt/chat-widget

# In your JavaScript
import { CustomGPTWidget } from '@customgpt/chat-widget';
CustomGPTWidget.init({ apiKey: '...', agentId: 123 });
```

## 📋 Complete Integration Guide

### Embedded Chat Widget

**Basic Implementation:**
```html
<!DOCTYPE html>
<html>
<head>
    <title>My Website</title>
</head>
<body>
    <!-- Your website content -->
    
    <!-- Chat widget container -->
    <div id="customgpt-chat" style="width: 400px; height: 600px;"></div>
    
    <!-- Load and initialize widget -->
    <script src="https://cdn.jsdelivr.net/gh/customgpt/customgpt-ui@main/dist/widget/customgpt-widget.js"></script>
    <script>
        // Initialize the widget
        const chatWidget = CustomGPTWidget.init({
            apiKey: 'YOUR_API_KEY',
            agentId: 123,  // Your agent ID from CustomGPT dashboard
            containerId: 'customgpt-chat',
            theme: 'light',
            enableCitations: true,
            enableFeedback: true
        });
    </script>
</body>
</html>
```

### Floating Chat Button

**Basic Implementation:**
```html
<!DOCTYPE html>
<html>
<head>
    <title>My Website</title>
</head>
<body>
    <!-- Your website content -->
    
    <!-- Floating chat button (no container needed) -->
    <script src="https://cdn.jsdelivr.net/gh/customgpt/customgpt-ui@main/dist/widget/customgpt-widget.js"></script>
    <script>
        // Initialize floating widget
        const floatingChat = CustomGPTWidget.init({
            apiKey: 'YOUR_API_KEY',
            agentId: 123,
            mode: 'floating',
            position: 'bottom-right',
            theme: 'light'
        });
        
        // Optional: Open chat programmatically
        // floatingChat.open();
    </script>
</body>
</html>
```

### Iframe Embed (Better Isolation)

**For enhanced security and cross-domain compatibility:**
```html
<!DOCTYPE html>
<html>
<head>
    <title>My Website</title>
</head>
<body>
    <!-- Your website content -->
    
    <!-- Iframe-based implementation -->
    <script>
        (function() {
            // First, you need to host the iframe files somewhere
            // Then use this embed script
            const script = document.createElement('script');
            script.src = 'https://your-domain.com/embed/customgpt-embed.js';
            script.onload = function() {
                CustomGPTEmbed.init({
                    apiKey: 'YOUR_API_KEY',
                    agentId: 123,
                    mode: 'floating',
                    position: 'bottom-right',
                    iframeSrc: 'https://your-domain.com/iframe/'
                });
            };
            document.head.appendChild(script);
        })();
    </script>
</body>
</html>
```

### React/Next.js Integration

```jsx
// components/ChatWidget.jsx
import { useEffect } from 'react';

export default function ChatWidget() {
  useEffect(() => {
    // Load the widget CSS
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
    
    // Initialize widget after loading dependencies
    const initWidget = async () => {
      try {
        // First load vendors.js (contains React and dependencies)
        await loadScript('/static/vendors.js');
        
        // Then load the main widget
        await loadScript('/static/customgpt-widget.js');
        
        // Initialize the widget
        if (window.CustomGPTWidget) {
          window.CustomGPTWidget.init({
            apiKey: process.env.NEXT_PUBLIC_CUSTOMGPT_API_KEY,
            agentId: parseInt(process.env.NEXT_PUBLIC_CUSTOMGPT_AGENT_ID),
            containerId: 'chat-container',
            mode: 'embedded'
          });
        }
      } catch (error) {
        console.error('Failed to load widget:', error);
      }
    };
    
    initWidget();
    
    // Cleanup
    return () => {
      const scripts = document.querySelectorAll('script[src*="customgpt"], script[src*="vendors"]');
      scripts.forEach(script => script.remove());
      const links = document.querySelectorAll('link[href*="customgpt"]');
      links.forEach(link => link.remove());
    };
  }, []);
  
  return <div id="chat-container" style={{ width: '400px', height: '600px' }} />;
}
```

### Vue.js Integration

```vue
<!-- ChatWidget.vue -->
<template>
  <div id="customgpt-chat" :style="{ width: '400px', height: '600px' }"></div>
</template>

<script>
export default {
  mounted() {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/customgpt/customgpt-ui@main/dist/widget/customgpt-widget.js';
    script.onload = () => {
      window.CustomGPTWidget.init({
        apiKey: process.env.VUE_APP_CUSTOMGPT_API_KEY,
        agentId: process.env.VUE_APP_CUSTOMGPT_AGENT_ID,
        containerId: 'customgpt-chat'
      });
    };
    document.head.appendChild(script);
  }
}
</script>
```

### WordPress Plugin

```php
<?php
// customgpt-chat-widget.php
/*
Plugin Name: CustomGPT Chat Widget
Description: Adds CustomGPT chat widget to your WordPress site
*/

function customgpt_add_chat_widget() {
    ?>
    <div id="customgpt-chat" style="width: 400px; height: 600px;"></div>
    <script src="https://cdn.jsdelivr.net/gh/customgpt/customgpt-ui@main/dist/widget/customgpt-widget.js"></script>
    <script>
        CustomGPTWidget.init({
            apiKey: '<?php echo get_option('customgpt_api_key'); ?>',
            agentId: <?php echo get_option('customgpt_agent_id'); ?>,
            containerId: 'customgpt-chat'
        });
    </script>
    <?php
}
add_action('wp_footer', 'customgpt_add_chat_widget');
```

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

## ❓ Frequently Asked Questions

### Do I need to host this entire project?

**No!** You have several options:
- **Option 1**: Use the pre-built files directly from jsDelivr (easiest)
- **Option 2**: Download just the widget files and host them on your server
- **Option 3**: Fork and customize, then deploy your version
- **Option 4**: Build from source for maximum customization

### What files do I actually need?

For the **widget**, you need ALL of these files:
- **Vendor bundle**: `vendors.js` (contains React and other dependencies) - **MUST be loaded first**
- **Main JavaScript file**: `customgpt-widget.js` (the widget code)
- **CSS file**: `customgpt-widget.css` (widget styles)
- **Optional**: `.map` files are for debugging only (not required for production)

**Important Loading Order**:
1. Load `customgpt-widget.css` (in `<head>` or before widget init)
2. Load `vendors.js` **first** (contains required dependencies)
3. Load `customgpt-widget.js` **after** vendors.js
4. Initialize the widget

**Minimum files to copy**:
```
dist/widget/
├── vendors.js               # Dependencies - LOAD THIS FIRST!
├── customgpt-widget.js      # Main widget code - LOAD THIS SECOND!
└── customgpt-widget.css     # Widget styles
```

For the **iframe embed**, you need:
- The entire `iframe/` directory (for iframe content)
- `src/widget/iframe-embed.js` (the loader script)

### Can I use this without building anything?

Yes! If this repository has pre-built files in the `dist/` directory, you can use them directly.

**Important**: The built files have hashes in their names (e.g., `customgpt-widget.693e3bf38838c2a441a1.js`). You have two options:

**Option 1: Use the generated index.html**
The easiest way is to check `dist/widget/index.html` which has the correct file references:
```html
<!-- Copy these script tags from dist/widget/index.html -->
<link href="/customgpt-widget.4712081474807736b155.css" rel="stylesheet">
<script src="/vendors.de2e13382b18efc929eb.js"></script>
<script src="/customgpt-widget.693e3bf38838c2a441a1.js"></script>
```

**Option 2: Host and reference the files**
1. Copy ALL these files to your server:
   - `customgpt-widget.[hash].js` (main widget)
   - `customgpt-widget.[hash].css` (styles)
   - `vendors.[hash].js` (React and dependencies)

2. Reference them in your HTML with the exact filenames:
```html
<link rel="stylesheet" href="path/to/customgpt-widget.4712081474807736b155.css">
<script src="path/to/vendors.de2e13382b18efc929eb.js"></script>
<script src="path/to/customgpt-widget.693e3bf38838c2a441a1.js"></script>
```

**Note**: The `.map` files are optional (for debugging) and can be omitted in production.

### How do I get an API key and Agent ID?

1. Sign up at [app.customgpt.ai](https://app.customgpt.ai)
2. Create an agent/project
3. Find your API key in account settings
4. Find your Agent ID in the agent details or URL

### Is it secure to put my API key in client-side code?

For production, we recommend:
- Using a server-side proxy to hide your API key
- Implementing domain restrictions on your API key
- Using environment variables in your build process

### Can I customize the appearance?

Yes! You can:
- Use the `theme` option ('light' or 'dark')
- Override CSS styles
- Fork and modify the source code
- Pass custom CSS classes (in future versions)

### What's the difference between widget and iframe embed?

**Widget**: 
- Loads directly in your page's DOM
- Smaller file size
- Better performance
- May conflict with your site's CSS

**Iframe Embed**:
- Completely isolated from your page
- No CSS conflicts
- Better security isolation
- Works across domains
- Slightly larger total size

## 🧪 Testing Widget Locally (Step-by-Step Guide)

This guide will help you test the widget and floating chatbot on your local machine from start to finish.

### Prerequisites

Before starting, make sure you have:
- Node.js 18+ installed ([Download here](https://nodejs.org/))
- A CustomGPT.ai account with API key and at least one Agent created
- A code editor (VS Code recommended)
- Terminal/Command Prompt access

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/customgpt/customgpt-ui.git

# Navigate to the project directory
cd customgpt-ui
```

### Step 2: Install Dependencies

```bash
# Install all required packages
npm install

# This will install React, Webpack, and all other dependencies
```

### Step 3: Get Your Credentials

1. Go to [https://app.customgpt.ai](https://app.customgpt.ai)
2. Log in to your account
3. **Get your API Key:**
   - Click on your profile icon
   - Go to "API Keys" or "Settings"
   - Copy your API key
4. **Get your Agent ID:**
   - Go to "Agents" or "Projects"
   - Click on the agent you want to use
   - The Agent ID is in the URL (e.g., `app.customgpt.ai/projects/123` → Agent ID is `123`)

### Step 4: Build the Widget

You have three options for testing:

#### Option A: Test with Development Server (Recommended)

```bash
# Start the widget development server
npm run dev:widget

# This will start a server at http://localhost:3003
# The widget will auto-reload when you make changes
```

#### Option B: Build and Test Production Version

```bash
# Build the widget for production
npm run build:widget

# The built files will be in dist/widget/
# You'll need to serve these files locally (see Step 5)
```

#### Option C: Build Everything

```bash
# Build all formats (widget, iframe, and main app)
npm run build:all
```

### Step 5: Test the Widget

#### Method 1: Use the Quick Start Page (Easiest)

1. Open `quick-start.html` in your browser:
   - **If using dev server:** Go to `http://localhost:3003/quick-start.html`
   - **If built locally:** Open `file:///path/to/customgpt-ui/quick-start.html`

2. Enter your credentials:
   - Paste your API Key
   - Enter your Agent ID
   - Select "Embedded Chat" or "Floating Button"
   - Click "Initialize Widget"

3. You should see the chat widget appear!

#### Method 2: Use the Test Page

1. Open `test-widget.html` in your browser
2. If the widget files are built, you'll see a success message
3. Enter your API key and Agent ID
4. Click "Initialize Widget"

#### Method 3: Create Your Own Test HTML

Create a new file `my-test.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Widget Test</title>
</head>
<body>
    <h1>Testing CustomGPT Widget</h1>
    
    <!-- For embedded widget -->
    <div id="chat-widget" style="width: 400px; height: 600px; border: 1px solid #ccc;"></div>
    
    <!-- Load the widget script -->
    <script src="dist/widget/customgpt-widget.js"></script>
    
    <script>
        // Initialize embedded widget
        const widget = CustomGPTWidget.init({
            apiKey: 'YOUR_API_KEY_HERE',  // Replace with your API key
            agentId: 123,                  // Replace with your Agent ID
            containerId: 'chat-widget',
            mode: 'embedded',
            theme: 'light'
        });
        
        // Or initialize floating widget
        // const floatingWidget = CustomGPTWidget.init({
        //     apiKey: 'YOUR_API_KEY_HERE',
        //     agentId: 123,
        //     mode: 'floating',
        //     position: 'bottom-right'
        // });
    </script>
</body>
</html>
```

### Step 6: Test Different Configurations

#### Test Embedded Widget

```javascript
CustomGPTWidget.init({
    apiKey: 'your-api-key',
    agentId: 123,
    containerId: 'chat-container',
    mode: 'embedded',
    theme: 'light',  // or 'dark'
    width: '400px',
    height: '600px',
    enableCitations: true,
    enableFeedback: true
});
```

#### Test Floating Button

```javascript
CustomGPTWidget.init({
    apiKey: 'your-api-key',
    agentId: 123,
    mode: 'floating',
    position: 'bottom-right', // or 'bottom-left', 'top-right', 'top-left'
    theme: 'light'
});
```

### Step 7: Test Widget Controls

Once the widget is initialized, you can control it programmatically:

```javascript
// Get reference to widget
const widget = CustomGPTWidget.init(config);

// Open the widget
widget.open();

// Close the widget
widget.close();

// Toggle open/close
widget.toggle();

// Check if open
console.log(widget.isOpened);

// Update configuration
widget.updateConfig({
    theme: 'dark'
});

// Destroy the widget
widget.destroy();
```

### Step 8: Debugging Common Issues

If the widget doesn't appear or work correctly:

1. **Check Console Errors:**
   - Open browser DevTools (F12)
   - Look for errors in the Console tab

2. **Verify Widget Script Loaded:**
   ```javascript
   console.log(typeof CustomGPTWidget); // Should not be 'undefined'
   ```

3. **Check API Key and Agent ID:**
   - Make sure API key is valid
   - Verify Agent ID is a number
   - Check if the agent is active in your dashboard

4. **CORS Issues:**
   - If testing with `file://` protocol, use a local server instead:
   ```bash
   # Install a simple HTTP server
   npm install -g http-server
   
   # Serve the files
   http-server -p 8080
   
   # Open http://localhost:8080/test-widget.html
   ```

### Step 9: Test Iframe Embed (Alternative)

For better isolation, test the iframe version:

```bash
# Build iframe version
npm run build:iframe

# Start iframe dev server
npm run dev:iframe

# This starts at http://localhost:3004
```

Then use the iframe embed script:

```html
<script src="src/widget/iframe-embed.js"></script>
<script>
    CustomGPTEmbed.init({
        apiKey: 'your-api-key',
        agentId: 123,
        mode: 'floating',
        position: 'bottom-right',
        iframeSrc: 'http://localhost:3004/'
    });
</script>
```

### Step 10: Build for Production

Once testing is complete and you're happy with the widget:

```bash
# Build production version
npm run build:widget

# Files will be in dist/widget/
```

After building, you'll find files like:
- `customgpt-widget.693e3bf38838c2a441a1.js` (main widget)
- `customgpt-widget.4712081474807736b155.css` (styles)
- `vendors.de2e13382b18efc929eb.js` (dependencies)
- `index.html` (example usage)

**Using the Built Files:**

1. **Copy ALL required files** to your server:
   ```bash
   # Copy the main files (ignore .map files for production)
   cp dist/widget/*.js dist/widget/*.css /path/to/your/webserver/widget/
   ```

2. **Update your HTML** to use the hashed filenames:
   ```html
   <!-- Include CSS -->
   <link rel="stylesheet" href="/widget/customgpt-widget.4712081474807736b155.css">
   
   <!-- Include vendor bundle first -->
   <script src="/widget/vendors.de2e13382b18efc929eb.js"></script>
   
   <!-- Include main widget -->
   <script src="/widget/customgpt-widget.693e3bf38838c2a441a1.js"></script>
   
   <!-- Initialize widget -->
   <script>
     CustomGPTWidget.init({
       apiKey: 'YOUR_API_KEY',
       agentId: 123,
       containerId: 'chat-widget'
     });
   </script>
   ```

3. **Alternative: Use index.html**
   The generated `index.html` already has the correct file references. You can:
   - Use it as a template
   - Copy the script tags from it
   - Modify it for your needs

**Note about hashed filenames**: The hash (like `693e3bf38838c2a441a1`) changes with each build. This is for cache busting. You'll need to update your HTML references when you rebuild.

### Troubleshooting Checklist

- [ ] Node.js version 18+ installed?
- [ ] All dependencies installed (`npm install`)?
- [ ] Valid API key from CustomGPT.ai?
- [ ] Valid Agent ID (number)?
- [ ] Widget script loaded successfully?
- [ ] No CORS errors in console?
- [ ] Container element exists (for embedded mode)?
- [ ] No JavaScript errors in console?

### Quick Commands Reference

```bash
# Development
npm install              # Install dependencies
npm run dev:widget      # Start widget dev server (port 3003)
npm run dev:iframe      # Start iframe dev server (port 3004)

# Building
npm run build:widget    # Build widget only
npm run build:iframe    # Build iframe only
npm run build:all       # Build everything

# Testing
# Open in browser:
# - http://localhost:3003/quick-start.html (dev server)
# - http://localhost:3003/test-widget.html (dev server)
# - Or open HTML files directly if built
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

## 🐛 Common Issues & Solutions

### Widget Not Appearing

**Problem**: Widget script loads but nothing appears on the page.

**Solutions**:
1. Check if container element exists (for embedded mode):
   ```javascript
   console.log(document.getElementById('your-container-id')); // Should not be null
   ```
2. Verify API key and Agent ID are correct
3. Check browser console for errors
4. Make sure the agent is active in your CustomGPT dashboard

### CORS Errors

**Problem**: "Access to script at 'file://...' from origin 'null' has been blocked by CORS policy"

**Solution**: Use a local HTTP server instead of opening HTML files directly:
```bash
# Option 1: Using Python
python -m http.server 8000

# Option 2: Using Node.js
npx http-server -p 8000

# Then open http://localhost:8000/your-file.html
```

### API Key Invalid

**Problem**: "API Token is either missing or invalid" error

**Solutions**:
1. Double-check your API key is copied correctly (no extra spaces)
2. Ensure the API key is active in your dashboard
3. Check if you have the correct permissions

### Agent Not Found

**Problem**: "Agent with id X not found" error

**Solutions**:
1. Verify the Agent ID is correct (it's a number, not the agent name)
2. Make sure you own or have access to this agent
3. Check if the agent is active and not deleted

### Build Errors

**Problem**: `npm run build:widget` fails

**Solutions**:
1. Delete `node_modules` and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
2. Make sure you're using Node.js 18+:
   ```bash
   node --version  # Should be v18.x.x or higher
   ```
3. Clear npm cache:
   ```bash
   npm cache clean --force
   ```

### Widget Styling Issues

**Problem**: Widget looks broken or unstyled

**Solutions**:
1. Make sure CSS is loaded (check Network tab in DevTools)
2. Check for CSS conflicts with your site
3. Try the iframe version for better isolation
4. Use the `theme` option to switch between light/dark modes

### Memory/Performance Issues

**Problem**: Page becomes slow with widget

**Solutions**:
1. Use the iframe version for better isolation
2. Destroy widget when not needed:
   ```javascript
   widget.destroy();
   ```
3. Limit the number of messages displayed
4. Check for memory leaks in browser DevTools

### "process is not defined" Error

**Problem**: ReferenceError: process is not defined when loading widget

**Cause**: The widget contains Node.js-specific code that doesn't work in browsers

**Solutions**:
1. Make sure you're using the latest built files (we've fixed this in the webpack config)
2. If building from source, ensure webpack.DefinePlugin is configured
3. Load the files in the correct order:
   ```javascript
   // 1. Load vendors.js first
   await loadScript('/path/to/vendors.js');
   // 2. Then load customgpt-widget.js
   await loadScript('/path/to/customgpt-widget.js');
   // 3. Then initialize
   CustomGPTWidget.init({...});
   ```

### "Cannot read properties of undefined (reading 'init')" Error

**Problem**: Widget object is undefined when trying to initialize

**Solutions**:
1. Make sure you're loading ALL required files:
   - `vendors.js` (MUST be loaded first)
   - `customgpt-widget.js` (load after vendors.js)
   - `customgpt-widget.css`
2. Check that scripts are loaded in the correct order
3. Verify scripts loaded successfully (check Network tab in DevTools)
4. Ensure you're accessing `window.CustomGPTWidget` not just `CustomGPTWidget`

## 📝 License

This project is licensed under the MIT License.

## 🔗 Links

- [CustomGPT.ai](https://customgpt.ai) - Main platform
- [API Documentation](https://docs.customgpt.ai) - API reference
- [Support](https://support.customgpt.ai) - Get help

---

Built with ❤️ by the CustomGPT.ai team
