(() => {
  const api=window.__zaloDeskV2, original=api.settings, passed=[];
  const close=()=>{for(let i=0;i<5;i++)document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));};
  const open=group=>{close();document.getElementById('zalodesk-sidebar-button').click();document.querySelector(`[data-group=${group}]`).click();};
  const set=(key,value)=>{if(api.settings[key]===value)return;open('privacy');document.querySelector(`[data-config=${key}]`).click();};
  const shortcut=(repeat=false)=>document.dispatchEvent(new KeyboardEvent('keydown',{key:'P',code:'KeyP',ctrlKey:true,shiftKey:true,repeat,bubbles:true}));
  const assert=(ok,text)=>{if(!ok)throw Error(text);passed.push(text);};
  const root=document.createElement('div');root.style.cssText='position:fixed;left:-10000px';root.innerHTML='<div class="conv-item-body">Preview</div><div class="chat-message"><div class="text-message__container">Text</div></div><div class="header-title">Name</div>';
  try {
    document.body.append(root);if(api.settings.privacyPaused)shortcut();
    set('blurList',true);set('blur',false);set('names',false);set('avatars',true);close();
    const saved=api.settings;
    assert(getComputedStyle(root.querySelector('.conv-item-body')).filter.includes('blur'),'Initial configured preview blur active');
    shortcut();assert(api.settings.privacyPaused,'Shortcut pauses masking');
    assert(['blurList','blur','names','avatars','blurLevel','avatar','typing','seen'].every(k=>api.settings[k]===saved[k]),'Pause preserves chosen flags, strength, avatar and blocking options');
    assert(getComputedStyle(root.querySelector('.conv-item-body')).filter==='none','Pause reveals preview');
    shortcut(true);assert(api.settings.privacyPaused,'Holding shortcut does not toggle repeatedly');
    set('names',true);close();assert(getComputedStyle(root.querySelector('.header-title')).filter==='none','Editing preferences while paused does not re-enable effects');
    const stored=JSON.parse(localStorage.getItem('zalodesk.settings.v2'));assert(stored.privacyPaused&&stored.names&&stored.blurList&&!stored.blur,'Paused state and edited preferences persist');
    open('tools');assert(document.querySelector('[data-quick-privacy]').textContent==='Bật lại che nội dung','Menu describes restore action');
    document.querySelector('[data-quick-privacy]').click();assert(!api.settings.privacyPaused,'Menu restores masking');
    assert(api.settings.blurList&&!api.settings.blur&&api.settings.names&&api.settings.avatars,'Restore uses exact choices plus edits made while paused');
    close();assert(getComputedStyle(root.querySelector('.conv-item-body')).filter.includes('blur')&&getComputedStyle(root.querySelector('.header-title')).filter.includes('blur')&&getComputedStyle(root.querySelector('.text-message__container')).filter==='none','Restored CSS matches remembered settings');
    return {passed};
  } finally {
    for(const key of ['blurList','blur','names','avatars'])set(key,original[key]);
    if(api.settings.privacyPaused!==original.privacyPaused)shortcut();close();root.remove();
  }
})();
