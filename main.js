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
  setTimeout(() => cover.classList.add('is-in'), 30);
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
  const EMAIL = 'ay.guerfi@esi-sba.dz';
  const btn = document.querySelector('.copy');
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      btn.textContent = 'Copied';
    } catch (e) {
      btn.textContent = 'Press Ctrl+C';
      getSelection().selectAllChildren(document.querySelector('.mail'));
    }
    setTimeout(() => { btn.textContent = 'Copy'; }, 1800);
  };
  btn.addEventListener('click', copyEmail);

  // Export: reveal everything, then print (Save as PDF)
  const exportReport = () => {
    document.querySelectorAll('.reveal, .matrix, .signoff').forEach((el) => el.classList.add('is-in'));
    window.print();
  };
  document.querySelector('[data-export]').addEventListener('click', exportReport);

  // Command palette
  const go = (id) => () => document.getElementById(id).scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  const open = (url) => () => window.open(url, '_blank', 'noopener');
  const commands = [
    { label: 'Executive summary', kind: 'Go to', run: go('summary') },
    { label: 'Findings: projects', kind: 'Go to', run: go('findings') },
    { label: 'Capability matrix', kind: 'Go to', run: go('matrix') },
    { label: 'Record: education', kind: 'Go to', run: go('record') },
    { label: 'Disclosure channel: contact', kind: 'Go to', run: go('contact') },
    { label: 'Copy email address', kind: 'Action', run: () => { copyEmail(); go('contact')(); } },
    { label: 'Send an email', kind: 'Action', run: () => { location.href = `mailto:${EMAIL}?subject=Internship%20opportunity`; } },
    { label: 'Download CV (PDF)', kind: 'Action', run: () => { const a = document.createElement('a'); a.href = 'Guerfi_Ahmed_Yacine_CV.pdf'; a.download = ''; a.click(); } },
    { label: 'Export full report as PDF', kind: 'Action', run: exportReport },
    { label: 'Toggle dark / light theme', kind: 'Action', run: () => document.querySelector('.theme').click() },
    { label: 'GitHub: N4khlA', kind: 'Open', run: open('https://github.com/N4khlA') },
    { label: 'LinkedIn: Guerfi Ahmed Yacine', kind: 'Open', run: open('https://www.linkedin.com/in/guerfi-ahmed-yacine-6831b32b8/') },
    { label: 'Race Condition Exploiter repo', kind: 'Open', run: open('https://github.com/N4khlA/Race_condition_exploiter') },
    { label: 'ML Intrusion Detection repo', kind: 'Open', run: open('https://github.com/N4khlA/AI-_threat_hunting') },
    { label: 'masa: Mobile Analyzer repo', kind: 'Open', run: open('https://github.com/N4khlA/MobileApp_SecAnalyzer') },
  ];
  const dlg = document.querySelector('.palette');
  const input = dlg.querySelector('.palette__input');
  const list = dlg.querySelector('.palette__list');
  let shown = [], active = 0;

  const render = () => {
    const q = input.value.trim().toLowerCase();
    shown = commands.filter((c) => !q || `${c.kind} ${c.label}`.toLowerCase().includes(q));
    active = Math.min(active, Math.max(shown.length - 1, 0));
    list.innerHTML = '';
    if (!shown.length) {
      list.innerHTML = '<li class="empty">No matching command</li>';
      input.removeAttribute('aria-activedescendant');
      return;
    }
    shown.forEach((c, i) => {
      const li = document.createElement('li');
      li.id = `cmd-${i}`;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', String(i === active));
      li.textContent = c.label;
      const tag = document.createElement('span');
      tag.textContent = c.kind;
      li.append(tag);
      li.addEventListener('mousemove', () => { if (active !== i) { active = i; render(); } });
      li.addEventListener('click', () => runActive(i));
      list.append(li);
    });
    input.setAttribute('aria-activedescendant', `cmd-${active}`);
    list.children[active]?.scrollIntoView({ block: 'nearest' });
  };
  const runActive = (i = active) => {
    const c = shown[i];
    if (!c) return;
    dlg.close();
    c.run();
  };
  const openPalette = () => {
    if (dlg.open) return;
    input.value = ''; active = 0; render();
    dlg.showModal();
    input.focus();
  };

  input.addEventListener('input', () => { active = 0; render(); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); active = (active + 1) % (shown.length || 1); render(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); active = (active - 1 + shown.length) % (shown.length || 1); render(); }
    else if (e.key === 'Enter') { e.preventDefault(); runActive(); }
  });
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  document.querySelector('[data-open-palette]').addEventListener('click', openPalette);
  document.addEventListener('keydown', (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); dlg.open ? dlg.close() : openPalette(); }
    else if (e.key === '/' && !typing && !dlg.open) { e.preventDefault(); openPalette(); }
  });

  // For whoever opens DevTools
  console.log(
    '%cSEC-ASSESSMENT // GUERFI-A-Y%c\n\nYou opened the console, so you are my kind of reviewer.\nNo flags hidden here, just a hand-built static site.\n\nLooking for a security intern? → ay.guerfi@esi-sba.dz',
    'font: 700 14px monospace; color: #ff5a2e;',
    'font: 12px monospace;'
  );
})();
