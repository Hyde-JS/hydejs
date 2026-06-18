import fs from 'fs-extra';
import { join } from 'path';
import { tmpdir } from 'os';

export async function createTempDir() {
  const dirPath = join(tmpdir(), `hydejs-test-${Math.random().toString(36).substring(2, 9)}`);
  await fs.ensureDir(dirPath);
  return dirPath;
}

export async function removeDir(dirPath) {
  await fs.remove(dirPath);
}
