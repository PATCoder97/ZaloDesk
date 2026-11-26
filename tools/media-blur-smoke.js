(() => {
  const api=window.__zaloDeskV2,original=api.settings.blur,passed=[];
  const close=()=>{for(let i=0;i<5;i++)document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));};
  const set=value=>{if(api.settings.blur===value)return;close();document.getElementById('zalodesk-sidebar-button').click();document.querySelector('[data-group=privacy]').click();document.querySelector('[data-config=blur]').click();close();};
  const root=document.createElement('div');root.style.cssText='position:fixed;left:-10000px';
  const types=['text-message__container','img-msg-v2','card--group-photo','file-message__container','video-msg-container','chatStickerMessage','chatGifMessage','future-message-type'];
  for(const cls of types){const bubble=document.createElement('div');bubble.className='chat-message';bubble.innerHTML=`<div class="message-action"><div class="${cls}">Content</div><div class="message-reaction-container">Reaction</div></div><div class="card-send-time">Time</div>`;root.append(bubble);}
  const assert=(ok,s)=>{if(!ok)throw Error(s);passed.push(s);};
  try{document.body.append(root);set(true);
    types.forEach(cls=>assert(getComputedStyle(root.querySelector('.'+cls)).filter.includes('blur'),cls+' blurs'));
    assert([...root.querySelectorAll('.message-reaction-container,.card-send-time')].every(e=>getComputedStyle(e).filter==='none'),'Reaction and time remain unblurred');
    assert([...root.querySelectorAll('.message-action > div:first-child')].every(e=>getComputedStyle(e.firstElementChild||e).filter.includes('blur')),'All content roots covered');
    set(false);assert([...root.querySelectorAll('.message-action > div')].every(e=>getComputedStyle(e).filter==='none'),'Turning off restores all content');
    return{passed};
  }finally{root.remove();set(original);close();}
})();
