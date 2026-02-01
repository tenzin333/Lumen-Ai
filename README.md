# Lumen AI Assistant

![Lumen AI Logo](lumen.svg)

A powerful Chrome browser extension that brings intelligent AI assistance directly to any webpage. Get guided, context-aware responses powered by Groq's lightning-fast LLM API.

## Features

✨ **Intelligent AI Responses**
- Powered by Groq's `llama-3.1-8b-instant` model for fast, accurate answers
- No page refresh needed—AI assistance is always accessible
- Works on any webpage you're browsing

🎯 **Smart Assistant Widget**
- Sleek, draggable floating widget with glassmorphism design
- Highlight text, right-click, and ask AI to analyze or explain
- Beautiful markdown rendering for formatted responses
- Real-time loading and error feedback

⚙️ **Customizable Settings**
- Choose your preferred response tone: Professional, Casual, or Short & Witty
- In-page settings modal for quick configuration
- Standalone options page for detailed settings management
- Resume/Profile upload for job-specific assistance

🔒 **Privacy & Security**
- API key stored locally—never transmitted to third parties
- Optional resume upload for personalized assistance
- Secure API communication with Groq's infrastructure
- No data collection or tracking

## Installation

### Prerequisites
- Google Chrome or Chromium-based browser
- A free Groq API key ([get one here](https://console.groq.com))

### Setup Steps

1. **Clone or Download** this project
   ```bash
   git clone <repository-url>
   cd lumen_ai
   ```

2. **Open Chrome Extensions**
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)

3. **Load Extension**
   - Click "Load unpacked"
   - Select the `lumen_ai` folder
   - The Lumen AI icon should appear in your extensions toolbar

4. **Configure API Key**
   - Click the extension icon and select "Settings"
   - Paste your Groq API key
   - (Optional) Upload your resume for job assistance
   - Select your preferred response tone
   - Click "Save Settings"

5. **Test Connection**
   - In the settings modal, click "Test Key" to verify your API connection
   - You should see a success confirmation

## Usage

### Basic Usage

1. **Select Text & Ask Question**
   - Highlight any text on a webpage
   - Right-click and select "Analyze with Lumen AI"
   - The widget appears with the AI's response

2. **Interact with Widget**
   - Drag the widget around the page
   - Read formatted responses with syntax highlighting
   - Close by clicking outside or pressing Escape

3. **Change Settings**
   - Click the ⚙️ icon in the widget header to open settings modal
   - Adjust tone, API key, or resume
   - Changes save immediately

### Advanced Features

- **Response Tone**: Switch between Professional, Casual, or Short & Witty responses
- **Resume Integration**: Upload your resume for job application and interview prep assistance
- **Quick Test**: Validate your API key without leaving the page

## Configuration

### Options Page
Visit the extension settings page for detailed configuration:
- Full API key management
- Resume upload and download
- Response tone selection
- Status feedback for all actions

### Quick Settings (In-Page Modal)
Click the settings icon (⚙️) in the widget header to:
- Change API key temporarily
- Select response tone
- Upload/remove resume
- Test API connectivity

## Architecture

### File Structure
```
lumen_ai/
├── manifest.json          # Extension configuration & permissions
├── background.js          # Service worker for API calls
├── content.js             # Widget rendering & message handling
├── options.html           # Settings page UI
├── options.js             # Settings page logic
├── libs/marked.min.js     # Markdown parser
└── README.md             # This file
```

### Key Components

**manifest.json**
- MV3 compliant configuration
- Permissions: contextMenus, activeTab, scripting, storage
- Optional permissions for Groq API (`https://api.groq.com/*`)
- Content Security Policy for safe script execution

**background.js**
- Service worker handling API requests
- Context menu listener for right-click integration
- API key validation and error handling
- Timeout management (15 seconds) for reliability

**content.js**
- Draggable glassmorphic widget creation
- In-page settings modal with Shadow DOM isolation
- Message routing between service worker and UI
- Markdown rendering with marked.js library

**options.html/js**
- Standalone settings management page
- Resume file upload with base64 storage
- API key testing functionality
- Glassmorphism UI matching widget design

## Security & Privacy

### Data Handling
- **Local Storage Only**: All settings (API key, resume, preferences) stored in `chrome.storage.local`
- **No Cloud Sync**: Extension does not sync or backup settings to cloud services
- **No Analytics**: No tracking, telemetry, or user behavior collection

### API Security
- **Optional Permissions**: Groq API host requires explicit user consent
- **Direct Connection**: Requests go directly to Groq, not through intermediary services
- **Request Validation**: API responses validated before display
- **Error Handling**: Clear error messages without exposing sensitive data

### Browser Extension Security
- **Content Security Policy**: Restricts script execution and external connections
- **Shadow DOM**: Settings modal isolated from page DOM to prevent style/script injection
- **No innerHTML**: Widget uses DOM APIs for safe HTML rendering
- **Script Isolation**: Extension scripts don't pollute global namespace

## Troubleshooting

### Widget Not Appearing
- Ensure you've configured an API key in settings
- Check that you're on a webpage (widget works on all HTTPS pages)
- Reload the page (`Ctrl+R` / `Cmd+R`)
- Verify the extension is enabled in `chrome://extensions`

### "API Key Invalid" Error
- Double-check your Groq API key is correct
- Copy-paste from [Groq Console](https://console.groq.com) to avoid typos
- Click "Test Key" in settings to validate
- Try creating a new API key in Groq console

### Slow Responses
- Network latency varies by location
- Groq processes requests in ~100-500ms typically
- Ensure your internet connection is stable
- Try a simpler query first

### Resume Upload Issues
- File size should be reasonable (< 10MB recommended)
- Supported formats: PDF, DOC, DOCX
- If upload fails, try downloading and re-uploading
- Check browser console (F12) for detailed error messages

### Settings Not Saving
- Verify Chrome isn't in Guest mode (blocks storage)
- Check that storage isn't disabled for this extension
- Try clearing extension data and reconfiguring
- Restart the browser

## Browser Compatibility

- **Chrome**: 93+ (tested and working)
- **Edge**: 93+ (Chromium-based, should work)
- **Brave**: Should work with Groq permission enabled
- **Other Chromium browsers**: Check Manifest V3 support

## Performance

- **Response Time**: Typically 0.5-3 seconds depending on query complexity
- **Widget Load**: < 100ms to create and display
- **Memory Usage**: ~5-10MB extension size, minimal runtime overhead
- **Network**: Single API request per query, efficient payload size

## API Information

**Provider**: Groq Inc.
**Model**: llama-3.1-8b-instant
**Endpoint**: `https://api.groq.com/openai/v1/chat/completions`
**Rate Limits**: Standard Groq API limits apply (check console.groq.com)
**Cost**: Free tier available with rate limiting

## Development

### Project Structure
All files use vanilla JavaScript (no build tools required). Extension loads directly from source.

### Making Changes
1. Edit files in the `lumen_ai` folder
2. Navigate to `chrome://extensions`
3. Click the refresh icon on the Lumen AI extension card
4. Changes apply immediately on page reload

### Debugging
- Open DevTools on any page: `F12`
- Check Console tab for errors
- Extension background script logs appear in service worker console (chrome://extensions → "Inspect views" for Lumen AI)

## Future Enhancements

Potential improvements for future versions:
- [ ] Support for multiple AI models (Claude, GPT-4, etc.)
- [ ] Custom system prompts for specialized use cases
- [ ] Chat history and saved conversations
- [ ] Keyboard shortcuts for quick access
- [ ] Response caching to reduce API calls
- [ ] Multi-language support
- [ ] Dark/light theme preferences
- [ ] Integration with productivity apps (Gmail, Google Docs, etc.)

## License

MIT License - Feel free to use, modify, and distribute this extension.

## Support

For issues, feature requests, or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review the [Architecture](#architecture) section for technical details
3. Check Groq API status: [status.groq.com](https://status.groq.com)

## Credits

- Built with [Groq API](https://groq.com) for fast LLM inference
- Markdown rendering via [marked.js](https://marked.js.org)
- Glassmorphism UI inspired by modern web design trends

---

**Version**: 1.0  
**Last Updated**: January 2026
**Author**: Tenzin Thinlay
**linkedin**: https://www.linkedin.com/in/tenthinlay1/
