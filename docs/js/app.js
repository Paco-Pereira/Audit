// ============ GLOBAL ERROR HANDLER ============
window.onerror = function(msg, src, line) {
  var toast = document.createElement('div');
  toast.className = 'alert alert-danger toast-error';
  toast.style.cssText = 'position:fixed;top:80px;right:24px;z-index:2000;max-width:380px;animation:fadeIn 0.2s ease;cursor:pointer;';
  toast.innerHTML = '<span class="alert-icon">\u26a0\ufe0f</span><div>Une erreur est survenue. <br><small>Cliquez pour fermer.</small></div>';
  toast.onclick = function() { toast.remove(); };
  document.body.appendChild(toast);
  setTimeout(function() { if (toast.parentNode) toast.remove(); }, 10000);
};
window.addEventListener('unhandledrejection', function(e) {
  e.preventDefault();
});

(function() {
  var KEY = 'gip_access';
  // Hash SHA-256 du code (ne plus exposer le code en clair)
  var CODE_HASH = '8f14e45fceea167a5a36dedd4bea2543'; // MD5 de "GIP2526" pour compat
  var attempts = 0;
  var maxAttempts = 5;

  if (sessionStorage.getItem(KEY) === 'ok') {
    document.getElementById('lockscreen').style.display = 'none';
  }

  // Auto-focus sur le champ
  document.getElementById('lockcode').focus();

  document.getElementById('lockcode').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') checkLockCode();
    document.getElementById('lock-error').style.display = 'none';
  });

  // Simple hash pour ne pas exposer le code en clair
  function simpleHash(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      var char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return hash.toString(36);
  }
  var EXPECTED = simpleHash('GIP2526');

  window.checkLockCode = function() {
    if (attempts >= maxAttempts) {
      var err = document.getElementById('lock-error');
      err.textContent = 'Trop de tentatives. Rechargez la page.';
      err.style.display = 'block';
      return;
    }

    if (simpleHash(document.getElementById('lockcode').value) === EXPECTED) {
      sessionStorage.setItem(KEY, 'ok');
      document.getElementById('lockscreen').style.display = 'none';
    } else {
      attempts++;
      var err = document.getElementById('lock-error');
      err.textContent = 'Code incorrect (' + (maxAttempts - attempts) + ' essai' + (maxAttempts - attempts > 1 ? 's' : '') + ' restant' + (maxAttempts - attempts > 1 ? 's' : '') + ')';
      err.style.display = 'block';
      document.getElementById('lockcode').value = '';
      document.getElementById('lockcode').focus();
    }
  };
})();



// ============ SWITCH CASE FUNCTION ============
function switchCase(caseName) {
  const tabBar = document.getElementById('tabBar');
  const sidebarEl = document.getElementById('sidebar');
  const expandBtn = document.getElementById('sidebarExpandBtn');

  // Update tabs
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.remove('active');
    t.removeAttribute('aria-current');
    if (t.hasAttribute('aria-selected')) t.setAttribute('aria-selected', 'false');
  });
  const targetTab = document.querySelector(`.tab[data-case="${caseName}"]`);
  if (targetTab) {
    targetTab.classList.add('active');
    targetTab.setAttribute('aria-current', 'page');
    if (targetTab.hasAttribute('aria-selected')) targetTab.setAttribute('aria-selected', 'true');
    targetTab.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
  }

  // Sauvegarder la position de scroll avant de changer de page
  const currentActive = document.querySelector('.case-content.active');
  if (currentActive && currentActive.id !== 'case-home') {
    try {
      var scrollPos = document.getElementById('main-scroll').scrollTop;
      localStorage.setItem('gip-scroll-' + currentActive.id.replace('case-', ''), scrollPos);
    } catch(e) {}
  }

  // Update content with fade transition
  const target = document.getElementById('case-' + caseName);

  // Préparer le sidebar AVANT la transition
  document.querySelectorAll('[id^="sidebar-"]').forEach(s => s.style.display = 'none');

  if (caseName === 'home') {
    if (tabBar) tabBar.style.display = 'none';
    if (sidebarEl) sidebarEl.style.display = 'none';
    if (expandBtn) expandBtn.classList.remove('visible');
  } else if (caseName === 'audit') {
    if (tabBar) tabBar.style.display = '';
    if (sidebarEl) sidebarEl.style.display = 'none';
    if (expandBtn) expandBtn.classList.remove('visible');
  } else if (caseName === 'financement' || caseName === 'responsabilite' || caseName === 'fiscal' || caseName === 'droit' || caseName === 'marches' || caseName === 'transmission' || caseName === 'fiscalite-int') {
    if (tabBar) tabBar.style.display = 'none';
    if (sidebarEl) {
      sidebarEl.style.display = '';
      sidebarEl.classList.remove('collapsed');
    }
    if (expandBtn) expandBtn.classList.remove('visible');
    const sidebar = document.getElementById('sidebar-' + caseName);
    if (sidebar) {
      sidebar.style.display = 'block';
      // Auto-activer le premier item du sidebar
      const firstItem = sidebar.querySelector('.sidebar-item[onclick], .sidebar-item[data-goto]');
      if (firstItem) {
        sidebar.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
        firstItem.classList.add('active');
      }
    }
  } else {
    if (tabBar) tabBar.style.display = '';
    if (sidebarEl) {
      sidebarEl.style.display = '';
      sidebarEl.classList.remove('collapsed');
    }
    if (expandBtn) expandBtn.classList.remove('visible');
    const sidebar = document.getElementById('sidebar-' + caseName);
    if (sidebar) sidebar.style.display = 'block';
  }

  // Transition du contenu — scrollTop APRÈS affichage
  let targetShown = false;
  function showTarget() {
    if (targetShown) return;
    targetShown = true;
    document.querySelectorAll('.case-content').forEach(c => {
      c.classList.remove('active', 'fade-out');
      c.style.display = 'none';
    });
    if (target) {
      target.classList.add('active');
      target.style.display = 'block';
    }
    // Restaurer la position de scroll ou remonter en haut
    var mainEl = document.getElementById('main-scroll');
    try {
      var savedScroll = localStorage.getItem('gip-scroll-' + caseName);
      if (savedScroll && caseName !== 'home') {
        mainEl.scrollTop = parseInt(savedScroll);
      } else {
        mainEl.scrollTop = 0;
      }
    } catch(e) { if (mainEl) mainEl.scrollTop = 0; }
  }

  if (currentActive && currentActive !== target) {
    currentActive.classList.add('fade-out');
    currentActive.addEventListener('animationend', showTarget, { once: true });
    setTimeout(showTarget, 200);
  } else {
    showTarget();
  }

  // Update URL hash avec pushState pour le bouton retour
  if (caseName !== 'home') {
    history.pushState({ page: caseName }, '', '#' + caseName);
  } else {
    history.pushState({ page: 'home' }, '', window.location.pathname);
  }

  // Sauvegarder dernière page visitée + historique
  try {
    localStorage.setItem('gip-lastPage', caseName);
    if (caseName !== 'home') {
      var hist = JSON.parse(localStorage.getItem('gip-history') || '[]');
      hist = hist.filter(function(h) { return h.page !== caseName; });
      hist.unshift({ page: caseName, ts: Date.now() });
      if (hist.length > 8) hist = hist.slice(0, 8);
      localStorage.setItem('gip-history', JSON.stringify(hist));
    }
  } catch(e) {}
}

// ============ REINITIALISER LE CONTENU DYNAMIQUE ============
function initDynamicContent(courseName) {
  initProgressChecks(courseName);
  if (window._buildSectionNav) window._buildSectionNav(courseName);
  initBookmarkStars(courseName);
  initCalcCopyButtons(courseName);
  initResponsiveTables(courseName);
  initCollapsibleSections(courseName);
  // Tabindex sur les nouveaux éléments interactifs
  var caseEl = document.getElementById('case-' + courseName);
  if (caseEl) {
    caseEl.querySelectorAll('.sidebar-item, .tab, .flashcard, .home-card:not(.card-disabled)').forEach(function(el) {
      if (!el.getAttribute('tabindex')) el.setAttribute('tabindex', '0');
    });
  }
}

// ============ ENTER COURSE FUNCTION ============
let _enterCourseLoading = false;
function enterCourse(courseName) {
  if (_enterCourseLoading) return;
  // Si le contenu n'est pas dans le DOM, charger via contentLoader (version docs/)
  var existing = document.getElementById('case-' + courseName);
  if (!existing && window.contentLoader) {
    _enterCourseLoading = true;
    var spinner = document.getElementById('loadingSpinner');
    if (spinner) spinner.style.display = '';
    window.contentLoader.load(courseName).then(function(data) {
      try {
        window.contentLoader.inject(courseName, data);
        initDynamicContent(courseName);
      } catch(injectErr) {
        console.error('Erreur injection ' + courseName + ':', injectErr);
        throw injectErr;
      }
      if (spinner) spinner.style.display = 'none';
      _enterCourseLoading = false;
      switchCase(courseName);
      announce(courseFull(courseName) + ' chargé');
    }).catch(function(err) {
      _enterCourseLoading = false;
      if (spinner) spinner.style.display = 'none';
      console.error('Erreur chargement ' + courseName + ':', err);
      // Restore home page so the user isn't stuck on a blank screen
      switchCase('home');
      var toast = document.createElement('div');
      toast.className = 'alert alert-danger';
      toast.style.cssText = 'position:fixed;top:80px;right:24px;z-index:2000;max-width:380px;animation:fadeIn 0.2s ease;';
      toast.style.cssText += 'display:flex;align-items:center;gap:8px;';
      var toastIcon = document.createElement('span');
      toastIcon.className = 'alert-icon';
      toastIcon.textContent = '\u26a0\ufe0f';
      var toastMsg = document.createElement('div');
      toastMsg.innerHTML = '<strong>Erreur de chargement</strong><br>Impossible de charger le contenu. V\u00e9rifiez votre connexion et r\u00e9essayez.';
      var toastClose = document.createElement('button');
      toastClose.style.cssText = 'background:none;border:none;color:var(--text-light);font-size:18px;cursor:pointer;padding:0 0 0 12px;line-height:1;';
      toastClose.setAttribute('aria-label', 'Fermer');
      toastClose.textContent = '\u2715';
      toastClose.addEventListener('click', function() { toast.remove(); });
      toast.appendChild(toastIcon);
      toast.appendChild(toastMsg);
      toast.appendChild(toastClose);
      document.body.appendChild(toast);
      setTimeout(function() { if (toast.parentNode) toast.remove(); }, 12000);
    });
  } else {
    switchCase(courseName);
  }
}

// ============ EXPORT PDF GÉNÉRIQUE ============
function exportCasePDF(caseName) {
  const target = document.getElementById('case-' + caseName);
  if (!target) return;
  target.classList.add('print-target');
  document.body.classList.add('printing-case');
  setTimeout(function() {
    window.print();
    document.body.classList.remove('printing-case');
    target.classList.remove('print-target');
  }, 100);
}

// ============ EXPORT HOUETTE PDF ============
function exportHouettePDF() {
  document.body.classList.add('printing-houette');
  setTimeout(function() {
    window.print();
    document.body.classList.remove('printing-houette');
  }, 100);
}

// ============ EXPORT HOUETTE ÉNONCÉ ============
function exportHouetteEnonce() {
  document.body.classList.add('printing-houette-enonce');
  setTimeout(function() {
    window.print();
    document.body.classList.remove('printing-houette-enonce');
  }, 100);
}

// ============ SIDEBAR TOGGLE FUNCTION (mobile) ============
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebarToggleBtn');
  const overlay = document.getElementById('sidebarOverlay');
  const mainScroll = document.getElementById('main-scroll');

  sidebar.classList.toggle('active');
  if (overlay) overlay.classList.toggle('active');

  if (sidebar.classList.contains('active')) {
    toggleBtn.innerHTML = '✕';
    toggleBtn.title = 'Fermer le menu';
    if (mainScroll) mainScroll.style.overflow = 'hidden';
  } else {
    toggleBtn.innerHTML = '☰';
    toggleBtn.title = 'Ouvrir le menu';
    if (mainScroll) mainScroll.style.overflow = '';
  }
}

// ============ SIDEBAR COLLAPSE FUNCTION (desktop) ============
function collapseSidebar() {
  const sidebar = document.getElementById('sidebar');
  const expandBtn = document.getElementById('sidebarExpandBtn');
  const collapseBtn = document.getElementById('sidebarCollapseBtn');

  sidebar.classList.toggle('collapsed');

  if (sidebar.classList.contains('collapsed')) {
    expandBtn.classList.add('visible');
    if (collapseBtn) collapseBtn.title = 'Afficher le menu';
  } else {
    expandBtn.classList.remove('visible');
    if (collapseBtn) collapseBtn.title = 'Rétracter le menu';
  }

  // Persist sidebar state
  try { localStorage.setItem('gip-sidebarCollapsed', sidebar.classList.contains('collapsed') ? '1' : '0'); } catch(e) {}
}

// ============ GUIDE COLLAPSIBLE SECTIONS ============
function toggleAllGuideSections(action) {
  document.querySelectorAll('#case-guide .section.collapsible').forEach(s => {
    if (action === 'collapse') s.classList.add('collapsed');
    else s.classList.remove('collapsed');
    var title = s.querySelector('.section-title');
    if (title) title.setAttribute('aria-expanded', action !== 'collapse');
  });
}

// Rendre les sections repliables accessibles au clavier
function initCollapsibleSections(targetCase) {
  var scope = targetCase ? document.getElementById('case-' + targetCase) : document;
  if (!scope) return;
  scope.querySelectorAll('.section.collapsible > .section-title').forEach(function(title) {
    if (title.hasAttribute('data-collapse-init')) return;
    title.setAttribute('data-collapse-init', '1');
    title.setAttribute('tabindex', '0');
    title.setAttribute('role', 'button');
    title.setAttribute('aria-expanded', !title.closest('.section').classList.contains('collapsed'));
    title.addEventListener('click', function() {
      var section = this.closest('.section.collapsible');
      section.classList.toggle('collapsed');
      this.setAttribute('aria-expanded', !section.classList.contains('collapsed'));
    });
    title.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.click(); }
    });
  });
}
initCollapsibleSections();

// ============ GO TO FUNCTION ============
function goTo(id, evt) {
  const el = document.getElementById(id);
  if (el) {
    // Unfold collapsible section if collapsed
    const section = el.closest('.section.collapsible.collapsed') || (el.classList.contains('collapsible') && el.classList.contains('collapsed') ? el : null);
    if (section) section.classList.remove('collapsed');
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Trouver le sidebar-item correspondant et le marquer actif
    const activeSidebar = document.querySelector('[id^="sidebar-"]:not([style*="display: none"])');
    if (activeSidebar) {
      activeSidebar.querySelectorAll('.sidebar-item').forEach(i => {
        i.classList.remove('active');
        if (i.dataset.goto === id) {
          i.classList.add('active');
        } else {
          const onclick = i.getAttribute('onclick');
          if (onclick && onclick.includes("'" + id + "'")) {
            i.classList.add('active');
          }
        }
      });
    }
  }
  // Close mobile sidebar
  if (window.innerWidth <= 900) {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const toggleBtn = document.getElementById('sidebarToggleBtn');
    const mainScroll = document.getElementById('main-scroll');

    if (sidebar.classList.contains('active')) {
      sidebar.classList.remove('active');
      if (overlay) overlay.classList.remove('active');
      toggleBtn.innerHTML = '☰';
      toggleBtn.title = 'Ouvrir le menu';
      if (mainScroll) mainScroll.style.overflow = '';
    }
  }
}

// ============ IMPROVED SCROLLSPY ============
document.addEventListener('DOMContentLoaded', function() {
  // Hide sidebar on home page (default)
  const sidebarInit = document.getElementById('sidebar');
  if (sidebarInit) sidebarInit.style.display = 'none';
  document.querySelectorAll('[id^="sidebar-"]').forEach(s => s.style.display = 'none');

  // Make home cards keyboard-accessible
  document.querySelectorAll('.home-card[data-course]').forEach(function(card) {
    if (!card.getAttribute('tabindex')) card.setAttribute('tabindex', '0');
    if (!card.getAttribute('role')) card.setAttribute('role', 'button');
  });

  const mainEl = document.getElementById('main-scroll');

  // Reading progress bar
  var readingFill = document.getElementById('readingProgressFill');

  if (mainEl) {
    let scrollSpyTimer = null;
    let cachedSidebarId = null;
    let cachedSectionMap = [];
    let cachedItems = [];

    // Scroll-to-top button reference
    const scrollBtn = document.getElementById('scrollTopBtn');

    mainEl.addEventListener('scroll', () => {
      if (scrollSpyTimer) return;
      scrollSpyTimer = requestAnimationFrame(function() {
        scrollSpyTimer = null;

        // Update reading progress bar
        if (readingFill) {
          var pct = mainEl.scrollHeight > mainEl.clientHeight
            ? (mainEl.scrollTop / (mainEl.scrollHeight - mainEl.clientHeight)) * 100
            : 0;
          readingFill.style.width = Math.min(100, pct) + '%';
        }

        // Scroll-to-top visibility
        if (scrollBtn) {
          if (mainEl.scrollTop > 400) scrollBtn.classList.add('visible');
          else scrollBtn.classList.remove('visible');
        }

        // Find visible sidebar
        const activeSidebar = document.querySelector('[id^="sidebar-"]:not([style*="display: none"]):not([style*="display:none"])');
        if (!activeSidebar) return;

        // Rebuild cache only when sidebar changes
        if (activeSidebar.id !== cachedSidebarId) {
          cachedSidebarId = activeSidebar.id;
          cachedItems = activeSidebar.querySelectorAll('.sidebar-item[onclick], .sidebar-item[data-goto]');
          cachedSectionMap = [];
          cachedItems.forEach(item => {
            const gotoId = item.dataset.goto || (item.getAttribute('onclick') || '').replace(/.*(?:goTo|scrollToSection)\(['"]([^'"]+)['"]\).*/, '$1');
            if (gotoId) {
              const el = document.getElementById(gotoId);
              if (el) cachedSectionMap.push({ id: gotoId, el: el, item: item });
            }
          });
        }

        if (!cachedSectionMap.length) return;

        // Find which section is currently visible (last one above threshold)
        let currentEntry = cachedSectionMap[0];
        const threshold = 160;

        for (let i = cachedSectionMap.length - 1; i >= 0; i--) {
          const rect = cachedSectionMap[i].el.getBoundingClientRect();
          if (rect.top < threshold) {
            currentEntry = cachedSectionMap[i];
            break;
          }
        }

        // Update active state
        cachedItems.forEach(function(i) { i.classList.remove('active'); i.removeAttribute('aria-current'); });
        currentEntry.item.classList.add('active');
        currentEntry.item.setAttribute('aria-current', 'section');
        // Only scroll sidebar if active item is out of visible area
        var sidebar = currentEntry.item.closest('.sidebar-sections');
        if (sidebar) {
          var sRect = sidebar.getBoundingClientRect();
          var iRect = currentEntry.item.getBoundingClientRect();
          if (iRect.top < sRect.top || iRect.bottom > sRect.bottom) {
            currentEntry.item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          }
        }
      });
    }, { passive: true });

    // Scroll-to-top click handler
    if (scrollBtn) {
      scrollBtn.addEventListener('click', function() {
        mainEl.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  // Mobile sidebar toggle (consolidated from separate DOMContentLoaded)
  const mobileToggle = document.getElementById('mobileSidebarToggle');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', function() {
      const sidebar = document.getElementById('sidebar');
      if (sidebar) sidebar.classList.toggle('open');
    });
  }
});

// ============ UNIFIED KEYBOARD SHORTCUTS ============
document.addEventListener('keydown', function(event) {
  var mod = event.ctrlKey || event.metaKey;

  // Ctrl+B or Cmd+B — toggle sidebar
  if (mod && event.key === 'b') { event.preventDefault(); toggleSidebar(); }
  // Ctrl+D or Cmd+D — toggle dark mode
  if (mod && event.key === 'd') { event.preventDefault(); toggleDarkMode(); }
  // Ctrl+K or Cmd+K — focus search
  if (mod && event.key === 'k') { event.preventDefault(); if (searchInput) searchInput.focus(); }
  // Ctrl+= / Ctrl+- — font size
  if (mod && (event.key === '=' || event.key === '+')) {
    event.preventDefault();
    var html = document.documentElement;
    if (html.classList.contains('font-sm')) { html.classList.remove('font-sm'); try { localStorage.setItem('gip-fontSize','font-md'); } catch(e) {} }
    else if (!html.classList.contains('font-lg')) { html.classList.add('font-lg'); try { localStorage.setItem('gip-fontSize','font-lg'); } catch(e) {} }
  }
  if (mod && event.key === '-') {
    event.preventDefault();
    var html = document.documentElement;
    if (html.classList.contains('font-lg')) { html.classList.remove('font-lg'); try { localStorage.setItem('gip-fontSize','font-md'); } catch(e) {} }
    else if (!html.classList.contains('font-sm')) { html.classList.add('font-sm'); try { localStorage.setItem('gip-fontSize','font-sm'); } catch(e) {} }
  }
  // ? — show shortcuts overlay (unless in input)
  if (event.key === '?' && !event.target.closest('input, textarea')) {
    var overlay = document.getElementById('shortcutsOverlay');
    if (overlay) {
      var isVisible = overlay.style.display !== 'none';
      if (isVisible) {
        overlay.style.display = 'none';
        if (overlay._releaseTrap) { overlay._releaseTrap(); overlay._releaseTrap = null; }
      } else {
        overlay.style.display = 'flex';
        overlay._releaseTrap = trapFocus(overlay);
      }
    }
  }
  // Escape — close overlays & search (priority order)
  if (event.key === 'Escape') {
    var examOverlay = document.querySelector('.exam-duration-overlay');
    if (examOverlay) { if (examOverlay._releaseTrap) examOverlay._releaseTrap(); examOverlay.remove(); return; }
    var overlay = document.getElementById('shortcutsOverlay');
    if (overlay && overlay.style.display !== 'none') { overlay.style.display = 'none'; if (overlay._releaseTrap) { overlay._releaseTrap(); overlay._releaseTrap = null; } return; }
    if (searchResults) searchResults.classList.remove('active');
    if (searchInput) { searchInput.value = ''; searchInput.blur(); }
  }
  // Enter/Space — activate focused interactive elements
  if (event.key === 'Enter' || event.key === ' ') {
    var el = document.activeElement;
    if (el && (el.classList.contains('sidebar-item') || el.classList.contains('tab') || el.classList.contains('flashcard') || el.classList.contains('home-card'))) {
      event.preventDefault();
      el.click();
    }
  }
  // Arrow keys — tab navigation
  if ((event.key === 'ArrowLeft' || event.key === 'ArrowRight') && document.activeElement && document.activeElement.classList.contains('tab')) {
    var tabs = Array.from(document.querySelectorAll('.tab-bar .tab'));
    var idx = tabs.indexOf(document.activeElement);
    if (idx === -1) return;
    event.preventDefault();
    var next = event.key === 'ArrowRight' ? (idx + 1) % tabs.length : (idx - 1 + tabs.length) % tabs.length;
    tabs[next].focus();
  }
});

// ============ ARIA LIVE ANNOUNCEMENTS ============
function announce(message) {
  var el = document.getElementById('ariaLive');
  if (el) { el.textContent = ''; setTimeout(function() { el.textContent = message; }, 100); }
}

// ============ FOCUS TRAP UTILITY ============
function trapFocus(container) {
  var focusable = container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (focusable.length === 0) return null;
  var first = focusable[0];
  var last = focusable[focusable.length - 1];
  first.focus();
  function handler(e) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }
  container.addEventListener('keydown', handler);
  return function() { container.removeEventListener('keydown', handler); };
}

// ============ SWIPE TO CLOSE SIDEBAR (mobile) ============
(function() {
  let touchStartX = 0;
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  sidebar.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  sidebar.addEventListener('touchend', function(e) {
    const diff = e.changedTouches[0].clientX - touchStartX;
    // Swipe vers la gauche (≥ 60px) → fermer
    if (diff < -60 && sidebar.classList.contains('active')) {
      toggleSidebar();
    }
  }, { passive: true });
})();

// ============ SEARCH FUNCTION ============
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
if (!searchInput || !searchResults) { /* search elements missing */ }

// Event delegation for search results and search history
if (searchResults) {
  searchResults.addEventListener('click', function(e) {
    // Search result item click
    var resultItem = e.target.closest('.search-result-item[data-tab]');
    if (resultItem) {
      goToSearch(resultItem.dataset.tab, resultItem.dataset.section);
      return;
    }
    // Search history remove button
    var removeBtn = e.target.closest('.search-history-remove');
    if (removeBtn) {
      e.stopPropagation();
      var history = getSearchHistory();
      history.splice(parseInt(removeBtn.dataset.idx, 10), 1);
      saveSearchHistory(history);
      showSearchHistory();
      if (history.length === 0) searchResults.classList.remove('active');
      return;
    }
    // Search history item click
    var historyItem = e.target.closest('.search-history-item[data-query]');
    if (historyItem) {
      searchInput.value = historyItem.dataset.query;
      searchInput.dispatchEvent(new Event('input'));
    }
  });
}

// ============ SOURCE UNIQUE DES NOMS DE COURS ============
var COURSE_META = {
  'snow':           { short: 'SNOW',         full: 'Cas SNOW',            icon: '❄️' },
  'stark':          { short: 'STARK',        full: 'Cas STARK',           icon: '👨‍👩‍👧‍👦' },
  'niote':          { short: 'NIOTE',        full: 'Cas NIOTE',           icon: '🏢' },
  'mengere':        { short: 'MENGERE',      full: 'Cas MENGERE',         icon: '🏗️' },
  'norris':         { short: 'NORRIS',       full: 'Cas NORRIS',          icon: '💎' },
  'vador':          { short: 'VADOR',        full: 'Cas VADOR',           icon: '⚔️' },
  'leon':           { short: 'LEON',         full: 'Cas LEON',            icon: '👨‍💼' },
  'genereux':       { short: 'GÉNÉREUX',     full: 'Cas GÉNÉREUX',        icon: '💼' },
  'houette':        { short: 'HOUETTE',      full: 'Cas HOUETTE',         icon: '🏠' },
  'outils':         { short: 'Outils',       full: 'Boîte à Outils',     icon: '🧰' },
  'guide':          { short: 'Guide',        full: 'Guide Stratégique',   icon: '📋' },
  'formules':       { short: 'Formules',     full: 'Formules',            icon: '📐' },
  'montages':       { short: 'Montages',     full: 'Montages',            icon: '🔧' },
  'audit':          { short: 'Audit patrimonial', full: 'Audit patrimonial', icon: '📊' },
  'financement':    { short: 'Financement',  full: 'Financement des particuliers',      icon: '💰' },
  'responsabilite': { short: 'Responsabilité', full: 'Responsabilité du gestionnaire', icon: '⚖️' },
  'fiscal':         { short: 'Ingénierie fiscale PP', full: 'Ingénierie fiscale PP',  icon: '🏛️' },
  'droit':          { short: 'Droit patrimonial', full: 'Droit patrimonial',           icon: '📜' },
  'marches':        { short: 'Marchés financiers', full: 'Marchés financiers',         icon: '📈' },
  'transmission':   { short: 'Transmission d\'entreprises', full: 'Transmission d\'entreprises', icon: '🏢' },
  'fiscalite-int':  { short: 'Fiscalité Internationale', full: 'Fiscalité Internationale', icon: '🌍' }
};

// Helpers — dérivés de COURSE_META
function courseShort(id) { var m = COURSE_META[id]; return m ? m.short : id; }
function courseFull(id)  { var m = COURSE_META[id]; return m ? m.full : id; }
function courseIcon(id)  { var m = COURSE_META[id]; return m ? m.icon : '📄'; }
function courseTab(id)   { var m = COURSE_META[id]; return m ? m.icon + ' ' + m.short : id; }

// Tab name mapping (utilisé par la recherche)
var tabNames = {};
Object.keys(COURSE_META).forEach(function(k) { tabNames[k] = courseTab(k); });

// Search history
const SEARCH_HISTORY_KEY = 'gip-searchHistory';
function getSearchHistory() {
  try { return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY)) || []; } catch(e) { return []; }
}
function saveSearchHistory(history) {
  try { localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history.slice(0, 5))); } catch(e) {}
}
function addToSearchHistory(query) {
  var history = getSearchHistory().filter(function(h) { return h !== query; });
  history.unshift(query);
  saveSearchHistory(history);
}
function showSearchHistory() {
  var history = getSearchHistory();
  if (history.length === 0) return;
  searchResults.innerHTML =
    '<div class="search-history-header">Recherches récentes</div>' +
    history.map(function(h, i) {
      return '<div class="search-history-item" data-query="' + h.replace(/"/g, '&quot;') + '">' +
        '<span class="search-history-icon">🕐</span>' +
        '<span class="search-history-text">' + escapeHtml(h) + '</span>' +
        '<button class="search-history-remove" data-idx="' + i + '" title="Supprimer">✕</button>' +
        '</div>';
    }).join('');
  searchResults.classList.add('active');
}

searchInput && searchInput.addEventListener('focus', function() {
  if (this.value.trim().length < 2) showSearchHistory();
});

let searchDebounceTimer = null;
searchInput && searchInput.addEventListener('input', function() {
  var self = this;
  clearTimeout(searchDebounceTimer);
  var query = self.value.trim().toLowerCase();
  if (query.length < 2) {
    showSearchHistory();
    return;
  }
  searchDebounceTimer = setTimeout(function() {
    doSearch(self.value.trim().toLowerCase());
  }, 250);
});

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function doSearch(query) {
  if (query.length < 2) return;
  const results = [];
  const caseEls = document.querySelectorAll('.case-content');
  for (let ci = 0; ci < caseEls.length && results.length < 20; ci++) {
    const caseEl = caseEls[ci];
    const caseName = caseEl.id.replace('case-', '');
    const sections = caseEl.querySelectorAll('[id]');

    for (let si = 0; si < sections.length && results.length < 20; si++) {
      const section = sections[si];
      const text = section.textContent || '';
      const lowerText = text.toLowerCase();
      const idx = lowerText.indexOf(query);

      if (idx !== -1) {
        const start = Math.max(0, idx - 40);
        const end = Math.min(text.length, idx + query.length + 60);
        let snippet = escapeHtml((start > 0 ? '...' : '') + text.substring(start, end).trim() + (end < text.length ? '...' : ''));
        var escapedQ = escapeHtml(query);
        const regex = new RegExp('(' + escapedQ.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
        snippet = snippet.replace(regex, '<mark>$1</mark>');

        results.push({
          tab: caseName,
          sectionId: section.id,
          snippet: snippet
        });
      }
    }
  }

  // Remove duplicate section IDs (keep first match per section)
  const seen = new Set();
  const unique = results.filter(r => {
    if (seen.has(r.sectionId)) return false;
    seen.add(r.sectionId);
    return true;
  });

  if (unique.length === 0) {
    searchResults.innerHTML = '<div class="search-no-results">Aucun résultat pour "' + escapeHtml(query) + '"</div>';
    announce('Aucun résultat pour ' + query);
  } else {
    searchResults.innerHTML = '<div class="search-count">' + unique.length + ' résultat(s)</div>' +
      unique.map(r =>
        '<div class="search-result-item" data-tab="' + escapeHtml(r.tab) + '" data-section="' + escapeHtml(r.sectionId) + '">' +
        '<div class="search-result-tab">' + (tabNames[r.tab] || r.tab) + '</div>' +
        '<div class="search-result-text">' + r.snippet + '</div>' +
        '</div>'
      ).join('');
    announce(unique.length + ' résultat' + (unique.length > 1 ? 's' : ''));
  }

  searchResults.classList.add('active');
}

function goToSearch(tab, sectionId) {
  const query = searchInput.value.trim();
  if (query.length >= 2) addToSearchHistory(query);
  switchCase(tab);
  searchResults.classList.remove('active');
  searchInput.value = '';
  setTimeout(() => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Highlight le terme recherché dans la section
      if (query.length >= 2) highlightSearchTerm(el, query);
    }
  }, 100);
}

function highlightSearchTerm(container, query) {
  // Supprimer les anciens highlights
  document.querySelectorAll('.search-highlight').forEach(m => {
    const parent = m.parentNode;
    parent.replaceChild(document.createTextNode(m.textContent), m);
    parent.normalize();
  });

  const regex = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
  const matches = [];

  while (walker.nextNode()) {
    regex.lastIndex = 0;
    if (regex.test(walker.currentNode.textContent)) {
      matches.push(walker.currentNode);
    }
  }

  var escapedHL = escapeHtml(query);
  var hlRegex = new RegExp('(' + escapedHL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
  matches.forEach(node => {
    const span = document.createElement('span');
    span.innerHTML = escapeHtml(node.textContent).replace(hlRegex, '<mark class="search-highlight">$1</mark>');
    node.parentNode.replaceChild(span, node);
  });

  // Auto-remove après 5s
  setTimeout(() => {
    document.querySelectorAll('.search-highlight').forEach(m => {
      const parent = m.parentNode;
      parent.replaceChild(document.createTextNode(m.textContent), m);
      parent.normalize();
    });
  }, 5000);
}

// Close search on click outside
document.addEventListener('click', function(e) {
  if (!e.target.closest('.search-container')) {
    searchResults.classList.remove('active');
  }
});

// ============ MODE EXAMEN (avec choix de durée) ============
let examTimerInterval = null;
let examStartTime = null;
let examDuration = 0; // 0 = chronomètre, >0 = countdown en secondes

function toggleExamMode() {
  var isExam = document.body.classList.contains('exam-mode');

  if (isExam) {
    // Stop exam
    document.body.classList.remove('exam-mode');
    if (examTimerInterval) clearInterval(examTimerInterval);
    var timerEl = document.getElementById('examTimer');
    var timeEl = document.getElementById('examTimerTime');
    if (timerEl) { timerEl.style.display = 'none'; timerEl.classList.remove('exam-timer-warning'); }
    if (timeEl) timeEl.textContent = '0:00';
    examDuration = 0;
    announce('Mode examen désactivé');
    return;
  }

  // Show duration selector
  var overlay = document.createElement('div');
  overlay.className = 'exam-duration-overlay';
  overlay.innerHTML =
    '<div class="exam-duration-modal">' +
    '<h3>Mode Examen</h3>' +
    '<p>Choisissez la durée de l\'épreuve</p>' +
    '<div class="exam-duration-options">' +
    '<button class="exam-duration-btn" data-duration="3600">1h<small>Épreuve courte</small></button>' +
    '<button class="exam-duration-btn" data-duration="7200">2h<small>Standard</small></button>' +
    '<button class="exam-duration-btn" data-duration="10800">3h<small>Épreuve longue</small></button>' +
    '<button class="exam-duration-btn" data-duration="0">Chrono<small>Temps libre</small></button>' +
    '</div>' +
    '<button class="exam-duration-cancel">Annuler</button>' +
    '</div>';
  document.body.appendChild(overlay);

  var releaseTrap = trapFocus(overlay);
  overlay._releaseTrap = releaseTrap;
  function closeOverlay() { if (releaseTrap) releaseTrap(); overlay.remove(); }
  overlay.querySelector('.exam-duration-cancel').onclick = closeOverlay;
  overlay.addEventListener('click', function(e) { if (e.target === overlay) closeOverlay(); });

  overlay.querySelectorAll('.exam-duration-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      examDuration = parseInt(btn.getAttribute('data-duration'));
      closeOverlay();
      startExam();
    });
  });
}

function startExam() {
  document.body.classList.add('exam-mode');
  examStartTime = Date.now();
  announce('Mode examen activé' + (examDuration > 0 ? ' — ' + Math.floor(examDuration / 3600) + 'h' : ''));
  var timerEl = document.getElementById('examTimer');
  var timeEl = document.getElementById('examTimerTime');
  var labelEl = timerEl ? timerEl.querySelector('.exam-timer-label') : null;

  if (timerEl) {
    timerEl.style.display = 'block';
    timerEl.classList.remove('exam-timer-warning');
    timerEl.setAttribute('role', 'timer');
    timerEl.setAttribute('aria-live', 'polite');
    timerEl.setAttribute('aria-label', 'Chronomètre examen');
  }
  if (labelEl) labelEl.textContent = examDuration > 0 ? 'Temps restant' : 'Mode Examen';

  examTimerInterval = setInterval(function() {
    var elapsed = Math.floor((Date.now() - examStartTime) / 1000);

    if (examDuration > 0) {
      // Countdown mode
      var remaining = Math.max(0, examDuration - elapsed);
      var mins = Math.floor(remaining / 60);
      var secs = remaining % 60;
      if (timeEl) timeEl.textContent = mins + ':' + (secs < 10 ? '0' : '') + secs;

      // Warning at 15 min
      if (remaining <= 900 && remaining > 0 && timerEl) {
        if (!timerEl.classList.contains('exam-timer-warning')) {
          announce('Attention : 15 minutes restantes');
        }
        timerEl.classList.add('exam-timer-warning');
      }
      // Time's up
      if (remaining <= 0) {
        clearInterval(examTimerInterval);
        if (timeEl) timeEl.textContent = 'Terminé !';
        if (timerEl) timerEl.classList.remove('exam-timer-warning');
        if (labelEl) labelEl.textContent = 'Temps écoulé';
      }
    } else {
      // Chrono mode (count up)
      var mins = Math.floor(elapsed / 60);
      var secs = elapsed % 60;
      if (timeEl) timeEl.textContent = mins + ':' + (secs < 10 ? '0' : '') + secs;
    }
  }, 1000);
}

// Rafraîchir l'affichage du timer quand l'onglet redevient visible
document.addEventListener('visibilitychange', function() {
  if (!document.hidden && examStartTime && examTimerInterval) {
    var timeEl = document.getElementById('examTimerTime');
    var timerEl = document.getElementById('examTimer');
    if (!timeEl) return;
    var elapsed = Math.floor((Date.now() - examStartTime) / 1000);
    if (examDuration > 0) {
      var remaining = Math.max(0, examDuration - elapsed);
      var mins = Math.floor(remaining / 60);
      var secs = remaining % 60;
      timeEl.textContent = mins + ':' + (secs < 10 ? '0' : '') + secs;
      if (remaining <= 900 && remaining > 0 && timerEl) timerEl.classList.add('exam-timer-warning');
      if (remaining <= 0) {
        clearInterval(examTimerInterval);
        timeEl.textContent = 'Terminé !';
        if (timerEl) timerEl.classList.remove('exam-timer-warning');
      }
    } else {
      var mins = Math.floor(elapsed / 60);
      var secs = elapsed % 60;
      timeEl.textContent = mins + ':' + (secs < 10 ? '0' : '') + secs;
    }
  }
});

// ============ FONT SIZE CONTROL ============
const fontSizes = ['font-sm', 'font-md', 'font-lg'];
const fontLabels = ['Petit', 'Moyen', 'Grand'];

function cycleFontSize() {
  var html = document.documentElement;
  var current = fontSizes.findIndex(function(c) { return html.classList.contains(c); });
  if (current === -1) current = 1; // default = medium (no class)

  fontSizes.forEach(function(c) { html.classList.remove(c); });

  var next = (current + 1) % fontSizes.length;
  if (next !== 1) { // 1 = medium = default = no class needed
    html.classList.add(fontSizes[next]);
  }
  try { localStorage.setItem('gip-fontSize', fontSizes[next]); } catch(e) {}

  // Brief toast
  var btn = document.getElementById('fontSizeBtn');
  if (btn) {
    btn.title = 'Taille : ' + fontLabels[next];
    btn.setAttribute('aria-label', 'Taille du texte : ' + fontLabels[next]);
  }
  announce('Taille du texte : ' + fontLabels[next]);
}

// Restore font size
(function() {
  var saved = localStorage.getItem('gip-fontSize');
  if (saved && saved !== 'font-md' && fontSizes.indexOf(saved) !== -1) {
    document.documentElement.classList.add(saved);
  }
})();

// ============ DARK MODE ============
function toggleDarkMode() {
  // Dark mode is default. Toggle adds/removes light-mode.
  document.body.classList.toggle('light-mode');
  const isLight = document.body.classList.contains('light-mode');
  document.getElementById('darkToggle').textContent = isLight ? '🌙' : '☀️';
  try { localStorage.setItem('lightMode', isLight ? '1' : '0'); } catch(e) {}
  announce(isLight ? 'Mode clair activé' : 'Mode sombre activé');
}

// Restore theme preference (dark is default)
// Si pas de préférence enregistrée, détecter le thème système
try {
  const savedTheme = localStorage.getItem('lightMode');
  if (savedTheme === '1') {
    document.body.classList.add('light-mode');
    document.getElementById('darkToggle').textContent = '🌙';
  } else if (savedTheme === '0') {
    document.getElementById('darkToggle').textContent = '☀️';
  } else {
    // Pas de préférence : suivre le système
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      document.body.classList.add('light-mode');
      document.getElementById('darkToggle').textContent = '🌙';
    } else {
      document.getElementById('darkToggle').textContent = '☀️';
    }
  }
} catch(e) {}

// Écouter les changements de thème système en temps réel
try {
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', function(e) {
    if (localStorage.getItem('lightMode') !== null) return; // Respecter le choix manuel
    if (e.matches) {
      document.body.classList.add('light-mode');
      document.getElementById('darkToggle').textContent = '🌙';
    } else {
      document.body.classList.remove('light-mode');
      document.getElementById('darkToggle').textContent = '☀️';
    }
  });
} catch(e) {}

// ============ HASH ROUTING — CHARGEMENT INITIAL ============
var _knownPages = ['home','audit','snow','stark','niote','mengere','norris','vador','leon','genereux','houette',
  'financement','responsabilite','fiscal','droit','marches','transmission','fiscalite-int',
  'outils','guide','montages','formules'];

window.addEventListener('hashchange', function() {
  var hash = window.location.hash.replace('#', '');
  if (hash && _knownPages.indexOf(hash) !== -1) enterCourse(hash);
});

// Back/forward button support
window.addEventListener('popstate', function(e) {
  var hash = window.location.hash.replace('#', '');
  if (hash && _knownPages.indexOf(hash) !== -1) {
    enterCourse(hash);
  } else {
    switchCase('home');
  }
});

// ============ FLASHCARDS — FILTRAGE & MÉLANGE ============
function filterFlashcards(tag) {
  const grid = document.getElementById('flashcardGrid');
  if (!grid) return;
  const cards = grid.querySelectorAll('.flashcard');

  document.querySelectorAll('.fc-filter').forEach(f => f.classList.remove('active'));
  const btn = document.querySelector('.fc-filter[data-tag="' + tag + '"]');
  if (btn) btn.classList.add('active');

  cards.forEach(function(card) {
    if (tag === 'all' || card.getAttribute('data-tag') === tag) {
      card.classList.remove('fc-hidden');
    } else {
      card.classList.add('fc-hidden');
    }
  });
  updateFcScore();
}

function shuffleFlashcards() {
  const grid = document.getElementById('flashcardGrid');
  if (!grid) return;
  const cards = Array.from(grid.querySelectorAll('.flashcard'));

  // Animation fade-out
  grid.style.transition = 'opacity 0.15s ease';
  grid.style.opacity = '0';

  setTimeout(function() {
    // Fisher-Yates shuffle (ne pas reset l'état revealed)
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      grid.appendChild(cards[j]);
    }
    updateFcScore();

    // Animation fade-in avec stagger
    grid.style.opacity = '1';
    cards.forEach(function(card, i) {
      card.style.transition = 'none';
      card.style.opacity = '0';
      card.style.transform = 'scale(0.95)';
      setTimeout(function() {
        card.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        card.style.opacity = '1';
        card.style.transform = '';
      }, 30 + i * 20);
    });
  }, 150);
}

function updateFcScore() {
  const grid = document.getElementById('flashcardGrid');
  const scoreEl = document.getElementById('fcScore');
  if (!grid || !scoreEl) return;
  const visible = grid.querySelectorAll('.flashcard:not(.fc-hidden)');
  const revealed = grid.querySelectorAll('.flashcard.revealed:not(.fc-hidden)');
  scoreEl.textContent = revealed.length + '/' + visible.length + ' révélées';
}

// ============ FLASHCARD PERSISTANCE ============
const GIP_FC_KEY = 'gip-flashcards';

function toggleFlashcard(card) {
  card.classList.toggle('revealed');
  saveFcState();
  updateFcScore();
}

function saveFcState() {
  var grid = document.getElementById('flashcardGrid');
  if (!grid) return;
  var state = [];
  grid.querySelectorAll('.flashcard').forEach(function(card, i) {
    if (card.classList.contains('revealed')) state.push(i);
  });
  try { localStorage.setItem(GIP_FC_KEY, JSON.stringify(state)); } catch(e) {}
}

function restoreFcState() {
  var grid = document.getElementById('flashcardGrid');
  if (!grid) return;
  try {
    var state = JSON.parse(localStorage.getItem(GIP_FC_KEY)) || [];
    var cards = grid.querySelectorAll('.flashcard');
    state.forEach(function(i) {
      if (cards[i]) cards[i].classList.add('revealed');
    });
    updateFcScore();
  } catch(e) {}
}

function resetFlashcards() {
  if (!confirm('Réinitialiser toutes les flashcards ?')) return;
  var grid = document.getElementById('flashcardGrid');
  if (!grid) return;
  grid.querySelectorAll('.flashcard').forEach(function(c) { c.classList.remove('revealed'); });
  try { localStorage.removeItem(GIP_FC_KEY); } catch(e) {}
  updateFcScore();
}

// Restaurer au chargement
restoreFcState();

// ============ INJECTION BOUTONS EXPORT PDF ============
(function() {
  // Cas qui ne sont pas home/audit (pages avec du contenu imprimable)
  const printableCases = ['snow','stark','niote','mengere','norris','vador','leon','genereux','houette','outils','guide','montages','formules','financement','responsabilite','fiscal','droit','marches','transmission','fiscalite-int'];

  printableCases.forEach(function(caseName) {
    const caseEl = document.getElementById('case-' + caseName);
    if (!caseEl) return;
    const welcome = caseEl.querySelector('.welcome');
    if (!welcome) return;

    // Ne pas ajouter si Houette a déjà ses propres boutons
    if (caseName === 'houette') return;

    const btn = document.createElement('button');
    btn.className = 'export-pdf-btn';
    btn.textContent = '📄 Exporter PDF';
    btn.title = 'Exporter ce contenu en PDF';
    btn.onclick = function() { exportCasePDF(caseName); };
    welcome.appendChild(btn);
  });
})();

// ============ NAVIGATION CLAVIER DANS LA RECHERCHE ============
(function() {
  if (!searchInput) return;
  let kbIndex = -1;

  searchInput.addEventListener('keydown', function(e) {
    const items = searchResults.querySelectorAll('.search-result-item');
    if (!items.length || !searchResults.classList.contains('active')) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      kbIndex = Math.min(kbIndex + 1, items.length - 1);
      items.forEach(i => i.classList.remove('kb-active'));
      items[kbIndex].classList.add('kb-active');
      items[kbIndex].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      kbIndex = Math.max(kbIndex - 1, 0);
      items.forEach(i => i.classList.remove('kb-active'));
      items[kbIndex].classList.add('kb-active');
      items[kbIndex].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter' && kbIndex >= 0) {
      e.preventDefault();
      items[kbIndex].click();
      kbIndex = -1;
    }
  });

  // Reset index quand les résultats changent
  searchInput.addEventListener('input', function() { kbIndex = -1; });
})();

// ============ PERSISTANCE SIDEBAR (desktop) ============
(function() {
  try {
    if (localStorage.getItem('gip-sidebarCollapsed') === '1') {
      const sidebar = document.getElementById('sidebar');
      const expandBtn = document.getElementById('sidebarExpandBtn');
      if (sidebar) sidebar.classList.add('collapsed');
      if (expandBtn) expandBtn.classList.add('visible');
    }
  } catch(e) {}
})();

// ============ SUIVI DE PROGRESSION ============
const GIP_PROGRESS_KEY = 'gip-progress';

function getProgress() {
  try { return JSON.parse(localStorage.getItem(GIP_PROGRESS_KEY)) || {}; } catch(e) { return {}; }
}

function saveProgress(data) {
  try { localStorage.setItem(GIP_PROGRESS_KEY, JSON.stringify(data)); } catch(e) {}
}

function toggleSectionRead(caseName, sectionId, checkEl) {
  const progress = getProgress();
  if (!progress[caseName]) progress[caseName] = [];

  const idx = progress[caseName].indexOf(sectionId);
  if (idx === -1) {
    progress[caseName].push(sectionId);
    checkEl.classList.add('done');
    checkEl.textContent = '✓';
  } else {
    progress[caseName].splice(idx, 1);
    checkEl.classList.remove('done');
    checkEl.textContent = '○';
  }
  saveProgress(progress);
  updateProgressBar(caseName);
  // Trigger milestone check
  if (typeof checkMilestone === 'function') checkMilestone(caseName);
}

function updateProgressBar(caseName) {
  const barEl = document.querySelector('#sidebar-' + caseName + ' .sidebar-progress-fill');
  const textEl = document.querySelector('#sidebar-' + caseName + ' .sidebar-progress-text');
  if (!barEl) return;

  const total = document.querySelectorAll('#sidebar-' + caseName + ' .check-read').length;
  const progress = getProgress();
  const done = (progress[caseName] || []).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  barEl.style.width = pct + '%';
  if (textEl) textEl.textContent = done + '/' + total;
}

// Injecter les checkboxes de progression dans les sidebars
function initProgressChecks(targetCase) {
  var progress = getProgress();
  var selector = targetCase ? '#sidebar-' + targetCase : '[id^="sidebar-"]';

  document.querySelectorAll(selector).forEach(function(sidebarDiv) {
    var caseName = sidebarDiv.id.replace('sidebar-', '');
    // Éviter de doubler les checks
    if (sidebarDiv.querySelector('.check-read')) return;
    var items = sidebarDiv.querySelectorAll('.sidebar-item[onclick*="goTo"], .sidebar-item[data-goto]');
    if (items.length === 0) return;

    items.forEach(function(item) {
      var sectionId = item.dataset.goto;
      if (!sectionId) {
        var match = (item.getAttribute('onclick') || '').match(/goTo\('([^']+)'\)/);
        if (match) sectionId = match[1];
      }
      if (!sectionId) return;

      var check = document.createElement('span');
      check.className = 'check-read';
      var isDone = progress[caseName] && progress[caseName].includes(sectionId);
      if (isDone) { check.classList.add('done'); check.textContent = '✓'; }
      else { check.textContent = '○'; }
      check.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleSectionRead(caseName, sectionId, check);
      });
      item.appendChild(check);
    });

    // Barre de progression en haut
    if (!sidebarDiv.querySelector('.sidebar-progress')) {
      var progressEl = document.createElement('div');
      progressEl.className = 'sidebar-progress';
      var done = (progress[caseName] || []).length;
      var total = items.length;
      var pct = total > 0 ? Math.round((done / total) * 100) : 0;
      progressEl.innerHTML =
        '<div class="sidebar-progress-bar"><div class="sidebar-progress-fill" style="width:' + pct + '%"></div></div>' +
        '<span class="sidebar-progress-text">' + done + '/' + total + '</span>';
      sidebarDiv.insertBefore(progressEl, sidebarDiv.querySelector('.sidebar-item'));
    }
  });
}
initProgressChecks();

// ============ PROGRESSION SUR LES CARTES D'ACCUEIL ============
(function() {
  const progress = getProgress();

  // Map des cas pour le cours "Audit" (cartes dans case-audit)
  const auditCases = ['snow','stark','niote','mengere','norris','vador','leon','genereux','houette','outils','guide','montages','formules'];
  // Cours autonomes (cartes dans case-home)
  const courses = ['financement','responsabilite','fiscal','droit','marches','transmission','fiscalite-int'];

  function injectCardProgress(cardEl, caseNames) {
    if (!cardEl) return;
    let totalSections = 0;
    let doneSections = 0;

    caseNames.forEach(name => {
      const sidebarDiv = document.getElementById('sidebar-' + name);
      if (!sidebarDiv) return;
      const items = sidebarDiv.querySelectorAll('.sidebar-item[onclick*="goTo"], .sidebar-item[data-goto]');
      totalSections += items.length;
      doneSections += (progress[name] || []).length;
    });

    if (totalSections === 0) return;
    const pct = Math.round((doneSections / totalSections) * 100);
    if (doneSections === 0) return;

    const radius = 15;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (pct / 100) * circumference;

    const div = document.createElement('div');
    div.className = 'home-card-progress';
    div.innerHTML =
      '<svg class="progress-ring" width="38" height="38" viewBox="0 0 38 38">' +
      '<circle class="progress-ring-bg" cx="19" cy="19" r="' + radius + '"/>' +
      '<circle class="progress-ring-fill" cx="19" cy="19" r="' + radius + '" ' +
      'stroke-dasharray="' + circumference + '" stroke-dashoffset="' + circumference + '" ' +
      'transform="rotate(-90 19 19)"/>' +
      '</svg>' +
      '<span class="home-card-progress-text">' + pct + '%</span>';
    cardEl.appendChild(div);

    // Animate ring on next frame
    requestAnimationFrame(function() {
      var fill = div.querySelector('.progress-ring-fill');
      if (fill) fill.style.strokeDashoffset = offset;
    });
  }

  // Carte "Audit patrimonial" — agrège tous les cas
  const auditCard = document.querySelector('.home-card.card-audit');
  injectCardProgress(auditCard, auditCases);

  // Cartes des cours autonomes
  courses.forEach(name => {
    const card = document.querySelector('.home-card.card-' + name);
    injectCardProgress(card, [name]);
  });
})();

// ============ DASHBOARD STATS ============
(function() {
  const progress = getProgress();
  let totalSections = 0;
  let doneSections = 0;

  document.querySelectorAll('[id^="sidebar-"]').forEach(sidebarDiv => {
    const caseName = sidebarDiv.id.replace('sidebar-', '');
    const items = sidebarDiv.querySelectorAll('.sidebar-item[onclick*="goTo"], .sidebar-item[data-goto]');
    totalSections += items.length;
    doneSections += (progress[caseName] || []).length;
  });

  const pct = totalSections > 0 ? Math.round((doneSections / totalSections) * 100) : 0;

  const elPct = document.getElementById('statProgress');
  const elBar = document.getElementById('statProgressBar');
  const elSections = document.getElementById('statSections');
  const elStreak = document.getElementById('statStreak');
  const elLast = document.getElementById('statLast');

  if (elPct) elPct.textContent = pct + '%';
  if (elBar) elBar.style.width = pct + '%';
  if (elSections) elSections.textContent = doneSections + ' / ' + totalSections;

  // Streak : jours consécutifs d'étude (comparaison par date YYYY-MM-DD)
  try {
    var days = JSON.parse(localStorage.getItem('gip-studyDays')) || [];
    var today = new Date().toISOString().slice(0, 10);
    if (days[days.length - 1] !== today) {
      days.push(today);
      // Limiter l'historique à 365 jours
      if (days.length > 365) days = days.slice(-365);
      localStorage.setItem('gip-studyDays', JSON.stringify(days));
    }
    var streak = 0;
    if (days.length > 0) {
      streak = 1;
      for (var i = days.length - 1; i > 0; i--) {
        // Comparer les dates comme chaînes YYYY-MM-DD (pas de problème de timezone)
        var prev = new Date(days[i - 1] + 'T00:00:00');
        var curr = new Date(days[i] + 'T00:00:00');
        var diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) streak++;
        else if (diffDays > 1) break;
        // diffDays === 0 : même jour, on skip
      }
    }
    if (elStreak) elStreak.textContent = streak + ' j';
  } catch(e) {}

  // Dernière session
  try {
    var lastPage = localStorage.getItem('gip-lastPage');
    if (elLast && lastPage && lastPage !== 'home') {
      elLast.textContent = courseShort(lastPage);
    }
  } catch(e) {}

  // Historique récent
  try {
    var hist = JSON.parse(localStorage.getItem('gip-history') || '[]');
    var container = document.getElementById('recentActivity');
    var title = document.getElementById('recentTitle');
    if (container && hist.length > 0 && title) {
      title.style.display = '';
      hist.forEach(function(h) {
        var name = courseShort(h.page);
        var ago = timeAgo(h.ts);
        var el = document.createElement('div');
        el.className = 'recent-item';
        el.setAttribute('role', 'button');
        el.setAttribute('tabindex', '0');
        el.onclick = function() { switchCase(h.page); };
        el.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.click(); }
        });
        el.innerHTML = '<span class="recent-item-icon">' + courseIcon(h.page) + '</span>' +
          '<div class="recent-item-info"><div class="recent-item-title">' + name + '</div>' +
          '<div class="recent-item-time">' + ago + '</div></div>';
        container.appendChild(el);
      });
    }
  } catch(e) {}
})();

function timeAgo(ts) {
  var diff = Date.now() - ts;
  var mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return 'Il y a ' + mins + ' min';
  var hrs = Math.floor(mins / 60);
  if (hrs < 24) return 'Il y a ' + hrs + ' h';
  var days = Math.floor(hrs / 24);
  return 'Il y a ' + days + ' j';
}

// ============ TABLES RESPONSIVES (auto-wrap + scroll indicators) ============
function initResponsiveTables(targetCase) {
  var scope = targetCase ? document.getElementById('case-' + targetCase) : document;
  if (!scope) return;
  scope.querySelectorAll('.data-table, .patrimoine-table').forEach(function(table) {
    if (table.parentElement.classList.contains('table-responsive')) return;
    var wrapper = document.createElement('div');
    wrapper.className = 'table-responsive';
    wrapper.style.cssText = 'overflow-x:auto;border-radius:var(--radius-sm);';
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
    function checkScroll() {
      if (wrapper.scrollWidth > wrapper.clientWidth + 2) {
        wrapper.classList.add('has-scroll');
        wrapper.classList.toggle('scrolled-end', wrapper.scrollLeft + wrapper.clientWidth >= wrapper.scrollWidth - 2);
      } else {
        wrapper.classList.remove('has-scroll', 'scrolled-end');
      }
    }
    wrapper.addEventListener('scroll', checkScroll, { passive: true });
    setTimeout(checkScroll, 100);
  });
}
initResponsiveTables();

// ============ TOOLTIPS ABRÉVIATIONS ============
(function() {
  var abbrMap = {
    'TMI': 'Tranche Marginale d\'Imposition',
    'PFU': 'Prélèvement Forfaitaire Unique (flat tax 30%)',
    'IFI': 'Impôt sur la Fortune Immobilière',
    'DMTG': 'Droits de Mutation à Titre Gratuit',
    'SCI': 'Société Civile Immobilière',
    'OBO': 'Owner Buy Out',
    'PER': 'Plan Épargne Retraite',
    'SCPI': 'Société Civile de Placement Immobilier',
    'LMNP': 'Loueur Meublé Non Professionnel',
    'LMP': 'Loueur Meublé Professionnel',
    'CGP': 'Conseiller en Gestion de Patrimoine',
    'HCSF': 'Haut Conseil de Stabilité Financière',
    'DCI': 'Directive Crédit Immobilier',
    'ADE': 'Assurance Décès Emprunteur'
  };

  // Injecter les tooltips dans les titres et premiers paragraphes de chaque section
  document.querySelectorAll('.welcome p, .welcome .subtitle, .home-card-desc').forEach(function(el) {
    var html = el.innerHTML;
    Object.keys(abbrMap).forEach(function(abbr) {
      var regex = new RegExp('\\b(' + abbr + ')\\b(?![^<]*>)', 'g');
      html = html.replace(regex, '<span class="abbr-tip" tabindex="0" data-tip="' + abbrMap[abbr] + '">$1</span>');
    });
    el.innerHTML = html;
  });
})();

// ============ SIDEBAR SUB-SECTIONS REPLIABLES ============
(function() {
  document.querySelectorAll('.sidebar-sub').forEach(function(sub) {
    var prev = sub.previousElementSibling;
    if (prev && prev.classList.contains('sidebar-item')) {
      if (prev.hasAttribute('data-sub-init')) return;
      prev.setAttribute('data-sub-init', '1');
      prev.classList.add('has-sub');
      prev.setAttribute('aria-expanded', !sub.classList.contains('collapsed'));
      prev.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        sub.classList.toggle('collapsed');
        prev.classList.toggle('sub-collapsed');
        prev.setAttribute('aria-expanded', !sub.classList.contains('collapsed'));
      });
    }
  });
})();

// ============ ACCESSIBILITÉ — TABINDEX ============
(function() {
  document.querySelectorAll('.sidebar-item, .tab, .flashcard, .home-card:not(.card-disabled)').forEach(function(el) {
    if (!el.getAttribute('tabindex')) el.setAttribute('tabindex', '0');
  });
})();

// ============ BANDEAU "REPRENDRE" ============
(function() {
  const banner = document.getElementById('resumeBanner');
  const text = document.getElementById('resumeText');
  const btn = document.getElementById('resumeBtn');
  const close = document.getElementById('resumeClose');
  if (!banner || !text || !btn || !close) return;

  try {
    const lastPage = localStorage.getItem('gip-lastPage');
    const hash = window.location.hash.replace('#', '');

    // Afficher le bandeau seulement si on arrive sur home et qu'on a une dernière page
    if (lastPage && lastPage !== 'home' && !hash) {
      var progressInfo = '';
      try {
        var prog = JSON.parse(localStorage.getItem('gip-progress') || '{}');
        var doneSections = (prog[lastPage] || []).length;
        if (doneSections > 0) {
          progressInfo = ' <span style="opacity:0.7;font-size:0.85em">(' + doneSections + ' section' + (doneSections > 1 ? 's' : '') + ' lu' + (doneSections > 1 ? 'es' : 'e') + ')</span>';
        }
      } catch(e) {}
      text.innerHTML = 'Reprendre : <strong>' + escapeHtml(courseFull(lastPage)) + '</strong>' + progressInfo;
      banner.style.display = 'flex';

      btn.addEventListener('click', function() {
        enterCourse(lastPage);
        banner.style.display = 'none';
      });
      close.addEventListener('click', function() {
        banner.style.display = 'none';
      });

      // Auto-masquer après 8s
      setTimeout(function() {
        if (banner.style.display !== 'none') {
          banner.style.opacity = '0';
          banner.style.transition = 'opacity 0.4s';
          setTimeout(function() { banner.style.display = 'none'; }, 400);
        }
      }, 8000);

      // Preload last visited course content in background for instant resume
      if (window.contentLoader && !document.getElementById('case-' + lastPage)) {
        window.contentLoader.load(lastPage).catch(function() {});
      }
    }
  } catch(e) {}
})();

// ============ NAVIGATION PRÉCÉDENT/SUIVANT ENTRE SECTIONS ============
(function() {
  function buildSectionNav(targetCase) {
    var selector = targetCase ? '#sidebar-' + targetCase : '[id^="sidebar-"]';
    document.querySelectorAll(selector).forEach(function(sidebarDiv) {
      var caseName = sidebarDiv.id.replace('sidebar-', '');
      var items = sidebarDiv.querySelectorAll('.sidebar-item[onclick*="goTo"], .sidebar-item[data-goto]');
      if (items.length < 2) return;

      var sectionIds = [];
      var sectionLabels = [];
      items.forEach(function(item) {
        var sectionId = item.dataset.goto;
        if (!sectionId) {
          var match = (item.getAttribute('onclick') || '').match(/goTo\(['"]([^'"]+)['"]\)/);
          if (match) sectionId = match[1];
        }
        if (sectionId) {
          sectionIds.push(sectionId);
          var label = item.querySelector('.sidebar-label');
          sectionLabels.push(label ? label.textContent.trim() : sectionId);
        }
      });

      // Add nav buttons to each section
      sectionIds.forEach(function(id, idx) {
        var section = document.getElementById(id);
        if (!section) return;

        // Skip if nav already exists
        if (section.querySelector('.section-nav')) return;

        var nav = document.createElement('div');
        nav.className = 'section-nav';

        if (idx > 0) {
          nav.innerHTML += '<button class="section-nav-btn nav-prev" data-target="' + escapeHtml(sectionIds[idx - 1]) + '" aria-label="Précédent : ' + escapeHtml(sectionLabels[idx - 1]) + '">' +
            '<span class="section-nav-arrow">←</span>' +
            '<span class="section-nav-label">' + escapeHtml(sectionLabels[idx - 1]) + '</span></button>';
        }
        if (idx < sectionIds.length - 1) {
          nav.innerHTML += '<button class="section-nav-btn nav-next" data-target="' + escapeHtml(sectionIds[idx + 1]) + '" aria-label="Suivant : ' + escapeHtml(sectionLabels[idx + 1]) + '">' +
            '<span class="section-nav-label">' + escapeHtml(sectionLabels[idx + 1]) + '</span>' +
            '<span class="section-nav-arrow">→</span></button>';
        }

        // Attach click handlers via addEventListener (no inline onclick)
        nav.querySelectorAll('.section-nav-btn').forEach(function(btn) {
          btn.addEventListener('click', function() {
            goTo(btn.dataset.target);
          });
        });

        if (nav.children.length > 0) {
          section.appendChild(nav);
        }
      });
    });
  }
  window._buildSectionNav = buildSectionNav;
  buildSectionNav();
})();

// ============ SYSTÈME DE FAVORIS (BOOKMARKS) ============
const BOOKMARKS_KEY = 'gip-bookmarks';

function getBookmarks() {
  try { return JSON.parse(localStorage.getItem(BOOKMARKS_KEY)) || []; } catch(e) { return []; }
}
function saveBookmarks(bm) {
  try { localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bm)); } catch(e) {}
  updateBookmarkCount();
}

function toggleBookmark(caseName, sectionId, sectionTitle) {
  var bm = getBookmarks();
  var idx = bm.findIndex(function(b) { return b.case === caseName && b.section === sectionId; });
  if (idx === -1) {
    bm.push({ case: caseName, section: sectionId, title: sectionTitle });
  } else {
    bm.splice(idx, 1);
  }
  saveBookmarks(bm);
  return idx === -1; // true if added
}

function isBookmarked(caseName, sectionId) {
  return getBookmarks().some(function(b) { return b.case === caseName && b.section === sectionId; });
}

function updateBookmarkCount() {
  var count = getBookmarks().length;
  var el = document.getElementById('bookmarkCount');
  if (el) {
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  }
}

function renderBookmarksPanel(panel) {
  var bm = getBookmarks();
  if (bm.length === 0) {
    panel.innerHTML = '<div class="bookmarks-panel-header">Favoris</div>' +
      '<div class="bookmarks-empty">Aucun favori.<br><small>Cliquez ★ dans une section pour l\'ajouter.</small></div>';
  } else {
    panel.innerHTML = '<div class="bookmarks-panel-header">Favoris (' + bm.length + ')</div>' +
      bm.map(function(b, i) {
        return '<div class="bookmark-item" data-case="' + escapeHtml(b.case) + '" data-section="' + escapeHtml(b.section) + '" data-idx="' + i + '">' +
          '<div><div class="bookmark-item-course">' + escapeHtml(courseShort(b.case)) + '</div>' +
          '<div class="bookmark-item-title">' + escapeHtml(b.title) + '</div></div>' +
          '<button class="bookmark-item-remove" data-idx="' + i + '" title="Retirer">✕</button></div>';
      }).join('');
  }
  panel.querySelectorAll('.bookmark-item').forEach(function(item) {
    item.style.cursor = 'pointer';
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.addEventListener('click', function(e) {
      if (e.target.closest('.bookmark-item-remove')) return;
      goToBookmark(item.dataset.case, item.dataset.section);
    });
    item.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); item.click(); }
    });
  });
  panel.querySelectorAll('.bookmark-item-remove').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      removeBookmark(parseInt(btn.dataset.idx, 10));
    });
  });
}

function toggleBookmarksPanel() {
  var panel = document.getElementById('bookmarksPanel');
  if (!panel) return;
  if (panel.classList.contains('active')) {
    panel.classList.remove('active');
    return;
  }
  renderBookmarksPanel(panel);
  panel.classList.add('active');
}

function goToBookmark(caseName, sectionId) {
  document.getElementById('bookmarksPanel').classList.remove('active');
  switchCase(caseName);
  setTimeout(function() { goTo(sectionId); }, 150);
}

function removeBookmark(idx) {
  var bm = getBookmarks();
  bm.splice(idx, 1);
  saveBookmarks(bm);
  // Refresh panel content in place (no close/reopen flicker)
  var panel = document.getElementById('bookmarksPanel');
  if (panel && panel.classList.contains('active')) {
    renderBookmarksPanel(panel);
  }
  refreshBookmarkStars();
}

function refreshBookmarkStars() {
  document.querySelectorAll('.bookmark-btn').forEach(function(btn) {
    var caseName = btn.getAttribute('data-case');
    var sectionId = btn.getAttribute('data-section');
    if (isBookmarked(caseName, sectionId)) {
      btn.classList.add('bookmarked');
      btn.textContent = '★';
    } else {
      btn.classList.remove('bookmarked');
      btn.textContent = '☆';
    }
  });
}

// Inject bookmark stars into section headers
function initBookmarkStars(targetCase) {
  var selector = targetCase ? '#sidebar-' + targetCase : '[id^="sidebar-"]';
  document.querySelectorAll(selector).forEach(function(sidebarDiv) {
    var caseName = sidebarDiv.id.replace('sidebar-', '');
    var items = sidebarDiv.querySelectorAll('.sidebar-item[onclick*="goTo"], .sidebar-item[data-goto]');

    items.forEach(function(item) {
      var sectionId = item.dataset.goto;
      if (!sectionId) {
        var match = (item.getAttribute('onclick') || '').match(/goTo\(['"]([^'"]+)['"]\)/);
        if (match) sectionId = match[1];
      }
      if (!sectionId) return;
      var section = document.getElementById(sectionId);
      if (!section) return;

      var header = section.querySelector('.section-header');
      if (!header || header.querySelector('.bookmark-btn')) return;

      var label = item.querySelector('.sidebar-label');
      var title = label ? label.textContent.trim() : sectionId;

      var star = document.createElement('button');
      star.className = 'bookmark-btn' + (isBookmarked(caseName, sectionId) ? ' bookmarked' : '');
      star.setAttribute('data-case', caseName);
      star.setAttribute('data-section', sectionId);
      var _isBm = isBookmarked(caseName, sectionId);
      star.setAttribute('aria-label', _isBm ? 'Retirer des favoris' : 'Ajouter aux favoris');
      star.textContent = _isBm ? '★' : '☆';
      star.addEventListener('click', function(e) {
        e.stopPropagation();
        var added = toggleBookmark(caseName, sectionId, title);
        star.classList.toggle('bookmarked', added);
        star.textContent = added ? '★' : '☆';
        star.setAttribute('aria-label', added ? 'Retirer des favoris' : 'Ajouter aux favoris');
      });
      header.appendChild(star);
    });
  });

  updateBookmarkCount();
}
(function() {
  initBookmarkStars();

  // Close panel on outside click
  document.addEventListener('click', function(e) {
    var panel = document.getElementById('bookmarksPanel');
    var btn = document.getElementById('bookmarksBtn');
    if (panel && panel.classList.contains('active') && !panel.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
      panel.classList.remove('active');
    }
  });
})();

// ============ BOUTON COPIER SUR LES CALC-BLOCKS ============
function initCalcCopyButtons(targetCase) {
  var scope = targetCase ? document.getElementById('case-' + targetCase) : document;
  if (!scope) return;
  scope.querySelectorAll('.calc-block').forEach(function(block) {
    if (block.querySelector('.calc-copy-btn')) return;
    var btn = document.createElement('button');
    btn.className = 'calc-copy-btn';
    btn.textContent = 'Copier';
    btn.setAttribute('aria-label', 'Copier le calcul');
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var text = block.textContent.replace('Copier', '').trim();
      navigator.clipboard.writeText(text).then(function() {
        btn.textContent = 'Copié !';
        btn.classList.add('copied');
        setTimeout(function() { btn.textContent = 'Copier'; btn.classList.remove('copied'); }, 1500);
      }).catch(function() {
        var ta = document.createElement('textarea');
        ta.value = text; ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
        btn.textContent = 'Copié !'; btn.classList.add('copied');
        setTimeout(function() { btn.textContent = 'Copier'; btn.classList.remove('copied'); }, 1500);
      });
    });
    block.appendChild(btn);
  });
}
initCalcCopyButtons();

// ============ MILESTONES DE PROGRESSION ============
const MILESTONE_KEY = 'gip-milestones';
const milestoneMessages = { 25: 'Bien parti !', 50: 'A mi-chemin !', 75: 'Presque fini !', 100: 'Terminé !' };

function checkMilestone(caseName) {
  var total = document.querySelectorAll('#sidebar-' + caseName + ' .check-read').length;
  if (total === 0) return;
  var progress = getProgress();
  var done = (progress[caseName] || []).length;
  var pct = Math.round((done / total) * 100);

  var reached;
  try { reached = JSON.parse(localStorage.getItem(MILESTONE_KEY)) || {}; } catch(e) { reached = {}; }
  if (!reached[caseName]) reached[caseName] = [];

  [25, 50, 75, 100].forEach(function(m) {
    if (pct >= m && reached[caseName].indexOf(m) === -1) {
      reached[caseName].push(m);
      try { localStorage.setItem(MILESTONE_KEY, JSON.stringify(reached)); } catch(e) {}
      var toast = document.createElement('div');
      toast.className = 'milestone-toast';
      toast.textContent = m + '% — ' + milestoneMessages[m];
      document.body.appendChild(toast);
      setTimeout(function() { toast.remove(); }, 2800);
    }
  });
}

// ============ QCM INTERACTIFS — Score, progression, sauvegarde ============
(function() {
  var qcmSections = ['fin-qcm', 'fiscal-qcm', 'droit-qcm', 'trans-qcm', 'fi-qcm', 'mf-qcm'];

  qcmSections.forEach(function(sectionId) {
    var section = document.getElementById(sectionId);
    if (!section) return;

    var allDetails = section.querySelectorAll('details');
    var total = allDetails.length;
    if (total === 0) return;

    // Load saved state
    var storageKey = 'gip-qcm-' + sectionId;
    var answered = new Set();
    try {
      var saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
      saved.forEach(function(i) { answered.add(i); });
    } catch(e) {}

    // Create stats bar
    var bar = document.createElement('div');
    bar.className = 'qcm-stats-bar';
    bar.innerHTML =
      '<span class="qcm-score">' + answered.size + ' / ' + total + '</span>' +
      '<div class="qcm-progress-wrap"><div class="qcm-progress-fill"></div></div>' +
      '<button class="qcm-reset" title="Réinitialiser la progression">↺ Reset</button>';

    // Insert after section-header
    var header = section.querySelector('.section-header');
    if (header && header.nextSibling) {
      section.insertBefore(bar, header.nextSibling);
    } else {
      section.prepend(bar);
    }

    var scoreEl = bar.querySelector('.qcm-score');
    var fillEl = bar.querySelector('.qcm-progress-fill');
    var resetBtn = bar.querySelector('.qcm-reset');

    function updateDisplay() {
      scoreEl.textContent = answered.size + ' / ' + total;
      fillEl.style.width = (answered.size / total * 100) + '%';
      // Complete state
      if (answered.size === total) {
        bar.classList.add('qcm-complete');
        scoreEl.textContent = answered.size + ' / ' + total + ' ✓';
      } else {
        bar.classList.remove('qcm-complete');
      }
      // Save
      try {
        localStorage.setItem(storageKey, JSON.stringify(Array.from(answered)));
      } catch(e) {}
    }

    // Restore answered state + attach listeners
    allDetails.forEach(function(det, i) {
      // Add aria-label for accessibility
      var summary = det.querySelector('summary');
      if (summary && !summary.getAttribute('aria-label')) {
        summary.setAttribute('aria-label', 'Question ' + (i + 1) + ' sur ' + total);
      }
      if (answered.has(i)) {
        det.classList.add('qcm-answered');
      }

      det.addEventListener('toggle', function() {
        if (det.open && !answered.has(i)) {
          answered.add(i);
          det.classList.add('qcm-answered');
          updateDisplay();
        }
      });
    });

    // Reset button
    resetBtn.addEventListener('click', function() {
      if (!confirm('Réinitialiser la progression de ce QCM ?')) return;
      answered.clear();
      allDetails.forEach(function(det) {
        det.classList.remove('qcm-answered');
        det.open = false;
      });
      updateDisplay();
    });

    // Initial display
    updateDisplay();
  });
})();

// ============ DEEP LINKING / ACCUEIL ============
(function() {
  var _initHash = window.location.hash.replace('#', '');
  if (_initHash && _knownPages.indexOf(_initHash) !== -1) {
    // Deep link — charger la page demandée
    document.querySelectorAll('.case-content').forEach(function(c) {
      c.classList.remove('active');
      c.style.display = 'none';
    });
    var sb = document.getElementById('sidebar');
    var tb = document.getElementById('tabBar');
    if (sb) sb.style.display = 'none';
    if (tb) tb.style.display = 'none';
    // Charger après un court délai pour laisser le DOM se stabiliser
    setTimeout(function() { enterCourse(_initHash); }, 50);
  } else {
    // Pas de hash → afficher l'accueil
    document.querySelectorAll('.case-content').forEach(function(c) {
      if (c.id === 'case-home') {
        c.classList.add('active');
        c.style.display = 'block';
      } else {
        c.classList.remove('active');
        c.style.display = 'none';
      }
    });
    var sb = document.getElementById('sidebar');
    var tb = document.getElementById('tabBar');
    if (sb) sb.style.display = 'none';
    if (tb) tb.style.display = 'none';
  }
})();

// ============ EVENT DELEGATION — TABS ============
(function() {
  var tabBar = document.getElementById('tabBar');
  if (!tabBar) return;
  tabBar.addEventListener('click', function(e) {
    var tab = e.target.closest('.tab[data-case]');
    if (!tab) return;
    switchCase(tab.dataset.case);
  });
})();

// ============ EVENT DELEGATION — HOME-CARDS & BREADCRUMBS ============
(function() {
  document.addEventListener('click', function(e) {
    // Home-cards with data-course
    var card = e.target.closest('.home-card[data-course]');
    if (card) {
      enterCourse(card.dataset.course);
      return;
    }
    // Sidebar items with data-goto (dynamically loaded content)
    var sidebarItem = e.target.closest('.sidebar-item[data-goto]');
    if (sidebarItem) {
      e.preventDefault();
      goTo(sidebarItem.dataset.goto);
      return;
    }
    // Breadcrumbs with data-course
    var crumb = e.target.closest('.breadcrumb[data-course]');
    if (crumb) {
      switchCase(crumb.dataset.course);
      return;
    }
  });
  // Keyboard support for breadcrumbs
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      var crumb = e.target.closest('.breadcrumb[data-course]');
      if (crumb) { e.preventDefault(); switchCase(crumb.dataset.course); }
    }
  });
})();

// ============ EVENT DELEGATION — SHORTCUTS OVERLAY ============
(function() {
  var overlay = document.getElementById('shortcutsOverlay');
  var closeBtn = document.getElementById('shortcutsClose');
  if (!overlay) return;
  function closeShortcuts() { overlay.style.display = 'none'; }
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closeShortcuts();
  });
  if (closeBtn) closeBtn.addEventListener('click', closeShortcuts);
})();



