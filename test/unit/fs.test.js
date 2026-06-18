import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs-extra';
import { join } from 'path';
import { getFiles, isMarkdown, isHtml } from '../../src/fs.js';
import { createTempDir, removeDir } from '../helper.js';

describe('File System Utilities', () => {
  test('isMarkdown should return true for md and markdown extensions', () => {
    assert.equal(isMarkdown('post.md'), true);
    assert.equal(isMarkdown('post.markdown'), true);
    assert.equal(isMarkdown('POST.MD'), true);
    assert.equal(isMarkdown('POST.MARKDOWN'), true);
    assert.equal(isMarkdown('post.html'), false);
    assert.equal(isMarkdown('post.txt'), false);
    assert.equal(isMarkdown('post'), false);
  });

  test('isHtml should return true for html and htm extensions', () => {
    assert.equal(isHtml('index.html'), true);
    assert.equal(isHtml('index.htm'), true);
    assert.equal(isHtml('INDEX.HTML'), true);
    assert.equal(isHtml('INDEX.HTM'), true);
    assert.equal(isHtml('index.md'), false);
    assert.equal(isHtml('index.txt'), false);
    assert.equal(isHtml('index'), false);
  });

  test('getFiles should find files matching glob patterns recursively', async () => {
    const tempDir = await createTempDir();
    try {
      await fs.ensureDir(join(tempDir, 'nested'));
      await fs.writeFile(join(tempDir, 'file1.txt'), 'content1');
      await fs.writeFile(join(tempDir, 'file2.md'), 'content2');
      await fs.writeFile(join(tempDir, 'nested', 'file3.txt'), 'content3');

      const allFiles = await getFiles(tempDir);
      assert.deepEqual(allFiles.sort(), ['file1.txt', 'file2.md', 'nested/file3.txt'].sort());

      const txtFiles = await getFiles(tempDir, '**/*.txt');
      assert.deepEqual(txtFiles.sort(), ['file1.txt', 'nested/file3.txt'].sort());
    } finally {
      await removeDir(tempDir);
    }
  });
});
