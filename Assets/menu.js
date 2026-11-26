(() => {
  'use strict';
  const KEY = '__zaloDeskV2', STORE = 'zalodesk.settings.v2';
  const VERSION = '0.4.23';
  const SIGNATURE = 'Riêng tư|Giao diện|Công cụ|Cài đặt';
  window.__zaloDeskV1?.dispose();
  if (window[KEY]?.version === VERSION && window[KEY]?.signature === SIGNATURE) return window[KEY].mount() ? 'mounted' : 'waiting';
  window[KEY]?.dispose();
  const defaults = { theme: 'default', blur: false, blurList: false, names: false, avatars: false, avatar: 'default', privacyPaused: false, typing: false, seen: false, blurLevel: 8, blurEffect: 'soft', motion: true, quickCopy: true, moreReactions: true, hideCloud: true, hideScreenshot: true, hideTools: true };
  let config = { ...defaults };
  try { const saved = JSON.parse(localStorage.getItem(STORE)); for (const k of Object.keys(defaults)) if (typeof saved?.[k] === typeof defaults[k]) config[k] = saved[k]; if (typeof saved?.blurList !== 'boolean' && typeof saved?.blur === 'boolean') config.blurList = saved.blur; } catch { }
  const themes = {
    default: { name: 'Theo Zalo', colors: ['#edf2fa', '#ffffff', '#dbeaff', '#172b4d'] },
    midnight: { name: 'Midnight', colors: ['#0f172a', '#182338', '#274773', '#e2e8f0'] },
    ocean: { name: 'Ocean', colors: ['#eaf7ff', '#d9effb', '#b7e4fa', '#16425b'] },
    sakura: { name: 'Sakura', colors: ['#fff0f5', '#ffe2ec', '#ffd0e2', '#663047'] },
    forest: { name: 'Forest', colors: ['#eff8f0', '#deeddf', '#b7dfc5', '#204b39'] },
    lavender: { name: 'Lavender', colors: ['#f3f0ff', '#e8e0fc', '#d8c9fa', '#453369'] }
  };
  if (!themes[config.theme]) config.theme = 'default';
  const blurEffects = { soft: 'Mờ Gaussian', telegram: 'Hạt động (kiểu Telegram)', mosaic: 'Ô vuông (Mosaic)', lorem: 'Chữ giả (Lorem ipsum)', solid: 'Thanh đen' };
  if (!Object.hasOwn(blurEffects, config.blurEffect)) config.blurEffect = 'soft';
  config.blurLevel = Math.max(2, Math.min(20, config.blurLevel));
  const icon = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><path d="M14 17.5h7m-3.5-3.5v7"/></svg>';
  const menuIcons = {
    privacy: '<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/>',
    appearance: '<path d="M12 3a9 9 0 1 0 0 18h1.5a2.5 2.5 0 0 0 1.77-4.27 1 1 0 0 1 .71-1.73H18a3 3 0 0 0 3-3 9 9 0 0 0-9-9Z"/><circle cx="7.5" cy="11.5" r=".75" fill="currentColor" stroke="none"/><circle cx="10" cy="7.5" r=".75" fill="currentColor" stroke="none"/><circle cx="14.5" cy="7.5" r=".75" fill="currentColor" stroke="none"/><circle cx="17" cy="11" r=".75" fill="currentColor" stroke="none"/>',
    tools: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94Z"/>',
    settings: '<path d="m9.5 3-.6 2.3-1.8 1-2.3-.6-2.5 4.3 1.7 1.7v2.1L2.3 15l2.5 4.3 2.3-.6 1.8 1 .6 2.3h5l.6-2.3 1.8-1 2.3.6 2.5-4.3-1.7-1.7v-2.1l1.7-1.7L19.2 5l-2.3.6-1.8-1L14.5 3Z"/><circle cx="12" cy="12.5" r="3"/>'
  };
  let button, menu, dialog, reactionPicker, queued = false, disposed = false, messageTimer;
  const actionOffsets = new Map();
  const makeStyle = id => { const el = document.createElement('style'); el.id = id; return el; };
  const style = makeStyle('zalodesk-style'), visual = makeStyle('zalodesk-visual'), themeStyle = makeStyle('zalodesk-theme');
  const avatarPresets = {
    default: { name: 'Mặc định', image: 'https://zchat.vn/zalo-avatar/no-user.webp' },
    hacker: { name: 'Hacker', image: 'https://zchat.vn/zalo-avatar/hacker.jpg' },
    conan: { name: 'Conan', image: 'https://zchat.vn/zalo-avatar/conan.jpg' },
    doraemon: { name: 'Doraemon', image: 'https://zchat.vn/zalo-avatar/doraemon.jpg' },
    goku: { name: 'Goku', image: 'https://zchat.vn/zalo-avatar/goku.jpg' },
    female: { name: 'Avatar nữ', image: 'https://media.istockphoto.com/id/2014684899/vector/placeholder-avatar-female-person-default-woman-avatar-image-gray-profile-anonymous-face.jpg?s=612x612&w=0&k=20&c=D-dk9ek0_jb19TiMVNVmlpvYVrQiFiJmgGmiLB5yE4w=' }
  };
  if (!avatarPresets[config.avatar]) config.avatar = 'default';
  function chosenAvatar() { return avatarPresets[config.avatar].image; }
  function save() { try { localStorage.setItem(STORE, JSON.stringify(config)); } catch { } apply(); }
  function toggleQuickPrivacy() { config.privacyPaused = !config.privacyPaused; save(); }
  const privacyFilters = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  privacyFilters.id = 'zalodesk-privacy-filters';
  privacyFilters.setAttribute('aria-hidden', 'true');
  privacyFilters.style.cssText = 'position:absolute;width:0;height:0;pointer-events:none';
  function effectFilter() {
    if (config.blurEffect === 'lorem') return 'none';
    if (config.blurEffect === 'soft') return `blur(${config.blurLevel}px)`;
    if (config.blurEffect === 'mosaic') return 'url("#zalodesk-mosaic") blur(2px)';
    return `url("#zalodesk-${config.blurEffect}")`;
  }
  let filterStrength, particleFrame = 0;
  const dustCanvas = document.createElement('canvas'); dustCanvas.width = dustCanvas.height = 192;
  const dustContext = dustCanvas.getContext('2d');
  let dust = [];
  let seed = 731;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  function drawDust(step = false) {
    const ctx = dustContext, edge = 192;
    ctx.fillStyle = '#d5d9df'; ctx.fillRect(0, 0, edge, edge);
    for (const dot of dust) {
      if (step) {
        dot.age += 1 / 30;
        if (dot.age >= dot.life) { dot.x = random() * edge; dot.y = random() * edge; dot.age = 0; dot.phase = random() * Math.PI * 2; }
        const angle = Math.sin(dot.x / 35 + particleFrame / 110) + Math.cos(dot.y / 40 - particleFrame / 160) + dot.phase;
        dot.x = (dot.x + Math.cos(angle) * .32 + edge) % edge;
        dot.y = (dot.y + Math.sin(angle) * .32 + edge) % edge;
      }
      const opacity = Math.sin(Math.PI * dot.age / dot.life) * .65;
      ctx.fillStyle = `rgba(${dot.light ? '255,255,255' : '85,96,111'},${opacity})`;
      ctx.beginPath(); ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2); ctx.fill();
    }
    return dustCanvas.toDataURL();
  }
  function updatePrivacyFilters() {
    if (!privacyFilters.isConnected) document.documentElement.append(privacyFilters);
    const textColor = getComputedStyle(document.querySelector('.conv-item') || document.body).color.match(/[\d.]+/g)?.map(Number) || [0, 0, 0];
    const dark = textColor[0] * .2126 + textColor[1] * .7152 + textColor[2] * .0722 > 140;
    const filterKey = `${config.blurLevel}:${dark}`;
    if (filterStrength === filterKey) return;
    filterStrength = filterKey;
    // The square cover is an opaque pattern, independent of message pixels.
    const size = Math.round(config.blurLevel);
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = size * 8;
    const ctx = canvas.getContext('2d');
    const shades = dark ? ['#30363f', '#343a43', '#383f49', '#3c434d', '#404751'] : ['#d8dde4', '#dce1e7', '#e0e4ea', '#e4e8ed', '#e8ebef'];
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
      ctx.fillStyle = shades[Math.floor(random() * shades.length)]; ctx.fillRect(x * size, y * size, size, size);
    }
    const squares = canvas.toDataURL();
    // Particle density and fade lifetimes follow the approach of Telegram's DotRenderer.
    dust = Array.from({ length: 900 + config.blurLevel * 35 }, () => {
      const life = .9 + random() * 1.1;
      return { x: random() * 192, y: random() * 192, life, age: random() * life, phase: random() * Math.PI * 2, radius: .5 + random() * .7, light: random() > .6 };
    });
    privacyFilters.innerHTML = `<defs>
      <filter id="zalodesk-mosaic" x="0" y="0" width="100%" height="100%" primitiveUnits="userSpaceOnUse">
        <feImage href="${squares}" x="0" y="0" width="${size * 8}" height="${size * 8}" result="squares"/>
        <feTile in="squares"/>
      </filter>
      <filter id="zalodesk-telegram" x="0" y="0" width="100%" height="100%" primitiveUnits="userSpaceOnUse">
        <feImage href="${drawDust()}" x="0" y="0" width="192" height="192" result="dots"/>
        <feTile in="dots"/>
      </filter>
      <filter id="zalodesk-solid" x="0" y="0" width="100%" height="100%"><feFlood flood-color="#18202b"/></filter></defs>`;
  }
  const particleTimer = setInterval(() => {
    if (disposed || document.hidden || !config.motion || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if ((config.privacyPaused || (!config.blur && !config.blurList) || config.blurEffect !== 'telegram') && !menu) return;
    if (++particleFrame % 15 === 0 && config.blurEffect === 'mosaic') updatePrivacyFilters();
    const image = privacyFilters.querySelector('#zalodesk-telegram feImage');
    if (image && dust.length) { particleFrame++; image.setAttribute('href', drawDust(true)); }
  }, 1000 / 30);
  const loremNodes = new Map();
  let loremPointer;
  function restoreLorem() {
    for (const [node, saved] of loremNodes) if (node.data === saved.fake) node.data = saved.original;
    loremNodes.clear();
  }
  function syncLoremText() {
    if (disposed || config.privacyPaused || config.blurEffect !== 'lorem') { restoreLorem(); return; }
    const roots = [];
    if (config.blurList) roots.push(...document.querySelectorAll('.conv-item-body'));
    if (config.blur) roots.push(...document.querySelectorAll('.chat-message .text-message__container,.chat-message .card--text,.chat-message [data-id="div_ReceivedMsg_Text"]'));
    const wanted = new Set();
    for (const root of roots) {
      const scope = root.closest('.conv-item,.msg-item,.chat-message') || root;
      if (scope.matches(':hover') || (loremPointer && scope.contains(loremPointer))) continue;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      for (let node; (node = walker.nextNode());) {
        if (!node.data.trim() || node.parentElement?.closest('script,style,button,[contenteditable],.message-reaction-container,.card-send-time,.card-sender-name,.zd-copy-action,[data-zd-message-tools]')) continue;
        wanted.add(node);
      }
    }
    for (const [node, saved] of loremNodes) {
      if (!wanted.has(node)) { if (node.data === saved.fake) node.data = saved.original; loremNodes.delete(node); }
      else if (node.data !== saved.fake) loremNodes.delete(node); // Zalo updated or recycled this node.
    }
    const words = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit'];
    for (const node of wanted) {
      if (loremNodes.has(node)) continue;
      const original = node.data; let index = 0;
      const fake = original.replace(/[\p{L}\p{N}]+/gu, word => {
        const sample = words[index++ % words.length];
        const replacement = sample.repeat(Math.ceil(word.length / sample.length)).slice(0, word.length);
        return word[0] === word[0].toUpperCase() ? replacement[0].toUpperCase() + replacement.slice(1) : replacement;
      });
      if (fake !== original) { loremNodes.set(node, { original, fake }); node.data = fake; }
    }
  }
  function loremHover(event) {
    loremPointer = event.type === 'pointerout' ? event.relatedTarget : event.target;
    syncLoremText();
  }
  document.addEventListener('pointerover', loremHover, true);
  document.addEventListener('pointerout', loremHover, true);
  function apply() {
    updatePrivacyFilters();
    const strengthValue = menu?.querySelector('[data-strength-value]');
    if (strengthValue) strengthValue.textContent = config.blurEffect === 'lorem' ? 'Giữ nguyên kiểu chữ gốc' : (config.blurEffect === 'mosaic' ? `Ô ${config.blurLevel} × ${config.blurLevel}px` : `${config.blurLevel}px`);
    const sample = menu?.querySelector('.zd-effect-preview > div'); if (sample) { sample.style.filter = effectFilter(); sample.textContent = config.blurEffect === 'lorem' ? 'Lorem ipsum dolor sit amet' : 'Tin nhắn riêng tư'; }
    const privacyOn = !config.privacyPaused;
    const contentParts = '.message-action > :not(.message-reaction-container):not(.card-send-time):not(.zd-copy-action)';
    const oldParts = ':is(.text-message__container,.card--text,.chatImageMessage,.img-msg-v2,.card--group-photo,.file-message__container,.video-msg-container,.chatStickerMessage,.chatGifMessage)';
    visual.textContent = `
      ${config.quickCopy ? '.chat-message > .message-wrapper{max-width:calc(100% - 120px)}' : ''}
      ${privacyOn && config.blurList ? `.conv-item-body{filter:${effectFilter()} !important;transition:filter .15s}.conv-item:hover .conv-item-body,.msg-item:hover .conv-item-body{filter:none !important}` : ''}
      ${privacyOn && config.blur ? `.chat-message ${contentParts},.chat-message:not(:has(.message-action)) ${oldParts}{filter:${effectFilter()} !important;transition:filter .15s}.chat-message:hover ${contentParts},.chat-message:not(:has(.message-action)):hover ${oldParts}{filter:none !important}` : ''}
      ${privacyOn && config.blur && config.blurEffect === 'lorem' ? `.chat-message :is(.chatImageMessage,.img-msg-v2,.card--group-photo,.video-msg-container,.chatStickerMessage,.chatGifMessage){filter:blur(${config.blurLevel}px) !important}.chat-message:hover :is(.chatImageMessage,.img-msg-v2,.card--group-photo,.video-msg-container,.chatStickerMessage,.chatGifMessage){filter:none !important}` : ''}
      ${privacyOn && config.names ? `.conv-item-title__name,.card-sender-name,.header-title,.header-info__name{filter:blur(7px) !important}.conv-item:hover .conv-item-title__name,.card-sender-name:hover,.header-title:hover,.header-info__name:hover{filter:none !important}` : ''}
      ${privacyOn && config.avatars ? `.zavatar{position:relative}.zavatar img{opacity:0 !important}.zavatar:after{content:'';position:absolute;inset:0;display:block;background:#e4eaf1 url("${chosenAvatar()}") center/cover no-repeat;border-radius:50% !important;box-shadow:inset 0 0 0 1px #00000008;pointer-events:none}.zavatar:hover img{opacity:1 !important}.zavatar:hover:after{display:none}` : ''}`;
    const [bg, surface, mine, text] = themes[config.theme].colors;
    themeStyle.textContent = config.theme === 'default' ? '' : `
      #container,#chatView,.chat-content,.chat-view,.chat-view__body{background:${bg} !important;color:${text} !important}
      .conv-list,.conv-list-box,.chat-input,.chat-input-container,.chat-input-container--audit-2023,.chat-header,.header-info,.chat-info{background:${surface} !important;color:${text} !important}
      .conv-item,.msg-item{background:${surface} !important;color:${text} !important}.conv-item:hover,.conv-item.selected,.msg-item:hover,.msg-item.selected{background:${mine} !important}
      .card,.card--text,.message-frame{background:${surface} !important;color:${text} !important}.me.card,.me .card--text,.message-frame.me{background:${mine} !important;color:${text} !important}
      .conv-item-title__name,.conv-item-body,.header-title,.header-info__name,.card-sender-name,.card--text .text,.chat-input [contenteditable]{color:${text} !important}`;
    style.textContent = `
      ${config.hideCloud ? '.leftbar-tab[data-id="div_Main_Tab_zCloud"]{display:none !important}' : ''}
      ${config.hideScreenshot ? '.leftbar-tab[data-id="div_Main_TabScreenshot"]{display:none !important}' : ''}
      ${config.hideTools ? '.leftbar-tab[data-id="div_Main_TabTool"]{display:none !important}' : ''}
      #zalodesk-sidebar-button .zd-icon{display:flex;align-items:center;justify-content:center;width:28px;height:28px}
      #zalodesk-sidebar-button svg{transition:${config.motion ? 'transform .16s ease' : 'none'}}#zalodesk-sidebar-button:active svg{transform:${config.motion ? 'scale(.92)' : 'none'}}
      #zalodesk-sidebar-button:focus-visible{outline:2px solid #398bfa;outline-offset:-4px}
      #zalodesk-menu{position:fixed;z-index:10001;opacity:1;user-select:none;color:var(--text-primary)}
      #zalodesk-menu .zd-main{min-width:200px}
      #zalodesk-menu .zmenu-item{white-space:nowrap;outline:none}
      #zalodesk-menu .zmenu-item:focus-visible,#zalodesk-menu .zd-active{background:var(--layer-background-hover)}
      #zalodesk-menu .menu-icon{display:flex;align-items:center;justify-content:center;flex:none;width:24px;height:24px;color:var(--icon-primary)}
      #zalodesk-menu .menu-icon svg{display:block;width:20px;height:20px;stroke-width:1.8}
      #zalodesk-menu .zd-label{flex:1;overflow:hidden;text-overflow:ellipsis}
      #zalodesk-menu .zd-arrow{flex:none;width:20px;height:20px;margin-left:24px;color:var(--icon-primary)}
      #zalodesk-menu .zd-sub{position:fixed;display:none;opacity:1;transform:none;min-width:260px;max-width:300px;max-height:calc(100vh - 16px);overflow:auto;z-index:10002}
      #zalodesk-menu .zd-sub.open{display:block}
      #zalodesk-menu .zd-section{padding:8px 10px 4px;font-size:12px;color:var(--text-secondary);line-height:18px}
      #zalodesk-menu .zd-note{padding:6px 10px;white-space:normal;line-height:18px;color:var(--text-secondary);font-size:12px}
      #zalodesk-menu .zd-switch{width:30px;height:17px;border-radius:20px;background:var(--background-inactiveness-subtle,#9ba5b3);position:relative;flex:none;margin-left:24px;pointer-events:none}
      #zalodesk-menu .zd-switch:after{content:'';position:absolute;left:2px;top:2px;width:13px;height:13px;border-radius:50%;background:#fff;transition:${config.motion ? 'transform .15s ease' : 'none'}}
      #zalodesk-menu [aria-checked=true] > .zd-switch{background:var(--accent-blue-bg,#0068ff)}
      #zalodesk-menu [aria-checked=true] > .zd-switch:after{transform:translateX(13px)}
      #zalodesk-menu input[type=range]{width:100%;accent-color:var(--accent-blue-bg)}#zalodesk-menu .zd-range{padding:4px 10px 10px}
      #zalodesk-menu .zd-avatar-menu{min-width:176px;max-width:230px;z-index:10003}
      #zalodesk-menu .zd-avatar-choice img{width:24px;height:24px;border-radius:50%;object-fit:cover;flex:none;margin-right:12px;background:var(--layer-background-hover)}
      #zalodesk-menu .zd-avatar-check{width:20px;height:20px;margin-left:24px;display:flex;align-items:center;justify-content:center;color:var(--text-information)}
      #zalodesk-dialog{z-index:10002;color:var(--text-primary)}
      #zalodesk-dialog .zd-sheet{width:660px;max-width:calc(100vw - 32px);max-height:calc(100vh - 64px);overflow:hidden;border-radius:4px}
      #zalodesk-dialog .zl-modal__dialog__header{flex:none;justify-content:space-between}
      #zalodesk-dialog h2{margin:0}
      #zalodesk-dialog .zd-close{display:flex;align-items:center;justify-content:center;width:32px;height:32px;padding:4px;border:0;background:transparent;color:var(--icon-secondary);border-radius:4px;cursor:pointer}
      #zalodesk-dialog .zd-close:hover{background:var(--layer-background-hover)}
      #zalodesk-dialog .zd-dialog-content{padding:16px;overflow:auto;min-height:0;background:var(--surface-background-subtle)}
      #zalodesk-dialog p{margin:0 0 16px;color:var(--text-secondary);font-size:13px;line-height:20px}
      #zalodesk-dialog .zd-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px}
      #zalodesk-dialog .zd-theme{border:1px solid var(--border);border-radius:8px;padding:8px;background:var(--layer-background);text-align:left;font:inherit;color:var(--text-primary);cursor:pointer}
      #zalodesk-dialog .zd-theme:hover{background:var(--layer-background-hover)}
      #zalodesk-dialog .zd-theme[aria-pressed=true]{border-color:var(--accent-blue-bg);box-shadow:inset 0 0 0 1px var(--accent-blue-bg)}
      #zalodesk-dialog .zd-preview{height:96px;border-radius:4px;padding:12px;display:flex;flex-direction:column;justify-content:center;gap:8px}
      #zalodesk-dialog .zd-bubble{width:68%;height:20px;border-radius:6px}
      #zalodesk-dialog .zd-theme-name{display:block;margin:10px 2px 2px;font-weight:500}
      #zalodesk-dialog .zd-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;border-top:1px solid var(--divider);font-size:12px;color:var(--text-secondary)}
      #zalodesk-dialog .zd-done{font-family:inherit;cursor:pointer;border:0}
      #zalodesk-menu :focus-visible,#zalodesk-dialog :focus-visible{outline:2px solid var(--accent-blue-bg);outline-offset:-2px}
      ${!config.motion ? '#zalodesk-menu *,#zalodesk-dialog *{animation:none !important;transition:none !important}' : ''}
      .zd-message-tools{position:absolute;bottom:0;display:flex;gap:8px;z-index:4}
      .zd-message-tool{box-sizing:border-box;width:1.5rem;height:1.5rem;border-radius:100%;padding:0;border:none;background:var(--reaction-background);color:var(--text-primary);box-shadow:var(--shadow-bubble);display:flex;align-items:center;justify-content:center;cursor:pointer;flex:none;position:relative;z-index:4;line-height:0;font-size:.875rem}
      .zd-message-tool > span{display:flex;align-items:center;justify-content:center;width:16px;height:16px}
      .zd-message-tool[data-copied=true]{color:var(--text-information);background:var(--layer-background-selected)}
      .zd-message-tool:disabled{opacity:.45;cursor:default}.zd-message-tool:focus-visible{outline:2px solid var(--accent-blue-bg)}
      #zalodesk-reactions{position:fixed;z-index:10003;opacity:1;max-width:calc(100vw - 16px);box-sizing:border-box;color:var(--text-primary)}
      #zalodesk-reactions .zd-reaction-title{font-size:13px;font-weight:500;padding:4px 2px 8px}
      #zalodesk-reactions .zd-reaction-grid{display:grid;grid-template-columns:repeat(6,36px);gap:4px;max-height:260px;overflow:auto}
      #zalodesk-reactions .zd-reaction-choice{font-size:24px;font-family:'Segoe UI Emoji','Apple Color Emoji',sans-serif;line-height:36px;text-align:center;width:36px;height:36px;padding:0;border:0;border-radius:4px;background:transparent;cursor:pointer}
      #zalodesk-reactions .zd-reaction-choice:hover,#zalodesk-reactions .zd-reaction-choice:focus-visible{background:var(--layer-background-hover);outline:2px solid var(--accent-blue-bg);outline-offset:-2px}
      #zalodesk-reactions .zd-reaction-status{font-size:12px;line-height:18px;color:var(--text-secondary);max-width:236px;padding-top:6px}
      .MQA-contents > .zd-copy-action{flex-shrink:0}
      .MQA-contents:has(> .zd-copy-action){flex-wrap:nowrap;width:max-content}
      .MQA-contents:has(> .zd-copy-action) > .MSABtn-btn{flex-shrink:0}
      .emoji-list-wrapper:has(.zd-reaction-tier){top:auto !important;bottom:0;width:282px;max-width:calc(100vw - 24px)}
      .emoji-list-wrapper .reaction-emoji-list:has(.zd-reaction-tier){display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:2px;padding:8px;border-radius:16px;max-height:min(300px,calc(100vh - 100px));overflow:auto;overscroll-behavior:contain;scrollbar-width:thin}
      .emoji-list-wrapper .reaction-emoji-list:has(.zd-reaction-tier) .reaction-emoji-icon{margin:0;width:36px;height:36px;align-self:center;justify-self:center}
      .emoji-list-wrapper .reaction-emoji-list:has(.zd-reaction-tier) .reaction-emoji-icon > span{position:absolute !important;left:50% !important;top:50% !important;margin:-11px 0 0 -11px !important;width:22px !important;height:22px !important;background-size:contain;background-repeat:no-repeat}
      .zd-reaction-tier{display:grid;grid-column:1 / -1;grid-template-columns:repeat(7,minmax(0,1fr));gap:2px}
      .zd-reaction-tier button{width:36px;height:36px;font:22px 'Segoe UI Emoji',sans-serif;border:0;padding:0;background:transparent;cursor:pointer;justify-self:center}
      .zd-reaction-tier .zd-reaction-glyph{display:flex;align-items:center;justify-content:center;line-height:22px}
      .zd-reaction-tier button:focus-visible{outline:2px solid var(--accent-blue-bg);outline-offset:-2px;border-radius:4px}

    `;
    menu?.querySelectorAll('[data-config]').forEach(el => { el.setAttribute('aria-checked', String(config[el.dataset.config])); el.querySelector('.z-toggle')?.classList.toggle('z-toggle--active', config[el.dataset.config]); });
    menu?.querySelectorAll('[data-quick-privacy] .zd-label').forEach(el => { el.textContent = config.privacyPaused ? 'Bật lại che nội dung' : 'Tạm tắt che nội dung'; });
    menu?.querySelectorAll('[data-privacy-status]').forEach(el => { el.textContent = config.privacyPaused ? 'Đang tạm tắt che. Các lựa chọn bên dưới vẫn được ghi nhớ.' : 'Bật/tắt nhanh giữ nguyên bộ cài đặt bên dưới.'; });
    syncLoremText();
    scheduleMessageTools();
  }
  // These exact paths exist in the installed Zalo 26.11.12 bundle.
  const typingPaths = new Set(['/api/message/typing', '/api/group/typing']);
  const seenPaths = new Set(['/api/message/seen', '/api/message/seenv2', '/api/group/seen', '/api/group/seenv2', '/api/e2ee/pc/t/group/seen', '/api/e2ee/pc/t/message/seen']);
  function shouldBlock(input) {
    try { const path = new URL(typeof input === 'string' || input instanceof URL ? String(input) : input.url, location.href).pathname;
      return (config.typing && typingPaths.has(path)) || (config.seen && seenPaths.has(path));
    } catch { return false; }
  }
  const original = { fetch: window.fetch, open: XMLHttpRequest.prototype.open, send: XMLHttpRequest.prototype.send };
  const requests = new WeakMap();
  function wrappedFetch(input, ...args) { return shouldBlock(input) ? Promise.reject(new DOMException('Blocked by ZaloDesk', 'AbortError')) : original.fetch.call(this, input, ...args); }
  function wrappedOpen(method, url, ...args) { const result = original.open.call(this, method, url, ...args); requests.set(this, String(url)); return result; }
  function wrappedSend(...args) {
    if (shouldBlock(requests.get(this))) {
      this.abort();
      // An OPENED request without a send flag emits no abort events by itself.
      // Notify callers so their promises do not remain pending forever.
      queueMicrotask(() => { this.dispatchEvent(new ProgressEvent('abort')); this.dispatchEvent(new ProgressEvent('loadend')); });
      return;
    }
    return original.send.apply(this, args);
  }
  window.fetch = wrappedFetch; XMLHttpRequest.prototype.open = wrappedOpen; XMLHttpRequest.prototype.send = wrappedSend;
  function closeMenu() { menu?.remove(); menu = null; button?.classList.remove('selected'); button?.setAttribute('aria-expanded', 'false'); }
  function closeDialog() { dialog?.remove(); dialog = null; button?.focus(); }
  function showThemes() {
    closeMenu(); closeDialog(); dialog = document.createElement('div'); dialog.id = 'zalodesk-dialog';
    dialog.className = 'zl-modal flx flx-col';
    dialog.innerHTML = `<div class="zl-modal__container flx-1 flx flx-center flx-al-c ovf-hidden"><section class="zd-sheet zl-modal__dialog flx flx-col no-border" role="dialog" aria-modal="true" aria-labelledby="zd-theme-title"><header class="zl-modal__dialog__header"><h2 class="zl-modal__dialog__header__title-text" id="zd-theme-title">Giao diện ZaloDesk</h2><button class="zd-close" aria-label="Đóng"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m6 6 12 12M18 6 6 18"/></svg></button></header><div class="zd-dialog-content"><p>Chọn giao diện để áp dụng ngay. “Theo Zalo” giữ giao diện gốc.</p><div class="zd-grid"></div></div><footer class="zd-footer"><span>Tự động lưu thay đổi</span><button class="zd-done z--btn--v2 medium btn-primary">Xong</button></footer></section></div>`;
    for (const [id, theme] of Object.entries(themes)) {
      const [bg, surface, mine] = theme.colors, tile = document.createElement('button'); tile.className = 'zd-theme'; tile.dataset.theme = id; tile.setAttribute('aria-pressed', String(config.theme === id));
      tile.innerHTML = `<span class="zd-preview" style="background:${bg};border-left:18px solid ${surface}"><span class="zd-bubble" style="background:${surface};border:1px solid ${mine}"></span><span class="zd-bubble" style="background:${mine};align-self:flex-end"></span></span><span class="zd-theme-name">${theme.name}</span>`;
      tile.onclick = () => { config.theme = id; save(); dialog.querySelectorAll('[data-theme]').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.theme === id))); };
      dialog.querySelector('.zd-grid').append(tile);
    }
    dialog.querySelector('.zd-close').onclick = closeDialog; dialog.querySelector('.zd-done').onclick = closeDialog;
    dialog.onclick = e => { if (e.target === dialog || e.target.classList.contains('zl-modal__container')) closeDialog(); };
    document.body.append(dialog); dialog.querySelector(`[data-theme="${config.theme}"]`).focus();
  }
  function avatarSubmenu(parent) {
    const trigger = row(parent, 'Ảnh avatar'); trigger.dataset.avatarTrigger = '';
    trigger.setAttribute('aria-haspopup', 'menu'); trigger.setAttribute('aria-expanded', 'false');
    const arrow = document.createElement('span'); arrow.className = 'zd-arrow'; arrow.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m9 5 7 7-7 7"/></svg>'; trigger.append(arrow);
    const sub = document.createElement('div'); sub.className = 'zd-sub zd-avatar-menu zmenu-body content-only sub-menu'; sub.setAttribute('role', 'menu'); sub.setAttribute('aria-label', 'Chọn ảnh avatar'); trigger.append(sub);
    for (const [id, preset] of Object.entries(avatarPresets)) {
      const item = row(sub, preset.name, () => {
        config.avatar = id; config.avatars = true; save();
        sub.querySelectorAll('[data-avatar]').forEach(el => {
          const on = el.dataset.avatar === id; el.setAttribute('aria-checked', String(on)); el.querySelector('.zd-avatar-check').textContent = on ? '✓' : '';
        });
      });
      item.classList.add('zd-avatar-choice'); item.dataset.avatar = id; item.setAttribute('role', 'menuitemradio'); item.setAttribute('aria-checked', String(config.avatar === id));
      const image = document.createElement('img'); image.src = preset.image; image.alt = ''; image.referrerPolicy = 'no-referrer';
      image.onerror = () => { item.title = 'Không tải được ảnh ' + preset.name; };
      item.prepend(image);
      const check = document.createElement('span'); check.className = 'zd-avatar-check'; check.textContent = config.avatar === id ? '✓' : ''; item.append(check);
    }
    const open = () => {
      sub.classList.add('open'); trigger.setAttribute('aria-expanded', 'true');
      const r = parent.getBoundingClientRect(), t = trigger.getBoundingClientRect();
      sub.style.left = `${r.right + sub.offsetWidth < innerWidth - 8 ? r.right - 1 : Math.max(8, r.left - sub.offsetWidth + 1)}px`;
      sub.style.top = `${Math.max(8, Math.min(t.top - 6, innerHeight - sub.offsetHeight - 8))}px`;
    };
    trigger.onmouseenter = open;
    trigger.onclick = e => { if (e.target.closest('.zd-avatar-menu')) return; e.stopPropagation(); open(); };
    trigger.onkeydown = e => {
      if (e.target === trigger && ['ArrowRight', 'Enter', ' '].includes(e.key)) { e.preventDefault(); e.stopPropagation(); open(); sub.querySelector('[tabindex]').focus(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); sub.classList.remove('open'); trigger.setAttribute('aria-expanded', 'false'); trigger.focus(); }
    };
    // Leave the nested menu open while moving the pointer into it; close on another row.
    parent.addEventListener('mouseover', e => { const item = e.target.closest('.zmenu-item'); if (item && !trigger.contains(item)) { sub.classList.remove('open'); trigger.setAttribute('aria-expanded', 'false'); } });
  }
  // Reaction IDs and wire icons verified in the installed Zalo reaction table.
  const reactions = [
    [3, '/-strong', '👍', 'Thích'], [5, '/-heart', '❤️', 'Yêu thích'], [0, ':>', '😆', 'Cười'],
    [20, ':-h', '😍', 'Thích thú'], [32, ':o', '😮', 'Ngạc nhiên'], [2, ':-((', '😢', 'Buồn'],
    [46, ':handclap', '👏', 'Vỗ tay'], [68, '/-ok', '👌', 'Đồng ý'], [69, '/-v', '✌️', 'Chiến thắng'],
    [70, '/-thanks', '🙌', 'Cảm ơn'], [71, '/-punch', '👊', 'Đấm tay'], [72, '/-share', '🤝', 'Bắt tay'],
    [73, '_()_', '🙏', 'Cầu nguyện'], [133, '/-loveu', '🤟', 'Yêu bạn'], [4, '/-weak', '👎', 'Không thích'],
    [120, '/-rose', '🌹', 'Hoa hồng'], [65, '/-break', '💔', 'Tan vỡ'], [126, '/-bd', '🎂', 'Sinh nhật'],
    [95, '🎁', '🎁', 'Quà tặng'], [84, '🎄', '🎄', 'Giáng sinh'], [86, '⛄️', '⛄️', 'Người tuyết'],
    [17, ':)', '🙂', 'Mỉm cười'], [45, ';-)', '😉', 'Nháy mắt'], [18, ':p', '😛', 'Tinh nghịch'],
    [8, ':-*', '😘', 'Hôn'], [22, '8-)', '😎', 'Ngầu'], [27, ';?', '🤔', 'Suy nghĩ'],
    [28, ':|', '😐', 'Bình thường'], [19, ':$', '😳', 'Ngại ngùng'], [25, ':(', '🙁', 'Không vui'],
    [36, ':-bye', '👋', 'Tạm biệt'], [66, '/-shit', '💩', 'Hài hước'], [6, ':d', '😁', 'Cười tươi'],
    [9, ':3', '😊', 'Dễ thương'], [12, ':~', '😭', 'Khóc'], [31, ';g', '😬', 'Khó xử']
  ];
  const reactionSprites = {"/-strong": "emoji/emoji-40/row-34-column-43.png", "/-heart": "emoji/emoji-40/row-30-column-43.png", ":>": "emoji/emoji-40/row-4-column-42.png", ":-h": "emoji/emoji-40/row-3-column-43.png", ":o": "emoji/emoji-40/row-9-column-43.png", ":-((": "emoji/emoji-40/row-2-column-43.png", ":handclap": "emoji/emoji-40/row-32-column-42.png", "/-ok": "emoji/emoji-40/row-36-column-43.png", "/-v": "emoji/emoji-40/row-37-column-43.png", "/-thanks": "emoji/emoji-40/row-38-column-43.png", "/-punch": "emoji/emoji-40/row-39-column-43.png", "/-share": "emoji/emoji-40/row-40-column-43.png", "_()_": "emoji/emoji-40/row-41-column-43.png", "/-loveu": "emoji/emoji-40/row-3-column-44.png", "/-weak": "emoji/emoji-40/row-35-column-43.png", "/-rose": "emoji/emoji-40/row-25-column-43.png", "/-break": "emoji/emoji-40/row-31-column-43.png", "/-bd": "emoji/emoji-40/row-27-column-43.png", "🎁": "emoji/emoji-40/row-26-column-9.png", "🎄": "emoji/emoji-40/row-29-column-9.png", ":)": "emoji/emoji-40/row-8-column-42.png", ";-)": "emoji/emoji-40/row-21-column-42.png", ":p": "emoji/emoji-40/row-17-column-42.png", ":-*": "emoji/emoji-40/row-14-column-42.png", "8-)": "emoji/emoji-40/row-19-column-42.png", ";?": "emoji/emoji-40/row-8-column-43.png", ":|": "emoji/emoji-40/row-28-column-42.png", ":$": "emoji/emoji-40/row-9-column-42.png", ":(": "emoji/emoji-40/row-35-column-42.png", ":-bye": "emoji/emoji-40/row-6-column-42.png", "/-shit": "emoji/emoji-40/row-32-column-43.png", ":d": "emoji/emoji-40/row-1-column-42.png", ":3": "emoji/emoji-40/row-16-column-42.png", ":~": "emoji/emoji-40/row-16-column-43.png", ";g": "emoji/emoji-40/row-18-column-42.png"};
  function reactionHandler(container) {
    const node = container.querySelector('.msg-reaction-icon,.reaction-emoji-icon') || container;
    let fiber = node[Object.keys(node).find(k => k.startsWith('__reactFiber$') || k.startsWith('__reactInternalInstance$'))];
    if (fiber) {
      let root = fiber; while (root.return) root = root.return;
      if (root.stateNode?.current && root.stateNode.current !== root && fiber.alternate) fiber = fiber.alternate;
    }
    for (let depth = 0; fiber && depth < 30; depth++, fiber = fiber.return) {
      const props = fiber.memoizedProps;
      if (typeof props?.sendReaction !== 'function') continue;
      // Prefer the message-bound callback used by Zalo's own emoji picker.
      if (props.msgId != null) return payload => props.sendReaction(payload);
      if (props.message && props.userId) return payload => props.sendReaction(payload, props.userId, props.message);
    }
    return null;
  }
  function closeReactions(restoreFocus = false) {
    const anchor = reactionPicker?._anchor; reactionPicker?.remove(); reactionPicker = null;
    if (restoreFocus && anchor?.isConnected) anchor.focus({ preventScroll: true });
  }
  function showReactions(container, anchor) {
    if (reactionPicker?._anchor === anchor) { closeReactions(true); return; }
    closeReactions(); closeMenu(); closeDialog();
    const picker = document.createElement('div'); reactionPicker = picker; picker.id = 'zalodesk-reactions'; picker.className = 'popover-v3';
    const messageIdentity = container.closest('[data-qid]')?.getAttribute('data-qid');
    picker._anchor = anchor; picker._source = container; picker.setAttribute('role', 'dialog'); picker.setAttribute('aria-label', 'Chọn cảm xúc');
    const title = document.createElement('div'); title.className = 'zd-reaction-title'; title.textContent = 'Chọn cảm xúc'; picker.append(title);
    const grid = document.createElement('div'); grid.className = 'zd-reaction-grid'; picker.append(grid);
    const status = document.createElement('div'); status.className = 'zd-reaction-status'; status.setAttribute('role', 'status'); picker.append(status);
    for (const [rType, rIcon, emoji, name] of reactions) {
      const choice = document.createElement('button'); choice.type = 'button'; choice.className = 'zd-reaction-choice'; choice.textContent = emoji; choice.title = name; choice.setAttribute('aria-label', name); choice.dataset.reactionType = rType;
      choice.onclick = async e => {
        e.preventDefault(); e.stopPropagation();
        if (!container.isConnected || container.closest('[data-qid]')?.getAttribute('data-qid') !== messageIdentity) { status.textContent = 'Tin nhắn đã thay đổi. Hãy mở lại bảng chọn.'; return; }
        const send = reactionHandler(container);
        if (!send) { status.textContent = 'Chưa tìm thấy nút thả cảm xúc của tin nhắn này.'; return; }
        grid.querySelectorAll('button').forEach(b => b.disabled = true);
        try { await send({ rType, rIcon }); closeReactions(true); }
        catch { status.textContent = 'Không gửi được cảm xúc. Hãy thử lại.'; grid.querySelectorAll('button').forEach(b => b.disabled = false); }
      };
      grid.append(choice);
    }
    picker.onkeydown = e => {
      const buttons = [...grid.children], index = buttons.indexOf(document.activeElement);
      const steps = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 6, ArrowUp: -6 };
      if (index >= 0 && e.key in steps) { e.preventDefault(); buttons[(index + steps[e.key] + buttons.length) % buttons.length].focus(); }
    };
    document.body.append(picker);
    const r = anchor.getBoundingClientRect(); picker.style.left = `${Math.max(8, Math.min(r.left, innerWidth - picker.offsetWidth - 8))}px`;
    const above = r.top - picker.offsetHeight - 8; picker.style.top = `${Math.max(8, Math.min(above >= 8 ? above : r.bottom + 8, innerHeight - picker.offsetHeight - 8))}px`;
    grid.firstElementChild.focus({ preventScroll: true });
  }
  function messageText(frame) {
    const modern = frame.querySelector('.text-message__container');
    const text = modern || frame.querySelector('.card--text,[data-id="div_ReceivedMsg_Text"]');
    if (!text) return '';
    const restored = [];
    try {
      for (const [node, saved] of loremNodes) if (text.contains(node) && node.data === saved.fake) { restored.push([node, saved]); node.data = saved.original; }
      return (text.innerText || text.textContent || '').trim();
    } finally { for (const [node, saved] of restored) if (node.data === saved.original) node.data = saved.fake; }
  }
  function messageImage(frame) { return frame.querySelector('[data-id="div_ReceivedMsg_Photo"] img,.img-msg-v2__photo img,.img-msg-v2 img.zimg-el,.msg-photo img,.vmsg-photo-container img'); }
  async function copyMessage(frame, control) {
    const initialTitle = control.title;
    try {
      const text = messageText(frame);
      if (text) {
        try { await navigator.clipboard.writeText(text); }
        catch {
          const focus = document.activeElement, input = document.createElement('textarea'); input.value = text; input.style.cssText = 'position:fixed;left:-10000px;top:0'; document.body.append(input);
          try { input.select(); if (!document.execCommand('copy')) throw Error('copy failed'); }
          finally { input.remove(); focus?.focus({ preventScroll: true }); }
        }
      } else {
        const image = messageImage(frame); if (!image) throw Error('No copyable content');
        const response = await fetch(image.currentSrc || image.src); if (!response.ok) throw Error('Cannot read image');
        const bitmap = await createImageBitmap(await response.blob()); let png;
        try { const canvas = document.createElement('canvas'); canvas.width = bitmap.width; canvas.height = bitmap.height; canvas.getContext('2d').drawImage(bitmap, 0, 0); png = await new Promise(resolve => canvas.toBlob(resolve, 'image/png')); }
        finally { bitmap.close(); }
        if (!png) throw Error('Cannot encode image'); await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })]);
      }
      control.title = 'Đã sao chép'; control.setAttribute('aria-label', 'Đã sao chép'); control.dataset.copied = 'true';
    } catch { control.title = 'Không sao chép được tin nhắn này'; control.setAttribute('aria-label', control.title); }
    setTimeout(() => { if (control.isConnected) { control.title = initialTitle; control.setAttribute('aria-label', initialTitle); delete control.dataset.copied; } }, 1600);
  }
  function toolButton(kind, title, paths, action) {
    const control = document.createElement('button'); control.type = 'button'; control.className = `zd-message-tool zd-${kind}`; control.title = title; control.setAttribute('aria-label', title);
    control.innerHTML = `<span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg></span>`;
    control.onclick = e => { e.preventDefault(); e.stopPropagation(); action(control); }; return control;
  }
  function syncMessageTools() {
    if (disposed || !document.body) return;
    syncHoverActions();
    return;
  }
  function fitActionBar(toolbar) {
    if (!toolbar.matches('.MQA-contents')) return;
    const surface = toolbar.closest('.MQA-container') || toolbar;
    const previous = actionOffsets.get(surface) || { x: 0, y: 0, original: surface.style.translate };
    let left = 4, right = innerWidth - 4, top = 4, bottom = innerHeight - 4;
    for (let parent = surface.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
      const css = getComputedStyle(parent), r = parent.getBoundingClientRect();
      if (/hidden|clip|auto|scroll/.test(css.overflowX)) { left = Math.max(left, r.left + 4); right = Math.min(right, r.right - 4); }
      if (/hidden|clip|auto|scroll/.test(css.overflowY)) { top = Math.max(top, r.top + 4); bottom = Math.min(bottom, r.bottom - 4); }
    }
    const r = toolbar.getBoundingClientRect(), baseLeft = r.left - previous.x, baseTop = r.top - previous.y;
    const x = Math.max(left, Math.min(baseLeft, right - r.width)) - baseLeft;
    const y = Math.max(top, Math.min(baseTop, bottom - r.height)) - baseTop;
    if (!actionOffsets.has(surface) || x !== previous.x || y !== previous.y) surface.style.translate = `${x}px ${y}px`;
    actionOffsets.set(surface, { ...previous, x, y });
  }
  function fitVisibleActions() { document.querySelectorAll('.MQA-contents:has(> .zd-copy-action)').forEach(fitActionBar); }
  function syncHoverActions() {
    for (const [surface, offset] of actionOffsets) {
      if (!config.quickCopy) surface.style.translate = offset.original;
      if (!surface.isConnected || !config.quickCopy) actionOffsets.delete(surface);
    }
    document.querySelectorAll('[data-zd-message-tools]').forEach(e => e.remove());
    if (!config.quickCopy) document.querySelectorAll('.zd-copy-action').forEach(e => e.remove());
    if (!config.moreReactions) document.querySelectorAll('.zd-reaction-tier').forEach(e => e.remove());
    const actionBars = new Set(document.querySelectorAll('.MQA-contents,.chat-message__actions'));
    document.querySelectorAll('.chat-message__actions__btn__reply,.chat-message__actions__btn__forward,.chat-message__actions__btn__more,[data-id$="Msg_Quote"],[data-id$="Msg_FWD"]').forEach(e => actionBars.add(e.parentElement));
    for (const toolbar of actionBars) {
      const bubble = toolbar.closest('.chat-message,.msg-item');
      const frame = bubble?.querySelector('[data-qid],.message-frame') || bubble;
      if (!config.quickCopy || !frame) continue;
      const existingCopy = toolbar.querySelector('.zd-copy-action');
      const reply = toolbar.querySelector('[data-translate-title="STR_REPLY_MSG"],.chat-message__actions__btn__reply') || [...toolbar.children].find(el => !el.classList.contains('zd-copy-action'));
      if (existingCopy) { if (reply && reply.nextElementSibling !== existingCopy) reply.after(existingCopy); fitActionBar(toolbar); continue; }
      bubble.querySelector('.zd-copy-standalone')?.remove();
      const copy = document.createElement('div'); copy.className = 'MSABtn-btn zd-copy zd-copy-action';
      copy.title = 'Sao chép nhanh'; copy.setAttribute('aria-label', copy.title); copy.setAttribute('role', 'button'); copy.tabIndex = 0;
      copy.innerHTML = '<div class="MSABtn-btn-icon-wrapper"><svg class="MSABtn-btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg></div>';
      copy.onclick = e => { e.preventDefault(); e.stopPropagation(); copyMessage(frame, copy); };
      copy.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); copy.click(); } };
      copy.onpointerdown = e => e.stopPropagation(); if (reply) reply.after(copy); else toolbar.append(copy);
      fitActionBar(toolbar);
    }
    if (!config.moreReactions) return;
    for (const wrapper of document.querySelectorAll('.emoji-list-wrapper')) {
      if (wrapper.querySelector('.zd-reaction-tier')) continue;
      const container = wrapper.closest('.message-reaction-container'); if (!container) continue;
      const tier = document.createElement('div'); tier.className = 'zd-reaction-tier'; tier.setAttribute('aria-label', 'Thêm cảm xúc');
      tier.onmousedown = e => e.stopPropagation();
      for (const [rType, rIcon, emoji, name] of reactions) {
        if ([0, 20, 2, 3, 32, 5].includes(rType)) continue; // Already in Zalo's native first row.
        const choice = document.createElement('button'); choice.type = 'button'; choice.className = 'reaction-emoji-icon';
        const glyph = document.createElement('span'); glyph.className = 'emoji-sizer emoji-outer zd-reaction-glyph';
        const sprite = reactionSprites[rIcon] || (rIcon === '⛄️' ? 'emoji/emoji-40/row-21-column-3.png' : null);
        if (sprite) glyph.style.backgroundImage = `url("${sprite}")`; else glyph.textContent = emoji;
        choice.append(glyph);
        choice.title = name; choice.setAttribute('aria-label', name); choice.dataset.reactionType = rType;
        choice.onclick = async e => {
          e.preventDefault(); e.stopPropagation(); const send = container.isConnected && reactionHandler(container);
          if (!send) { choice.title = 'Không tìm thấy tin nhắn để gửi cảm xúc'; return; }
          choice.disabled = true;
          try { await send({ rType, rIcon }); } catch { choice.title = 'Không gửi được cảm xúc'; }
          finally { choice.disabled = false; }
        }; tier.append(choice);
      }
      const list = wrapper.querySelector('.reaction-emoji-list'); if (!list) continue;
      list.prepend(tier);
    }
  }
  function scheduleMessageTools() { if (disposed || messageTimer) return; messageTimer = setTimeout(() => { messageTimer = null; syncMessageTools(); }, 120); }
  function blurEffectChoice(parent) {
    const label = document.createElement('label'); label.className = 'zd-range'; label.style.display = 'block';
    label.textContent = 'Kiểu che nội dung';
    const select = document.createElement('select'); select.dataset.config = 'blurEffect'; select.setAttribute('aria-label', 'Kiểu che nội dung');
    select.style.cssText = 'display:block;width:100%;margin-top:6px;padding:6px;background:var(--layer-background);color:var(--text-primary);border:1px solid var(--border);border-radius:4px';
    for (const [value, name] of Object.entries(blurEffects)) { const option = document.createElement('option'); option.value = value; option.textContent = name; select.append(option); }
    select.value = config.blurEffect;
    select.onchange = () => { config.blurEffect = select.value; save(); };
    label.append(select); parent.append(label);
    note(parent, 'Xem thử — rê chuột để hiện nội dung:');
    const preview = document.createElement('div'); preview.className = 'zd-effect-preview'; preview.style.cssText = 'margin:0 10px 8px;overflow:visible;border-radius:6px';
    const sample = document.createElement('div'); sample.style.cssText = 'height:64px;display:grid;place-content:center;background:linear-gradient(110deg,#2a9d8f,#e9c46a,#e76f51);color:#172b4d;font-weight:600'; sample.textContent = config.blurEffect === 'lorem' ? 'Lorem ipsum dolor sit amet' : 'Tin nhắn riêng tư';
    preview.append(sample); parent.append(preview);
    preview.onmouseenter = () => { sample.style.filter = 'none'; };
    preview.onmouseleave = () => { sample.style.filter = effectFilter(); };
    sample.style.filter = effectFilter();
    const previousChange = select.onchange;
    select.onchange = () => { previousChange(); sample.style.filter = effectFilter(); };
  }
  function blurRange(parent) {
    note(parent, 'MỨC ĐỘ CHE', 'zd-section'); const range = document.createElement('div'); range.className = 'zd-range';
    const input = document.createElement('input'); input.type = 'range'; input.min = '2'; input.max = '20'; input.value = config.blurLevel; input.setAttribute('aria-label', 'Độ mờ tin nhắn');
    const value = document.createElement('span'); value.className = 'zd-note'; value.dataset.strengthValue = ''; value.textContent = config.blurEffect === 'lorem' ? 'Giữ nguyên kiểu chữ gốc' : (config.blurEffect === 'mosaic' ? `Ô ${config.blurLevel} × ${config.blurLevel}px` : `${config.blurLevel}px`);
    input.oninput = () => { config.blurLevel = Number(input.value); value.textContent = config.blurEffect === 'lorem' ? 'Giữ nguyên kiểu chữ gốc' : `${config.blurLevel}px`; save(); }; range.append(input, value); parent.append(range);
  }
  function row(parent, label, action, key) {
    const el = document.createElement('div'); el.className = 'zmenu-item --NORMAL md'; el.tabIndex = 0; el.setAttribute('role', key ? 'menuitemcheckbox' : 'menuitem');
    if (key) { el.dataset.config = key; el.setAttribute('aria-checked', String(config[key])); }
    const text = document.createElement('span'); text.className = 'zd-label'; text.textContent = label; el.append(text);
    if (key) { const toggle = document.createElement('span'); toggle.className = 'zd-switch'; toggle.setAttribute('aria-hidden', 'true'); el.append(toggle); }
    el.onclick = e => { e.stopPropagation(); if (key) { config[key] = !config[key]; save(); } else action?.(); };
    el.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); el.click(); } }; parent.append(el); return el;
  }
  function note(parent, text, cls = 'zd-note') { const el = document.createElement('div'); el.className = cls; el.textContent = text; parent.append(el); }
  function openMenu() {
    if (menu) { closeMenu(); return; } closeReactions(); closeDialog(); document.body.click();
    menu = document.createElement('div'); menu.id = 'zalodesk-menu'; menu.className = 'popover-v3 popover-v3--unselect'; menu.setAttribute('role', 'menu');
    const menuBody = document.createElement('div'); menuBody.className = 'zd-main zmenu-body has-submenu'; menu.append(menuBody);
    note(menuBody, 'ZaloDesk', 'zmenu-item subtitle');
    const groups = [['privacy', 'Riêng tư', 'Lock'], ['appearance', 'Giao diện', 'Photo'], ['tools', 'Công cụ', 'Setting'], ['settings', 'Cài đặt', 'Setting']];
    for (const [id, title, glyph] of groups) {
      const group = row(menuBody, title); group.dataset.group = id; group.classList.add('--SUBMENU'); group.setAttribute('aria-haspopup', 'menu'); group.setAttribute('aria-expanded', 'false');
      const image = document.createElement('span'); image.className = 'menu-icon left'; image.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${menuIcons[id]}</svg>`; group.prepend(image);
      const arrow = document.createElement('span'); arrow.className = 'zd-arrow'; arrow.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m9 5 7 7-7 7"/></svg>'; group.append(arrow);
      const sub = document.createElement('div'); sub.className = 'zd-sub zmenu-body content-only sub-menu'; sub.setAttribute('role', 'menu'); group.append(sub);
      if (id === 'privacy') {
        const status = document.createElement('div'); status.className = 'zd-note'; status.dataset.privacyStatus = ''; status.textContent = config.privacyPaused ? 'Đang tạm tắt che. Các lựa chọn bên dưới vẫn được ghi nhớ.' : 'Bật/tắt nhanh giữ nguyên bộ cài đặt bên dưới.'; sub.append(status);
        note(sub, 'TIN NHẮN', 'zd-section'); row(sub, 'Chặn “đang soạn tin”', null, 'typing'); row(sub, 'Chặn gửi “đã xem” · HTTP', null, 'seen');
        note(sub, 'Chặn trên Zalo PC này. Trạng thái từ điện thoại hoặc kênh khác vẫn có thể được gửi.');
        note(sub, 'CHE NỘI DUNG', 'zd-section'); row(sub, 'Làm mờ danh sách trò chuyện', null, 'blurList'); row(sub, 'Làm mờ nội dung chat', null, 'blur'); blurEffectChoice(sub); blurRange(sub); row(sub, 'Che tên người dùng', null, 'names'); row(sub, 'Thay avatar hiển thị', null, 'avatars'); avatarSubmenu(sub); note(sub, 'Rê chuột vào để xem. Avatar chỉ thay trên máy bạn.');
      } else if (id === 'appearance') {
        row(sub, 'Chọn theme…', showThemes); row(sub, 'Theo giao diện gốc của Zalo', () => { config.theme = 'default'; save(); });
        note(sub, 'THANH BÊN', 'zd-section'); row(sub, 'Ẩn Zalo Cloud', null, 'hideCloud'); row(sub, 'Ẩn Chụp màn hình', null, 'hideScreenshot'); row(sub, 'Ẩn Công cụ Zalo', null, 'hideTools');
      } else if (id === 'tools') {
        row(sub, 'Nút sao chép nhanh', null, 'quickCopy'); row(sub, 'Thêm nhiều cảm xúc', null, 'moreReactions'); note(sub, 'Rê vào tin nhắn để thấy nút cạnh reaction.');
        const quick = row(sub, config.privacyPaused ? 'Bật lại che nội dung' : 'Tạm tắt che nội dung', toggleQuickPrivacy); quick.dataset.quickPrivacy = '';
        note(sub, 'Ctrl + Shift + P: tạm tắt hoặc bật lại đúng bộ cài đặt đã chọn.');
      } else { row(sub, 'Hiệu ứng chuyển động', null, 'motion'); note(sub, 'Tùy chọn được lưu tự động trên Zalo PC này.'); note(sub, `ZaloDesk ${VERSION} · Tiện ích độc lập dành cho Zalo PC.`); note(sub, '© 2026 HAVY'); }
      const activate = () => {
        menu.querySelectorAll('[data-group]').forEach(g => { const on = g === group; g.classList.toggle('zd-active', on); g.setAttribute('aria-expanded', String(on)); g.querySelector('.zd-sub').classList.toggle('open', on); if (!on) g.querySelectorAll('.zd-sub.open').forEach(child => child.classList.remove('open')); });
        const r = menu.getBoundingClientRect(), gr = group.getBoundingClientRect(); sub.style.left = `${r.right + sub.offsetWidth < innerWidth - 8 ? r.right - 1 : Math.max(8, r.left - sub.offsetWidth + 1)}px`; sub.style.top = `${Math.max(8, Math.min(gr.top - 6, innerHeight - sub.offsetHeight - 8))}px`;
      };
      group.onmouseenter = activate; group.onclick = e => { if (e.target.closest('.zd-sub')) return; e.stopPropagation(); activate(); };
      group.onkeydown = e => { if (['ArrowRight', 'Enter', ' '].includes(e.key) && e.target === group) { e.preventDefault(); activate(); sub.querySelector('[tabindex]')?.focus(); } if (e.key === 'ArrowLeft') { e.preventDefault(); sub.classList.remove('open'); group.setAttribute('aria-expanded', 'false'); group.focus(); } };
    }
    note(menuBody, '© 2026 HAVY');
    menu.onkeydown = e => { if (!['ArrowDown', 'ArrowUp'].includes(e.key)) return; const parent = e.target.closest('.zd-sub') || menuBody, rows = [...parent.children].filter(el => el.classList.contains('zmenu-item') && el.hasAttribute('tabindex')), idx = rows.indexOf(e.target); if (idx < 0) return; e.preventDefault(); rows[(idx + (e.key === 'ArrowDown' ? 1 : rows.length - 1)) % rows.length].focus(); };
    document.body.append(menu); const r = button.getBoundingClientRect(); menu.style.left = `${Math.max(8, Math.min(r.left + 8, innerWidth - menu.offsetWidth - 8))}px`; menu.style.top = `${Math.max(8, Math.min(r.top - menu.offsetHeight - 6, innerHeight - menu.offsetHeight - 8))}px`;
    button.classList.add('selected'); button.setAttribute('aria-expanded', 'true'); menu.querySelector('[data-group]').focus();
  }
  function mount() {
    if (disposed || !document.body) return false; if (button?.isConnected) return true;
    for (const el of [style, visual, themeStyle]) if (!el.isConnected) document.documentElement.append(el);
    const cloud = document.querySelector('[data-id="div_Main_Tab_zCloud"]'), nav = document.querySelector('.nav__tabs__bottom'); if (!cloud?.parentElement && !nav) return false;
    button = document.createElement('div'); button.id = 'zalodesk-sidebar-button'; button.tabIndex = 0; button.setAttribute('role', 'button'); button.setAttribute('aria-label', 'ZaloDesk'); button.setAttribute('aria-haspopup', 'menu'); button.setAttribute('aria-expanded', 'false'); button.title = 'ZaloDesk';
    button.className = 'clickable leftbar-tab flx flx-col flx-al-c flx-center rel'; button.innerHTML = `<div class="mmi-icon-wr"><div class="z-noti-badge-container"><span class="internal-icon zd-icon">${icon}</span></div></div><div class="lb-tab-title truncate">ZaloDesk</div>`;
    button.onclick = e => { e.preventDefault(); e.stopPropagation(); openMenu(); }; button.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); button.click(); } }; if (cloud?.parentElement) cloud.before(button); else nav.prepend(button); return true;
  }
  function pointer(e) {
    if (menu && !menu.contains(e.target) && !button?.contains(e.target)) closeMenu();
    if (reactionPicker && !reactionPicker.contains(e.target) && !reactionPicker._anchor?.contains(e.target)) closeReactions();
  }
  function hoverTools() { scheduleMessageTools(); }
  function keyboard(e) {
    if (e.key === 'Escape' && reactionPicker) { e.preventDefault(); e.stopPropagation(); closeReactions(true); return; }
    if (e.key === 'Escape' && (menu || dialog)) {
      e.preventDefault(); e.stopPropagation();
      if (dialog) { closeDialog(); return; }
      const deepest = [...menu.querySelectorAll('.zd-sub.open')].pop();
      if (deepest) { deepest.classList.remove('open'); const trigger = deepest.parentElement; trigger.setAttribute('aria-expanded', 'false'); trigger.classList.remove('zd-active'); trigger.focus(); }
      else { closeMenu(); button?.focus(); }
      return;
    }
    if (e.ctrlKey && e.shiftKey && e.code === 'KeyP' && !e.repeat) { e.preventDefault(); toggleQuickPrivacy(); }
    if (e.key === 'Tab' && dialog) { const controls = [...dialog.querySelectorAll('button')], idx = controls.indexOf(document.activeElement); e.preventDefault(); controls[(idx + (e.shiftKey ? controls.length - 1 : 1)) % controls.length].focus(); }
  }
  const resize = () => { closeMenu(); closeReactions(); fitVisibleActions(); };
  document.addEventListener('scroll', fitVisibleActions, true);
  document.addEventListener('pointerdown', pointer, true); document.addEventListener('pointerover', hoverTools, true); document.addEventListener('keydown', keyboard, true); window.addEventListener('resize', resize);
  const observer = new MutationObserver(records => {
    if (disposed) return;
    syncLoremText();
    // Native hover actions are created after Zalo's own hover timer. Add copy
    // in this mutation microtask, before paint, rather than 120 ms later.
    const actionsChanged = records.some(record =>
      record.target.nodeType === 1 && record.target.matches('.MQA-contents,.chat-message__actions') ||
      [...record.addedNodes].some(node => node.nodeType === 1 &&
        (node.matches('.MQA-contents,.chat-message__actions,.chat-message') || node.querySelector('.MQA-contents,.chat-message__actions'))));
    if (actionsChanged) syncHoverActions();
    else scheduleMessageTools();
    if (button?.isConnected || queued) return;
    queued = true; setTimeout(() => { queued = false; mount(); }, 250);
  }); observer.observe(document, { childList: true, characterData: true, subtree: true });
  window[KEY] = { version: VERSION, signature: SIGNATURE, mount, shouldBlock, get settings() { return { ...config }; }, dispose() {
    document.removeEventListener('scroll', fitVisibleActions, true);
    for (const [surface, offset] of actionOffsets) surface.style.translate = offset.original;
    actionOffsets.clear();
    disposed = true; clearInterval(particleTimer); observer.disconnect(); restoreLorem(); document.removeEventListener('pointerover', loremHover, true); document.removeEventListener('pointerout', loremHover, true); clearTimeout(messageTimer); document.querySelectorAll('[data-zd-message-tools],.zd-copy-action,.zd-reaction-tier').forEach(e => e.remove()); document.querySelectorAll('.zd-copy-anchor').forEach(e=>e.classList.remove('zd-copy-anchor')); document.removeEventListener('pointerdown', pointer, true); document.removeEventListener('pointerover', hoverTools, true); document.removeEventListener('keydown', keyboard, true); window.removeEventListener('resize', resize); closeMenu(); closeDialog(); closeReactions(); button?.remove(); style.remove(); visual.remove(); themeStyle.remove(); privacyFilters.remove();
    if (window.fetch === wrappedFetch) window.fetch = original.fetch; if (XMLHttpRequest.prototype.open === wrappedOpen) XMLHttpRequest.prototype.open = original.open; if (XMLHttpRequest.prototype.send === wrappedSend) XMLHttpRequest.prototype.send = original.send; delete window[KEY];
  } };
  apply(); return mount() ? 'mounted' : 'waiting';
})();
