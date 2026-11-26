(async()=>{
 const passed=[],sent=[],assert=(ok,s)=>{if(!ok)throw Error(s);passed.push(s)},wait=()=>new Promise(r=>setTimeout(r,250));
 const el=document.createElement('div');el.className='chat-message';el.style.cssText='position:fixed;left:-10000px';
 el.innerHTML='<div class="message-frame" data-qid="zd-test"><div class="text-message__container">Test</div><div class="message-reaction-container message-reaction-container-v2"><div><div class="msg-reaction-icon"></div><div class="emoji-list-wrapper"><div class="reaction-emoji-list"></div></div></div></div></div><div class="MQA-contents"><div class="MSABtn-btn"></div></div>';
 el.querySelector('.msg-reaction-icon').__reactFiber$zd={memoizedProps:{msgId:'zd-test',sendReaction:p=>sent.push(p)},return:null};
 try{document.body.append(el);await new Promise(resolve=>queueMicrotask(resolve));
 assert(!!el.querySelector('.zd-copy'),'Copy inserted in mutation microtask without the 120ms delay');
 await wait();
 assert(el.querySelector('.MQA-contents').children[1].classList.contains('zd-copy'),'Copy immediately after reply in native hover action bar');
 assert(el.querySelector('.zd-copy').classList.contains('MSABtn-btn'),'Copy uses native action button class');
 assert(!el.querySelector('.zd-copy-standalone'),'No standalone copy button');
 assert(!el.querySelector('.message-reaction-container .zd-copy,.zd-more-reactions'),'No extra buttons beside like');
 const tier=el.querySelector('.reaction-emoji-list > .zd-reaction-tier');assert(tier?.children.length===30,'30 additional reactions integrated into native list, without six duplicates');
 assert(getComputedStyle(tier).display==='grid'&&tier.parentElement.firstElementChild===tier,'Extended reactions are above the native bottom row in one picker');
 const wrapper=tier.closest('.emoji-list-wrapper');wrapper.classList.add('show-elist');
 const choice=tier.querySelector('button');
 assert(choice.classList.contains('reaction-emoji-icon')&&!!choice.querySelector(':scope > span'),'New emoji uses native reaction cell and animated span');
 assert([...tier.querySelectorAll('button > span')].every(e=>getComputedStyle(e).backgroundImage.includes('emoji/emoji-40/')),'Every added reaction uses the Zalo image set');
 assert([...tier.querySelectorAll('button > span')].every(e=>getComputedStyle(e).width==='22px'&&getComputedStyle(e).height==='22px'),'Uniform 22px image size');
 assert(getComputedStyle(choice).animationName==='zoom-reaction-icon','Opening uses native reaction pop-in animation');
 wrapper.classList.remove('show-elist');wrapper.classList.add('hide-elist');
 assert(getComputedStyle(wrapper).opacity==='0'&&getComputedStyle(wrapper).pointerEvents==='none','New reactions hide with the native picker');
 tier.querySelector('[data-reaction-type="46"]').click();await wait();assert(sent.length===1&&sent[0].rIcon===':handclap','Choice invokes bound callback once');
 el.append(document.createElement('span'));await wait();assert(el.querySelectorAll('.zd-copy').length===1&&el.querySelectorAll('.zd-reaction-tier').length===1,'No duplicates after DOM changes');
 return{passed};}finally{el.remove();}
})();
