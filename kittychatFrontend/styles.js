export const widgetStyles = `
  :host {
    --primary: #FA8112;
    --primary-dark: #D96A0A;
    --primary-light: #FFF8F0;
    --secondary: #222222;
    --bg-cream: #FAF8F5;
    --bg-sand: #F3EFE9;
    --bg-warm: #EDE8E0;
    --bg-white: #FFFFFF;
    --bg-light: #F4F4F5;
    --gray: #D9D5CF;
    --text-dark: #222222;
    --text-muted: #615A52;
    --text-light: #8A8279;
    --shadow-soft: 0 1px 3px rgba(34, 34, 34, 0.04);
    --shadow-card: 0 2px 8px rgba(34, 34, 34, 0.06);
    --shadow-lifted: 0 4px 16px rgba(34, 34, 34, 0.08);
    --shadow-brand: 0 2px 10px rgba(250, 129, 18, 0.2);
    --radius-cozy: 14px;
    font-family: 'Poppins', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
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
    width: 120px;
    height: 120px;
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
    overflow: visible;
  }

  /* Full geometric CSS cat mascot - scaled to fit launcher */
  .kc-cat-container { position: relative; width: 320px; height: 340px; transform: scale(0.34); transform-origin: center center; margin: -112px -104px; cursor: pointer; }
  .kc-cat-ground-shadow { position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); width: 240px; height: 18px; background: radial-gradient(ellipse at center, rgba(0,0,0,0.16) 0%, rgba(0,0,0,0) 70%); border-radius: 50%; z-index: 0; }
  .kc-cat-tail { position: absolute; bottom: 26px; right: 32px; width: 90px; height: 110px; z-index: 1; transform-origin: 20px 100px; animation: kcTailWag 3s infinite ease-in-out; }
  .kc-cat-tail-svg { width: 100%; height: 100%; filter: drop-shadow(-2px 3px 3px rgba(0,0,0,0.12)); }
  @keyframes kcTailWag { 0%,100% { transform: rotate(10deg); } 50% { transform: rotate(40deg); } }
  @keyframes kcBreathe { 0%,100% { transform: translateY(0); } 50% { transform: translateY(4px); } }
  @keyframes kcBodyBreathe { 0%,100% { transform: translateX(-50%) translateY(0) scaleY(1); } 50% { transform: translateX(-50%) translateY(1.5px) scaleY(0.985); } }
  @keyframes kcTwitchEarL { 0%,90%,100% { transform: rotate(-16deg); } 92%,96% { transform: rotate(-24deg); } }
  @keyframes kcTwitchEarR { 0%,86%,100% { transform: rotate(16deg); } 88%,92% { transform: rotate(24deg); } }
  .kc-cat-hip { position: absolute; bottom: 20px; width: 44px; height: 64px; background-color: #ff7c12; border-radius: 50% 50% 45% 45% / 60% 60% 40% 40%; z-index: 2; box-shadow: inset -3px -3px 8px #cc4f00, inset 3px 3px 5px #ffaa40; }
  .kc-cat-hip.kc-left { left: 68px; transform: rotate(-6deg); }
  .kc-cat-hip.kc-right { right: 68px; transform: rotate(6deg); }
  .kc-cat-paw-back { position: absolute; bottom: 12px; width: 30px; height: 20px; background-color: #fff; border-radius: 12px 12px 8px 8px; z-index: 3; box-shadow: 0 3px 6px rgba(0,0,0,0.08); }
  .kc-cat-paw-back.kc-left { left: 70px; }
  .kc-cat-paw-back.kc-right { right: 70px; }
  .kc-cat-body { position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%); width: 106px; height: 156px; background-color: #ff7c12; border-radius: 50% 50% 35% 35% / 60% 60% 40% 40%; z-index: 3; box-shadow: inset -8px -6px 16px #cc4f00, inset 6px 6px 12px #ffaa40; overflow: hidden; transform-origin: bottom center; animation: kcBodyBreathe 3.2s infinite ease-in-out; }
  .kc-cat-body-stripe { position: absolute; height: 8px; background-color: #2b180d; border-radius: 4px; opacity: 0.85; z-index: 4; }
  .kc-cat-body-stripe.kc-left { left: -4px; border-radius: 0 4px 4px 0; }
  .kc-cat-body-stripe.kc-right { right: -4px; border-radius: 4px 0 0 4px; }
  .kc-cat-body-stripe.kc-s1 { top: 32px; width: 22px; }
  .kc-cat-body-stripe.kc-left.kc-s1 { transform: rotate(12deg); }
  .kc-cat-body-stripe.kc-right.kc-s1 { transform: rotate(-12deg); }
  .kc-cat-body-stripe.kc-s2 { top: 60px; width: 28px; }
  .kc-cat-body-stripe.kc-left.kc-s2 { transform: rotate(5deg); }
  .kc-cat-body-stripe.kc-right.kc-s2 { transform: rotate(-5deg); }
  .kc-cat-body-stripe.kc-s3 { top: 88px; width: 24px; }
  .kc-cat-body-stripe.kc-left.kc-s3 { transform: rotate(-2deg); }
  .kc-cat-body-stripe.kc-right.kc-s3 { transform: rotate(2deg); }
  .kc-cat-leg-front { position: absolute; bottom: 20px; width: 22px; height: 88px; background-color: #ff7c12; z-index: 5; box-shadow: inset -2px -2px 6px #cc4f00, inset 2px 2px 4px #ffaa40; }
  .kc-cat-leg-front.kc-left { left: 129px; border-radius: 10px 5px 3px 5px; transform: rotate(3deg); }
  .kc-cat-leg-front.kc-right { right: 129px; border-radius: 5px 10px 5px 3px; transform: rotate(-3deg); }
  .kc-cat-paw-front { position: absolute; bottom: 12px; width: 30px; height: 20px; background-color: #fff; border-radius: 12px 12px 6px 6px; z-index: 6; box-shadow: 0 3px 5px rgba(0,0,0,0.08); }
  .kc-cat-paw-front.kc-left { left: 125px; }
  .kc-cat-paw-front.kc-right { right: 125px; }
  .kc-cat-head-group { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 8; animation: kcBreathe 3.2s infinite ease-in-out; }
  .kc-cat-head-joint { position: absolute; top: 0; left: 0; width: 100%; height: 100%; transform-origin: 50% 180px; transition: transform 0.15s cubic-bezier(0.2,0.8,0.2,1); }
  .kc-cat-ear { position: absolute; top: -16px; width: 95px; height: 104px; background-color: #ff7c12; z-index: 1; box-shadow: inset -4px 4px 10px #cc4f00, inset 3px -3px 6px #ffaa40; transform-origin: bottom center; transition: transform 0.2s cubic-bezier(0.175,0.885,0.32,1.275); }
  .kc-cat-ear.kc-left { left: 60px; border-radius: 18% 82% 12% 48% / 15% 82% 15% 55%; transform: rotate(-16deg); animation: kcTwitchEarL 5s infinite ease-in-out; }
  .kc-cat-ear.kc-right { right: 60px; border-radius: 82% 18% 48% 12% / 82% 15% 55% 15%; transform: rotate(16deg); animation: kcTwitchEarR 5.2s infinite ease-in-out; }
  .kc-cat-ear-inner { position: absolute; top: 18px; width: 48px; height: 58px; background: linear-gradient(135deg, #ffadb5 40%, #f68994 100%); box-shadow: inset 1px 2px 4px rgba(0,0,0,0.15); }
  .kc-cat-ear.kc-left .kc-cat-ear-inner { left: 18px; border-radius: 15% 85% 12% 48% / 15% 85% 15% 55%; }
  .kc-cat-ear.kc-right .kc-cat-ear-inner { right: 18px; border-radius: 85% 15% 48% 12% / 85% 15% 55% 15%; }
  .kc-cat-hair-tuft-1,.kc-cat-hair-tuft-2,.kc-cat-hair-tuft-3,.kc-cat-hair-tuft-4 { position: absolute; background-color: #ff7c12; border-radius: 0 100% 0 100%; z-index: 2; box-shadow: inset -2px 2px 3px #cc4f00; }
  .kc-cat-hair-tuft-1 { top: -12px; left: 44%; transform: translateX(-50%) rotate(-18deg); width: 14px; height: 24px; }
  .kc-cat-hair-tuft-2 { top: -16px; left: 48%; transform: translateX(-50%) rotate(-6deg); width: 18px; height: 28px; }
  .kc-cat-hair-tuft-3 { top: -18px; left: 52%; transform: translateX(-50%) rotate(8deg); width: 20px; height: 32px; }
  .kc-cat-hair-tuft-4 { top: -14px; left: 56%; transform: translateX(-50%) rotate(22deg); width: 14px; height: 24px; }
  .kc-cat-head { position: absolute; top: 15px; left: 50%; transform: translateX(-50%); width: 190px; height: 165px; background-color: #ff7c12; border-radius: 50% 50% 48% 48% / 55% 55% 45% 45%; z-index: 3; box-shadow: inset -8px -8px 18px #cc4f00, inset 6px 6px 12px #ffaa40, 0 4px 10px rgba(0,0,0,0.08); }
  .kc-cat-cheek-fluff { position: absolute; width: 36px; height: 100px; z-index: 2; }
  .kc-cat-cheek-fluff.kc-left { left: -18px; top: 52px; }
  .kc-cat-cheek-fluff.kc-right { right: -18px; top: 52px; }
  .kc-fluff-spike { position: absolute; width: 32px; height: 18px; background-color: #ff7c12; border-radius: 100% 0 100% 0; box-shadow: inset -2px 2px 3px #cc4f00; }
  .kc-cat-cheek-fluff.kc-left .kc-spike-1 { top: 8px; left: 8px; transform: rotate(-35deg); }
  .kc-cat-cheek-fluff.kc-left .kc-spike-2 { top: 24px; left: 2px; transform: rotate(-15deg); }
  .kc-cat-cheek-fluff.kc-left .kc-spike-3 { top: 40px; left: 2px; transform: rotate(5deg); }
  .kc-cat-cheek-fluff.kc-left .kc-spike-4 { top: 56px; left: 8px; transform: rotate(25deg); }
  .kc-cat-cheek-fluff.kc-right .kc-spike-1 { top: 8px; right: 8px; transform: scaleX(-1) rotate(-35deg); }
  .kc-cat-cheek-fluff.kc-right .kc-spike-2 { top: 24px; right: 2px; transform: scaleX(-1) rotate(-15deg); }
  .kc-cat-cheek-fluff.kc-right .kc-spike-3 { top: 40px; right: 2px; transform: scaleX(-1) rotate(5deg); }
  .kc-cat-cheek-fluff.kc-right .kc-spike-4 { top: 56px; right: 8px; transform: scaleX(-1) rotate(25deg); }
  .kc-cat-eyebrow { position: absolute; top: 26px; width: 22px; height: 10px; border-top: 3px solid #40220d; border-radius: 50% 50% 0 0; z-index: 5; transition: transform 0.2s cubic-bezier(0.175,0.885,0.32,1.275); }
  .kc-cat-eyebrow.kc-left { left: 38px; transform: rotate(-12deg); }
  .kc-cat-eyebrow.kc-right { right: 38px; transform: rotate(12deg); }
  .kc-cat-eye { position: absolute; top: 40px; width: 56px; height: 56px; background-color: #0b0c10; border-radius: 50%; overflow: hidden; z-index: 6; box-shadow: inset 2px 2px 4px rgba(0,0,0,0.6), 0 3px 6px rgba(0,0,0,0.1); transition: background-color 0.12s ease-out, box-shadow 0.12s ease-out; }
  .kc-cat-eye.kc-left { left: 22px; transform: rotate(-3deg); }
  .kc-cat-eye.kc-right { right: 22px; transform: rotate(3deg); }
  .kc-cat-eye-iris { position: absolute; top: -5%; left: -5%; width: 110%; height: 110%; background: radial-gradient(circle at 50% 75%, #3fc5ff 0%, #0e70e3 48%, #011d4d 100%); border-radius: 50%; transition: transform 0.08s ease-out; }
  .kc-cat-eye-pupil { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 28px; height: 32px; background-color: #0b0c10; border-radius: 50%; }
  .kc-cat-eye-highlight-1 { position: absolute; top: 6px; left: 8px; width: 14px; height: 14px; background-color: #fff; border-radius: 50%; opacity: 0.98; z-index: 5; }
  .kc-cat-eye-highlight-2 { position: absolute; bottom: 7px; right: 8px; width: 7px; height: 7px; background-color: #fff; border-radius: 50%; opacity: 0.92; z-index: 5; }
  .kc-cat-eye-highlight-3 { position: absolute; top: 22px; left: 5px; width: 3.5px; height: 3.5px; background-color: #fff; border-radius: 50%; opacity: 0.88; z-index: 5; }
  .kc-cat-eyelid { position: absolute; top: 0; left: 0; width: 100%; height: 0%; background-color: #ff7c12; z-index: 10; transition: height 0.08s ease-in-out; }
  .kc-cat-muzzle-group { position: absolute; top: 94px; left: 50%; transform: translateX(-50%); width: 100px; height: 60px; z-index: 10; }
  .kc-cat-muzzle-pad { position: absolute; top: 4px; width: 38px; height: 30px; background-color: #fff; border-radius: 50%; z-index: 9; box-shadow: inset 0 -3px 6px rgba(0,0,0,0.02), 0 2px 5px rgba(0,0,0,0.06); }
  .kc-cat-muzzle-pad.kc-left { left: 14px; }
  .kc-cat-muzzle-pad.kc-right { right: 14px; }
  .kc-whisker-dot-group { position: absolute; top: 12px; width: 100%; height: 14px; }
  .kc-whisker-dot { position: absolute; width: 2px; height: 2px; background-color: #d1cdc2; border-radius: 50%; }
  .kc-cat-muzzle-pad.kc-left .kc-d1 { top: 3px; right: 6px; }
  .kc-cat-muzzle-pad.kc-left .kc-d2 { top: 8px; right: 10px; }
  .kc-cat-muzzle-pad.kc-left .kc-d3 { top: 13px; right: 5px; }
  .kc-cat-muzzle-pad.kc-right .kc-d1 { top: 3px; left: 6px; }
  .kc-cat-muzzle-pad.kc-right .kc-d2 { top: 8px; left: 10px; }
  .kc-cat-muzzle-pad.kc-right .kc-d3 { top: 13px; left: 5px; }
  .kc-cat-nose { position: absolute; top: 4px; left: 50%; transform: translateX(-50%); width: 11px; height: 8px; background-color: #ff728a; border-radius: 50% 50% 60% 60% / 40% 40% 80% 80%; z-index: 12; box-shadow: inset -1px -1px 2px rgba(0,0,0,0.2), inset 1px 1px 2px rgba(255,255,255,0.25); }
  .kc-cat-open-mouth { position: absolute; top: 24px; left: 50%; transform: translateX(-50%); width: 22px; height: 16px; background-color: #40220d; border-radius: 0 0 11px 11px; z-index: 8; overflow: hidden; transition: transform 0.2s cubic-bezier(0.175,0.885,0.32,1.275); }
  .kc-cat-tongue { position: absolute; bottom: -2px; left: 50%; transform: translateX(-50%); width: 18px; height: 10px; background-color: #ff8a9e; border-radius: 50% 50% 0 0; }
  .kc-cat-whiskers-container { position: absolute; top: 16px; width: 80px; height: 35px; z-index: 15; transition: transform 0.2s cubic-bezier(0.175,0.885,0.32,1.275); }
  .kc-cat-whiskers-container.kc-left { left: -42px; }
  .kc-cat-whiskers-container.kc-right { right: -42px; }
  .kc-whisker-line { position: absolute; height: 2px; background: linear-gradient(to right, rgba(255,255,255,0.9) 20%, rgba(255,255,255,0.2) 100%); border-radius: 1px; }
  .kc-cat-whiskers-container.kc-right .kc-whisker-line { background: linear-gradient(to left, rgba(255,255,255,0.9) 20%, rgba(255,255,255,0.2) 100%); }
  .kc-whisker-line.kc-w1 { width: 60px; top: 4px; }
  .kc-whisker-line.kc-w2 { width: 70px; top: 15px; }
  .kc-whisker-line.kc-w3 { width: 58px; top: 26px; }
  .kc-cat-whiskers-container.kc-left .kc-w1 { transform: rotate(8deg); left: 10px; }
  .kc-cat-whiskers-container.kc-left .kc-w2 { transform: rotate(-2deg); left: 0; }
  .kc-cat-whiskers-container.kc-left .kc-w3 { transform: rotate(-12deg); left: 8px; }
  .kc-cat-whiskers-container.kc-right .kc-w1 { transform: rotate(-8deg); right: 10px; }
  .kc-cat-whiskers-container.kc-right .kc-w2 { transform: rotate(2deg); right: 0; }
  .kc-cat-whiskers-container.kc-right .kc-w3 { transform: rotate(12deg); right: 8px; }

  /* Happy click expression */
  .kc-cat-container.kc-is-clicked .kc-cat-eye-iris,
  .kc-cat-container.kc-is-clicked .kc-cat-eye-highlight-1,
  .kc-cat-container.kc-is-clicked .kc-cat-eye-highlight-2,
  .kc-cat-container.kc-is-clicked .kc-cat-eye-highlight-3 { opacity: 0 !important; }
  .kc-cat-container.kc-is-clicked .kc-cat-eyelid { height: 0% !important; }
  .kc-cat-container.kc-is-clicked .kc-cat-eye { background-color: #ff7c12 !important; box-shadow: none !important; }
  .kc-cat-container.kc-is-clicked .kc-cat-eye::after { content: ''; position: absolute; top: 25%; left: 10%; width: 80%; height: 50%; border: 5px solid #2b180d; border-bottom: none; border-left: none; border-right: none; border-radius: 50% 50% 0 0 / 100% 100% 0 0; }
  .kc-cat-container.kc-is-clicked .kc-cat-ear.kc-left { transform: rotate(-24deg) translateY(3px) !important; }
  .kc-cat-container.kc-is-clicked .kc-cat-ear.kc-right { transform: rotate(24deg) translateY(3px) !important; }
  .kc-cat-container.kc-is-clicked .kc-cat-eyebrow.kc-left { transform: translateY(-6px) rotate(-8deg) !important; }
  .kc-cat-container.kc-is-clicked .kc-cat-eyebrow.kc-right { transform: translateY(-6px) rotate(8deg) !important; }
  .kc-cat-container.kc-is-clicked .kc-cat-open-mouth { transform: translateX(-50%) scale(1.3) !important; }
  .kc-cat-container.kc-is-clicked .kc-cat-whiskers-container.kc-left { transform: rotate(8deg) !important; }
  .kc-cat-container.kc-is-clicked .kc-cat-whiskers-container.kc-right { transform: rotate(-8deg) !important; }

  .launcher-close {
    display: none !important;
  }

  #launcher.open .launcher-cat {
    display: flex;
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
    border-radius: var(--radius-cozy);
    box-shadow: var(--shadow-lifted);
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    z-index: 2;
    cursor: pointer;
    animation: slideInRight 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    max-width: 300px;
    transition: opacity 0.3s ease;
    border: 1px solid var(--bg-warm);
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
    color: var(--text-light);
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
    background-color: var(--bg-cream);
    border-radius: 20px;
    box-shadow: 0 12px 40px rgba(34, 34, 34, 0.12), 0 4px 16px rgba(250, 129, 18, 0.1);
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
    border: 1px solid var(--bg-warm);
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
    background: linear-gradient(135deg, #FA8112 0%, #D96A0A 100%);
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
    box-shadow: var(--shadow-card);
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
    border-bottom: 1px solid var(--bg-warm);
    flex-shrink: 0;
  }

  .messages-avatar {
    width: 56px;
    height: 56px;
    border-radius: var(--radius-cozy);
    background-color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: var(--shadow-brand);
  }

  #header-info {
    flex: 1;
  }

  #header-title {
    margin: 0 0 4px 0;
    font-size: 18px;
    font-weight: 700;
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
    background-color: var(--bg-cream);
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
    background-color: var(--bg-white);
    color: var(--text-dark);
    border-radius: 20px;
    border: 1px solid var(--bg-warm);
    font-weight: 400;
    padding: 14px 20px;
    font-family: inherit;
    font-size: 14px;
    box-shadow: var(--shadow-soft);
  }

  .message.user {
    align-self: flex-end;
    background: linear-gradient(135deg, #FA8112 0%, #D96A0A 100%);
    color: white;
    border-bottom-right-radius: 4px;
    box-shadow: var(--shadow-brand);
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
    border: 1px solid var(--bg-warm);
    border-radius: var(--radius-cozy);
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
    box-shadow: var(--shadow-soft);
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
    color: var(--text-light);
    flex-shrink: 0;
    transition: transform 0.2s ease;
  }

  .quick-reply-btn:hover {
    border-color: var(--primary);
    background-color: var(--primary-light);
    box-shadow: var(--shadow-card);
    transform: translateY(-1px);
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
    border-top: 1px solid var(--bg-warm);
  }

  .input-wrapper-new {
    border: 1px solid var(--bg-warm);
    border-radius: var(--radius-cozy);
    padding: 12px 14px 10px 14px;
    display: flex;
    flex-direction: column;
    background-color: var(--bg-cream);
    box-shadow: var(--shadow-soft);
    transition: box-shadow 0.2s ease, border-color 0.2s ease;
  }
  
  .input-wrapper-new:focus-within {
    box-shadow: var(--shadow-brand);
    border-color: var(--primary);
    background-color: var(--bg-white);
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
    color: var(--text-light);
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
    color: var(--text-light);
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
    background-color: var(--primary-light);
    color: var(--primary);
  }
  
  .send-btn-new {
    background: linear-gradient(135deg, #FA8112 0%, #D96A0A 100%);
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
    box-shadow: var(--shadow-brand);
  }
  
  .send-btn-new svg {
    margin-left: -2px;
    margin-top: 2px;
  }

  .send-btn-new:hover {
    background: linear-gradient(135deg, #D96A0A 0%, #B35308 100%);
    transform: scale(1.05);
    box-shadow: 0 4px 16px rgba(250, 129, 18, 0.35);
  }

  .branding {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    font-size: 12px;
    color: var(--text-muted);
  }
  
  .branding strong {
    font-weight: 700;
    color: var(--primary);
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
    box-shadow: var(--shadow-lifted);
    border-radius: 8px;
    --num-columns: 8;
    --emoji-size: 1.3rem;
  }

  .lead-capture {
    background-color: var(--bg-white);
    border: 1px solid var(--bg-warm);
    border-radius: var(--radius-cozy);
    padding: 16px;
    margin: 10px 0;
    font-size: 14px;
    animation: fadeIn 0.4s ease;
    box-shadow: var(--shadow-card);
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
    border: 1px solid var(--bg-warm);
    border-radius: 10px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    background-color: var(--bg-cream);
    font-family: inherit;
  }
  
  .lead-capture input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(250, 129, 18, 0.1);
    background-color: var(--bg-white);
  }

  .lead-capture button {
    background: linear-gradient(135deg, #FA8112 0%, #D96A0A 100%);
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 10px;
    cursor: pointer;
    width: 100%;
    font-weight: 600;
    font-size: 14px;
    font-family: inherit;
    transition: all 0.2s;
    box-shadow: var(--shadow-brand);
  }
  .lead-capture button:hover {
    background: linear-gradient(135deg, #D96A0A 0%, #B35308 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(250, 129, 18, 0.3);
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
    background-color: var(--bg-cream);
    overflow-y: auto;
  }

  .home-hero {
    background: linear-gradient(135deg, #FA8112 0%, #D96A0A 100%);
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
    width: 64px;
    height: 64px;
    background: white;
    border-radius: var(--radius-cozy);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 14px;
    box-shadow: 0 8px 24px rgba(217, 106, 10, 0.3);
    position: relative;
    z-index: 1;
    padding: 8px;
    overflow: hidden;
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
    padding: 0 20px 24px 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: -20px;
    position: relative;
    z-index: 2;
  }

  .home-card-gradient {
    background: white;
    border-radius: 16px;
    padding: 18px 20px;
    display: flex;
    align-items: center;
    gap: 14px;
    box-shadow: var(--shadow-card);
    border: 1px solid var(--bg-warm);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  }

  .home-card-gradient:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(250, 129, 18, 0.18);
    border-color: rgba(250, 129, 18, 0.4);
  }

  .hc-icon-gradient {
    width: 44px;
    height: 44px;
    background: linear-gradient(135deg, #FA8112 0%, #D96A0A 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(250, 129, 18, 0.3);
  }

  .hc-icon-gradient.hc-icon-articles {
    background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%);
    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
  }

  .hc-card-body {
    flex: 1;
    min-width: 0;
  }

  .hc-text-bold {
    font-size: 15px;
    font-weight: 600;
    color: var(--secondary);
    margin-bottom: 2px;
  }

  .hc-text-sub {
    font-size: 12px;
    color: var(--text-light);
  }

  .hc-arrow {
    color: var(--text-light);
    flex-shrink: 0;
    transition: transform 0.2s ease, color 0.2s ease;
  }

  .home-card-gradient:hover .hc-arrow {
    transform: translateX(3px);
    color: var(--primary);
  }

  .home-articles-list {
    display: flex;
    flex-direction: column;
    gap: 0;
    background: white;
    border-radius: 16px;
    border: 1px solid var(--bg-warm);
    box-shadow: var(--shadow-soft);
    overflow: hidden;
  }

  .home-article-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 20px;
    font-size: 14px;
    color: var(--text-muted);
    cursor: pointer;
    transition: all 0.2s ease;
    border-bottom: 1px solid var(--bg-warm);
  }

  .home-article-item:last-child {
    border-bottom: none;
  }

  .home-article-item:hover {
    background-color: var(--primary-light);
    color: var(--secondary);
  }

  .home-article-item:hover .home-article-dot {
    background: var(--primary);
    transform: scale(1.3);
  }

  .home-article-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--bg-warm);
    flex-shrink: 0;
    transition: all 0.2s ease;
  }

  .home-article-item span {
    flex: 1;
    line-height: 1.4;
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
    border-radius: var(--radius-cozy);
    padding: 20px;
    box-shadow: var(--shadow-card);
    border: 1px solid var(--bg-warm);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .hcs-title {
    color: var(--text-light);
    font-size: 14px;
    margin: 0;
  }

  .hcs-status {
    font-weight: 600;
    color: var(--secondary);
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
    background-color: var(--bg-white);
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
    font-weight: 600;
  }

  .av-items {
    padding: 0 16px;
  }

  .av-category {
    display: flex;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid var(--bg-warm);
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .av-category:hover {
    background-color: var(--bg-cream);
  }

  .av-cat-content {
    flex: 1;
  }

  .av-cat-content h4 {
    margin: 0 0 4px 0;
    color: var(--secondary);
    font-size: 16px;
    font-weight: 600;
  }

  .av-cat-content p {
    margin: 0 0 8px 0;
    color: var(--text-muted);
    font-size: 13px;
    line-height: 1.4;
  }

  .av-cat-meta {
    font-size: 12px;
    color: var(--text-light);
  }

  .av-cat-arrow {
    padding: 0 8px;
  }

  /* Article Detail */
  .av-detail-header {
    display: flex;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid var(--bg-warm);
    position: sticky;
    top: 0;
    background: var(--bg-white);
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
    background: linear-gradient(135deg, #FA8112 0%, #D96A0A 100%);
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
    background-color: var(--secondary);
    border-radius: var(--radius-cozy);
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
    border-top: 1px solid var(--bg-warm);
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
      pointer-events: none;
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
