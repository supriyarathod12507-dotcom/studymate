/**
 * Shared app shell: sidebar, topbar, logout
 */
const NAV_ITEMS = [
  { href: 'dashboard.html', label: 'Dashboard', icon: 'home' },
  { href: 'semester.html', label: 'My Semester', icon: 'book' },
  { href: 'planner.html', label: 'Study Planner', icon: 'calendar' },
  { href: 'tasks.html', label: 'My Tasks', icon: 'check' },
  { href: 'notes.html', label: 'Notes', icon: 'note' },
  { href: 'revision.html', label: 'Revision', icon: 'refresh' },
  { href: 'ai.html', label: 'StudyMate AI', icon: 'bot' },
  { href: 'exams.html', label: 'Exam Tracker', icon: 'exam' },
  { href: 'focus.html', label: 'Focus Mode', icon: 'timer' },
  { href: 'resources.html', label: 'Resources', icon: 'link' },
  { href: 'goals.html', label: 'Goals', icon: 'target' },
  { href: 'progress.html', label: 'Progress', icon: 'chart' },
  { href: 'analytics.html', label: 'Analytics', icon: 'analytics' },
  { href: 'profile.html', label: 'Profile', icon: 'user' },
];

const ICONS = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M9 22V12h6v10"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>',
  note: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>',
  bot: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4M8 16h0M16 16h0"/></svg>',
  exam: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h6"/></svg>',
  timer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>',
  target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>',
  analytics: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
};

function initShell(activePage) {
  const user = API.getUser();
  const shell = document.getElementById('app-shell');
  if (!shell) return;

  const navHtml = NAV_ITEMS.map((item) => {
    const active = item.href === activePage ? ' active' : '';
    return `<a href="${item.href}" class="nav-item${active}">${ICONS[item.icon] || ''}<span>${item.label}</span></a>`;
  }).join('');

  shell.innerHTML = `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-brand">
        <div class="logo">S</div>
        <h1>StudyMate</h1>
      </div>
      <nav class="sidebar-nav">${navHtml}</nav>
      <div class="sidebar-footer">
        <div class="text-sm text-muted mb-1">${escapeHtml(user?.name || 'Student')}</div>
        <button class="btn btn-outline btn-sm btn-block" id="logout-btn">Logout</button>
      </div>
    </aside>
    <div class="sidebar-overlay" id="sidebar-overlay"></div>
    <div class="main">
      <header class="topbar">
        <button class="menu-btn" id="menu-btn" aria-label="Open menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
        </button>
        <div class="topbar-title" id="page-title"></div>
        <div class="topbar-actions">
          <div style="position:relative;max-width:200px;display:none" id="search-wrap" class="search-wrap-desktop">
            <input type="search" class="form-control" id="global-search" placeholder="Search..." aria-label="Search" style="min-height:36px;padding:0.4rem 0.75rem;font-size:0.875rem">
            <div class="search-dropdown" id="search-results" style="display:none"></div>
          </div>
        </div>
      </header>
      <main class="content" id="main-content"></main>
    </div>
  `;

  // Move existing page content into main
  const pageContent = document.getElementById('page-content');
  const main = document.getElementById('main-content');
  if (pageContent && main) {
    main.appendChild(pageContent);
    pageContent.style.display = 'block';
  }

  const titleEl = document.getElementById('page-title');
  if (titleEl) {
    const item = NAV_ITEMS.find((n) => n.href === activePage);
    titleEl.textContent = item ? item.label : 'StudyMate';
  }

  document.getElementById('menu-btn')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.add('open');
    document.getElementById('sidebar-overlay')?.classList.add('show');
  });
  document.getElementById('sidebar-overlay')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.remove('open');
    document.getElementById('sidebar-overlay')?.classList.remove('show');
  });
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    API.clearAuth();
    window.location.href = 'login.html';
  });

  // Global search (desktop)
  const searchInput = document.getElementById('global-search');
  const searchResults = document.getElementById('search-results');
  let searchTimer;
  if (searchInput) {
    searchInput.parentElement.style.display = 'block';
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimer);
      const q = searchInput.value.trim();
      if (q.length < 2) {
        searchResults.style.display = 'none';
        return;
      }
      searchTimer = setTimeout(async () => {
        try {
          const res = await API.get(`/dashboard/search?q=${encodeURIComponent(q)}`);
          const d = res.data;
          let html = '';
          const add = (items, type, href, labelFn) => {
            items.forEach((item) => {
              html += `<a class="search-item" href="${href}"><span class="type">${type}</span><br>${escapeHtml(labelFn(item))}</a>`;
            });
          };
          add(d.tasks || [], 'Task', 'tasks.html', (i) => i.title);
          add(d.notes || [], 'Note', 'notes.html', (i) => i.title);
          add(d.subjects || [], 'Subject', 'semester.html', (i) => i.name);
          add(d.goals || [], 'Goal', 'goals.html', (i) => i.title);
          add(d.exams || [], 'Exam', 'exams.html', (i) => i.name);
          add(d.resources || [], 'Resource', 'resources.html', (i) => i.title);
          searchResults.innerHTML = html || '<div class="search-item text-muted">No results</div>';
          searchResults.style.display = 'block';
        } catch {
          searchResults.style.display = 'none';
        }
      }, 300);
    });
    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.style.display = 'none';
      }
    });
  }
}
