(() => {
  const progress = document.querySelector('.reading-progress');
  const updateProgress = () => {
    if (!progress) return;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
  };
  addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  document.querySelectorAll('[data-copy]').forEach((button) => {
    button.addEventListener('click', async () => {
      const target = document.querySelector(button.dataset.copy);
      if (!target) return;
      try {
        await navigator.clipboard.writeText(target.textContent.trim());
        const old = button.textContent;
        button.textContent = 'کپی شد';
        setTimeout(() => { button.textContent = old; }, 1800);
      } catch { button.textContent = 'کپی نشد'; }
    });
  });

  const filterList = (inputSelector, gridSelector, itemSelector) => {
    const input = document.querySelector(inputSelector);
    const grid = document.querySelector(gridSelector);
    if (!input || !grid) return;
    const items = [...grid.querySelectorAll(itemSelector)];
    const normalize = (value) => value.replace(/[\u064B-\u065F\u0670]/g, '').replace(/[يى]/g, 'ی').replace(/ك/g, 'ک').replace(/\s/g, '').toLowerCase();
    const params = new URLSearchParams(location.search);
    if (params.get('q')) input.value = params.get('q');
    const run = () => {
      const query = normalize(input.value);
      items.forEach((item) => { item.hidden = query && !normalize(item.textContent).includes(query); });
    };
    input.addEventListener('input', run);
    run();
  };
  filterList('[data-poet-filter]', '[data-poet-grid]', '.poet-index-card');
  filterList('[data-term-filter]', '[data-term-grid]', 'article');
})();
