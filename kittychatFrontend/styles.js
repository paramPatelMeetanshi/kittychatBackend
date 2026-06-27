export const widgetStyles = `
  :host {
    --primary: #FF7A00;
    --secondary: #111111;
    --bg-white: #FFFFFF;
    --bg-light: #F4F4F5;
    --gray: #E0E0E0;
    --text-dark: #222222;
    --text-muted: #737373;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }
  
  /* Hide Scrollbar UX and Reset */
  * {
    box-sizing: border-box;
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  *::-webkit-scrollbar {
    display: none;
  }
  
  #kittychat-container {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    position: relative;
  }

  #launcher {
    width: 80px;
    height: 80px;
    background-color: transparent;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: transform 0.2s ease;
    z-index: 2;
  }

  #launcher:hover {
    transform: scale(1.05) translateY(-2px);
  }

  .launcher-cat {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  /* Mini CSS Cat Mascot */
  .mini-cat {
    position: relative;
    width: 52px;
    height: 52px;
  }
  .mini-cat-ear {
    position: absolute;
    top: 0;
    width: 16px;
    height: 18px;
    background: #ff7c12;
    z-index: 1;
  }
  .mini-cat-ear-l {
    left: 6px;
    border-radius: 3px 60% 3px 40%;
    transform: rotate(-12deg);
  }
  .mini-cat-ear-r {
    right: 6px;
    border-radius: 60% 3px 40% 3px;
    transform: rotate(12deg);
  }
  .mini-cat-ear::after {
    content: '';
    position: absolute;
    top: 4px;
    left: 50%;
    transform: translateX(-50%);
    width: 8px;
    height: 10px;
    background: #ffadb5;
    border-radius: 2px 50% 2px 50%;
  }
  .mini-cat-ear-r::after {
    border-radius: 50% 2px 50% 2px;
  }
  .mini-cat-head {
    position: absolute;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
    width: 44px;
    height: 40px;
    background: #ff7c12;
    border-radius: 50% 50% 46% 46% / 55% 55% 45% 45%;
    z-index: 2;
    box-shadow: inset -3px -3px 8px #cc4f00, inset 2px 2px 6px #ffaa40;
    overflow: visible;
  }
  .mini-cat-eye {
    position: absolute;
    top: 12px;
    width: 12px;
    height: 12px;
    background: #0b0c10;
    border-radius: 50%;
    overflow: hidden;
  }
  .mini-cat-eye-l { left: 7px; }
  .mini-cat-eye-r { right: 7px; }
  .mini-cat-pupil {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 50% 70%, #3fc5ff 0%, #0e70e3 50%, #011d4d 100%);
    border-radius: 50%;
  }
  .mini-cat-glint {
    position: absolute;
    top: 2px;
    left: 3px;
    width: 4px;
    height: 4px;
    background: white;
    border-radius: 50%;
    opacity: 0.95;
  }
  .mini-cat-nose {
    position: absolute;
    top: 24px;
    left: 50%;
    transform: translateX(-50%);
    width: 5px;
    height: 4px;
    background: #ff728a;
    border-radius: 50% 50% 60% 60% / 40% 40% 80% 80%;
  }
  .mini-cat-mouth {
    position: absolute;
    top: 28px;
    left: 50%;
    transform: translateX(-50%);
    width: 8px;
    height: 5px;
    background: #40220d;
    border-radius: 0 0 5px 5px;
  }
  .mini-cat-whisker {
    position: absolute;
    top: 24px;
    width: 12px;
    height: 1.5px;
    background: rgba(255,255,255,0.85);
    border-radius: 1px;
  }
  .mini-cat-wl1 { left: -6px; transform: rotate(8deg); }
  .mini-cat-wl2 { left: -8px; top: 27px; transform: rotate(-2deg); }
  .mini-cat-wl3 { left: -5px; top: 30px; transform: rotate(-10deg); }
  .mini-cat-wr1 { right: -6px; transform: rotate(-8deg); }
  .mini-cat-wr2 { right: -8px; top: 27px; transform: rotate(2deg); }
  .mini-cat-wr3 { right: -5px; top: 30px; transform: rotate(10deg); }

  /* Breathing animation for the mini cat */
  @keyframes miniCatBreathe {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    50% { transform: translateX(-50%) translateY(1px); }
  }
  .mini-cat-head {
    animation: miniCatBreathe 3s infinite ease-in-out;
  }

  .launcher-close {
    display: none;
  }

  #launcher.open .launcher-cat {
    display: none;
  }

  #launcher.open .launcher-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    background-color: var(--primary);
    border-radius: 50%;
    box-shadow: 0 4px 16px rgba(255, 122, 0, 0.4);
    color: white;
  }

  #unread-badge {
    position: absolute;
    top: 5px;
    right: 5px;
    background-color: #EF4444;
    color: white;
    font-size: 12px;
    font-weight: 700;
    min-width: 20px;
    height: 20px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 6px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    z-index: 3;
    animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  
  @keyframes popIn {
    0% { transform: scale(0); }
    100% { transform: scale(1); }
  }

  #notification-toast {
    position: absolute;
    bottom: 85px;
    right: 20px;
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(255, 122, 0, 0.2);
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 2;
    cursor: pointer;
    animation: slideInRight 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    max-width: 300px;
    transition: opacity 0.3s ease;
  }
  
  @keyframes slideInRight {
    0% { transform: translateX(50px); opacity: 0; }
    100% { transform: translateX(0); opacity: 1; }
  }

  .toast-avatar {
    flex-shrink: 0;
  }

  .toast-content {
    flex: 1;
    overflow: hidden;
  }

  .toast-title {
    font-size: 13px;
    font-weight: 700;
    color: var(--secondary);
    margin-bottom: 2px;
  }

  .toast-message {
    font-size: 13px;
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .toast-close {
    color: #A0A0A0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    margin-left: 4px;
  }
  .toast-close:hover {
    color: var(--secondary);
  }

  #chat-window {
    position: absolute;
    bottom: 80px;
    right: 0;
    width: 380px;
    max-width: calc(100vw - 40px);
    height: calc(100vh - 120px);
    min-height: 400px;
    max-height: 680px;
    background-color: var(--bg-white);
    border-radius: 16px;
    box-shadow: 0 12px 40px rgba(255, 122, 0, 0.25);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transform-origin: bottom right;
    transform: translateY(20px) scale(0.95);
    opacity: 0;
    transition: transform 0.22s cubic-bezier(0.4, 0, 1, 1), opacity 0.2s ease-in, width 0.35s cubic-bezier(0.25, 1, 0.5, 1), height 0.35s cubic-bezier(0.25, 1, 0.5, 1), max-height 0.35s cubic-bezier(0.25, 1, 0.5, 1);
    z-index: 1;
    pointer-events: none;
    will-change: transform, opacity;
  }
  
  #chat-window.open {
    transform: translateY(0) scale(1);
    opacity: 1;
    transition: transform 0.32s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease-out, width 0.35s cubic-bezier(0.25, 1, 0.5, 1), height 0.35s cubic-bezier(0.25, 1, 0.5, 1), max-height 0.35s cubic-bezier(0.25, 1, 0.5, 1);
    pointer-events: auto;
  }

  /* Expand animation */
  #chat-window.expanded {
    width: 550px;
    max-width: calc(100vw - 40px);
    height: calc(100vh - 120px);
    max-height: 900px;
  }

  #header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: linear-gradient(135deg, #FF8F00 0%, #FF6B00 100%);
    border-bottom: none;
    flex-shrink: 0;
  }

  .header-icon-btn {
    background: none;
    border: none;
    font-size: 18px;
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: all 0.2s ease;
  }

  .header-icon-btn.active {
    color: #FFFFFF;
  }

  .header-icon-btn:hover {
    color: #FFFFFF;
    background-color: rgba(255, 255, 255, 0.1);
  }

  .pill-tabs {
    display: flex;
    background-color: rgba(0, 0, 0, 0.15);
    border-radius: 20px;
    padding: 4px;
    gap: 4px;
  }

  .tab {
    padding: 8px 10px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.9);
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    display: flex;
    align-items: center;
    gap: 0;
  }

  .tab .tab-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .tab .tab-text {
    max-width: 0;
    opacity: 0;
    overflow: hidden;
    white-space: nowrap;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  }

  .tab:hover {
    background-color: rgba(255,255,255,0.1);
  }

  .tab.active {
    padding: 8px 16px;
    background-color: #FFFFFF;
    color: var(--primary);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .tab.active .tab-text {
    max-width: 100px;
    opacity: 1;
    margin-left: 8px;
  }

  #header-main {
    background-color: var(--bg-white);
    padding: 24px 20px 20px 20px;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 16px;
    border-bottom: 1px solid var(--bg-light);
    flex-shrink: 0;
  }

  .messages-avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background-color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 8px 24px rgba(255, 122, 0, 0.25);
  }

  #header-info {
    flex: 1;
  }

  #header-title {
    margin: 0 0 4px 0;
    font-size: 18px;
    font-weight: 800;
    color: var(--secondary);
    letter-spacing: -0.3px;
  }

  #header-subtitle {
    margin: 0;
    font-size: 14px;
    color: var(--text-muted);
  }

  #message-feed {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background-color: var(--bg-white);
  }
  
  .message {
    max-width: 80%;
    padding: 12px 16px;
    border-radius: 18px;
    font-size: 14px;
    line-height: 1.5;
    word-wrap: break-word;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .message.agent {
    align-self: flex-start;
    background-color: #FFF2E8;
    color: #1A1A1A;
    border-radius: 20px;
    border: none;
    font-weight: 400;
    padding: 14px 20px;
    font-family: inherit;
    font-size: 15px;
  }

  .message.user {
    align-self: flex-end;
    background-color: var(--primary);
    color: white;
    border-bottom-right-radius: 4px;
    box-shadow: 0 2px 8px rgba(255, 122, 0, 0.2);
  }

  .quick-replies-grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 0 20px 10px 20px;
    flex-shrink: 0;
  }

  .qr-row {
    display: flex;
    gap: 8px;
    width: 100%;
  }

  .qr-row.full-width .quick-reply-btn {
    width: 100%;
    justify-content: center;
  }

  .quick-reply-btn {
    background-color: var(--bg-white);
    border: 1px solid rgba(255, 122, 0, 0.3);
    border-radius: 20px;
    padding: 10px 14px;
    font-size: 13px;
    font-weight: 500;
    color: var(--secondary);
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
  }

  .quick-reply-btn > svg:first-child {
    color: var(--primary);
    flex-shrink: 0;
  }
  
  .quick-reply-btn span {
    flex: 1;
    text-align: left;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .quick-reply-btn .qr-caret {
    color: rgba(255, 122, 0, 0.5);
    flex-shrink: 0;
    transition: transform 0.2s ease;
  }

  .quick-reply-btn:hover {
    border-color: var(--primary);
    background-color: #FFF9F5;
  }
  
  .quick-reply-btn:hover .qr-caret {
    transform: translateX(2px);
    color: var(--primary);
  }

  .input-area-new {
    padding: 10px 20px 20px 20px;
    background-color: var(--bg-white);
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex-shrink: 0;
  }

  .input-wrapper-new {
    border: 1px solid var(--primary);
    border-radius: 16px;
    padding: 12px 14px 10px 14px;
    display: flex;
    flex-direction: column;
    background-color: var(--bg-white);
    box-shadow: 0 4px 16px rgba(255, 122, 0, 0.08);
    transition: box-shadow 0.2s ease, border-color 0.2s ease;
  }
  
  .input-wrapper-new:focus-within {
    box-shadow: 0 4px 20px rgba(255, 122, 0, 0.15);
    border-color: #FF6B00;
  }

  #chat-input {
    border: none;
    outline: none;
    resize: none;
    max-height: 100px;
    min-height: 24px;
    font-family: inherit;
    font-size: 14px;
    line-height: 1.5;
    color: var(--secondary);
    background: transparent;
    padding-bottom: 8px;
  }
  
  #chat-input::placeholder {
    color: #B0B0B0;
  }

  .input-actions-new {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .left-actions {
    display: flex;
    gap: 4px;
  }

  .icon-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 18px;
    color: #A0A0A0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px;
    border-radius: 50%;
    transition: all 0.2s;
    height: 32px;
    width: 32px;
  }

  .icon-btn:hover {
    background-color: var(--bg-light);
    color: var(--primary);
  }
  
  .send-btn-new {
    background-color: var(--primary);
    color: white;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(255, 122, 0, 0.4);
  }
  
  .send-btn-new svg {
    margin-left: -2px;
    margin-top: 2px;
  }

  .send-btn-new:hover {
    background-color: #E86A00;
    transform: scale(1.05);
  }

  .branding {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    font-size: 12px;
    color: var(--primary);
  }
  
  .branding strong {
    font-weight: 700;
  }
  
  .branding-cat {
    color: var(--primary);
  }

  .hidden {
    display: none !important;
  }

  #emoji-picker {
    position: absolute;
    bottom: 80px;
    left: 20px;
    z-index: 100;
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    border-radius: 8px;
    --num-columns: 8;
    --emoji-size: 1.3rem;
  }


  .lead-capture {
    background-color: var(--bg-white);
    border: 2px solid var(--primary);
    border-radius: 12px;
    padding: 16px;
    margin: 10px 0;
    font-size: 14px;
    animation: fadeIn 0.4s ease;
  }
  
  .lead-capture p {
    margin: 0 0 12px 0;
    font-weight: 600;
    color: var(--secondary);
    line-height: 1.4;
  }

  .lead-capture input {
    width: calc(100% - 24px);
    padding: 10px 12px;
    margin-bottom: 10px;
    border: 1px solid var(--gray);
    border-radius: 8px;
    outline: none;
    transition: border-color 0.2s;
  }
  
  .lead-capture input:focus {
    border-color: var(--primary);
  }

  .lead-capture button {
    background-color: var(--primary);
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 8px;
    cursor: pointer;
    width: 100%;
    font-weight: bold;
    font-size: 14px;
    transition: background-color 0.2s;
  }
  .lead-capture button:hover {
    background-color: #E66A00;
  }

  .view-panel {
    display: none;
    flex: 1;
    flex-direction: column;
    overflow: hidden;
  }

  .view-panel.active-view {
    display: flex;
    animation: tabSwitch 0.35s cubic-bezier(0.25, 1, 0.5, 1);
  }

  @keyframes tabSwitch {
    0% { opacity: 0; transform: scale(0.97) translateY(5px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }

  #home-view {
    background-color: #f7f9fa;
    overflow-y: auto;
  }

  .home-hero {
    background: linear-gradient(135deg, #FF8F00 0%, #FF6B00 100%);
    padding: 24px 24px 44px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: white;
    flex-shrink: 0;
    position: relative;
    overflow: hidden;
  }

  .home-hero::before {
    content: '';
    position: absolute;
    top: -20px;
    right: -20px;
    width: 150px;
    height: 150px;
    background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
  }
  
  .home-hero::after {
    content: '';
    position: absolute;
    bottom: -40px;
    left: -20px;
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
  }

  .home-hero-avatar {
    width: 56px;
    height: 56px;
    background: white;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
    box-shadow: 0 8px 24px rgba(255, 107, 0, 0.3);
    position: relative;
    z-index: 1;
  }

  .home-hero-title {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    letter-spacing: -0.5px;
    position: relative;
    z-index: 1;
  }

  .home-hero-subtitle {
    margin: 8px 0 0 0;
    opacity: 0.9;
    font-size: 15px;
    position: relative;
    z-index: 1;
  }

  .home-content {
    padding: 0 24px 24px 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: -20px;
    position: relative;
    z-index: 2;
  }

  .home-section-title {
    font-weight: 600;
    color: white;
    margin-bottom: 4px;
    text-shadow: 0 2px 8px rgba(255, 107, 0, 0.4);
  }

  .home-card {
    background: white;
    border-radius: 16px;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.05);
    border: 1px solid rgba(0,0,0,0.02);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  }

  .home-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(255, 107, 0, 0.15);
  }

  .home-card.stacked {
    flex-direction: column;
    align-items: stretch;
    padding: 0;
  }

  .hc-header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
    border-bottom: 1px solid #F4F4F5;
  }

  .hc-icon {
    width: 44px;
    height: 44px;
    background: #FFF0E6;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary);
  }

  .hc-text {
    flex: 1;
    font-weight: 600;
    color: #222;
    font-size: 15px;
  }

  .hc-links {
    padding: 8px 20px 20px 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .hc-link {
    color: #666;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .hc-link::before {
    content: '→';
    font-size: 14px;
    color: var(--primary);
    opacity: 0;
    transform: translateX(-10px);
    transition: all 0.2s;
    width: 0;
    overflow: hidden;
  }

  .hc-link:hover {
    color: #111;
  }

  .hc-link:hover::before {
    opacity: 1;
    transform: translateX(0);
    width: 14px;
  }

  .home-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
    margin-top: 8px;
    padding-bottom: 24px;
  }

  .home-card-small {
    background: white;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.05);
    border: 1px solid rgba(0,0,0,0.02);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .hcs-title {
    color: #888;
    font-size: 14px;
    margin: 0;
  }

  .hcs-status {
    font-weight: 600;
    color: #222;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
  }

  .status-dot {
    width: 10px;
    height: 10px;
    background-color: #10B981;
    border-radius: 50%;
  }

  .av-screen {
    display: none;
    flex-direction: column;
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    background-color: white;
    width: 100%;
    min-width: 0;
  }

  .av-screen.active-screen {
    display: flex;
  }

  .av-title {
    text-align: center;
    color: var(--secondary);
    font-size: 18px;
    margin: 24px 0 16px 0;
  }

  .av-items {
    padding: 0 16px;
  }

  .av-category {
    display: flex;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid var(--bg-light);
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .av-category:hover {
    background-color: #fcfcfc;
  }

  .av-cat-content {
    flex: 1;
  }

  .av-cat-content h4 {
    margin: 0 0 4px 0;
    color: var(--secondary);
    font-size: 16px;
  }

  .av-cat-content p {
    margin: 0 0 8px 0;
    color: var(--text-muted);
    font-size: 13px;
    line-height: 1.4;
  }

  .av-cat-meta {
    font-size: 12px;
    color: #666;
  }

  .av-cat-arrow {
    padding: 0 8px;
  }

  /* Article Detail */
  .av-detail-header {
    display: flex;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid var(--bg-light);
    position: sticky;
    top: 0;
    background: white;
    z-index: 10;
  }

  .av-detail-title-group {
    flex: 1;
    text-align: center;
    min-width: 0;
    padding: 0 8px;
  }

  #av-detail-title {
    margin: 0;
    font-size: 16px;
    color: var(--secondary);
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  #av-detail-meta {
    margin: 4px 0 0 0;
    font-size: 12px;
    color: var(--text-muted);
  }

  .av-detail-content {
    padding: 16px;
    color: var(--secondary);
    font-size: 15px;
    line-height: 1.6;
    word-break: break-word;
    overflow-x: hidden;
    width: 100%;
    min-width: 0;
  }

  .av-detail-content * {
    max-width: 100% !important;
    box-sizing: border-box !important;
  }

  .av-detail-content img,
  .av-detail-content video,
  .av-detail-content iframe {
    max-width: 100% !important;
    height: auto !important;
    border-radius: 8px;
  }

  .av-list-bullets {
    padding-left: 20px;
    margin-top: 0;
  }
  
  .av-list-bullets li {
    margin-bottom: 8px;
  }

  .av-list-numbers {
    list-style: none;
    padding-left: 0;
  }

  .av-list-numbers li {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }

  .av-list-numbers span {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background-color: var(--primary);
    color: white;
    border-radius: 50%;
    font-size: 12px;
    font-weight: bold;
  }

  .av-list-numbers a {
    color: var(--primary);
    text-decoration: underline;
    cursor: pointer;
  }

  .av-heading-border {
    font-size: 20px;
    color: var(--primary);
    border-left: 4px solid var(--primary);
    padding-left: 12px;
    margin: 32px 0 16px 0;
  }

  .av-video-placeholder {
    width: 100%;
    height: 200px;
    background-color: #222;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    margin: 24px 0 8px 0;
    cursor: pointer;
  }

  .av-video-play {
    width: 48px;
    height: 48px;
    background-color: rgba(255,255,255,0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
    transition: background-color 0.2s;
  }

  .av-video-placeholder:hover .av-video-play {
    background-color: var(--primary);
  }

  .av-callout {
    background-color: #FFFAE5;
    border-left: 4px solid #F5C518;
    padding: 16px;
    border-radius: 0 8px 8px 0;
    margin: 24px 0;
    font-size: 14px;
  }

  .av-detail-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: var(--text-muted);
    font-size: 13px;
    margin-top: 48px;
    padding-top: 24px;
    border-top: 1px solid var(--bg-light);
  }

  /* Responsive Design for Mobile/Tablets */
  @media screen and (max-width: 768px) {
    :host {
      bottom: 0 !important;
      right: 0 !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      pointer-events: none; /* Let clicks pass through empty areas */
    }

    #kittychat-container {
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    #launcher {
      position: absolute;
      bottom: 20px;
      right: 20px;
      pointer-events: auto;
      width: 60px;
      height: 60px;
    }

    #chat-window {
      position: absolute !important;
      bottom: 0 !important;
      right: 0 !important;
      width: 100% !important;
      max-width: 100% !important;
      height: 100% !important;
      max-height: 100% !important;
      border-radius: 0 !important;
      z-index: 9999 !important;
      pointer-events: none;
      opacity: 0;
      transform: translateY(100%) !important;
      transform-origin: bottom center !important;
      transition: transform 0.32s cubic-bezier(0.25, 1, 0.5, 1) !important, opacity 0.25s ease !important;
    }

    #chat-window.open {
      pointer-events: auto;
      opacity: 1;
      transform: translateY(0) !important;
      transition: transform 0.32s cubic-bezier(0.25, 1, 0.5, 1) !important, opacity 0.25s ease !important;
    }

    #expand-btn {
      display: none !important;
    }

    #header-top {
      padding: 10px;
    }

    .pill-tabs {
      margin: 0 8px;
    }
    
    .tab {
      padding: 6px 10px;
      font-size: 12px;
    }

    #message-feed {
      padding: 15px;
    }
    
    #quick-replies {
      padding: 0 15px 10px 15px;
      justify-content: center;
    }

    .quick-reply-btn {
      padding: 6px 12px;
      font-size: 12px;
    }

    #input-area {
      padding: 10px 15px 15px 15px;
    }

    #emoji-picker {
      width: calc(100vw - 30px);
      left: 15px;
      bottom: 110px;
    }
  }
`;
