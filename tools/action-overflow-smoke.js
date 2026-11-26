(async () => {
  const passed = [], check = (ok, text) => { if (!ok) throw Error(text); passed.push(text); };
  const host = document.createElement('div'); host.className = 'chat-message';
  host.style.cssText = 'position:fixed;left:100px;top:150px;width:200px;height:100px;overflow:hidden;z-index:-1';
  host.innerHTML = '<div class="message-frame" data-qid="zd-overflow"><div class="text-message__container">test</div></div><div class="floating-menu-wrapper" style="position:absolute;left:180px;top:30px"><div class="MQA-container"><div class="MQA-contents" style="display:flex"><div class="MSABtn-btn"></div><div class="MSABtn-btn"></div><div class="MSABtn-btn"></div></div></div></div>';
  try {
    document.body.append(host); await new Promise(r => setTimeout(r, 200));
    const bar = host.querySelector('.MQA-contents');
    const fits = () => { const outer=host.getBoundingClientRect(), inner=bar.getBoundingClientRect(); return inner.left>=outer.left+3 && inner.right<=outer.right-3; };
    check(fits(), 'Four-button bar fits clipping ancestor even when anchored past its right edge');
    check([...bar.children].every(e => e.getBoundingClientRect().width === 24), 'All four buttons remain 24px wide');
    host.querySelector('.floating-menu-wrapper').style.left = '-60px';
    document.dispatchEvent(new Event('scroll')); check(fits(), 'Bar also fits after moving past left edge');
    for(let i=0;i<5;i++)document.dispatchEvent(new Event('scroll'));
    check(fits(), 'Repeated positioning does not drift');
    return { passed };
  } finally { host.remove(); }
})();
