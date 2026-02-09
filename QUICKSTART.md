# Quick Start Guide

## 1. Test Locally (5 minutes)

```bash
# Install dependencies
npm install

# Build the optimized version
npm run build

# Start dev server
npm run dev
```

Open http://localhost:8080 in your browser.

### What to Test
1. Click on "Cas SNOW" - should see loading spinner, then content appears
2. Click on "Cas SNOW" again - should load instantly (cached)
3. Try multiple cases - each loads on first click
4. Check browser console (F12) - no errors
5. Check Network tab - initial load ~132 KB

## 2. Deploy to GitHub Pages (10 minutes)

### Option A: Automatic (Recommended)
```bash
npm run deploy
```

### Option B: Manual
```bash
npm run build
git add dist/ src/ package.json extract.js README.md .gitignore
git commit -m "Implement lazy loading optimization"
git push
```

### Configure GitHub Pages
1. Go to repository Settings
2. Navigate to Pages
3. Select:
   - **Source**: Deploy from a branch
   - **Branch**: `main`
   - **Folder**: `/dist` (if available) or `/root`
4. Save

**Note**: If `/dist` is not available in the dropdown, you'll need to use the gh-pages branch method (see below).

### Alternative: gh-pages Branch
```bash
# Create and checkout gh-pages branch
git checkout -b gh-pages

# Remove everything except dist
git rm -rf .
git checkout main -- dist/*

# Move dist contents to root
mv dist/* .
rm -rf dist/

# Commit and push
git add .
git commit -m "Deploy to gh-pages"
git push origin gh-pages

# Switch back to main
git checkout main

# Configure GitHub Pages to use gh-pages branch
# Settings → Pages → Source: gh-pages, folder: / (root)
```

## 3. Verify Deployment

1. Wait 2-3 minutes for GitHub Pages to build
2. Visit your site: `https://[username].github.io/[repo]/`
3. Open DevTools → Network
4. Refresh the page
5. Check:
   - Initial load < 200 KB
   - Click on a case → see new request to `/content/audit/[case].json`
   - Click same case again → no new request (cached)

## 4. Troubleshooting

### Issue: "Failed to load content"
- Open browser console (F12)
- Check the error message
- Verify files exist in `dist/content/`
- Check that server is running (not using file://)

### Issue: Blank page
- Check browser console for errors
- Verify `dist/index.html` exists
- Check that JavaScript files loaded (Network tab)

### Issue: 404 on content files
**If deployed in a subdirectory**, paths need to be relative.

Edit `extract.js` line ~142:
```javascript
// Change this line:
$('style').replaceWith('<link rel="stylesheet" href="/css/styles.css">');

// To this:
$('style').replaceWith('<link rel="stylesheet" href="./css/styles.css">');
```

Also change script tags (line ~158):
```javascript
$('script').replaceWith(`
<script src="./js/content-loader.js"></script>
<script src="./js/app.js"></script>
`);
```

And in `dist/js/content-loader.js` line ~31:
```javascript
// Change:
this.fetchWithRetry(`/content/${this.getPath(caseId)}.json`)

// To:
this.fetchWithRetry(`./content/${this.getPath(caseId)}.json`)
```

Then rebuild:
```bash
npm run build
git add dist/
git commit -m "Fix paths for subdirectory deployment"
git push
```

## 5. Making Changes

### Edit Content
1. Edit `src/index.html` (NOT `dist/index.html`)
2. Run `npm run build`
3. Test with `npm run dev`
4. Deploy with `npm run deploy`

### Why?
- `src/index.html` is your source of truth (1.25 MB, all content)
- `dist/` is auto-generated from `src/index.html`
- Never edit files in `dist/` directly - they'll be overwritten

## 6. Debug Commands

### In Browser Console
```javascript
// Check cache stats
contentLoader.getStats()
// Returns: { cached: 3, loading: 0, totalSize: 150000 }

// Clear cache
contentLoader.clearCache()

// Preload multiple cases
contentLoader.preload(['snow', 'stark', 'niote'])

// Load a specific case
await contentLoader.load('snow')
```

### In Terminal
```bash
# Check dist/ sizes
du -sh dist/*

# List all JSON files
find dist/content -name "*.json"

# Check for errors in build
npm run build 2>&1 | grep -i error

# Start server on different port
npx http-server dist -p 3000
```

## 7. Performance Tips

### Preload Popular Cases
Add to `dist/js/app.js` after page load:
```javascript
// Preload most visited cases
window.addEventListener('load', () => {
  setTimeout(() => {
    contentLoader.preload(['snow', 'stark', 'norris']);
  }, 2000);
});
```

### Enable Compression
If using custom server (not GitHub Pages), enable gzip/brotli:

**.htaccess** (Apache):
```apache
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json
</IfModule>
```

**nginx.conf**:
```nginx
gzip on;
gzip_types text/html text/css application/javascript application/json;
```

## 8. Checklist

Before deploying:
- [ ] `npm run build` completes without errors
- [ ] `npm run dev` works locally
- [ ] All cases load correctly
- [ ] No errors in browser console
- [ ] Initial load < 200 KB
- [ ] Lazy loading works (check Network tab)

---

Need help? Check:
- **README.md** - Full documentation
- **TESTING.md** - Complete test checklist
- **IMPLEMENTATION_SUMMARY.md** - Technical details
