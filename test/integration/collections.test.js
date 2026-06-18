import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs-extra';
import { join } from 'path';
import { build, clean } from '../../src/build.js';
import { createTempDir, removeDir } from '../helper.js';

describe('Collections Integration', () => {
  test('should support collections defined as array (output: false)', async () => {
    const tempDir = await createTempDir();
    const srcDir = tempDir;
    const destDir = join(tempDir, '_site');

    try {
      // 1. Create a config with an array collection
      await fs.writeFile(
        join(srcDir, '_config.yml'),
        'title: Array Collections Site\ndestination: _site\ncollections:\n  - team\n'
      );

      // Create layouts
      await fs.ensureDir(join(srcDir, '_layouts'));
      await fs.writeFile(
        join(srcDir, '_layouts/default.html'),
        '<html><body>{{ content }}</body></html>'
      );

      // Create team collection directory and items
      const teamDir = join(srcDir, '_team');
      await fs.ensureDir(teamDir);
      await fs.writeFile(
        join(teamDir, 'member-one.md'),
        '---\nname: "Alice Smith"\nrole: "Developer"\n---\nAlice is a senior developer.'
      );
      await fs.writeFile(
        join(teamDir, 'member-two.md'),
        '---\nname: "Bob Jones"\nrole: "Designer"\n---\nBob does visual design.'
      );

      // Create index.html checking site.team data availability
      await fs.writeFile(
        join(srcDir, 'index.html'),
        `---
layout: default
---
<ul>
  {% for member in site.team %}
    <li>{{ member.name }} - {{ member.role }}</li>
  {% endfor %}
</ul>`
      );

      const config = {
        source: srcDir,
        destination: '_site',
        layouts_dir: '_layouts',
        posts_dir: '_posts',
        data_dir: '_data',
        includes_dir: '_includes',
        collections: ['team']
      };

      await build(config);

      // Verify index.html rendered the collection items correct attributes
      const indexCompiled = join(destDir, 'index.html');
      assert.ok(await fs.pathExists(indexCompiled), 'index.html should exist');
      const indexHtml = await fs.readFile(indexCompiled, 'utf8');
      assert.match(indexHtml, /<li>Alice Smith - Developer<\/li>/);
      assert.match(indexHtml, /<li>Bob Jones - Designer<\/li>/);

      // Verify that individual member pages are NOT outputted because output defaults to false
      const member1Compiled = join(destDir, 'team/member-one.html');
      const member2Compiled = join(destDir, 'team/member-two.html');
      assert.equal(await fs.pathExists(member1Compiled), false, 'Alice page should not be outputted');
      assert.equal(await fs.pathExists(member2Compiled), false, 'Bob page should not be outputted');

    } finally {
      await removeDir(tempDir);
    }
  });

  test('should support collections defined as object (output: true) with custom permalinks', async () => {
    const tempDir = await createTempDir();
    const srcDir = tempDir;
    const destDir = join(tempDir, '_site');

    try {
      // 1. Create config with object collection config
      const configYaml = `
title: Object Collections Site
destination: _site
collections:
  portfolio:
    output: true
    permalink: /projects/:path/
`;
      await fs.writeFile(join(srcDir, '_config.yml'), configYaml);

      // Create layouts
      await fs.ensureDir(join(srcDir, '_layouts'));
      await fs.writeFile(
        join(srcDir, '_layouts/default.html'),
        '<html><body>{{ content }}</body></html>'
      );
      await fs.writeFile(
        join(srcDir, '_layouts/project.html'),
        '---\nlayout: default\n---\n<div class="project-page"><h1>{{ page.title }}</h1><div class="body">{{ content }}</div></div>'
      );

      // Create portfolio collection directory (including a nested subdirectory)
      const portfolioDir = join(srcDir, '_portfolio');
      await fs.ensureDir(join(portfolioDir, 'nested'));
      
      await fs.writeFile(
        join(portfolioDir, 'nested/project-one.md'),
        '---\nlayout: project\ntitle: "Project Alpha"\n---\nDetails of Project Alpha.'
      );

      const config = {
        source: srcDir,
        destination: '_site',
        layouts_dir: '_layouts',
        posts_dir: '_posts',
        data_dir: '_data',
        includes_dir: '_includes',
        collections: {
          portfolio: {
            output: true,
            permalink: '/projects/:path/'
          }
        }
      };

      await build(config);

      // Verify individual page output was generated matching custom permalink
      // /projects/nested/project-one/ -> projects/nested/project-one/index.html
      const projectCompiled = join(destDir, 'projects/nested/project-one/index.html');
      assert.ok(await fs.pathExists(projectCompiled), 'Custom permalink page should be outputted');
      
      const projectHtml = await fs.readFile(projectCompiled, 'utf8');
      assert.match(projectHtml, /<div class="project-page">/);
      assert.match(projectHtml, /<h1>Project Alpha<\/h1>/);
      assert.match(projectHtml, /Details of Project Alpha\./);

    } finally {
      await removeDir(tempDir);
    }
  });

  test('should expose site.collections metadata correctly', async () => {
    const tempDir = await createTempDir();
    const srcDir = tempDir;
    const destDir = join(tempDir, '_site');

    try {
      await fs.writeFile(
        join(srcDir, '_config.yml'),
        'title: Collections Metadata\ndestination: _site\ncollections:\n  - services\n'
      );

      await fs.ensureDir(join(srcDir, '_layouts'));
      await fs.writeFile(
        join(srcDir, '_layouts/default.html'),
        '<html><body>{{ content }}</body></html>'
      );

      const servicesDir = join(srcDir, '_services');
      await fs.ensureDir(servicesDir);
      await fs.writeFile(
        join(servicesDir, 'design.md'),
        '---\ntitle: Design Service\n---\nCreative design.'
      );

      // Create index.html inspecting site.collections
      await fs.writeFile(
        join(srcDir, 'index.html'),
        `---
layout: default
---
<ul>
  {% for collection in site.collections %}
    <li>Collection: {{ collection.label }} (Size: {{ collection.docs.size }})</li>
  {% endfor %}
</ul>`
      );

      const config = {
        source: srcDir,
        destination: '_site',
        layouts_dir: '_layouts',
        posts_dir: '_posts',
        data_dir: '_data',
        includes_dir: '_includes',
        collections: ['services']
      };

      await build(config);

      const indexCompiled = join(destDir, 'index.html');
      assert.ok(await fs.pathExists(indexCompiled));
      const indexHtml = await fs.readFile(indexCompiled, 'utf8');

      // Should list posts and services
      assert.match(indexHtml, /Collection: posts/);
      assert.match(indexHtml, /Collection: services/);
      assert.match(indexHtml, /Size: 1/); // 1 service doc
    } finally {
      await removeDir(tempDir);
    }
  });

  test('should sort collection documents by order list or sort_by key or date/path', async () => {
    const tempDir = await createTempDir();
    const srcDir = tempDir;
    const destDir = join(tempDir, '_site');

    try {
      const configYaml = `
title: Sorting Collections Site
destination: _site
collections:
  tutorials:
    order:
      - intro.md
      - sub/basic.md
  books:
    sort_by: rating
`;
      await fs.writeFile(join(srcDir, '_config.yml'), configYaml);

      await fs.ensureDir(join(srcDir, '_layouts'));
      await fs.writeFile(
        join(srcDir, '_layouts/default.html'),
        '<html><body>{{ content }}</body></html>'
      );

      // Tutorials collection (manual order)
      const tutorialsDir = join(srcDir, '_tutorials');
      await fs.ensureDir(join(tutorialsDir, 'sub'));
      await fs.writeFile(join(tutorialsDir, 'intro.md'), '---\ntitle: Intro\n---\nIntro.');
      await fs.writeFile(join(tutorialsDir, 'sub/basic.md'), '---\ntitle: Basic\n---\nBasic.');
      await fs.writeFile(join(tutorialsDir, 'advanced.md'), '---\ntitle: Advanced\n---\nAdvanced.');

      // Books collection (sort_by key)
      const booksDir = join(srcDir, '_books');
      await fs.ensureDir(booksDir);
      await fs.writeFile(join(booksDir, 'book-a.md'), '---\ntitle: A\nrating: 3\n---\nBook A.');
      await fs.writeFile(join(booksDir, 'book-b.md'), '---\ntitle: B\nrating: 1\n---\nBook B.');
      await fs.writeFile(join(booksDir, 'book-c.md'), '---\ntitle: C\n---\nBook C (no rating).');

      // Index listing tutorials and books
      await fs.writeFile(
        join(srcDir, 'index.html'),
        `---
layout: default
---
Tutorials: {% for t in site.tutorials %}{{ t.title }}; {% endfor %}
Books: {% for b in site.books %}{{ b.title }}; {% endfor %}`
      );

      const config = {
        source: srcDir,
        destination: '_site',
        layouts_dir: '_layouts',
        posts_dir: '_posts',
        data_dir: '_data',
        includes_dir: '_includes',
        collections: {
          tutorials: { order: ['intro.md', 'sub/basic.md'] },
          books: { sort_by: 'rating' }
        }
      };

      await build(config);

      const indexHtml = await fs.readFile(join(destDir, 'index.html'), 'utf8');
      
      // Tutorials order: intro, sub/basic, advanced (placed last)
      assert.match(indexHtml, /Tutorials: Intro; Basic; Advanced;/);
      
      // Books order: rating 1 (B), rating 3 (A), no rating (C, placed last)
      assert.match(indexHtml, /Books: B; A; C;/);

    } finally {
      await removeDir(tempDir);
    }
  });

  test('should support collections_dir option', async () => {
    const tempDir = await createTempDir();
    const srcDir = tempDir;
    const destDir = join(tempDir, '_site');

    try {
      await fs.writeFile(
        join(srcDir, '_config.yml'),
        'title: Collections Dir Site\ndestination: _site\ncollections_dir: collections_folder\ncollections:\n  - documents\n'
      );

      await fs.ensureDir(join(srcDir, '_layouts'));
      await fs.writeFile(join(srcDir, '_layouts/default.html'), '<html><body>{{ content }}</body></html>');

      // Create collections dir
      const colDir = join(srcDir, 'collections_folder', '_documents');
      await fs.ensureDir(colDir);
      await fs.writeFile(
        join(colDir, 'doc1.md'),
        '---\ntitle: Document One\n---\nDoc 1.'
      );

      await fs.writeFile(
        join(srcDir, 'index.html'),
        '---\nlayout: default\n---\nDocs: {% for d in site.documents %}{{ d.title }}{% endfor %}'
      );

      const config = {
        source: srcDir,
        destination: '_site',
        layouts_dir: '_layouts',
        posts_dir: '_posts',
        data_dir: '_data',
        includes_dir: '_includes',
        collections_dir: 'collections_folder',
        collections: ['documents']
      };

      await build(config);

      const indexHtml = await fs.readFile(join(destDir, 'index.html'), 'utf8');
      assert.match(indexHtml, /Docs: Document One/);

    } finally {
      await removeDir(tempDir);
    }
  });

  test('should treat files without front matter as static files and copy raw only if output: true', async () => {
    const tempDir = await createTempDir();
    const srcDir = tempDir;
    const destDir = join(tempDir, '_site');

    try {
      await fs.writeFile(
        join(srcDir, '_config.yml'),
        'title: Static Files Site\ndestination: _site\ncollections:\n  docs:\n    output: true\n  notes:\n    output: false\n'
      );

      const docsDir = join(srcDir, '_docs');
      await fs.ensureDir(docsDir);
      // Create static file (no front matter) in docs
      await fs.writeFile(join(docsDir, 'static-doc.txt'), 'Raw content of static doc.');

      const notesDir = join(srcDir, '_notes');
      await fs.ensureDir(notesDir);
      // Create static file (no front matter) in notes
      await fs.writeFile(join(notesDir, 'static-note.txt'), 'Raw content of static note.');

      const config = {
        source: srcDir,
        destination: '_site',
        layouts_dir: '_layouts',
        posts_dir: '_posts',
        data_dir: '_data',
        includes_dir: '_includes',
        collections: {
          docs: { output: true },
          notes: { output: false }
        }
      };

      await build(config);

      // Verify static-doc.txt gets copied raw directly to output
      const copiedDoc = join(destDir, 'docs/static-doc.txt');
      assert.ok(await fs.pathExists(copiedDoc), 'Static doc should be copied to site output');
      assert.equal(await fs.readFile(copiedDoc, 'utf8'), 'Raw content of static doc.');

      // Verify static-note.txt does NOT get copied (output: false)
      const copiedNote = join(destDir, 'notes/static-note.txt');
      assert.equal(await fs.pathExists(copiedNote), false, 'Static note should not be outputted');

    } finally {
      await removeDir(tempDir);
    }
  });
});
