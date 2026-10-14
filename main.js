(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Theme toggle
  document.querySelector('.theme').addEventListener('click', () => {
    const root = document.documentElement;
    const dark = root.dataset.theme ? root.dataset.theme === 'dark'
      : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
  });

  // Cover: animate name + stamp, then declassify the redacted words one by one
  const cover = document.querySelector('.cover');
  requestAnimationFrame(() => cover.classList.add('is-in'));
  const bars = [...document.querySelectorAll('.redact')];
  bars.forEach((el, i) => setTimeout(() => el.classList.add('is-out'), reduce ? 0 : 1100 + i * 380));

  // Scroll reveals
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    }
  }, { rootMargin: '0px 0px -12% 0px' });
  document.querySelectorAll('.reveal, .matrix, .signoff').forEach((el) => io.observe(el));

  // Matrix cells: stagger left-to-right, column by column
  document.querySelectorAll('.tactic').forEach((col, c) => {
    col.querySelectorAll('li').forEach((li, r) => { li.style.transitionDelay = `${(c * 5 + r) * 30}ms`; });
  });
  // Clear the delay once revealed so hover colour changes stay instant
  document.querySelector('.matrix').addEventListener('transitionend', (e) => {
    if (e.target.tagName === 'LI' && e.propertyName === 'transform') e.target.style.transitionDelay = '';
  });

  // Section indicator in the top bar
  const sec = document.querySelector('.bar__sec');
  const name = document.querySelector('.bar__name');
  const spy = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      sec.textContent = e.target.dataset.sec;
      name.textContent = e.target.dataset.name;
    }
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('[data-sec]').forEach((s) => spy.observe(s));

  // Copy email
  const btn = document.querySelector('.copy');
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      btn.textContent = 'Copied';
    } catch (e) {
      btn.textContent = 'Press Ctrl+C';
      getSelection().selectAllChildren(document.querySelector('.mail'));
    }
    setTimeout(() => { btn.textContent = 'Copy'; }, 1800);
  });
})();
