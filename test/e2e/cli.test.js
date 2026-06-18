import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import child_process from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import { createTempDir, removeDir } from '../helper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const cliPath = join(__dirname, '../../bin/hydejs.js');
const pkgPath = join(__dirname, '../../package.json');

describe('CLI Commands (E2E)', () => {
  let pkgVersion;

  before(async () => {
    const pkg = await fs.readJson(pkgPath);
    pkgVersion = pkg.version;
  });

  test('--version should display package version', () => {
    const output = child_process.execSync(`node ${cliPath} --version`).toString().trim();
    assert.equal(output, pkgVersion);
  });

  test('new subcommand should create a blank site scaffold', async () => {
    const tempDir = await createTempDir();
    const sitePath = join(tempDir, 'my-new-site');

    try {
      child_process.execSync(`node ${cliPath} new ${sitePath} --blank`, { stdio: 'ignore' });

      assert.ok(await fs.pathExists(sitePath), 'Site folder should be created');
      assert.ok(await fs.pathExists(join(sitePath, '_posts')), '_posts directory should exist');
      assert.ok(await fs.pathExists(join(sitePath, '_config.yml')), '_config.yml should exist');
      
      const config = await fs.readFile(join(sitePath, '_config.yml'), 'utf8');
      assert.match(config, /title: My HydeJS Site/);
    } finally {
      await removeDir(tempDir);
    }
  });

  test('doctor command should execute and output report', async () => {
    const tempDir = await createTempDir();
    try {
      // Create a default config so doctor runs cleanly
      await fs.writeFile(join(tempDir, '_config.yml'), 'title: E2E Doctor Site\nsource: .');
      
      const stdout = child_process.execSync(`node ${cliPath} doctor`, {
        cwd: tempDir,
        env: { ...process.env, NODE_ENV: 'test' }
      }).toString();

      assert.match(stdout, /Checking configuration.../);
      assert.match(stdout, /potential issues/);
    } finally {
      await removeDir(tempDir);
    }
  });

  test('clean command should execute and clean up output', async () => {
    const tempDir = await createTempDir();
    try {
      // Create custom destination
      await fs.writeFile(
        join(tempDir, '_config.yml'),
        'title: E2E Clean Site\ndestination: custom_out\nsource: .'
      );
      const outDir = join(tempDir, 'custom_out');
      await fs.ensureDir(outDir);
      await fs.writeFile(join(outDir, 'old-file.txt'), 'some content');

      child_process.execSync(`node ${cliPath} clean`, { cwd: tempDir });

      // After clean, directory exists but should be empty
      assert.ok(await fs.pathExists(outDir));
      assert.deepEqual(await fs.readdir(outDir), []);
    } finally {
      await removeDir(tempDir);
    }
  });

  test('build command should accept --source and --destination options', async () => {
    const tempDir = await createTempDir();
    const srcDir = join(tempDir, 'src');
    const outDir = join(tempDir, 'out');
    
    try {
      await fs.ensureDir(srcDir);
      await fs.writeFile(join(srcDir, 'index.md'), '# Hello World');
      
      // Run build specifying source and destination options
      child_process.execSync(`node ${cliPath} build --source ${srcDir} --destination ${outDir}`, { stdio: 'ignore' });
      
      const indexCompiled = join(outDir, 'index.html');
      assert.ok(await fs.pathExists(indexCompiled), 'Page should be built in custom destination directory');
      const html = await fs.readFile(indexCompiled, 'utf8');
      assert.match(html, /<h1>Hello World<\/h1>/);
    } finally {
      await removeDir(tempDir);
    }
  });
});
