import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs-extra';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createNewSite, createNewTheme } from '../../src/scaffold.js';
import { createTempDir, removeDir } from '../helper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('Scaffold', () => {
  test('createNewSite (blank) should create folders and a basic config', async () => {
    const tempDir = await createTempDir();
    try {
      await createNewSite(tempDir, true);
      
      const dirs = ['_posts', '_layouts', '_includes', '_data', 'assets'];
      for (const dir of dirs) {
        assert.ok(await fs.pathExists(join(tempDir, dir)), `${dir} should exist`);
      }
      
      const configExists = await fs.pathExists(join(tempDir, '_config.yml'));
      assert.ok(configExists, '_config.yml should exist');
      
      const configContent = await fs.readFile(join(tempDir, '_config.yml'), 'utf8');
      assert.match(configContent, /title: My HydeJS Site/);
      assert.match(configContent, /description: A new blank HydeJS site/);
    } finally {
      await removeDir(tempDir);
    }
  });

  test('createNewSite (themed) should copy files from theme and exclude Ruby artifacts', async () => {
    const tempDir = await createTempDir();
    try {
      // Create scaffold with the default theme name
      await createNewSite(tempDir, false, '@hydejs/theme-default');
      
      // We expect _layouts, _includes, assets, etc. to be copied from @hydejs/theme-default.
      // Ensure it copies the layouts
      const layoutsExist = await fs.pathExists(join(tempDir, '_layouts'));
      assert.ok(layoutsExist, 'layouts should be copied from theme');

      // Ruby/Jekyll leftovers should not be copied
      const gemfileExist = await fs.pathExists(join(tempDir, 'Gemfile'));
      assert.equal(gemfileExist, false, 'Gemfile should be excluded during de-jekyllizing');
      
      const readmeExists = await fs.pathExists(join(tempDir, 'README.md'));
      assert.equal(readmeExists, false, 'README.md should be excluded during de-jekyllizing');
    } finally {
      await removeDir(tempDir);
    }
  });

  test('createNewTheme should generate a theme scaffold inside jekyll-themes directory', async () => {
    const uniqueThemeName = `test-theme-${Math.random().toString(36).substring(2, 9)}`;
    const themesDir = join(__dirname, '../../jekyll-themes');
    const expectedThemePath = join(themesDir, uniqueThemeName);

    try {
      await createNewTheme(uniqueThemeName);

      assert.ok(await fs.pathExists(expectedThemePath), 'Theme folder should be created');
      assert.ok(await fs.pathExists(join(expectedThemePath, '_layouts')), '_layouts should exist');
      assert.ok(await fs.pathExists(join(expectedThemePath, '_includes')), '_includes should exist');
      assert.ok(await fs.pathExists(join(expectedThemePath, 'assets')), 'assets should exist');
      
      const pkgPath = join(expectedThemePath, 'package.json');
      assert.ok(await fs.pathExists(pkgPath), 'package.json should exist');
      
      const pkgJson = await fs.readJson(pkgPath);
      assert.equal(pkgJson.name, uniqueThemeName);
      assert.equal(pkgJson.version, '0.1.0');
    } finally {
      // Clean up the created theme folder in the repository
      await fs.remove(expectedThemePath);
    }
  });
});
