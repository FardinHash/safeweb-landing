# Safe-Web - Privacy Protection Browser Extension

**Repository:** [https://github.com/intellwe/safe-web](https://github.com/intellwe/safe-web)

Safe-Web is a multipurpose browser extension designed to enhance privacy, usability, and productivity on the web. Built with React, Vite, TailwindCSS, and Framer Motion, it offers intuitive controls and elegant transitions for masking sensitive information.

## Features

### Sensitive Information Masking

- **Real-time Detection**: Automatically detects sensitive data on web pages
- **Multiple Masking Styles**: Blur, pixelate, or blackout sensitive information
- **Adjustable Intensity**: Fine-tune masking strength (1-10 levels)
- **Pattern Types**:
  - Email addresses
  - Phone numbers
  - Credit card numbers
  - Social Security Numbers
  - Custom patterns (coming soon)

### Modern UI/UX

- **Dark Mode**: Sleek dark interface by default
- **Cyan Accents**: Modern cyan and RGB gradient highlights
- **Smooth Animations**: Powered by Framer Motion
- **Responsive Design**: Works seamlessly across different screen sizes

### Smart Controls

- **One-Click Toggle**: Quick enable/disable masking
- **Keyboard Shortcuts**: Ctrl+Shift+M to toggle masking
- **Per-Site Settings**: Individual configuration for different websites
- **Real-time Updates**: Instant settings synchronization

## Quick Start

### Browser Installation

1. **Build the extension**

   ```bash
   npm run build:extension
   ```

2. **Load in Chrome/Edge**

   - Open `chrome://extensions/` or `edge://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

3. **Load in Firefox**
   - Open `about:debugging`
   - Click "This Firefox"
   - Click "Load Temporary Add-on"
   - Select any file in the `dist` folder

## Project Structure

```
safe-web/
├── public/
│   ├── manifest.json      # Extension manifest
│   └── icons/            # Extension icons (16, 32, 48, 128px)
├── src/
│   ├── components/       # React components
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Utility functions
│   ├── content/         # Content script
│   ├── background/      # Background service worker
│   ├── App.jsx          # Main popup component
│   ├── main.jsx         # React entry point
│   └── index.css        # Global styles
├── dist/                # Built extension files
└── vite.config.js       # Vite configuration
```

## Technical Stack

- **Frontend**: React 19, Vite 6
- **Styling**: TailwindCSS 4, Custom CSS Variables
- **Animations**: Framer Motion 12
- **Browser APIs**: Chrome Extension Manifest v3
- **Build Tool**: Vite with custom extension configuration

## Core Components

### Background Service Worker

- Manages extension lifecycle and settings
- Handles communication between popup and content scripts
- Provides persistent storage and tab management

### Content Script

- Scans web pages for sensitive information
- Applies masking effects in real-time
- Handles dynamic content updates
- Provides visual feedback to users

### Popup Interface

- Modern React-based UI
- Real-time settings management
- Current page status display
- Quick action controls

## Development Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run build:extension # Build extension + copy manifest
npm run lint            # Run ESLint

# Extension-specific
npm run copy-manifest   # Copy manifest to dist folder
```

## Browser Permissions

The extension requires the following permissions:

- `storage`: For saving user settings
- `activeTab`: For interacting with the current tab
- `scripting`: For injecting content scripts
- `<all_urls>`: For working on all websites

## 🚧 Roadmap

### Upcoming Features

- [ ] Custom pattern creation
- [ ] Advanced settings page
- [ ] Export/import settings
- [ ] Website whitelist/blacklist
- [ ] Performance monitoring
- [ ] Additional masking effects
- [ ] Multi-language support

### Version History

- **v1.0.0**: Initial release with core masking functionality
  - Sensitive information detection
  - Three masking styles (blur, pixelate, blackout)
  - Modern popup interface
  - Real-time settings sync

---

**Safe-Web** - Protecting your privacy, one page at a time. Built with ❤️ by IntellWe
