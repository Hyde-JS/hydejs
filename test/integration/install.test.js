import { test, describe, before, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs-extra';
import { join, basename } from 'path';
import child_process from 'child_process';
import { installTheme } from '../../src/install.js';
import { createTempDir, removeDir } from '../helper.js';

describe('Theme Installer', () => {
  let originalCwd;

  before(() => {
    originalCwd = process.cwd();
  });

  afterEach(() => {
    process.chdir(originalCwd);
  });

  test('should clone theme, convert it, update _config.yml, and link it via npm', async (t) => {
    const tempDir = await createTempDir();
    const dummyRepo = await createTempDir();

    try {
      // 1. Create a dummy git theme repo
      await fs.ensureDir(join(dummyRepo, '_layouts'));
      await fs.writeFile(join(dummyRepo, '_layouts/default.html'), '<html>{{ content }}</html>');
      await fs.writeFile(join(dummyRepo, '_config.yml'), 'title: Dummy Theme');
      
      // Initialize git in dummy theme
      child_process.execSync('git init', { cwd: dummyRepo, stdio: 'ignore' });
      child_process.execSync('git config user.email "test@example.com"', { cwd: dummyRepo, stdio: 'ignore' });
      child_process.execSync('git config user.name "Tester"', { cwd: dummyRepo, stdio: 'ignore' });
      child_process.execSync('git add .', { cwd: dummyRepo, stdio: 'ignore' });
      child_process.execSync('git commit -m "initial commit"', { cwd: dummyRepo, stdio: 'ignore' });

      // 2. Set up target project dir
      await fs.writeFile(join(tempDir, '_config.yml'), 'title: My Site\ntheme: "@hydejs/theme-default"');

      // Change cwd to target project
      process.chdir(tempDir);

      // Mock execSync to avoid running slow and network-dependent npm installs
      const originalExecSync = child_process.execSync;
      const execSyncCalls = [];
      t.mock.method(child_process, 'execSync', (cmd, opts) => {
        if (cmd.includes('npm install')) {
          execSyncCalls.push({ cmd, opts });
          return Buffer.from('');
        }
        return originalExecSync(cmd, opts);
      });

      // Call installTheme pointing to local dummy git repo
      await installTheme(dummyRepo);

      // Verify conversion output files were created in .hydejs-themes/<themeName>
      const themeDestName = basename(dummyRepo);
      const conversionPath = join(tempDir, '.hydejs-themes', themeDestName);
      
      assert.ok(await fs.pathExists(conversionPath), 'Theme files should be converted and saved');
      assert.ok(await fs.pathExists(join(conversionPath, 'package.json')), 'Converted package.json should exist');
      
      const pkgJson = await fs.readJson(join(conversionPath, 'package.json'));
      assert.equal(pkgJson.name, `@hydejs/theme-${themeDestName}`);

      // Verify npm install was called with correct command
      assert.ok(execSyncCalls.some(call => call.cmd.includes('npm install file:.hydejs-themes/')));

      // Verify target project config.yml was updated to use the new theme
      const configContent = await fs.readFile(join(tempDir, '_config.yml'), 'utf8');
      assert.match(configContent, new RegExp(`theme: ['"]@hydejs/theme-${themeDestName}['"]`));

    } finally {
      await removeDir(tempDir);
      await removeDir(dummyRepo);
    }
  });
});
