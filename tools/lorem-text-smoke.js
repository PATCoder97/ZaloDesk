(async () => {
  const api = window.__zaloDeskV2, original = api.settings, passed = [];
  const assert = (ok, name) => { if (!ok) throw Error(name); passed.push(name); };
  const close = () => { for (let i=0;i<5;i++) document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})); };
  const open = () => { close(); document.getElementById('zalodesk-sidebar-button').click(); document.querySelector('[data-group=privacy]').click(); };
  const choose = value => { const select = document.querySelector('[data-config=blurEffect]'); select.value=value; select.dispatchEvent(new Event('change')); };
  const set = (key,value) => { if(api.settings[key]!==value) document.querySelector(`[data-config=${key}]`).click(); };
  const pause = () => document.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyP',ctrlKey:true,shiftKey:true,bubbles:true}));
  const root = document.createElement('div'); root.style.cssText='position:fixed;left:-2000px';
  root.innerHTML='<div class="conv-item"><span class="conv-item-title__name">Real name</span><div class="conv-item-body">Private preview 123</div></div><div class="chat-message"><div class="message-action"><div class="card--text">Secret <strong>message</strong><br>next line</div><div class="card-send-time">12:00</div></div></div>';
  document.body.append(root);
  const text=root.querySelector('.card--text'), strong=text.querySelector('strong');
  try {
    if(api.settings.privacyPaused) pause();
    open();set('blur',true);set('blurList',true);choose('lorem');
    assert(text.textContent!=='Secret messagenext line' && text.textContent.toLowerCase().includes('lorem'),'Text nodes show dummy words');
    assert(text.querySelector('strong')===strong && text.querySelector('br'),'Original formatting and child elements preserved');
    assert(getComputedStyle(text).filter==='none' && getComputedStyle(root.querySelector('.conv-item-body')).filter==='none','No covering filter on text');
    assert(root.querySelector('.card-send-time').textContent==='12:00' && root.querySelector('.conv-item-title__name').textContent==='Real name','Names and timestamps unchanged');
    text.dispatchEvent(new PointerEvent('pointerover',{bubbles:true}));
    assert(text.textContent==='Secret messagenext line','Hover restores original text');
    text.dispatchEvent(new PointerEvent('pointerout',{bubbles:true,relatedTarget:document.body}));
    assert(text.textContent!=='Secret messagenext line','Leaving masks text again');
    text.firstChild.data='Updated message';
    await new Promise(resolve=>setTimeout(resolve,0));
    assert(!text.textContent.includes('Updated message'),'New text is masked after renderer updates');
    pause();
    assert(text.textContent==='Updated messagemessagenext line','Pause restores latest content without overwriting renderer updates');
    pause();choose('soft');
    assert(root.querySelector('.conv-item-body').textContent==='Private preview 123','Changing effects restores original preview');
  } finally {
    open();choose(original.blurEffect);set('blur',original.blur);set('blurList',original.blurList);
    if(api.settings.privacyPaused!==original.privacyPaused) pause();
    root.remove();close();
  }
  return {passed};
})();
