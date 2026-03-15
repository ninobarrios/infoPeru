(function(){
  const accRoot = document.getElementById('faq');
  if(!accRoot) return;

  const items = accRoot.querySelectorAll('.accordion-item');

  items.forEach(item => {
    const btn = item.querySelector('.accordion-btn');
    const panel = item.querySelector('.accordion-panel');

    // initialize aria
    btn.setAttribute('aria-expanded', 'false');
    panel.classList.remove('open');

    // click handler
    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // close all
      items.forEach(i => {
        const b = i.querySelector('.accordion-btn');
        const p = i.querySelector('.accordion-panel');
        b.setAttribute('aria-expanded', 'false');
        p.classList.remove('open');
        p.style.maxHeight = null;
      });

      if(!isOpen){
        // open current
        btn.setAttribute('aria-expanded', 'true');
        panel.classList.add('open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });

    // keyboard support
    btn.addEventListener('keydown', (e) => {
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        btn.click();
      }
    });
  });
})();