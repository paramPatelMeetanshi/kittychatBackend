export class KittySocket {
  constructor(baseUrl, onOpen, onMessage) {
    this.baseUrl = baseUrl;
    this.ws = null;
    this.onOpen = onOpen;
    this.onMessage = onMessage;
    
    // Generate or retrieve session ID
    this.sessionId = sessionStorage.getItem('chat_session_id');
    if (!this.sessionId) {
      this.sessionId = crypto.randomUUID();
      sessionStorage.setItem('chat_session_id', this.sessionId);
    }
    
    this.connect();
  }

  connect() {
    try {
      const url = `${this.baseUrl}?sessionId=${this.sessionId}`;
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('KittyChat WebSocket connected.');
        if (this.onOpen) this.onOpen();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (this.onMessage) this.onMessage(data);
        } catch (e) {
          console.error('Failed to parse WebSocket message', e);
        }
      };

      this.ws.onclose = () => {
        console.log('KittyChat WebSocket disconnected. Reconnecting in 3s...');
        setTimeout(() => this.connect(), 3000);
      };
      
      this.ws.onerror = (err) => {
        console.error('KittyChat WebSocket error', err);
        this.ws.close();
      };
    } catch (e) {
      console.error('WebSocket connection failed', e);
      setTimeout(() => this.connect(), 3000);
    }
  }

  send(payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    } else {
      console.warn('Cannot send message, WebSocket is not open.');
    }
  }
}

