import { widgetStyles } from './styles.js';
import { widgetTemplate } from './template.js';
import { KittySocket } from './socket.js';
import { KittyUI } from './ui.js';
import 'https://cdn.jsdelivr.net/npm/emoji-picker-element@1.22.8/index.js';

class KittyChatWidget {
  constructor(config = {}) {
    // Derive the server host from the script's own URL (works when embedded on external sites)
    const scriptOrigin = new URL(import.meta.url).origin; // e.g. "http://192.168.0.166:3001"
    const serverHost = new URL(scriptOrigin).host; // e.g. "192.168.0.166:3001"
    const wsProto = scriptOrigin.startsWith("https") ? "wss:" : "ws:";

    this.serverOrigin = scriptOrigin;
    this.apiUrl = config.apiUrl || `${wsProto}//${serverHost}/widget`;
    this.API_URL = config.apiBaseUrl || `${scriptOrigin}/api`;
    this.init();
  }

  init() {
    // Prevent multiple injections
    if (document.getElementById('kittychat-root')) {
      return;
    }

    // Create the root container for the widget
    const widgetRoot = document.createElement('div');
    widgetRoot.id = 'kittychat-root';
    
    // Position it to be fixed at the bottom right of the screen
    widgetRoot.style.position = 'fixed';
    widgetRoot.style.bottom = '20px';
    widgetRoot.style.right = '20px';
    widgetRoot.style.zIndex = '999999';
    
    document.body.appendChild(widgetRoot);

    // Attach Shadow DOM
    const shadow = widgetRoot.attachShadow({ mode: 'open' });

    // Add styles
    const style = document.createElement('style');
    style.textContent = widgetStyles;
    shadow.appendChild(style);

    // Add HTML structure
    const container = document.createElement('div');
    container.id = 'kittychat-container';
    container.innerHTML = widgetTemplate;
    shadow.appendChild(container);

    let ui = null;

    const onSocketOpen = () => {
      // 1. Basic user identification
      this.socket.send({ 
        type: 'set_name', 
        name: 'Website Visitor'
      });
      
      // 2. Comprehensive Tracking (Metadata)
      this.socket.send({
        type: 'set_metadata',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screenResolution: `${screen.width}x${screen.height}`,
        referrer: document.referrer || 'direct',
        currentPage: window.location.href,
        customData: {
          locale: navigator.language,
        }
      });

      // 3. Initial page view
      this.socket.send({
        type: 'page_view',
        url: window.location.href,
        title: document.title,
      });

      // 4. Fetch precise location (City/Country) — may fail on some origins due to CORS
      try {
        fetch('https://ipapi.co/json/', { mode: 'cors' })
          .then(res => {
            if (!res.ok) throw new Error('blocked');
            return res.json();
          })
          .then(data => {
            if (data.city && data.country_name) {
              this.socket.send({
                type: 'set_metadata',
                city: data.city,
                country: data.country_name
              });
            }
          })
          .catch(() => { /* Silent fail — geo will come from server-side IP lookup */ });
      } catch (e) { /* Silent fail */ }
    };

    const onSocketMessage = (data) => {
      if (this.ui) this.ui.handleIncomingMessage(data);
    };

    this.socket = new KittySocket(this.apiUrl, onSocketOpen, onSocketMessage);

    // Initialize UI Logic
    this.ui = new KittyUI(shadow, this.socket);
  }

  // Global API methods
  open() {
    if (this.ui) {
      this.ui.chatWindow.classList.add('open');
      this.ui.launcher.innerHTML = '<span>✖</span>';
      setTimeout(() => this.ui.chatInput.focus(), 300);
    }
  }

  close() {
    if (this.ui) {
      this.ui.chatWindow.classList.remove('open');
      this.ui.launcher.innerHTML = '<span>🐱</span>';
    }
  }
}

// Expose and auto-initialize
window.KittyChat = new KittyChatWidget();


