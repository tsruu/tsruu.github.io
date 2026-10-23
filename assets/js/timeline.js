(() => {
  const list = document.querySelector('.news');
  if (!list) return;

  const events = Array.from(list.querySelectorAll('li[data-date][data-type]'), (item) => {
    const content = item.querySelector('span:nth-child(2)');
    return {
      date: new Date(`${item.dataset.date}T00:00:00Z`),
      type: item.dataset.type,
      html: content.innerHTML,
      text: content.textContent.trim(),
    };
  }).sort((a, b) => a.date - b.date);
  if (!events.length) return;

  const first = events[0].date.getTime();
  const last = events[events.length - 1].date.getTime();
  const position = (time) => 4 + 92 * (time - first) / (last - first || 1);
  const shortDate = (date) => `${new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' }).format(date)} ’${String(date.getUTCFullYear()).slice(-2)}`;
  const longDate = (date) => new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);

  const timeline = document.createElement('div');
  timeline.className = 'timeline';
  timeline.setAttribute('aria-label', 'News timeline');

  const track = document.createElement('div');
  track.className = 'timeline-track';
  timeline.append(track);

  const dots = events.map((event, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = `timeline-dot timeline-${event.type}`;
    dot.setAttribute('aria-label', `${longDate(event.date)}: ${event.text}`);
    dot.addEventListener('click', () => show(index, true));
    track.append(dot);
    return dot;
  });

  for (let year = events[0].date.getUTCFullYear(); year <= events[events.length - 1].date.getUTCFullYear(); year++) {
    const tick = document.createElement('span');
    tick.className = 'timeline-year';
    tick.style.left = `${Math.max(4, Math.min(96, position(Date.UTC(year, 0, 1))))}%`;
    tick.textContent = `’${String(year).slice(-2)}`;
    track.append(tick);
  }

  const row = document.createElement('div');
  row.className = 'timeline-row';
  const detail = document.createElement('div');
  detail.className = 'timeline-detail';
  detail.setAttribute('aria-live', 'polite');
  const controls = document.createElement('div');
  controls.className = 'timeline-controls';
  const earlier = document.createElement('button');
  earlier.type = 'button';
  earlier.textContent = '‹';
  earlier.setAttribute('aria-label', 'Earlier update');
  const later = document.createElement('button');
  later.type = 'button';
  later.textContent = '›';
  later.setAttribute('aria-label', 'Later update');
  controls.append(earlier, later);
  row.append(detail, controls);
  timeline.append(row);

  const legend = document.createElement('div');
  legend.className = 'timeline-legend';
  for (const [type, label] of [['paper', 'Paper'], ['position', 'Position'], ['award', 'Award']]) {
    const item = document.createElement('span');
    item.className = `timeline-legend-item timeline-${type}`;
    item.textContent = label;
    legend.append(item);
  }
  timeline.append(legend);

  let active = events.length - 1;
  let fadeTimer;
  function show(index, animate = false) {
    if (index < 0 || index >= events.length) return;
    active = index;
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === active);
      dot.setAttribute('aria-pressed', String(i === active));
    });
    earlier.disabled = active === 0;
    later.disabled = active === events.length - 1;

    clearTimeout(fadeTimer);
    const update = () => {
      const event = events[active];
      detail.innerHTML = `<span class="timeline-date">${shortDate(event.date)} — </span>${event.html}`;
      requestAnimationFrame(() => detail.classList.remove('is-fading'));
    };
    if (animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      detail.classList.add('is-fading');
      fadeTimer = setTimeout(update, 100);
    } else {
      detail.classList.remove('is-fading');
      update();
    }
  }

  earlier.addEventListener('click', () => show(active - 1, true));
  later.addEventListener('click', () => show(active + 1, true));
  timeline.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    show(active + (event.key === 'ArrowLeft' ? -1 : 1), true);
    dots[active].focus();
  });

  function positionDots() {
    const width = track.getBoundingClientRect().width;
    const min = width * 0.04;
    const max = width * 0.96;
    const x = events.map((event) => min + (max - min) * (event.date.getTime() - first) / (last - first || 1));
    for (let i = 1; i < x.length; i++) x[i] = Math.max(x[i], x[i - 1] + 14);
    if (x[x.length - 1] > max) {
      x[x.length - 1] = max;
      for (let i = x.length - 2; i >= 0; i--) x[i] = Math.min(x[i], x[i + 1] - 14);
    }
    dots.forEach((dot, i) => { dot.style.left = `${x[i]}px`; });
  }

  list.before(timeline);
  list.hidden = true;
  show(active);
  positionDots();
  window.addEventListener('resize', positionDots);
})();
