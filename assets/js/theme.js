(() => {
  const button = document.querySelector('.theme-toggle');
  if (!button) return;

  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
  const isDark = () => document.documentElement.dataset.theme === 'dark' ||
    (!document.documentElement.dataset.theme && systemDark.matches);
  const updateLabel = () => {
    button.setAttribute('aria-label', `Switch to ${isDark() ? 'light' : 'dark'} mode`);
  };

  button.hidden = false;
  updateLabel();
  button.addEventListener('click', () => {
    const theme = isDark() ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('theme', theme); } catch (_) {}
    updateLabel();
  });
  systemDark.addEventListener('change', updateLabel);
})();
