
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
    if (t.hasAttribute('aria-selected')) t.setAttribute('aria-selected', 'false');
  });
  const targetTab = document.querySelector(`.tab[data-case="${caseName}"]`);
  if (targetTab) {
    targetTab.classList.add('active');
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
      const firstItem = sidebar.querySelector('.sidebar-item[onclick]');
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
    } catch(e) { mainEl.scrollTop = 0; }
  }

  if (currentActive && currentActive !== target) {
    currentActive.classList.add('fade-out');
    currentActive.addEventListener('animationend', showTarget, { once: true });
    setTimeout(showTarget, 200);
  } else {
    showTarget();
  }

  // Update URL hash (sans déclencher hashchange)
  if (caseName !== 'home') {
    history.replaceState(null, '', '#' + caseName);
  } else {
    history.replaceState(null, '', window.location.pathname);
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

// ============ ENTER COURSE FUNCTION ============
function enterCourse(courseName) {
  // Si le contenu n'est pas dans le DOM, charger via contentLoader (version docs/)
  var existing = document.getElementById('case-' + courseName);
  if (!existing && window.contentLoader) {
    var spinner = document.getElementById('loadingSpinner');
    if (spinner) spinner.style.display = '';
    window.contentLoader.load(courseName).then(function(data) {
      window.contentLoader.inject(courseName, data);
      if (spinner) spinner.style.display = 'none';
      switchCase(courseName);
    }).catch(function(err) {
      if (spinner) spinner.style.display = 'none';
      console.error('Erreur chargement ' + courseName + ':', err);
      var toast = document.createElement('div');
      toast.className = 'alert alert-danger';
      toast.style.cssText = 'position:fixed;top:80px;right:24px;z-index:9999;max-width:380px;animation:fadeIn 0.2s ease;';
      toast.innerHTML = '<span class="alert-icon">\u26a0\ufe0f</span><div><strong>Erreur de chargement</strong><br>Impossible de charger le contenu. V\u00e9rifiez votre connexion et r\u00e9essayez.</div>';
      document.body.appendChild(toast);
      setTimeout(function() { toast.remove(); }, 5000);
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
}

// ============ GUIDE COLLAPSIBLE SECTIONS ============
function toggleAllGuideSections(action) {
  document.querySelectorAll('#case-guide .section.collapsible').forEach(s => {
    if (action === 'collapse') s.classList.add('collapsed');
    else s.classList.remove('collapsed');
  });
}

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
        const onclick = i.getAttribute('onclick');
        if (onclick && onclick.includes("'" + id + "'")) {
          i.classList.add('active');
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

  const mainEl = document.getElementById('main-scroll');

  if (mainEl) {
    let scrollSpyTimer = null;
    mainEl.addEventListener('scroll', () => {
      if (scrollSpyTimer) return;
      scrollSpyTimer = requestAnimationFrame(() => {
        scrollSpyTimer = null;

        // Find visible sidebar and build section-to-item map
        const activeSidebar = document.querySelector('[id^="sidebar-"]:not([style*="display: none"]):not([style*="display:none"])');
        if (!activeSidebar) return;

        const items = activeSidebar.querySelectorAll('.sidebar-item[onclick]');
        if (!items.length) return;

        // Extract target IDs from sidebar onclick attributes
        const sectionMap = [];
        items.forEach(item => {
          const match = item.getAttribute('onclick').match(/(?:goTo|scrollToSection)\(['"]([^'"]+)['"]\)/);
          if (match) {
            const el = document.getElementById(match[1]);
            if (el) sectionMap.push({ id: match[1], el: el, item: item });
          }
        });

        if (!sectionMap.length) return;

        // Find which section is currently visible (last one above threshold)
        let currentEntry = sectionMap[0];
        const scrollTop = mainEl.scrollTop;
        const threshold = 160;

        for (let i = sectionMap.length - 1; i >= 0; i--) {
          const rect = sectionMap[i].el.getBoundingClientRect();
          if (rect.top < threshold) {
            currentEntry = sectionMap[i];
            break;
          }
        }

        // Update active state
        items.forEach(i => i.classList.remove('active'));
        currentEntry.item.classList.add('active');
        currentEntry.item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      });
    });
  }
});

// ============ KEYBOARD SHORTCUTS ============
document.addEventListener('keydown', function(event) {
  // Ctrl+B or Cmd+B to toggle sidebar
  if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
    event.preventDefault();
    toggleSidebar();
  }
  // ? pour afficher les raccourcis (sauf si focus sur un input)
  if (event.key === '?' && !event.target.closest('input, textarea')) {
    const overlay = document.getElementById('shortcutsOverlay');
    if (overlay) overlay.style.display = overlay.style.display === 'none' ? 'flex' : 'none';
  }
  // Escape pour fermer l'overlay raccourcis
  if (event.key === 'Escape') {
    const overlay = document.getElementById('shortcutsOverlay');
    if (overlay && overlay.style.display !== 'none') {
      overlay.style.display = 'none';
    }
  }
});

// ============ MOBILE SIDEBAR TOGGLE ============
document.addEventListener('DOMContentLoaded', function() {
  const mobileToggle = document.getElementById('mobileSidebarToggle');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', function() {
      const sidebar = document.getElementById('sidebar');
      if (sidebar) {
        sidebar.classList.toggle('open');
      }
    });
  }
});

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
if (!searchInput || !searchResults) { console.warn('Search elements not found'); }

// Tab name mapping
const tabNames = {
  'snow': '❄️ SNOW', 'stark': '👨‍👩‍👧‍👦 STARK', 'niote': '🏢 NIOTE',
  'mengere': '🏗️ MENGERE', 'norris': '💎 NORRIS', 'vador': '⚔️ VADOR',
  'leon': '👨‍💼 LEON', 'genereux': '💼 GÉNÉREUX', 'houette': '🏠 HOUETTE',
  'outils': '🧰 Outils', 'guide': '📋 Guide', 'formules': '📐 Formules',
  'montages': '🔧 Montages', 'audit': '📊 Audit',
  'financement': '💰 Financement', 'responsabilite': '⚖️ Responsabilité',
  'fiscal': '🏛️ Fiscalité',
  'droit': '📜 Droit patrimonial',
  'marches': '📈 Marchés financiers',
  'transmission': '🏢 Transmission d\'entreprises',
  'fiscalite-int': '🌍 Fiscalité Internationale'
};

searchInput && searchInput.addEventListener('input', function() {
  const query = this.value.trim().toLowerCase();
  if (query.length < 2) {
    searchResults.classList.remove('active');
    return;
  }

  const results = [];
  document.querySelectorAll('.case-content').forEach(caseEl => {
    const caseName = caseEl.id.replace('case-', '');
    const sections = caseEl.querySelectorAll('[id]');

    sections.forEach(section => {
      const text = section.textContent || '';
      const lowerText = text.toLowerCase();
      const idx = lowerText.indexOf(query);

      if (idx !== -1 && results.length < 20) {
        // Get snippet
        const start = Math.max(0, idx - 40);
        const end = Math.min(text.length, idx + query.length + 60);
        let snippet = (start > 0 ? '...' : '') + text.substring(start, end).trim() + (end < text.length ? '...' : '');
        // Highlight match
        const regex = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
        snippet = snippet.replace(regex, '<mark>$1</mark>');

        results.push({
          tab: caseName,
          sectionId: section.id,
          snippet: snippet
        });
      }
    });
  });

  // Remove duplicate section IDs (keep first match per section)
  const seen = new Set();
  const unique = results.filter(r => {
    if (seen.has(r.sectionId)) return false;
    seen.add(r.sectionId);
    return true;
  });

  if (unique.length === 0) {
    searchResults.innerHTML = '<div class="search-no-results">Aucun résultat pour "' + query + '"</div>';
  } else {
    searchResults.innerHTML = '<div class="search-count">' + unique.length + ' résultat(s)</div>' +
      unique.map(r =>
        '<div class="search-result-item" onclick="goToSearch(\'' + r.tab + '\',\'' + r.sectionId + '\')">' +
        '<div class="search-result-tab">' + (tabNames[r.tab] || r.tab) + '</div>' +
        '<div class="search-result-text">' + r.snippet + '</div>' +
        '</div>'
      ).join('');
  }

  searchResults.classList.add('active');
});

function goToSearch(tab, sectionId) {
  const query = searchInput.value.trim();
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
    if (regex.test(walker.currentNode.textContent)) {
      matches.push(walker.currentNode);
    }
  }

  matches.forEach(node => {
    const span = document.createElement('span');
    span.innerHTML = node.textContent.replace(regex, '<mark class="search-highlight">$1</mark>');
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

// Ctrl+K shortcut for search
document.addEventListener('keydown', function(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    searchInput.focus();
  }
  if (e.key === 'Escape') {
    searchResults.classList.remove('active');
    searchInput.blur();
  }
});

// ============ MODE EXAMEN ============
var examTimerInterval = null;
var examStartTime = null;

function toggleExamMode() {
  document.body.classList.toggle('exam-mode');
  var isExam = document.body.classList.contains('exam-mode');
  var timerEl = document.getElementById('examTimer');
  var timeEl = document.getElementById('examTimerTime');

  if (isExam) {
    examStartTime = Date.now();
    if (timerEl) timerEl.style.display = 'block';
    examTimerInterval = setInterval(function() {
      var elapsed = Math.floor((Date.now() - examStartTime) / 1000);
      var mins = Math.floor(elapsed / 60);
      var secs = elapsed % 60;
      if (timeEl) timeEl.textContent = mins + ':' + (secs < 10 ? '0' : '') + secs;
    }, 1000);
  } else {
    if (examTimerInterval) clearInterval(examTimerInterval);
    if (timerEl) timerEl.style.display = 'none';
    if (timeEl) timeEl.textContent = '0:00';
  }
}

// ============ DARK MODE ============
function toggleDarkMode() {
  // Dark mode is default. Toggle adds/removes light-mode.
  document.body.classList.toggle('light-mode');
  const isLight = document.body.classList.contains('light-mode');
  document.getElementById('darkToggle').textContent = isLight ? '🌙' : '☀️';
  try { localStorage.setItem('lightMode', isLight ? '1' : '0'); } catch(e) {}
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
window.addEventListener('hashchange', function() {
  const hash = window.location.hash.replace('#', '');
  if (hash) enterCourse(hash);
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
var GIP_FC_KEY = 'gip-flashcards';

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
    btn.style.cssText = 'margin-top:12px;padding:8px 16px;border-radius:10px;border:1px solid var(--glass-border);background:var(--glass-bg);backdrop-filter:var(--blur);color:var(--text);font-size:0.8rem;font-weight:600;cursor:pointer;transition:background 0.2s;';
    btn.onmouseover = function() { this.style.background = 'var(--primary)'; this.style.color = '#fff'; };
    btn.onmouseout = function() { this.style.background = 'var(--glass-bg)'; this.style.color = 'var(--text)'; };
    welcome.appendChild(btn);
  });
})();

// ============ SCROLL TO TOP ============
(function() {
  const scrollBtn = document.getElementById('scrollTopBtn');
  const mainEl = document.getElementById('main-scroll');
  if (!scrollBtn || !mainEl) return;

  mainEl.addEventListener('scroll', function() {
    if (mainEl.scrollTop > 400) {
      scrollBtn.classList.add('visible');
    } else {
      scrollBtn.classList.remove('visible');
    }
  });

  scrollBtn.addEventListener('click', function() {
    mainEl.scrollTo({ top: 0, behavior: 'smooth' });
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

// Patcher collapseSidebar pour persister l'état
const _origCollapseSidebar = collapseSidebar;
collapseSidebar = function() {
  _origCollapseSidebar();
  try {
    const sidebar = document.getElementById('sidebar');
    localStorage.setItem('gip-sidebarCollapsed', sidebar.classList.contains('collapsed') ? '1' : '0');
  } catch(e) {}
};

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

// Injecter les checkboxes de progression dans toutes les sidebars
(function() {
  const progress = getProgress();

  document.querySelectorAll('[id^="sidebar-"]').forEach(sidebarDiv => {
    const caseName = sidebarDiv.id.replace('sidebar-', '');
    const items = sidebarDiv.querySelectorAll('.sidebar-item[onclick*="goTo"]');
    if (items.length === 0) return;

    // Ajouter les checks
    items.forEach(item => {
      const onclick = item.getAttribute('onclick') || '';
      const match = onclick.match(/goTo\('([^']+)'\)/);
      if (!match) return;
      const sectionId = match[1];

      const check = document.createElement('span');
      check.className = 'check-read';
      const isDone = progress[caseName] && progress[caseName].includes(sectionId);
      if (isDone) {
        check.classList.add('done');
        check.textContent = '✓';
      } else {
        check.textContent = '○';
      }
      check.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleSectionRead(caseName, sectionId, check);
      });
      item.appendChild(check);
    });

    // Ajouter la barre de progression en haut
    const progressHtml = document.createElement('div');
    progressHtml.className = 'sidebar-progress';
    const done = (progress[caseName] || []).length;
    const total = items.length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    progressHtml.innerHTML =
      '<div class="sidebar-progress-bar"><div class="sidebar-progress-fill" style="width:' + pct + '%"></div></div>' +
      '<span class="sidebar-progress-text">' + done + '/' + total + '</span>';
    sidebarDiv.insertBefore(progressHtml, sidebarDiv.querySelector('.sidebar-item'));
  });
})();

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
      const items = sidebarDiv.querySelectorAll('.sidebar-item[onclick*="goTo"]');
      totalSections += items.length;
      doneSections += (progress[name] || []).length;
    });

    if (totalSections === 0) return;
    const pct = Math.round((doneSections / totalSections) * 100);
    if (doneSections === 0) return; // Pas de barre si rien commencé

    const div = document.createElement('div');
    div.className = 'home-card-progress';
    div.innerHTML =
      '<div class="home-card-progress-bar"><div class="home-card-progress-fill" style="width:' + pct + '%"></div></div>' +
      '<span class="home-card-progress-text">' + pct + '%</span>';
    cardEl.appendChild(div);
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
    const items = sidebarDiv.querySelectorAll('.sidebar-item[onclick*="goTo"]');
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

  // Streak : jours consécutifs d'étude
  try {
    var days = JSON.parse(localStorage.getItem('gip-studyDays')) || [];
    var today = new Date().toISOString().slice(0, 10);
    if (days[days.length - 1] !== today) {
      days.push(today);
      localStorage.setItem('gip-studyDays', JSON.stringify(days));
    }
    // Calculer le streak
    var streak = 1;
    for (var i = days.length - 1; i > 0; i--) {
      var d1 = new Date(days[i]);
      var d2 = new Date(days[i - 1]);
      var diff = (d1 - d2) / (1000 * 60 * 60 * 24);
      if (diff <= 1) streak++;
      else break;
    }
    if (elStreak) elStreak.textContent = streak + ' j';
  } catch(e) {}

  // Dernière session
  try {
    var lastPage = localStorage.getItem('gip-lastPage');
    var courseNames = {
      'snow': 'SNOW', 'stark': 'STARK', 'niote': 'NIOTE',
      'mengere': 'MENGERE', 'norris': 'NORRIS', 'vador': 'VADOR',
      'leon': 'LEON', 'genereux': 'GÉNÉREUX', 'houette': 'HOUETTE',
      'outils': 'Outils', 'guide': 'Guide', 'montages': 'Montages',
      'formules': 'Formules', 'audit': 'Audit', 'financement': 'Financement',
      'responsabilite': 'Responsabilité', 'fiscal': 'Fiscalité',
      'droit': 'Droit patrimonial', 'marches': 'Marchés financiers',
      'transmission': 'Transmission d\'entreprises',
      'fiscalite-int': 'Fiscalité Internationale'
    };
    if (elLast && lastPage && lastPage !== 'home') {
      elLast.textContent = courseNames[lastPage] || lastPage;
    }
  } catch(e) {}

  // Historique récent
  try {
    var hist = JSON.parse(localStorage.getItem('gip-history') || '[]');
    var container = document.getElementById('recentActivity');
    var title = document.getElementById('recentTitle');
    if (container && hist.length > 0 && title) {
      title.style.display = '';
      var icons = {
        'snow': '❄️', 'stark': '🦁', 'niote': '🏠', 'mengere': '👨‍👩‍👧', 'norris': '💪',
        'vador': '🌑', 'leon': '🎭', 'genereux': '🎁', 'houette': '🏦',
        'outils': '🧰', 'guide': '📖', 'montages': '🏗️', 'formules': '🔢',
        'audit': '📊', 'financement': '💰', 'responsabilite': '⚖️', 'fiscal': '🧾',
        'droit': '📜', 'marches': '📈', 'transmission': '🏢',
        'fiscalite-int': '🌍'
      };
      hist.forEach(function(h) {
        var name = courseNames[h.page] || h.page;
        var ago = timeAgo(h.ts);
        var el = document.createElement('div');
        el.className = 'recent-item';
        el.setAttribute('role', 'button');
        el.setAttribute('tabindex', '0');
        el.onclick = function() { switchCase(h.page); };
        el.innerHTML = '<span class="recent-item-icon">' + (icons[h.page] || '📄') + '</span>' +
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
(function() {
  document.querySelectorAll('.data-table, .patrimoine-table').forEach(function(table) {
    if (table.parentElement.classList.contains('table-responsive')) return;
    var wrapper = document.createElement('div');
    wrapper.className = 'table-responsive';
    wrapper.style.cssText = 'overflow-x:auto;border-radius:var(--radius-sm);';
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
    // Detect scroll state
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
})();

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
      prev.classList.add('has-sub');
      prev.addEventListener('dblclick', function(e) {
        e.preventDefault();
        sub.classList.toggle('collapsed');
        prev.classList.toggle('sub-collapsed');
      });
    }
  });
})();

// ============ ACCESSIBILITÉ — FOCUS VISIBLE ============
(function() {
  // Ajouter tabindex aux éléments interactifs de la sidebar
  document.querySelectorAll('.sidebar-item, .tab, .flashcard, .home-card:not(.card-disabled)').forEach(function(el) {
    if (!el.getAttribute('tabindex')) el.setAttribute('tabindex', '0');
  });

  // Permettre l'activation par Entrée/Espace
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      var el = document.activeElement;
      if (el && (el.classList.contains('sidebar-item') || el.classList.contains('tab') || el.classList.contains('flashcard') || el.classList.contains('home-card'))) {
        e.preventDefault();
        el.click();
      }
    }
    // Arrow key navigation for tabs
    if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && document.activeElement && document.activeElement.classList.contains('tab')) {
      var tabs = Array.from(document.querySelectorAll('.tab-bar .tab'));
      var idx = tabs.indexOf(document.activeElement);
      if (idx === -1) return;
      e.preventDefault();
      var next = e.key === 'ArrowRight' ? (idx + 1) % tabs.length : (idx - 1 + tabs.length) % tabs.length;
      tabs[next].focus();
    }
  });
})();

// ============ BANDEAU "REPRENDRE" ============
(function() {
  const banner = document.getElementById('resumeBanner');
  const text = document.getElementById('resumeText');
  const btn = document.getElementById('resumeBtn');
  const close = document.getElementById('resumeClose');
  if (!banner || !text || !btn || !close) return;

  // Noms lisibles
  const courseNames = {
    'snow': 'Cas SNOW', 'stark': 'Cas STARK', 'niote': 'Cas NIOTE',
    'mengere': 'Cas MENGERE', 'norris': 'Cas NORRIS', 'vador': 'Cas VADOR',
    'leon': 'Cas LEON', 'genereux': 'Cas GÉNÉREUX', 'houette': 'Cas HOUETTE',
    'outils': 'Boîte à Outils', 'guide': 'Guide Stratégique',
    'montages': 'Montages', 'formules': 'Formules',
    'audit': 'Audit patrimonial', 'financement': 'Financement des particuliers',
    'responsabilite': 'Responsabilité du gestionnaire', 'fiscal': 'Ingénierie fiscale PP',
    'droit': 'Droit patrimonial', 'marches': 'Marchés financiers',
    'transmission': 'Transmission d\'entreprises',
    'fiscalite-int': 'Fiscalité Internationale'
  };

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
      text.innerHTML = 'Reprendre : <strong>' + (courseNames[lastPage] || lastPage) + '</strong>' + progressInfo;
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
    }
  } catch(e) {}

  // Au chargement, toujours forcer l'accueil
  // 1) Nettoyer le hash
  if (window.location.hash) {
    history.replaceState(null, '', window.location.pathname);
  }
  // 2) Forcer case-home visible, masquer tout le reste
  document.querySelectorAll('.case-content').forEach(function(c) {
    if (c.id === 'case-home') {
      c.classList.add('active');
      c.style.display = 'block';
    } else {
      c.classList.remove('active');
      c.style.display = 'none';
    }
  });
  // 3) Masquer sidebar et tabBar
  var sb = document.getElementById('sidebar');
  var tb = document.getElementById('tabBar');
  if (sb) sb.style.display = 'none';
  if (tb) tb.style.display = 'none';
})();



