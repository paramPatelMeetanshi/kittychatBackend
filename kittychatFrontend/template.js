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
          <img src="${new URL('./kitty_logo.png', import.meta.url).href}" alt="KittyChat" style="width: 100%; height: 100%; object-fit: contain; border-radius: 10px;" />
        </div>
        <h2 class="home-hero-title">KittyChat</h2>
        <p class="home-hero-subtitle">How can we help?</p>
      </div>
      <div class="home-content">
        <div class="home-card home-card-gradient" id="hc-send-msg">
          <div class="hc-icon-gradient">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div class="hc-card-body">
            <div class="hc-text-bold">Send a message</div>
            <div class="hc-text-sub">We typically reply within a few minutes</div>
          </div>
          <div class="hc-arrow"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg></div>
        </div>

        <div class="home-card home-card-gradient" id="hc-read-articles">
          <div class="hc-icon-gradient hc-icon-articles">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><line x1="9" y1="7" x2="16" y2="7"/><line x1="9" y1="11" x2="14" y2="11"/></svg>
          </div>
          <div class="hc-card-body">
            <div class="hc-text-bold">Help articles</div>
            <div class="hc-text-sub">Browse our knowledge base</div>
          </div>
          <div class="hc-arrow"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m9 18 6-6-6-6"/></svg></div>
        </div>

        <div class="home-articles-list">
          <div class="home-article-item hc-link">
            <div class="home-article-dot"></div>
            <span>How to install a chat widget software on my website?</span>
          </div>
          <div class="home-article-item hc-link">
            <div class="home-article-dot"></div>
            <span>How to use Message Triggers and Quick Replies</span>
          </div>
          <div class="home-article-item hc-link">
            <div class="home-article-dot"></div>
            <span>How to replace the default chatbox button</span>
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
      
      <div id="quick-replies" class="quick-replies-grid hidden">
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
      <div class="kc-cat-container" id="kc-cat-artwork">
        <div class="kc-cat-ground-shadow"></div>
        <div class="kc-cat-tail"><svg class="kc-cat-tail-svg" viewBox="0 0 100 110"><path d="M20,100 Q60,90 65,55 T80,15" fill="none" stroke="#ff7c12" stroke-width="15" stroke-linecap="round"/><path d="M74,27 Q77,21 80,15" fill="none" stroke="#ffffff" stroke-width="15" stroke-linecap="round"/></svg></div>
        <div class="kc-cat-hip kc-left"></div>
        <div class="kc-cat-paw-back kc-left"></div>
        <div class="kc-cat-hip kc-right"></div>
        <div class="kc-cat-paw-back kc-right"></div>
        <div class="kc-cat-body"><div class="kc-cat-body-stripe kc-left kc-s1"></div><div class="kc-cat-body-stripe kc-right kc-s1"></div><div class="kc-cat-body-stripe kc-left kc-s2"></div><div class="kc-cat-body-stripe kc-right kc-s2"></div><div class="kc-cat-body-stripe kc-left kc-s3"></div><div class="kc-cat-body-stripe kc-right kc-s3"></div></div>
        <div class="kc-cat-leg-front kc-left"></div>
        <div class="kc-cat-leg-front kc-right"></div>
        <div class="kc-cat-paw-front kc-left"></div>
        <div class="kc-cat-paw-front kc-right"></div>
        <div class="kc-cat-head-group"><div class="kc-cat-head-joint">
          <div class="kc-cat-ear kc-left"><div class="kc-cat-ear-inner"></div></div>
          <div class="kc-cat-ear kc-right"><div class="kc-cat-ear-inner"></div></div>
          <div class="kc-cat-hair-tuft-1"></div><div class="kc-cat-hair-tuft-2"></div><div class="kc-cat-hair-tuft-3"></div><div class="kc-cat-hair-tuft-4"></div>
          <div class="kc-cat-head">
            <div class="kc-cat-cheek-fluff kc-left"><div class="kc-fluff-spike kc-spike-1"></div><div class="kc-fluff-spike kc-spike-2"></div><div class="kc-fluff-spike kc-spike-3"></div><div class="kc-fluff-spike kc-spike-4"></div></div>
            <div class="kc-cat-cheek-fluff kc-right"><div class="kc-fluff-spike kc-spike-1"></div><div class="kc-fluff-spike kc-spike-2"></div><div class="kc-fluff-spike kc-spike-3"></div><div class="kc-fluff-spike kc-spike-4"></div></div>
            <div class="kc-cat-eyebrow kc-left"></div>
            <div class="kc-cat-eyebrow kc-right"></div>
            <div class="kc-cat-eye kc-left"><div class="kc-cat-eye-iris"><div class="kc-cat-eye-pupil"></div></div><div class="kc-cat-eye-highlight-1"></div><div class="kc-cat-eye-highlight-2"></div><div class="kc-cat-eye-highlight-3"></div><div class="kc-cat-eyelid"></div></div>
            <div class="kc-cat-eye kc-right"><div class="kc-cat-eye-iris"><div class="kc-cat-eye-pupil"></div></div><div class="kc-cat-eye-highlight-1"></div><div class="kc-cat-eye-highlight-2"></div><div class="kc-cat-eye-highlight-3"></div><div class="kc-cat-eyelid"></div></div>
            <div class="kc-cat-muzzle-group">
              <div class="kc-cat-muzzle-pad kc-left"><div class="kc-whisker-dot-group"><div class="kc-whisker-dot kc-d1"></div><div class="kc-whisker-dot kc-d2"></div><div class="kc-whisker-dot kc-d3"></div></div></div>
              <div class="kc-cat-muzzle-pad kc-right"><div class="kc-whisker-dot-group"><div class="kc-whisker-dot kc-d1"></div><div class="kc-whisker-dot kc-d2"></div><div class="kc-whisker-dot kc-d3"></div></div></div>
              <div class="kc-cat-whiskers-container kc-left"><div class="kc-whisker-line kc-w1"></div><div class="kc-whisker-line kc-w2"></div><div class="kc-whisker-line kc-w3"></div></div>
              <div class="kc-cat-whiskers-container kc-right"><div class="kc-whisker-line kc-w1"></div><div class="kc-whisker-line kc-w2"></div><div class="kc-whisker-line kc-w3"></div></div>
              <div class="kc-cat-nose"></div>
              <div class="kc-cat-open-mouth"><div class="kc-cat-tongue"></div></div>
            </div>
          </div>
        </div></div>
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

