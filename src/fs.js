import fs from 'fs-extra';
import { join, relative, extname } from 'path';
import { glob } from 'glob';

export async function getFiles(dir, pattern = '**/*') {
  return glob(pattern, { cwd: dir, nodir: true });
}

export function isMarkdown(filePath) {
  const ext = extname(filePath).toLowerCase();
  return ['.md', '.markdown'].includes(ext);
}

export function isHtml(filePath) {
  const ext = extname(filePath).toLowerCase();
  return ['.html', '.htm'].includes(ext);
}
