import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs-extra';
import { join } from 'path';
import { loadConfig } from '../../src/config.js';
import { createTempDir, removeDir } from '../helper.js';

describe('Config Loader', () => {
  test('should return default config when no _config.yml exists', async () => {
    const tempDir = await createTempDir();
    try {
      const config = loadConfig(tempDir);
      assert.equal(config.title, 'My HydeJS Site');
      assert.equal(config.destination, '_site');
      assert.equal(config.layouts_dir, '_layouts');
      assert.equal(config.posts_dir, '_posts');
    } finally {
      await removeDir(tempDir);
    }
  });

  test('should merge defaults with user configuration', async () => {
    const tempDir = await createTempDir();
    try {
      await fs.writeFile(
        join(tempDir, '_config.yml'),
        'title: "Custom Title"\ndestination: "custom_build"\n'
      );
      const config = loadConfig(tempDir);
      assert.equal(config.title, 'Custom Title');
      assert.equal(config.destination, 'custom_build');
      // Verify other defaults persist
      assert.equal(config.layouts_dir, '_layouts');
    } finally {
      await removeDir(tempDir);
    }
  });

  test('should handle empty config file gracefully', async () => {
    const tempDir = await createTempDir();
    try {
      await fs.writeFile(join(tempDir, '_config.yml'), '');
      const config = loadConfig(tempDir);
      assert.equal(config.title, 'My HydeJS Site');
    } finally {
      await removeDir(tempDir);
    }
  });

  test('should handle invalid YAML configuration file gracefully and fallback to defaults', async () => {
    const tempDir = await createTempDir();
    try {
      // Invalid YAML: unclosed quotes
      await fs.writeFile(join(tempDir, '_config.yml'), 'title: "Unclosed quote');
      const config = loadConfig(tempDir);
      assert.equal(config.title, 'My HydeJS Site');
    } finally {
      await removeDir(tempDir);
    }
  });
});
