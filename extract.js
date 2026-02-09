#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { minify } = require('terser');
const CleanCSS = require('clean-css');

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
    const href = $el.attr('href') || '';
    const id = href.replace('#', '');
    const num = $el.find('.sidebar-num').text();
    const label = $el.find('.sidebar-label').text();

    sidebarItems.push({
      id,
      label,
      num: num || undefined
    });
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
const cssContent = $('style').html();
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

// Remove case content from HTML (keep only home and audit)
console.log('\n✂️  Creating optimized index.html...');

// Remove all case-content except home and audit
$('.case-content').each((i, el) => {
  const id = $(el).attr('id');
  if (id !== 'case-home' && id !== 'case-audit') {
    $(el).remove();
  }
});

// Remove all sidebar sections except home and audit
$('[id^="sidebar-"]').each((i, el) => {
  const id = $(el).attr('id');
  if (id !== 'sidebar-home' && id !== 'sidebar-audit') {
    $(el).remove();
  }
});

// Replace inline style with external CSS
$('style').replaceWith('<link rel="stylesheet" href="/css/styles.css">');

// Add loading spinner before closing body
const spinnerHTML = `
<div id="loadingSpinner" style="display:none; position:fixed; top:50%; left:50%;
     transform:translate(-50%,-50%); z-index:9999;
     background:var(--glass-bg); backdrop-filter:var(--blur);
     padding:32px; border-radius:var(--radius); border:1px solid var(--glass-border);
     box-shadow:var(--glass-shadow);">
  <div style="font-size:24px; animation:spin 1s linear infinite; text-align:center;">⏳</div>
  <div style="margin-top:12px; color:var(--text-light); font-size:14px; white-space:nowrap;">Chargement...</div>
</div>
<style>
@keyframes spin { to { transform: rotate(360deg); } }
</style>
`;

$('body').append(spinnerHTML);

// Replace inline script with external scripts
$('script').replaceWith(`
<script src="/js/content-loader.js"></script>
<script src="/js/app.js"></script>
`);

// Write optimized index.html
const optimizedHTML = $.html();
fs.writeFileSync(
  path.join(DIST_PATH, 'index.html'),
  optimizedHTML
);

const originalSize = fs.statSync(SRC_PATH).size;
const optimizedSize = fs.statSync(path.join(DIST_PATH, 'index.html')).size;
console.log(`✅ index.html optimized: ${(originalSize / 1024 / 1024).toFixed(2)} MB → ${(optimizedSize / 1024).toFixed(0)} KB (-${Math.round((1 - optimizedSize / originalSize) * 100)}%)`);

// Write app.js (will be modified next)
console.log('\n⚙️  Processing JavaScript...');
fs.writeFileSync(
  path.join(DIST_PATH, 'js/app.js'),
  jsContent
);
console.log('✅ app.js extracted');

// Summary
console.log('\n' + '='.repeat(60));
console.log('✨ Build completed successfully!\n');
console.log('📊 Summary:');
console.log(`   - Cases extracted: ${manifest.cases.length}`);
console.log(`   - Original size: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`   - Optimized size: ${(optimizedSize / 1024).toFixed(0)} KB`);
console.log(`   - Reduction: ${Math.round((1 - optimizedSize / originalSize) * 100)}%`);
console.log('\n💡 Next steps:');
console.log('   - Run: npm run dev');
console.log('   - Test in browser: http://localhost:8080');
console.log('='.repeat(60) + '\n');
