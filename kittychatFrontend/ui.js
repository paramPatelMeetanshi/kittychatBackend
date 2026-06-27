const baseUrl = new URL(".", import.meta.url).href;

export class KittyUI {
  constructor(shadowRoot, socket) {
    this.shadow = shadowRoot;
    this.socket = socket;

    // UI Elements
    this.launcher = this.shadow.getElementById("launcher");
    this.chatWindow = this.shadow.getElementById("chat-window");
    this.chatInput = this.shadow.getElementById("chat-input");
    this.messageFeed = this.shadow.getElementById("message-feed");
    this.sendBtn = this.shadow.getElementById("send-btn");

    // Attachment
    this.attachBtn = this.shadow.getElementById("attach-btn");
    this.fileInput = this.shadow.getElementById("file-input");

    // Emoji
    this.emojiBtn = this.shadow.getElementById("emoji-btn");
    this.emojiPicker = this.shadow.getElementById("emoji-picker");

    // Notifications
    this.unreadBadge = this.shadow.getElementById("unread-badge");
    this.notificationToast = this.shadow.getElementById("notification-toast");
    this.toastMessageText = this.shadow.getElementById("toast-message-text");
    this.toastClose = this.shadow.getElementById("toast-close");

    // State
    this.typingTimeout = null;
    this.stopTypingTimeout = null;
    this.unreadCount = 0;
    this.toastTimeout = null;
    this.leadCapturedOrSkipped =
      sessionStorage.getItem("leadCapturedOrSkipped") === "true";

    this.initEvents();
    this.initMagicBrowse();
    this.initEyeTracking();

    // Show Lead Capture after 30 seconds if not already skipped/submitted
    if (!this.leadCapturedOrSkipped) {
      setTimeout(() => this.showLeadCapture(), 30000);
    }

    // Inject dummy messages for styling/avatar test
    setTimeout(() => {
      this.renderMessageObj({
        id: "dummy-ai",
        sender: "KittyChat AI",
        content: "👋 Hi there! How can we help you today?",
        fromAgent: true,
        fromAI: true,
        timestamp: Date.now() - 60000,
      });
    }, 100);
  }

  initEyeTracking() {
    const catContainer = this.shadow.getElementById('kc-cat-artwork');
    const headJoint = this.shadow.querySelector('.kc-cat-head-joint');
    const leftIris = this.shadow.querySelector('.kc-cat-eye.kc-left .kc-cat-eye-iris');
    const rightIris = this.shadow.querySelector('.kc-cat-eye.kc-right .kc-cat-eye-iris');
    const eyelids = this.shadow.querySelectorAll('.kc-cat-eyelid');

    if (!catContainer || !headJoint || !leftIris || !rightIris) return;

    // Eye + head tracking
    document.addEventListener('mousemove', (e) => {
      if (this.chatWindow.classList.contains('open')) return;
      const headEl = this.shadow.querySelector('.kc-cat-head');
      if (!headEl) return;
      const rect = headEl.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 2) {
        leftIris.style.transform = 'translate(0px, 0px)';
        rightIris.style.transform = 'translate(0px, 0px)';
        headJoint.style.transform = 'translate(0px, 0px) rotate(0deg)';
        return;
      }
      const angle = Math.atan2(dy, dx);
      const maxOffset = 9;
      const strength = Math.min(dist * 0.06, maxOffset);
      const tx = Math.cos(angle) * strength;
      const ty = Math.sin(angle) * strength;
      leftIris.style.transform = `translate(${tx}px, ${ty}px)`;
      rightIris.style.transform = `translate(${tx}px, ${ty}px)`;
      const headStrength = Math.min(dist * 0.035, 6);
      const hx = Math.cos(angle) * headStrength;
      const hy = Math.sin(angle) * headStrength;
      const hRot = hx * 0.3;
      headJoint.style.transform = `translate(${hx}px, ${hy}px) rotate(${hRot}deg)`;
    });

    // Auto-blinking
    const triggerBlink = () => {
      eyelids.forEach(lid => lid.style.height = '100%');
      setTimeout(() => eyelids.forEach(lid => lid.style.height = '0%'), 150);
      setTimeout(triggerBlink, 3000 + Math.random() * 3000);
    };
    setTimeout(triggerBlink, 4000);

    // Happy face on click
    let isDown = false;
    catContainer.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      isDown = true;
      catContainer.classList.add('kc-is-clicked');
    });
    document.addEventListener('mouseup', () => {
      if (isDown) {
        isDown = false;
        setTimeout(() => { if (!isDown) catContainer.classList.remove('kc-is-clicked'); }, 400);
      }
    });
    catContainer.addEventListener('touchstart', () => { isDown = true; catContainer.classList.add('kc-is-clicked'); }, { passive: true });
    catContainer.addEventListener('touchend', () => { isDown = false; setTimeout(() => { if (!isDown) catContainer.classList.remove('kc-is-clicked'); }, 400); }, { passive: true });
  }

  initEvents() {
    // Launcher Toggle
    this.launcher.addEventListener("click", () => {
      this.chatWindow.classList.toggle("open");
      this.launcher.classList.toggle("open");
      if (this.chatWindow.classList.contains("open")) {
        this.unreadCount = 0;
        if (this.unreadBadge) this.unreadBadge.classList.add("hidden");
        if (this.notificationToast) this.notificationToast.classList.add("hidden");
        
        this.shadow.querySelector('.tab[data-tab="messages"]')?.click();
        
        // Scroll to the latest message
        setTimeout(() => {
          this.messageFeed.scrollTop = this.messageFeed.scrollHeight;
        }, 100);

        if (window.innerWidth > 768) {
          setTimeout(() => this.chatInput.focus(), 300);
        }
      }
    });

    if (this.notificationToast) {
      this.notificationToast.addEventListener("click", (e) => {
        if (e.target.closest("#toast-close")) return;
        this.launcher.click();
      });
    }
    
    if (this.toastClose) {
      this.toastClose.addEventListener("click", () => {
        this.notificationToast.classList.add("hidden");
      });
    }

    // Header Actions
    const minimizeBtn = this.shadow.getElementById("minimize-btn");
    const expandBtn = this.shadow.getElementById("expand-btn");
    const homeBtn = this.shadow.getElementById("home-btn");

    if (minimizeBtn) {
      minimizeBtn.addEventListener("click", () => {
        this.chatWindow.classList.remove("open");
        this.launcher.classList.remove("open");
      });
    }

    if (expandBtn) {
      expandBtn.addEventListener("click", () => {
        this.chatWindow.classList.toggle("expanded");
      });
    }

    // Tab Switching
    const tabs = this.shadow.querySelectorAll(".tab");
    const messagesView = this.shadow.getElementById("messages-view");
    const articlesView = this.shadow.getElementById("articles-view");
    const homeView = this.shadow.getElementById("home-view");
    const headerMain = this.shadow.getElementById("header-main");

    const switchToMessages = () => {
      tabs.forEach((t) => t.classList.remove("active"));
      if (homeBtn) homeBtn.classList.remove("active");
      this.shadow
        .querySelector('.tab[data-tab="messages"]')
        ?.classList.add("active");

      messagesView.classList.add("active-view");
      articlesView.classList.remove("active-view");
      homeView.classList.remove("active-view");
      headerMain.style.display = this.messageFeed.children.length > 0 ? "none" : "flex";
    };

    const switchToHome = () => {
      tabs.forEach((t) => t.classList.remove("active"));
      if (homeBtn) homeBtn.classList.add("active");

      homeView.classList.add("active-view");
      messagesView.classList.remove("active-view");
      articlesView.classList.remove("active-view");
      headerMain.style.display = "none";
    };

    if (homeBtn) {
      homeBtn.addEventListener("click", switchToHome);
    }

    tabs.forEach((tab) => {
      tab.addEventListener("click", (e) => {
        const target = e.currentTarget;
        tabs.forEach((t) => t.classList.remove("active"));
        if (homeBtn) homeBtn.classList.remove("active");
        target.classList.add("active");

        const tabName = target.getAttribute("data-tab");
        if (tabName === "messages") {
          messagesView.classList.add("active-view");
          articlesView.classList.remove("active-view");
          homeView.classList.remove("active-view");
          headerMain.style.display = this.messageFeed.children.length > 0 ? "none" : "flex";
        } else {
          messagesView.classList.remove("active-view");
          articlesView.classList.add("active-view");
          homeView.classList.remove("active-view");
          headerMain.style.display = "flex";
        }
      });
    });

    // Wire up home cards
    const hcSendMsg = this.shadow.getElementById("hc-send-msg");
    if (hcSendMsg) hcSendMsg.addEventListener("click", switchToMessages);

    const hcReadArticles = this.shadow.getElementById("hc-read-articles");
    if (hcReadArticles)
      hcReadArticles.addEventListener("click", () => {
        this.shadow.querySelector('.tab[data-tab="articles"]')?.click();
      });

    // 5.1 Articles Tab Navigation
    this.avList = this.shadow.getElementById("av-list");
    this.avDetail = this.shadow.getElementById("av-detail");
    this.avContainer = this.shadow.getElementById("articles-list-container");
    const avBackBtn = this.shadow.getElementById("av-back-btn");

    if (avBackBtn) {
      avBackBtn.addEventListener("click", () => {
        this.avDetail.style.display = "none";
        this.avList.style.display = "flex";
      });
    }

    // Load articles from backend
    this.loadArticles();

    // Quick Replies
    const quickReplies = this.shadow.querySelectorAll(".quick-reply-btn");
    quickReplies.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const textSpan = e.currentTarget.querySelector("span");
        this.chatInput.value = textSpan
          ? textSpan.textContent.trim()
          : e.currentTarget.textContent.trim();
        this.chatInput.focus();
      });
    });

    // 5.1 Articles Tab Logic (Search Removed)
    // The articles tab is still present, but search is removed.

    // 4.1 Live View Before Send (Typing Draft)
    this.chatInput.addEventListener("input", () => {
      const text = this.chatInput.value;

      clearTimeout(this.typingTimeout);
      clearTimeout(this.stopTypingTimeout);

      this.typingTimeout = setTimeout(() => {
        this.socket.send({ type: "typing", isTyping: true, draft: text });
      }, 500);

      this.stopTypingTimeout = setTimeout(() => {
        this.socket.send({ type: "typing", isTyping: false });
      }, 2000);

      this.socket.send({ type: "typing_content", content: text });
    });

    // Send Message on Button Click or Enter Key
    this.sendBtn.addEventListener("click", () => this.sendMessage());
    this.chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // 4.4 File Upload Support
    this.attachBtn.addEventListener("click", () => this.fileInput.click());
    this.fileInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (file) {
        // Validation: 2MB max
        if (file.size > 2 * 1024 * 1024) {
          this.showError("File size must be under 2MB.");
          this.fileInput.value = "";
          return;
        }

        // Validation: Only Images (including GIF) and PDFs
        const isImage = file.type.startsWith("image/");
        const isPdf = file.type === "application/pdf";

        if (!isImage && !isPdf) {
          this.showError("Only images and PDF files are allowed.");
          this.fileInput.value = "";
          return;
        }

        const formData = new FormData();
        formData.append("file", file);

        const oldContent = this.attachBtn.innerHTML;
        this.attachBtn.innerHTML = "⏳";

        try {
          const res = await fetch(`${window.KittyChat?.API_URL || (new URL(import.meta.url).origin + '/api')}/upload`, {
            method: 'POST',
            body: formData
          });
          const result = await res.json();

          if (result.success) {
            this.socket.send({
              type: "message",
              content: "",
              file: result.file,
              name: "Website Visitor",
            });
          }
        } catch (err) {
          console.error("File upload failed:", err);
        } finally {
          this.attachBtn.innerHTML = oldContent;
          this.fileInput.value = "";
        }
      }
    });

    // 4.5 Emoji Picker Toggle
    this.emojiBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.emojiPicker.classList.toggle("hidden");
    });

    // Close emoji picker if clicked outside
    this.shadow.addEventListener("click", (e) => {
      if (!this.emojiPicker.contains(e.target) && e.target !== this.emojiBtn) {
        this.emojiPicker.classList.add("hidden");
      }
    });

    // 4.5 Listen to external emoji-picker-element
    this.emojiPicker.addEventListener("emoji-click", (event) => {
      this.chatInput.value += event.detail.unicode;
      this.chatInput.focus();
      this.emojiPicker.classList.add("hidden");
    });
  }

  // 4.2 Magic Browse (DOM Tracking)
  initMagicBrowse() {
    // Track clicks on host body
    document.body.addEventListener(
      "click",
      (e) => {
        const target = e.target;
        // Exclude clicks inside the widget
        if (target.closest("#kittychat-root")) return;

        const label =
          target.innerText?.trim().substring(0, 50) ||
          target.id ||
          target.tagName;
        if (label) {
          this.socket.send({
            type: "magic_browse",
            action: "click",
            target: label,
          });
        }
      },
      true,
    ); // Use capture phase to catch before stopPropagation

    // Track URL changes (for SPAs)
    let lastUrl = location.href;
    const observer = new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        this.socket.send({
          type: "page_view",
          url: lastUrl,
          title: document.title,
        });
        this.socket.send({
          type: "set_metadata",
          currentPage: lastUrl,
        });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // 4.3 Text Markup & Formatting
  formatMessage(text) {
    // First escape HTML to prevent XSS
    const div = document.createElement("div");
    div.innerText = text;
    let escaped = div.innerHTML;

    // Then apply markdown formatting
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    escaped = escaped.replace(/\*(.*?)\*/g, "<em>$1</em>");
    escaped = escaped.replace(/\n/g, "<br>");
    return escaped;
  }

  sendMessage() {
    const text = this.chatInput.value.trim();
    if (!text) return;

    const hm = this.shadow.getElementById("header-main");
    if (hm) hm.style.display = "none";

    // Send to backend (will render when echoed back)
    this.socket.send({
      type: "message",
      content: text,
      name: "Website Visitor",
    });

    // Clear draft timeouts
    clearTimeout(this.typingTimeout);
    clearTimeout(this.stopTypingTimeout);
    this.socket.send({ type: "typing", isTyping: false });
    this.socket.send({ type: "typing_content", content: "" });

    this.chatInput.value = "";
    this.hideQuickReplies();
  }

  hideQuickReplies() {
    const qr = this.shadow.getElementById("quick-replies");
    if (qr) qr.style.display = "none";
  }

  showQuickReplies() {
    const qr = this.shadow.getElementById("quick-replies");
    if (qr) qr.style.display = "flex";
  }

  handleIncomingMessage(data) {
    switch (data.type) {
      case "history":
        this.messageFeed.innerHTML = "";
        if (data.messages && data.messages.length > 0) {
          data.messages.forEach((msg) => this.renderMessageObj(msg));
          this.hideQuickReplies();
        } else {
          this.showQuickReplies();
        }
        break;
      case "message":
        this.renderMessageObj(data);
        this.hideQuickReplies();
        const hm = this.shadow.getElementById("header-main");
        if (hm) hm.style.display = "none";
        
        const isOwn = data.senderId === this.socket.sessionId || data.fromVisitor;
        if (!isOwn && !this.chatWindow.classList.contains("open")) {
          this.unreadCount++;
          if (this.unreadBadge) {
            this.unreadBadge.innerText = this.unreadCount;
            this.unreadBadge.classList.remove("hidden");
          }
          if (this.notificationToast && this.toastMessageText) {
            this.toastMessageText.innerText = data.content || "Attachment";
            this.notificationToast.classList.remove("hidden");
            
            clearTimeout(this.toastTimeout);
            this.toastTimeout = setTimeout(() => {
              this.notificationToast.classList.add("hidden");
            }, 6000);
          }
        }
        break;
      case "typing":
        this.showTypingIndicator(data.sender, data.isTyping);
        break;
      case "error":
        console.error("Backend Error:", data.message);
        if (data.message === "Unauthorized") {
          console.error("Session unauthorized");
        }
        break;
      case "contact_saved":
        const lcForm = this.shadow.querySelector(".lead-capture");
        if (lcForm) {
          lcForm.innerHTML =
            '<p style="text-align: center; margin: 0; color: #2e7d32;">✅ Email saved!</p>';
          setTimeout(() => lcForm.remove(), 2000);
        }
        break;
    }
  }

  showTypingIndicator(sender, isTyping) {
    let indicator = this.shadow.getElementById("typing-indicator");
    if (!indicator) {
      indicator = document.createElement("div");
      indicator.id = "typing-indicator";
      indicator.style.fontSize = "12px";
      indicator.style.color = "#999";
      indicator.style.padding = "0 15px 10px 15px";
      indicator.style.fontStyle = "italic";
      this.shadow
        .getElementById("messages-view")
        .insertBefore(indicator, this.shadow.getElementById("input-area"));
    }

    if (isTyping) {
      indicator.textContent = `${sender || "Agent"} is typing...`;
    } else {
      indicator.textContent = "";
    }
  }

  renderMessageObj(msg) {
    // msg = { id, sender, senderId, content, timestamp, fromVisitor, fromAgent, file, fromAI }
    const isOwn = msg.senderId === this.socket.sessionId || msg.fromVisitor;
    const senderClass = isOwn ? "user" : "agent";

    this.renderMessage(msg, senderClass);
  }

  renderMessage(msgObj, senderClass) {
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.gap = "12px";
    wrapper.style.marginBottom = "16px";
    wrapper.style.maxWidth = "85%";
    wrapper.style.animation = "fadeIn 0.3s ease";

    if (senderClass === "user") {
      wrapper.style.alignSelf = "flex-end";
      wrapper.style.flexDirection = "row-reverse";
    } else {
      wrapper.style.alignSelf = "flex-start";
    }

    // Avatar for agent
    if (senderClass === "agent") {
      const avatar = document.createElement("div");
      avatar.style.width = "32px";
      avatar.style.height = "32px";
      avatar.style.borderRadius = "50%";
      avatar.style.display = "flex";
      avatar.style.alignItems = "center";
      avatar.style.justifyContent = "center";
      avatar.style.flexShrink = "0";
      avatar.style.overflow = "hidden";

      if (msgObj.fromAI) {
        avatar.style.backgroundColor = "#f3e8ff";
        avatar.innerHTML = `<img src="${baseUrl}ai_response_icon.png" style="width: 100%; height: 100%; object-fit: cover;" alt="AI">`;
      } else {
        avatar.style.backgroundColor = "#dbeafe";
        avatar.innerHTML = `<img src="${baseUrl}human_response.png" style="width: 100%; height: 100%; object-fit: cover;" alt="Human">`;
      }
      wrapper.appendChild(avatar);
    }

    const contentCol = document.createElement("div");
    contentCol.style.display = "flex";
    contentCol.style.flexDirection = "column";
    contentCol.style.gap = "4px";
    if (senderClass === "user") {
      contentCol.style.alignItems = "flex-end";
    } else {
      contentCol.style.alignItems = "flex-start";
    }

    // Sender Label
    if (senderClass === "agent") {
      const label = document.createElement("div");
      label.style.fontSize = "12px";
      label.style.color = "var(--text-muted)";
      label.style.display = "flex";
      label.style.alignItems = "center";
      label.style.gap = "6px";

      const name =
        msgObj.sender || (msgObj.fromAI ? "AI Assistant" : "Support Team");
      const badge = msgObj.fromAI
        ? `<span style="background: #f3e8ff; color: #7c3aed; font-size: 9px; font-weight: 600; padding: 2px 6px; border-radius: 10px;">AI</span>`
        : `<span style="background: #dbeafe; color: #2563eb; font-size: 9px; font-weight: 600; padding: 2px 6px; border-radius: 10px;">Human</span>`;

      label.innerHTML = `<strong>${name}</strong> ${badge}`;
      contentCol.appendChild(label);
    }

    // Message Bubble
    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${senderClass}`;

    // Apply styling based on AI vs Human (matching dashboard)
    if (senderClass === "agent") {
      if (msgObj.fromAI) {
        msgDiv.style.backgroundColor = "#faf5ff";
        msgDiv.style.border = "1px solid #e9d5ff";
      } else {
        msgDiv.style.backgroundColor = "#FFFFFF";
        msgDiv.style.border = "1px solid var(--bg-warm)";
      }
      msgDiv.style.boxShadow = "var(--shadow-soft)";
    }

    // Override max-width for the bubble itself since wrapper handles it
    msgDiv.style.maxWidth = "100%";
    msgDiv.style.margin = "0";

    const text = msgObj.content || "";
    if (text) {
      msgDiv.innerHTML = this.formatMessage(text);
    }

    if (msgObj.file) {
      const file = msgObj.file;
      const fileDiv = document.createElement("div");
      fileDiv.style.marginTop = text ? "8px" : "0";
      if (file.type && file.type.startsWith("image/")) {
        fileDiv.innerHTML = `<img src="${file.url}" alt="${file.name}" style="max-width: 160px; max-height: 160px; object-fit: cover; border-radius: 10px; display: block; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">`;
        if (!text) {
          msgDiv.style.backgroundColor = "transparent";
          msgDiv.style.padding = "0";
          msgDiv.style.boxShadow = "none";
          msgDiv.style.border = "none";
        }
      } else {
        fileDiv.innerHTML = `<a href="${file.url}" target="_blank" style="color: inherit; text-decoration: underline;">📎 ${file.name}</a>`;
      }
      msgDiv.appendChild(fileDiv);
    }

    contentCol.appendChild(msgDiv);

    // Timestamp
    if (msgObj.timestamp) {
      const timeDiv = document.createElement("div");
      timeDiv.style.fontSize = "10px";
      timeDiv.style.color = "#aaa";
      timeDiv.style.marginTop = "2px";
      timeDiv.textContent = new Date(msgObj.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      contentCol.appendChild(timeDiv);
    }

    wrapper.appendChild(contentCol);

    this.messageFeed.appendChild(wrapper);
    this.messageFeed.scrollTop = this.messageFeed.scrollHeight;
  }

  // 4.6 Lead Capture Form
  showLeadCapture() {
    if (
      this.leadCapturedOrSkipped ||
      this.shadow.querySelector(".lead-capture-modal")
    )
      return;

    const formDiv = document.createElement("div");
    formDiv.className = "lead-capture-modal";
    formDiv.innerHTML = `
      <h3 style="margin: 0 0 8px 0; text-align: center; color: var(--secondary); font-size: 18px;">What is your email address?</h3>
      <p style="margin: 0 0 16px 0; text-align: center; color: var(--text-muted); font-size: 14px;">Enter your email to know when we reply:</p>
      <input type="email" id="lc-email" placeholder="Enter your email address..." required style="width: calc(100% - 32px); padding: 12px 16px; margin-bottom: 16px; border: none; background-color: var(--bg-light); border-radius: 8px; font-size: 14px; outline: none; transition: background-color 0.2s;" />
      <div style="display: flex; gap: 12px; justify-content: center;">
        <button id="lc-submit" style="background-color: var(--primary); color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; flex: 1; transition: all 0.2s;">Set my email</button>
        <button id="lc-skip" style="background-color: white; color: var(--secondary); border: 1px solid var(--gray); padding: 12px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; flex: 1; transition: all 0.2s;">Skip</button>
      </div>
    `;

    // Modern Floating Styling
    formDiv.style.position = "absolute";
    formDiv.style.bottom = "20px";
    formDiv.style.left = "20px";
    formDiv.style.right = "20px";
    formDiv.style.backgroundColor = "white";
    formDiv.style.borderRadius = "16px";
    formDiv.style.padding = "24px";
    formDiv.style.boxShadow = "0 12px 48px rgba(0,0,0,0.15)";
    formDiv.style.zIndex = "50";
    formDiv.style.animation = "fadeIn 0.3s ease, slideUp 0.3s ease";

    // Append to messages-view so it overlays the feed perfectly
    const messagesView = this.shadow.getElementById("messages-view");
    messagesView.style.position = "relative";
    messagesView.appendChild(formDiv);

    const btn = formDiv.querySelector("#lc-submit");
    const skipBtn = formDiv.querySelector("#lc-skip");

    const markAsDone = () => {
      this.leadCapturedOrSkipped = true;
      sessionStorage.setItem("leadCapturedOrSkipped", "true");
    };

    skipBtn.addEventListener("click", () => {
      markAsDone();
      formDiv.style.opacity = "0";
      formDiv.style.transition = "opacity 0.3s ease";
      setTimeout(() => formDiv.remove(), 300);
    });

    btn.addEventListener("click", () => {
      const email = formDiv.querySelector("#lc-email").value.trim();

      if (email) {
        this.socket.send({ type: "set_contact", email });
        markAsDone();
        btn.innerHTML = "Saving...";
        btn.disabled = true;
      }
    });

    // Add focus/hover effects manually for inline styles
    const emailInput = formDiv.querySelector("#lc-email");
    emailInput.addEventListener("focus", () => {
      emailInput.style.backgroundColor = "#FFF8F0";
      emailInput.style.boxShadow = "0 0 0 3px rgba(250, 129, 18, 0.1)";
    });
    emailInput.addEventListener("blur", () => {
      emailInput.style.backgroundColor = "var(--bg-light)";
      emailInput.style.boxShadow = "none";
    });

    btn.addEventListener(
      "mouseenter",
      () => (btn.style.backgroundColor = "#D96A0A"),
    );
    btn.addEventListener(
      "mouseleave",
      () => (btn.style.backgroundColor = "var(--primary)"),
    );

    skipBtn.addEventListener("mouseenter", () => {
      skipBtn.style.backgroundColor = "var(--bg-light)";
    });
    skipBtn.addEventListener("mouseleave", () => {
      skipBtn.style.backgroundColor = "white";
    });
  }

  // 4.7 Beautiful System Errors
  showError(message) {
    const msgDiv = document.createElement("div");
    msgDiv.style.alignSelf = "center";
    msgDiv.style.backgroundColor = "#FFF0F0";
    msgDiv.style.color = "#D8000C";
    msgDiv.style.border = "1px solid #FFD2D2";
    msgDiv.style.borderRadius = "8px";
    msgDiv.style.padding = "8px 12px";
    msgDiv.style.fontSize = "12px";
    msgDiv.style.margin = "8px 0";
    msgDiv.style.maxWidth = "85%";
    msgDiv.style.textAlign = "center";
    msgDiv.style.animation = "fadeIn 0.3s ease";

    msgDiv.innerHTML = `⚠️ ${message}`;

    this.messageFeed.appendChild(msgDiv);
    this.messageFeed.scrollTop = this.messageFeed.scrollHeight;

    // Auto-remove error after 4 seconds
    setTimeout(() => {
      msgDiv.style.opacity = "0";
      msgDiv.style.transition = "opacity 0.3s ease";
      setTimeout(() => msgDiv.remove(), 300);
    }, 4000);
  }

  async loadArticles() {
    try {
      const baseUrl =
        window.KittyChat?.API_URL ||
        this.socket.baseUrl.replace(/^ws/, "http").replace(/\/widget$/, "/api");
      const res = await fetch(`${baseUrl}/articles`);
      if (!res.ok) throw new Error("Failed to load articles");
      const articles = await res.json();

      this.avContainer.innerHTML = "";
      if (articles.length === 0) {
        this.avContainer.innerHTML =
          '<p style="text-align: center; padding: 20px; color: var(--text-muted);">No articles available.</p>';
        return;
      }

      articles.forEach((article) => {
        if (!article.published) return; // Only show published ones

        const item = document.createElement("div");
        item.className = "av-category";

        const dateObj = new Date(article.updatedAt || article.createdAt);
        const dateStr = dateObj.toLocaleDateString();

        item.innerHTML = `
          <div class="av-cat-content" style="display: flex; align-items: center; gap: 12px; width: 100%;">
            ${article.avatar ? `<img src="${article.avatar}" alt="" style="width: 32px; height: 32px; border-radius: 8px; object-fit: cover; flex-shrink: 0;" />` : ""}
            <div style="flex: 1;">
              <h4 style="margin: 0; font-size: 14px; font-weight: 600; color: var(--text-dark);">${this.escapeHtml(article.title)}</h4>
              <span class="av-cat-meta" style="font-size: 11px; color: var(--text-muted); display: block; margin-top: 4px;">Updated: ${dateStr}</span>
            </div>
            <div class="av-cat-arrow"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg></div>
          </div>
        `;
        item.addEventListener("click", () => this.openArticle(article._id));
        this.avContainer.appendChild(item);
      });
    } catch (err) {
      console.error("Error loading articles:", err);
      this.avContainer.innerHTML =
        '<p style="text-align: center; padding: 20px; color: var(--text-muted);">Could not load articles.</p>';
    }
  }

  async openArticle(articleId) {
    try {
      this.avList.style.display = "none";
      this.avDetail.style.display = "flex";

      const titleEl = this.shadow.getElementById("av-detail-title");
      const metaEl = this.shadow.getElementById("av-detail-meta");
      const contentEl = this.shadow.getElementById("article-viewer-content");

      titleEl.textContent = "Loading...";
      metaEl.textContent = "";
      contentEl.innerHTML =
        '<div style="text-align:center; padding:40px;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></div>';

      const baseUrl =
        window.KittyChat?.API_URL ||
        this.socket.baseUrl.replace(/^ws/, "http").replace(/\/widget$/, "/api");
      const res = await fetch(`${baseUrl}/articles/${articleId}`);
      if (!res.ok) throw new Error("Failed to load article details");
      const article = await res.json();

      titleEl.textContent = this.escapeHtml(article.title);
      const dateObj = new Date(article.updatedAt || article.createdAt);
      metaEl.textContent = `Updated ${dateObj.toLocaleDateString()}`;

      contentEl.innerHTML = article.content;
    } catch (err) {
      console.error("Error loading article:", err);
      this.shadow.getElementById("article-viewer-content").innerHTML =
        '<p style="text-align: center; color: red;">Failed to load article content.</p>';
    }
  }

  escapeHtml(unsafe) {
    if (!unsafe) return "";
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}
