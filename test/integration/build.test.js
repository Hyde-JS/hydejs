import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs-extra';
import { join } from 'path';
import { build, clean } from '../../src/build.js';
import { createTempDir, removeDir } from '../helper.js';

describe('Site Builder', () => {
  test('should clean destination and build site from scratch', async () => {
    const tempDir = await createTempDir();

    try {
      // 1. Create a dummy site structure
      const srcDir = tempDir;
      const destDir = join(tempDir, '_site');

      await fs.writeFile(
        join(srcDir, '_config.yml'),
        'title: Build Test Site\ndestination: _site\npaginate: 2\n'
      );

      // Create layouts
      const layoutsDir = join(srcDir, '_layouts');
      await fs.ensureDir(layoutsDir);
      await fs.writeFile(
        join(layoutsDir, 'default.html'),
        '<!DOCTYPE html><html><head><title>{{ site.title }}</title></head><body>{{ content }}</body></html>'
      );
      await fs.writeFile(
        join(layoutsDir, 'post.html'),
        '---\nlayout: default\n---\n<article><h1>{{ page.title }}</h1><div class="date">{{ page.date | date: "%Y-%m-%d" }}</div>{{ content }}</article>'
      );

      // Create posts
      const postsDir = join(srcDir, '_posts');
      await fs.ensureDir(postsDir);
      
      // Post 1: has title and date in front matter
      await fs.writeFile(
        join(postsDir, '2026-06-10-post-one.md'),
        '---\nlayout: post\ntitle: "Custom Title One"\ndate: 2026-06-10 12:00:00\n---\nContent of post one.'
      );
      
      // Post 2: relies on filename parsing for title and date
      await fs.writeFile(
        join(postsDir, '2026-06-11-post-two.md'),
        '---\nlayout: post\n---\nContent of post two.'
      );

      // Post 3: additional post to test pagination (we set paginate: 2)
      await fs.writeFile(
        join(postsDir, '2026-06-12-post-three.md'),
        '---\nlayout: post\n---\nContent of post three.'
      );

      // Create index file that lists posts with pagination
      await fs.writeFile(
        join(srcDir, 'index.html'),
        `---
layout: default
---
<main>
  {% for post in paginator.posts %}
    <h2>{{ post.title }}</h2>
  {% endfor %}
  {% if paginator.next_page_path %}
    <a href="{{ paginator.next_page_path }}">Next</a>
  {% endif %}
</main>`
      );

      // Create a Sass asset file
      const assetsDir = join(srcDir, 'assets');
      await fs.ensureDir(assetsDir);
      await fs.writeFile(
        join(assetsDir, 'main.scss'),
        '---\n---\n$primary-color: #333;\nbody { color: $primary-color; h1 { font-weight: bold; } }'
      );

      // Create a static asset
      await fs.writeFile(
        join(assetsDir, 'logo.txt'),
        'Fake logo content'
      );

      // 2. Run clean check (should be safe to call clean on empty/non-existent folder)
      const config = {
        source: srcDir,
        destination: '_site',
        layouts_dir: '_layouts',
        posts_dir: '_posts',
        data_dir: '_data',
        includes_dir: '_includes',
        paginate: 2,
        paginate_path: 'page:num/'
      };

      await clean(config);
      assert.ok(await fs.pathExists(destDir));
      assert.deepEqual(await fs.readdir(destDir), []);

      // 3. Build the site
      await build(config);

      // Check outputs
      assert.ok(await fs.pathExists(destDir), '_site directory should exist');

      // Check Post 1 output
      const post1Path = join(destDir, '2026/06/10/post-one.html');
      // In build.js, the post URL matches Jekyll. If permalink is not set, 
      // let's verify what path gets compiled.
      // Let's inspect where posts are written:
      // destPathRelative = page.customDestPath || page.path.replace(/\.(md|markdown)$/, '.html').replace(/\.s[ac]ss$/, '.css');
      // If it doesn't match Jekyll's standard date-based folder format yet, it might compile to:
      // `_posts/2026-06-10-post-one.html` or url.replace(/^\/_posts\//, '/') if url is set.
      // Wait, build.js line 90 sets:
      // `const url = '/' + item.path.replace(/\.(md|markdown)$/, '.html').replace(/index\.html$/, '');`
      // and line 114 sets:
      // `url: data.permalink || url.replace(/^\/_posts\//, '/'), // Match Jekyll's clean post URLs`
      // So url will be: `/2026-06-10-post-one.html`.
      // Let's verify destPathRelative in build.js:
      // `destPathRelative = url;` (cleaned starting /) -> `2026-06-10-post-one.html`
      
      const post1Compiled = join(destDir, '2026-06-10-post-one.html');
      assert.ok(await fs.pathExists(post1Compiled), 'Post 1 should be compiled to root');
      const post1Html = await fs.readFile(post1Compiled, 'utf8');
      assert.match(post1Html, /<h1>Custom Title One<\/h1>/);
      assert.match(post1Html, /<div class="date">2026-06-10<\/div>/);
      assert.match(post1Html, /Content of post one\./);

      // Check Post 2 output (deduced title & date from filename)
      const post2Compiled = join(destDir, '2026-06-11-post-two.html');
      assert.ok(await fs.pathExists(post2Compiled), 'Post 2 should be compiled');
      const post2Html = await fs.readFile(post2Compiled, 'utf8');
      assert.match(post2Html, /<h1>Post Two<\/h1>/);
      assert.match(post2Html, /<div class="date">2026-06-11<\/div>/);
      assert.match(post2Html, /Content of post two\./);

      // Check SCSS compiles to CSS
      const cssCompiled = join(destDir, 'assets/main.css');
      assert.ok(await fs.pathExists(cssCompiled), 'Sass should compile to CSS');
      const cssContent = await fs.readFile(cssCompiled, 'utf8');
      assert.match(cssContent, /color: #333;/);
      assert.match(cssContent, /body h1/);

      // Check static asset gets copied
      const assetCopied = join(destDir, 'assets/logo.txt');
      assert.ok(await fs.pathExists(assetCopied), 'Static assets should be copied directly');
      assert.equal(await fs.readFile(assetCopied, 'utf8'), 'Fake logo content');

      // Check Pagination:
      // index.html should have Post 3 and Post 2 (ordered newest first)
      const indexCompiled = join(destDir, 'index.html');
      assert.ok(await fs.pathExists(indexCompiled), 'index.html should exist');
      const indexHtml = await fs.readFile(indexCompiled, 'utf8');
      assert.match(indexHtml, /Post Three/);
      assert.match(indexHtml, /Post Two/);
      assert.doesNotMatch(indexHtml, /Custom Title One/); // Since paginate is 2 and Post 1 is the oldest
      assert.match(indexHtml, /<a href="\/page2\/">Next<\/a>/);

      // Page 2 should have Post 1 (Custom Title One)
      const page2Compiled = join(destDir, 'page2/index.html');
      assert.ok(await fs.pathExists(page2Compiled), 'page2/index.html should exist');
      const page2Html = await fs.readFile(page2Compiled, 'utf8');
      assert.match(page2Html, /Custom Title One/);
      assert.doesNotMatch(page2Html, /Post Three/);

      // Test clean deletes the build directory contents
      await clean(config);
      assert.deepEqual(await fs.readdir(destDir), [], '_site should be empty after clean');
    } finally {
      await removeDir(tempDir);
    }
  });
});
