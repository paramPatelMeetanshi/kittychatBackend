export const widgetTemplate = `
  <div id="chat-window">
    <div id="header-top">
      <div id="header-icons-left">
        <button class="header-icon-btn active" id="home-btn" title="Home">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10l8-7 8 7v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M10 22v-5a2 2 0 0 1 4 0v5"/></svg>
        </button>
      </div>
      <div id="tabs" class="pill-tabs">
        <div class="tab" data-tab="messages">
          <span class="tab-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M21 4H3C1.9 4 1 4.9 1 6v10c0 1.1.9 2 2 2h3l4 4 4-4h7c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/><circle cx="7" cy="11" r="1.5" fill="white"/><circle cx="12" cy="11" r="1.5" fill="white"/><circle cx="17" cy="11" r="1.5" fill="white"/></svg></span>
          <span class="tab-text">Messages</span>
        </div>
        <div class="tab" data-tab="articles">
          <span class="tab-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="3" ry="3"/><line x1="4" y1="18" x2="20" y2="18"/></svg></span>
          <span class="tab-text">Articles</span>
        </div>
      </div>
      <div id="header-icons-right">
        <button class="header-icon-btn" id="expand-btn" title="Expand">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
        </button>
        <button class="header-icon-btn" id="minimize-btn" title="Minimize">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
      </div>
    </div>
    
    <div id="header-main" style="display: none;">
      <div id="header-avatar" class="messages-avatar">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="20" fill="#FF7A00"/>
          <path d="M13 22C13 22 16 26 20 26C24 26 27 22 27 22" stroke="white" stroke-width="2" stroke-linecap="round"/>
          <circle cx="15" cy="16" r="2" fill="white"/>
          <circle cx="25" cy="16" r="2" fill="white"/>
        </svg>
      </div>
      <div id="header-info">
        <h2 id="header-title">Questions? Chat with us.</h2>
        <p id="header-subtitle">Our team can also help</p>
      </div>
    </div>
    
    <div id="home-view" class="view-panel active-view">
      <div class="home-hero">
        <div class="home-hero-avatar">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><polygon points="28,72 52,20 72,68" fill="#E87800"/><polygon points="36,66 52,28 66,64" fill="#FF6B00"/><polygon points="128,68 148,20 172,72" fill="#E87800"/><polygon points="134,64 148,28 164,66" fill="#FF6B00"/><rect x="20" y="55" width="160" height="130" rx="22" fill="#E87800"/><rect x="32" y="65" width="136" height="110" rx="16" fill="#1A1A1A"/><ellipse cx="14" cy="162" rx="22" ry="13" fill="#1A1A1A"/><line x1="3" y1="173" x2="8" y2="180" stroke="#FFD700" stroke-width="2.5" stroke-linecap="round"/><line x1="12" y1="175" x2="14" y2="183" stroke="#FFD700" stroke-width="2.5" stroke-linecap="round"/><line x1="21" y1="174" x2="24" y2="182" stroke="#FFD700" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="186" cy="162" rx="22" ry="13" fill="#1A1A1A"/><line x1="175" y1="173" x2="172" y2="181" stroke="#FFD700" stroke-width="2.5" stroke-linecap="round"/><line x1="184" y1="175" x2="183" y2="183" stroke="#FFD700" stroke-width="2.5" stroke-linecap="round"/><line x1="193" y1="174" x2="196" y2="182" stroke="#FFD700" stroke-width="2.5" stroke-linecap="round"/><g><circle cx="72" cy="108" r="22" fill="#F5D000"/><ellipse class="cat-pupil-left" cx="72" cy="108" rx="7" ry="13" fill="#1A1A1A"/><circle cx="76" cy="101" r="4" fill="white" opacity="0.7"/></g><g><circle cx="128" cy="108" r="22" fill="#F5D000"/><ellipse class="cat-pupil-right" cx="128" cy="108" rx="7" ry="13" fill="#1A1A1A"/><circle cx="132" cy="101" r="4" fill="white" opacity="0.7"/></g><line x1="100" y1="128" x2="100" y2="136" stroke="#E87800" stroke-width="2" stroke-linecap="round"/><path d="M93,134 Q100,130 107,134 Q110,138 100,145 Q90,138 93,134 Z" fill="#E87800"/><ellipse cx="96" cy="135" rx="3" ry="2" fill="#FF9F40" opacity="0.5"/><path d="M100,145 Q93,153 85,151" stroke="#E87800" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M100,145 Q107,153 115,151" stroke="#E87800" stroke-width="2" stroke-linecap="round" fill="none"/><line x1="35" y1="145" x2="88" y2="140" stroke="#FFD700" stroke-width="1.5" stroke-linecap="round" opacity="0.85"/><line x1="35" y1="152" x2="88" y2="148" stroke="#FFD700" stroke-width="1.5" stroke-linecap="round" opacity="0.85"/><line x1="35" y1="159" x2="88" y2="156" stroke="#FFD700" stroke-width="1.5" stroke-linecap="round" opacity="0.85"/></svg>
        </div>
        <h2 class="home-hero-title">KittyChat</h2>
        <p class="home-hero-subtitle">How can we help?</p>
      </div>
      <div class="home-content">
        <div class="home-section-title">Get help</div>
        <div class="home-card" id="hc-send-msg">
          <div class="hc-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div class="hc-text">Send a message</div>
          <div class="hc-arrow"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg></div>
        </div>
        <div class="home-card stacked" id="hc-read-articles">
          <div class="hc-header">
            <div class="hc-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
            </div>
            <div class="hc-text">Read our help articles</div>
            <div class="hc-arrow"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg></div>
          </div>
          <div class="hc-links">
            <div class="hc-link">How to install a chat widget software on my website?</div>
            <div class="hc-link">How to use Message Triggers and Quick Replies</div>
            <div class="hc-link">How to replace the default chatbox button</div>
          </div>
        </div>
        <div class="home-grid">
          <div class="home-card-small">
            <div class="hcs-title">Service status</div>
            <div class="hcs-status"><span class="status-dot"></span> All healthy</div>
          </div>
        </div>
      </div>
    </div>

    <div id="messages-view" class="view-panel">
      <div id="message-feed">
      </div>
      
      <div id="quick-replies" class="quick-replies-grid">
        <div class="qr-row full-width">
          <button class="quick-reply-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.06-1.9 5.42-1.9.14.92-.03 2.53-1.07 3.96A8.96 8.96 0 0 1 21 13c0 4.97-4.03 9-9 9s-9-4.03-9-9c0-2.1.8-4.01 2.08-5.46C4.03 6.11 3.86 4.5 4 3.58c.36 0 3.64-.1 5.42 1.9.65-.17 1.33-.26 2-.26z"/></svg>
            <span>talk to a kitty</span>
            <svg class="qr-caret" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>
      
      <div id="input-area" class="input-area-new">
        <div class="input-wrapper-new">
          <textarea id="chat-input" placeholder="Compose your message..." rows="1"></textarea>
          <div class="input-actions-new">
            <div class="left-actions">
              <button class="icon-btn" id="emoji-btn" title="Add emoji">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
              </button>
              <button class="icon-btn" id="attach-btn" title="Attach file">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
              </button>
              <input type="file" id="file-input" style="display: none;" accept="image/*,application/pdf" />
            </div>
            <button class="icon-btn send-btn-new" id="send-btn" title="Send">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
        <div class="branding">
          Answers by <strong>KittyChat</strong>
          <svg class="branding-cat" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.06-1.9 5.42-1.9.14.92-.03 2.53-1.07 3.96A8.96 8.96 0 0 1 21 13c0 4.97-4.03 9-9 9s-9-4.03-9-9c0-2.1.8-4.01 2.08-5.46C4.03 6.11 3.86 4.5 4 3.58c.36 0 3.64-.1 5.42 1.9.65-.17 1.33-.26 2-.26z"/></svg>
        </div>
        <emoji-picker id="emoji-picker" class="hidden"></emoji-picker>
      </div>
    </div>

    <div id="articles-view" class="view-panel">
      <!-- Screen 1: Articles List -->
      <div id="av-list" class="av-screen active-screen">
        <h3 class="av-title">How can we help you?</h3>
        
        <div class="av-items" id="articles-list-container">
          <!-- Articles will be injected here via API -->
        </div>
      </div>

      <!-- Screen 2: Article Detail -->
      <div id="av-detail" class="av-screen" style="display: none;">
        <div class="av-detail-header">
          <button id="av-back-btn" class="header-icon-btn" style="background-color: var(--primary); color: white; border-radius: 50%; padding: 6px; margin-right: 12px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div class="av-detail-title-group">
            <h3 id="av-detail-title">Loading...</h3>
            <p id="av-detail-meta"></p>
          </div>
          <button class="header-icon-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>
          </button>
        </div>
        
        <div class="av-detail-content" id="article-viewer-content">
          <!-- Article HTML content will be injected here via API -->
        </div>
      </div>
    </div>
  </div>
  <div id="launcher">
    <div class="launcher-cat">
      <div class="mini-cat">
        <div class="mini-cat-ear mini-cat-ear-l"></div>
        <div class="mini-cat-ear mini-cat-ear-r"></div>
        <div class="mini-cat-head">
          <div class="mini-cat-eye mini-cat-eye-l"><div class="mini-cat-pupil"></div><div class="mini-cat-glint"></div></div>
          <div class="mini-cat-eye mini-cat-eye-r"><div class="mini-cat-pupil"></div><div class="mini-cat-glint"></div></div>
          <div class="mini-cat-nose"></div>
          <div class="mini-cat-mouth"></div>
          <div class="mini-cat-whisker mini-cat-wl1"></div>
          <div class="mini-cat-whisker mini-cat-wl2"></div>
          <div class="mini-cat-whisker mini-cat-wl3"></div>
          <div class="mini-cat-whisker mini-cat-wr1"></div>
          <div class="mini-cat-whisker mini-cat-wr2"></div>
          <div class="mini-cat-whisker mini-cat-wr3"></div>
        </div>
      </div>
    </div>
    <div class="launcher-close">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
    </div>
    <div id="unread-badge" class="hidden">0</div>
  </div>

  <div id="notification-toast" class="hidden">
    <div class="toast-avatar">
      <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="20" fill="#FF7A00"/>
        <path d="M13 22C13 22 16 26 20 26C24 26 27 22 27 22" stroke="white" stroke-width="2" stroke-linecap="round"/>
        <circle cx="15" cy="16" r="2" fill="white"/>
        <circle cx="25" cy="16" r="2" fill="white"/>
      </svg>
    </div>
    <div class="toast-content">
      <div class="toast-title">Support Team</div>
      <div class="toast-message" id="toast-message-text"></div>
    </div>
    <div class="toast-close" id="toast-close">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
    </div>
  </div>
  </div>
`;

