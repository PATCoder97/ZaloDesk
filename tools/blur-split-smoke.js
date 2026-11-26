(() => {
  const api = window.__zaloDeskV2, original = api.settings, passed = [];
  const close = () => { for(let i=0;i<5;i++)document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})); };
  const set = (key, value) => { if(api.settings[key]===value)return;close();document.getElementById('zalodesk-sidebar-button').click();document.querySelector('[data-group=privacy]').click();document.querySelector(`[data-config=${key}]`).click(); };
  const fixture=document.createElement('div'); fixture.style.cssText='position:fixed;left:-10000px';
  fixture.innerHTML='<div class="conv-item-body">Preview</div><div class="chat-message"><div class="text-message__container">Message</div></div>';
  const assert=(condition,text)=>{if(!condition)throw Error(text);passed.push(text);};
  try {
    document.body.append(fixture);
    set('blur',false);set('blurList',true);
    assert(getComputedStyle(fixture.querySelector('.conv-item-body')).filter.includes('blur')&&getComputedStyle(fixture.querySelector('.text-message__container')).filter==='none','Only left conversation preview blurs');
    set('blurList',false);set('blur',true);
    assert(getComputedStyle(fixture.querySelector('.conv-item-body')).filter==='none'&&getComputedStyle(fixture.querySelector('.text-message__container')).filter.includes('blur'),'Only open chat content blurs');
    set('blurList',true);
    assert(getComputedStyle(fixture.querySelector('.conv-item-body')).filter.includes('blur')&&getComputedStyle(fixture.querySelector('.text-message__container')).filter.includes('blur'),'Both can be enabled together');
    const stored=JSON.parse(localStorage.getItem('zalodesk.settings.v2'));
    assert(stored.blur===true&&stored.blurList===true,'Independent settings persist');
    return {passed};
  } finally {set('blur',original.blur);set('blurList',original.blurList);fixture.remove();close();}
})();
