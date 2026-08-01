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
      const status = button.parentElement.querySelector('[role="status"]');
      try {
        await navigator.clipboard.writeText(target.textContent.trim());
        const old = button.textContent;
        button.textContent = 'کپی شد';
        if (status) status.textContent = 'استناد در حافظهٔ موقت کپی شد.';
        setTimeout(() => { button.textContent = old; }, 1800);
      } catch {
        if (status) status.textContent = 'کپی خودکار ممکن نشد؛ متن استناد را انتخاب و کپی کنید.';
      }
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

  const aestheticsForm = document.querySelector('[data-aesthetic-explorer]');
  const aestheticsResults = document.querySelector('[data-aesthetic-results]');
  if (aestheticsForm && aestheticsResults) {
    const rows = [...aestheticsResults.querySelectorAll('tr')];
    const status = document.querySelector('[data-aesthetic-status]');
    const empty = document.querySelector('[data-aesthetic-empty]');
    const reset = aestheticsForm.querySelector('[data-aesthetic-reset]');
    const normalize = (value) => String(value || '')
      .replace(/[\u064B-\u065F\u0670]/g, '')
      .replace(/[يى]/g, 'ی')
      .replace(/ك/g, 'ک')
      .replace(/\s+/g, '')
      .toLowerCase();
    const params = new URLSearchParams(location.search);
    const controls = {
      q: aestheticsForm.elements.q,
      century: aestheticsForm.elements.century,
      metric: aestheticsForm.elements.metric,
      sort: aestheticsForm.elements.sort,
    };

    for (const [name, control] of Object.entries(controls)) {
      const value = params.get(name);
      if (control && value !== null && (
        control.tagName !== 'SELECT' || [...control.options].some((option) => option.value === value)
      )) control.value = value;
    }

    const applyAestheticsFilters = (updateUrl = true) => {
      const query = normalize(controls.q?.value);
      const century = controls.century?.value || '';
      const metric = controls.metric?.value || 'overall';
      const sort = controls.sort?.value || 'century-name';
      const visible = rows.filter((row) => {
        const matchesQuery = !query || normalize(row.dataset.aestheticPoet).includes(query);
        const matchesCentury = !century || row.dataset.century === century;
        row.hidden = !(matchesQuery && matchesCentury);
        return !row.hidden;
      });

      rows.sort((left, right) => {
        if (sort === 'score-desc') {
          const scoreDifference = Number(right.dataset[metric]) - Number(left.dataset[metric]);
          if (scoreDifference) return scoreDifference;
        }
        return Number(left.dataset.century) - Number(right.dataset.century)
          || left.dataset.aestheticPoet.localeCompare(right.dataset.aestheticPoet, 'fa');
      }).forEach((row) => aestheticsResults.append(row));

      rows.forEach((row) => {
        const score = row.querySelector('[data-aesthetic-score]');
        if (score) score.textContent = Number(row.dataset[metric]).toLocaleString('fa-IR', {
          maximumFractionDigits: 2,
        });
      });
      if (status) status.textContent = `${visible.length.toLocaleString('fa-IR')} نتیجه نمایش داده می‌شود.`;
      if (empty) empty.hidden = visible.length !== 0;

      if (updateUrl) {
        const next = new URLSearchParams();
        if (controls.q?.value.trim()) next.set('q', controls.q.value.trim());
        if (century) next.set('century', century);
        if (metric !== 'overall') next.set('metric', metric);
        if (sort !== 'century-name') next.set('sort', sort);
        const search = next.toString();
        history.replaceState({}, '', `${location.pathname}${search ? `?${search}` : ''}${location.hash}`);
      }
    };

    aestheticsForm.addEventListener('input', () => applyAestheticsFilters());
    aestheticsForm.addEventListener('change', () => applyAestheticsFilters());
    aestheticsForm.addEventListener('submit', (event) => {
      event.preventDefault();
      applyAestheticsFilters();
    });
    reset?.addEventListener('click', () => {
      aestheticsForm.reset();
      applyAestheticsFilters();
      controls.q?.focus();
    });
    applyAestheticsFilters(false);
  }
})();
