(async()=>{
 const fixture=document.createElement('div');fixture.className='chat-message';fixture.style.cssText='position:fixed;left:-10000px';
 fixture.innerHTML='<div class="message-reaction-container message-reaction-container-v2"><div class="emoji-list-wrapper"><div class="reaction-emoji-list"></div></div></div>';
 try{document.body.append(fixture);await new Promise(r=>setTimeout(r,250));
 const glyphs=[...fixture.querySelectorAll('.zd-reaction-glyph')];
 const loaded=await Promise.all(glyphs.map(async e=>{const i=new Image();i.src=e.style.backgroundImage.slice(5,-2);try{await i.decode();return true;}catch{return false;}}));
 if(glyphs.length!==30||loaded.some(x=>!x))throw Error('Some native reaction image paths failed to load');
 return {loaded:loaded.length,total:glyphs.length};
 }finally{fixture.remove();}
})();
