(() => {
  const emitStaticAnalytics = (name, properties = {}) => {
    if (typeof CustomEvent === 'function') {
      dispatchEvent(new CustomEvent('from-poetry-to-data:analytics', {
        detail: { name, properties },
      }));
    }
  };
  const searchLengthBucket = (value = '') => {
    const length = value.trim().length;
    if (length === 0) return '0';
    if (length <= 10) return '1-10';
    if (length <= 30) return '11-30';
    return '31+';
  };
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
        emitStaticAnalytics('citation_copied', {
          resource_type: button.dataset.copy.includes('dataset') ? 'dataset' : 'publication',
          citation_format: 'text',
        });
        setTimeout(() => { button.textContent = old; }, 1800);
      } catch {
        if (status) status.textContent = 'کپی خودکار ممکن نشد؛ متن استناد را انتخاب و کپی کنید.';
        emitStaticAnalytics('recoverable_error_shown', { surface: 'citation', error_category: 'clipboard' });
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
    const urlNotice = document.querySelector('[data-aesthetic-url-notice]');
    const loading = document.querySelector('[data-aesthetic-loading]');
    const error = document.querySelector('[data-aesthetic-error]');
    const retry = document.querySelector('[data-aesthetic-retry]');
    const reset = aestheticsForm.querySelector('[data-aesthetic-reset]');
    const normalize = (value) => String(value || '')
      .replace(/[\u064B-\u065F\u0670]/g, '')
      .replace(/[يى]/g, 'ی')
      .replace(/ك/g, 'ک')
      .replace(/\s+/g, '')
      .toLowerCase();
    const controls = {
      q: aestheticsForm.elements.q,
      century: aestheticsForm.elements.century,
      metric: aestheticsForm.elements.metric,
      sort: aestheticsForm.elements.sort,
    };

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
      return visible.length;
    };

    const runAestheticsFilters = (updateUrl = true) => {
      if (loading) {
        loading.hidden = false;
        loading.setAttribute('aria-busy', 'true');
      }
      if (error) error.hidden = true;
      try {
        const resultCount = applyAestheticsFilters(updateUrl);
        if (updateUrl) {
          const filterKeys = Object.entries(controls)
            .filter(([name, control]) => control?.value && !(
              (name === 'metric' && control.value === 'overall')
              || (name === 'sort' && control.value === 'century-name')
            ))
            .map(([name]) => name);
          emitStaticAnalytics('research_explorer_changed', {
            study_id: 'computational-aesthetics',
            filter_keys: filterKeys,
            query_length_bucket: searchLengthBucket(controls.q?.value),
            result_count: resultCount,
          });
        }
      } catch {
        if (error) error.hidden = false;
        if (status) status.textContent = 'نمایش تعاملی کامل نشد؛ جدول ایستا در دسترس است.';
        emitStaticAnalytics('recoverable_error_shown', {
          surface: 'computational-aesthetics-explorer',
          error_category: 'interaction',
        });
      } finally {
        if (loading) {
          loading.hidden = true;
          loading.setAttribute('aria-busy', 'false');
        }
      }
    };

    const restoreAestheticsFilters = () => {
      const params = new URLSearchParams(location.search);
      aestheticsForm.reset();
      let invalid = false;
      for (const [name, control] of Object.entries(controls)) {
        const value = params.get(name);
        if (!control || value === null) continue;
        const isValid = control.tagName !== 'SELECT'
          || [...control.options].some((option) => option.value === value);
        if (isValid) control.value = value;
        else invalid = true;
      }
      if (urlNotice) {
        urlNotice.hidden = !invalid;
        urlNotice.textContent = invalid
          ? 'یک یا چند فیلتر نامعتبر از نشانی حذف شد و نتایج معتبر بازیابی شدند.'
          : '';
      }
      runAestheticsFilters(invalid);
    };

    aestheticsForm.addEventListener('input', () => runAestheticsFilters());
    aestheticsForm.addEventListener('change', () => runAestheticsFilters());
    aestheticsForm.addEventListener('submit', (event) => {
      event.preventDefault();
      runAestheticsFilters();
    });
    reset?.addEventListener('click', () => {
      aestheticsForm.reset();
      if (urlNotice) urlNotice.hidden = true;
      runAestheticsFilters();
      controls.q?.focus();
    });
    retry?.addEventListener('click', () => runAestheticsFilters(false));
    addEventListener('popstate', restoreAestheticsFilters);
    emitStaticAnalytics('research_study_viewed', { study_id: 'computational-aesthetics' });
    restoreAestheticsFilters();
  }

  document.querySelectorAll('[data-aesthetic-couplet] details').forEach((details) => {
    details.addEventListener('toggle', () => {
      if (details.open) emitStaticAnalytics('evidence_table_opened', {
        metric_id: 'computational-aesthetics-dimensions', page_type: 'poet',
      });
    });
  });

  const poetAestheticsSection = document.querySelector('#computational-aesthetics');
  if (poetAestheticsSection && !aestheticsForm) {
    const poetSlug = location.pathname.match(/^\/poets\/([^/]+)\//)?.[1];
    if (poetSlug) emitStaticAnalytics('research_poet_section_viewed', {
      study_id: 'computational-aesthetics', poet_slug: poetSlug,
    });
  }

  document.addEventListener('click', (event) => {
    const link = event.target.closest?.('a[href]');
    if (!link) return;
    const url = new URL(link.href, location.origin);
    if (url.pathname.startsWith('/poets/') && document.querySelector('[data-aesthetic-explorer]')) {
      emitStaticAnalytics('entity_result_opened', { entity_type: 'poet', source_view: 'computational-aesthetics' });
    } else if (url.pathname === '/methodology/') {
      emitStaticAnalytics('methodology_opened', { claim_type: 'computational-aesthetics', page_type: 'research' });
    } else if (url.pathname.includes('computational-aesthetics')
      && (url.pathname.startsWith('/downloads/') || url.pathname.startsWith('/api/'))) {
      emitStaticAnalytics('dataset_download_started', {
        dataset_id: 'computational-aesthetics',
        format: url.pathname.endsWith('.csv') ? 'csv' : 'json',
        version: '7.0.0',
      });
    }
  });
})();
