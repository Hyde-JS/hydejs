import { test, describe, before, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs-extra';
import { join } from 'path';
import { doctor } from '../../src/doctor.js';
import { createTempDir, removeDir } from '../helper.js';

describe('Doctor command', () => {
  let originalCwd;

  before(() => {
    originalCwd = process.cwd();
  });

  afterEach(() => {
    process.chdir(originalCwd);
  });

  test('should report no issues on a fully configured directory structure', async (t) => {
    const tempDir = await createTempDir();
    
    // Create necessary dirs for a clean site
    await fs.ensureDir(join(tempDir, '_layouts'));
    await fs.ensureDir(join(tempDir, '_posts'));
    await fs.ensureDir(join(tempDir, '_includes'));
    await fs.ensureDir(join(tempDir, 'assets'));
    
    // Write a standard config
    await fs.writeFile(join(tempDir, '_config.yml'), 'title: Test Site\nsource: .');

    process.chdir(tempDir);

    const logCalls = [];
    const warnCalls = [];
    t.mock.method(console, 'log', (...args) => logCalls.push(args.join(' ')));
    t.mock.method(console, 'warn', (...args) => warnCalls.push(args.join(' ')));

    doctor();

    assert.ok(logCalls.includes('Checking configuration...'));
    assert.ok(logCalls.includes('No major issues found. Site configuration looks good!'));
    assert.equal(warnCalls.length, 0);

    await removeDir(tempDir);
  });

  test('should report warnings for missing directory structures', async (t) => {
    const tempDir = await createTempDir();
    await fs.writeFile(join(tempDir, '_config.yml'), 'title: Test Site\nsource: .');

    process.chdir(tempDir);

    const logCalls = [];
    const warnCalls = [];
    t.mock.method(console, 'log', (...args) => logCalls.push(args.join(' ')));
    t.mock.method(console, 'warn', (...args) => warnCalls.push(args.join(' ')));

    doctor();

    assert.ok(logCalls.includes('Checking configuration...'));
    assert.ok(logCalls.some(line => line.includes('Found 4 potential issues.')));
    
    const missingDirs = ['_layouts', '_posts', '_includes', 'assets'];
    for (const dir of missingDirs) {
      assert.ok(warnCalls.some(line => line.includes(`[Structure] Warning: Directory "${dir}" not found.`)));
    }

    await removeDir(tempDir);
  });

  test('should report warnings for Ruby/Jekyll leftovers and dev configs', async (t) => {
    const tempDir = await createTempDir();
    
    // Create structures to satisfy standard checks
    await fs.ensureDir(join(tempDir, '_layouts'));
    await fs.ensureDir(join(tempDir, '_posts'));
    await fs.ensureDir(join(tempDir, '_includes'));
    await fs.ensureDir(join(tempDir, 'assets'));

    // Write a standard config
    await fs.writeFile(join(tempDir, '_config.yml'), 'title: Test Site\nsource: .');

    // Create leftover Ruby and theme development files
    await fs.writeFile(join(tempDir, 'Gemfile'), 'gem "jekyll"');
    await fs.writeFile(join(tempDir, '_config_theme-dev.yml'), 'dev: true');

    process.chdir(tempDir);

    const logCalls = [];
    const warnCalls = [];
    t.mock.method(console, 'log', (...args) => logCalls.push(args.join(' ')));
    t.mock.method(console, 'warn', (...args) => warnCalls.push(args.join(' ')));

    doctor();

    assert.ok(logCalls.some(line => line.includes('Found 2 potential issues.')));
    assert.ok(warnCalls.some(line => line.includes('[Migration] Found Ruby/Jekyll leftover: "Gemfile"')));
    assert.ok(warnCalls.some(line => line.includes('[Cleanup] Found theme development config: "_config_theme-dev.yml"')));

    await removeDir(tempDir);
  });
});
