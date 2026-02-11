#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { minify } = require('terser');
const CleanCSS = require('clean-css');

const args = process.argv.slice(2);
const FORCE_JS = args.includes('--force-js');
const FORCE_HTML = args.includes('--force-html');
const FORCE_ALL = args.includes('--force-all');

console.log('🚀 Starting extraction and optimization...\n');

// Configuration
const SRC_PATH = path.join(__dirname, 'src/index.html');
const DIST_PATH = path.join(__dirname, 'docs');
const CONTENT_PATH = path.join(DIST_PATH, 'content');

// Case mapping
const CASE_MAP = {
  'snow': { type: 'audit', title: 'Cas SNOW', icon: '❄️' },
  'stark': { type: 'audit', title: 'Cas STARK', icon: '⚔️' },
  'niote': { type: 'audit', title: 'Cas NIOTE', icon: '🎵' },
  'mengere': { type: 'audit', title: 'Cas MENGERE', icon: '🏡' },
  'norris': { type: 'audit', title: 'Cas NORRIS', icon: '🥋' },
  'vador': { type: 'audit', title: 'Cas VADOR', icon: '🌌' },
  'leon': { type: 'audit', title: 'Cas LEON', icon: '🦁' },
  'genereux': { type: 'audit', title: 'Cas GENEREUX', icon: '💰' },
  'houette': { type: 'audit', title: 'Cas HOUETTE', icon: '👤' },
  'financement': { type: 'courses', title: 'Financement', icon: '💳' },
  'responsabilite': { type: 'courses', title: 'Responsabilité', icon: '⚖️' },
  'fiscal': { type: 'courses', title: 'Droit Fiscal', icon: '📊' },
  'droit': { type: 'courses', title: 'Droit Patrimonial', icon: '📜' },
  'marches': { type: 'courses', title: 'Marchés Financiers', icon: '📈' },
  'transmission': { type: 'courses', title: 'Transmission d\'entreprises', icon: '🏢' },
  'fiscalite-int': { type: 'courses', title: 'Fiscalité Internationale', icon: '🌍' },
  'outils': { type: 'tools', title: 'Outils', icon: '🛠️' },
  'guide': { type: 'tools', title: 'Guide', icon: '📘' },
  'montages': { type: 'tools', title: 'Montages', icon: '🏗️' },
  'formules': { type: 'tools', title: 'Formules', icon: '🔢' }
};

// Read source file
console.log('📖 Reading source file...');
const html = fs.readFileSync(SRC_PATH, 'utf8');
const $ = cheerio.load(html);

// Extract and process cases
console.log('✂️  Extracting content sections...\n');
const manifest = { version: '2.0.0', cases: [], index: [] };

for (const [caseId, meta] of Object.entries(CASE_MAP)) {
  const caseContent = $(`#case-${caseId}`);
  const sidebar = $(`#sidebar-${caseId}`);

  if (caseContent.length === 0) {
    console.log(`⚠️  Warning: case-${caseId} not found, skipping...`);
    continue;
  }

  // Extract sidebar structure
  const sidebarItems = [];
  sidebar.find('.sidebar-item').each((i, el) => {
    const $el = $(el);
    // ID: from href attribute or onclick goTo('...')
    let id = ($el.attr('href') || '').replace('#', '');
    if (!id) {
      const onclick = $el.attr('onclick') || '';
      const match = onclick.match(/goTo\(['"]([^'"]+)['"]\)/);
      if (match) id = match[1];
    }
    // Num: from .sidebar-num or .num span
    const num = ($el.find('.sidebar-num').text() || $el.find('.num').text()).trim();
    // Label: from .sidebar-label child, or full text minus num
    let label = $el.find('.sidebar-label').text().trim();
    if (!label) {
      // Clone, remove num/chip spans, get remaining text
      const clone = $el.clone();
      clone.find('.num, .sidebar-num, .progress-chip').remove();
      label = clone.text().trim();
    }

    if (id || label) {
      sidebarItems.push({
        id,
        label,
        num: num || undefined
      });
    }
  });

  // Extract search keywords
  const keywords = new Set();

  // Add title and case name
  keywords.add(meta.title.toLowerCase());
  keywords.add(caseId.toLowerCase());

  // Extract from headings
  caseContent.find('h1, h2, h3, h4').each((i, el) => {
    const text = $(el).text().trim();
    text.split(/\s+/).forEach(word => {
      if (word.length > 3) {
        keywords.add(word.toLowerCase());
      }
    });
  });

  // Extract from strong/em text
  caseContent.find('strong, em, .info-label').each((i, el) => {
    const text = $(el).text().trim();
    text.split(/\s+/).forEach(word => {
      if (word.length > 3) {
        keywords.add(word.toLowerCase());
      }
    });
  });

  // Clean inline onclick handlers in content → data attributes
  caseContent.find('[onclick]').each((i, el) => {
    const $el = $(el);
    const onclick = $el.attr('onclick') || '';
    // goTo('sectionId') → data-goto
    const goToMatch = onclick.match(/goTo\(['"]([^'"]+)['"]\)/);
    if (goToMatch) {
      $el.attr('data-goto', goToMatch[1]);
      $el.removeAttr('onclick');
      return;
    }
    // switchCase('name') → data-course
    const switchMatch = onclick.match(/switchCase\(['"]([^'"]+)['"]\)/);
    if (switchMatch) {
      $el.attr('data-course', switchMatch[1]);
      $el.removeAttr('onclick');
      return;
    }
    // toggleFlashcard(this) → data-action
    if (onclick.includes('toggleFlashcard')) {
      $el.attr('data-action', 'toggle-flashcard');
      $el.removeAttr('onclick');
      return;
    }
    // filterFlashcards('tag') → data-action + data-tag
    const filterMatch = onclick.match(/filterFlashcards\(['"]([^'"]+)['"]\)/);
    if (filterMatch) {
      $el.attr('data-action', 'filter-flashcards');
      $el.attr('data-tag', filterMatch[1]);
      $el.removeAttr('onclick');
      return;
    }
    // shuffleFlashcards() → data-action
    if (onclick.includes('shuffleFlashcards')) {
      $el.attr('data-action', 'shuffle-flashcards');
      $el.removeAttr('onclick');
      return;
    }
    // resetFlashcards() → data-action
    if (onclick.includes('resetFlashcards')) {
      $el.attr('data-action', 'reset-flashcards');
      $el.removeAttr('onclick');
      return;
    }
    // toggleAllGuideSections('mode') → data-action + data-mode
    const guideMatch = onclick.match(/toggleAllGuideSections\(['"]([^'"]+)['"]\)/);
    if (guideMatch) {
      $el.attr('data-action', 'toggle-all-sections');
      $el.attr('data-mode', guideMatch[1]);
      $el.removeAttr('onclick');
      return;
    }
    // this.parentElement.classList.toggle('collapsed') → data-action
    if (onclick.includes('toggle(') && onclick.includes('collapsed')) {
      $el.attr('data-action', 'toggle-collapsed');
      $el.removeAttr('onclick');
      return;
    }
    // exportHouette functions → data-action
    if (onclick.includes('exportHouetteEnonce')) {
      $el.attr('data-action', 'export-houette-enonce');
      $el.removeAttr('onclick');
      return;
    }
    if (onclick.includes('exportHouettePDF')) {
      $el.attr('data-action', 'export-houette-pdf');
      $el.removeAttr('onclick');
      return;
    }
  });

  // Build case data
  const caseData = {
    id: caseId,
    title: meta.title,
    icon: meta.icon,
    type: meta.type,
    sidebar: {
      items: sidebarItems
    },
    content: caseContent.html(),
    searchIndex: {
      keywords: Array.from(keywords).slice(0, 100) // Limit to 100 keywords
    }
  };

  // Write JSON file
  const outputPath = path.join(CONTENT_PATH, meta.type, `${caseId}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(caseData, null, 2));
  console.log(`✅ ${meta.icon} ${meta.title.padEnd(20)} → ${meta.type}/${caseId}.json (${keywords.size} keywords)`);

  // Add to manifest
  manifest.cases.push({
    id: caseId,
    title: meta.title,
    icon: meta.icon,
    type: meta.type,
    path: `${meta.type}/${caseId}.json`
  });

  manifest.index.push({
    id: caseId,
    title: meta.title,
    type: meta.type,
    keywords: Array.from(keywords).slice(0, 50)
  });
}

// Write manifest
console.log('\n📝 Writing manifest...');
fs.writeFileSync(
  path.join(CONTENT_PATH, 'manifest.json'),
  JSON.stringify(manifest, null, 2)
);
console.log('✅ manifest.json created');

// Extract and minify CSS
console.log('\n🎨 Extracting and minifying CSS...');
let cssContent = '';
$('style').each((i, el) => {
  const content = $(el).html();
  if (content) cssContent += content + '\n';
});
const minifiedCSS = new CleanCSS({
  level: 2,
  compatibility: '*'
}).minify(cssContent);

fs.writeFileSync(
  path.join(DIST_PATH, 'css/styles.css'),
  minifiedCSS.styles
);
console.log(`✅ CSS minified: ${cssContent.length} → ${minifiedCSS.styles.length} bytes (-${Math.round((1 - minifiedCSS.styles.length / cssContent.length) * 100)}%)`);

// Extract JavaScript (we'll process it in next step)
console.log('\n📦 Extracting JavaScript...');
let jsContent = '';
$('script').each((i, el) => {
  const content = $(el).html();
  if (content) {
    jsContent += content + '\n\n';
  }
});

if (FORCE_HTML || FORCE_ALL) {
  // Regenerate index.html from src
  console.log('\n✂️  Creating optimized index.html...');
  $('.case-content').each((i, el) => {
    const id = $(el).attr('id');
    if (id !== 'case-home' && id !== 'case-audit') $(el).remove();
  });
  $('[id^="sidebar-"]').each((i, el) => {
    const id = $(el).attr('id');
    if (id !== 'sidebar-home' && id !== 'sidebar-audit') $(el).remove();
  });
  $('style').remove();
  $('script').remove();
  $('head').append('<link rel="stylesheet" href="css/styles.css">');
  $('body').append(`
<div id="loadingSpinner" style="display:none; position:fixed; top:50%; left:50%;
     transform:translate(-50%,-50%); z-index:2000;
     background:var(--glass-bg); backdrop-filter:var(--blur);
     padding:32px; border-radius:var(--radius); border:1px solid var(--glass-border);
     box-shadow:var(--glass-shadow);">
  <div style="font-size:24px; animation:spin 1s linear infinite; text-align:center;">⏳</div>
  <div style="margin-top:12px; color:var(--text-light); font-size:14px; white-space:nowrap;">Chargement...</div>
</div>
<script src="js/content-loader.js"></script>
<script src="js/app.js"></script>
`);
  fs.writeFileSync(path.join(DIST_PATH, 'index.html'), $.html());
  const optimizedSize = fs.statSync(path.join(DIST_PATH, 'index.html')).size;
  console.log(`✅ index.html regenerated (${(optimizedSize / 1024).toFixed(0)} KB)`);
  console.log('   ⚠️  Note: aria-labels and a11y attributes may need to be re-applied');
} else {
  console.log('\n✂️  index.html: preserved (use --force-html to regenerate from src)');
}

const originalSize = fs.statSync(SRC_PATH).size;

if (FORCE_JS || FORCE_ALL) {
  console.log('\n⚙️  Extracting JavaScript from src...');
  fs.writeFileSync(path.join(DIST_PATH, 'js/app.js'), jsContent);
  console.log('✅ app.js regenerated from src');
  console.log('   ⚠️  Note: audit fixes (event delegation, a11y, etc.) will need to be re-applied');
} else {
  console.log('\n⚙️  app.js: preserved (use --force-js to regenerate from src)');
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('✨ Build completed successfully!\n');
console.log('📊 Summary:');
console.log(`   - Cases extracted: ${manifest.cases.length}`);
console.log(`   - Source size: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
console.log('\n💡 Next steps:');
console.log('   - Run: npm run dev');
console.log('   - Test in browser: http://localhost:8080');
console.log('='.repeat(60) + '\n');
