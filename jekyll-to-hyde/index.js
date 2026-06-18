import fs from 'fs-extra';
import { join, basename } from 'path';
import simpleGit from 'simple-git';
import { tmpdir } from 'os';

export async function convertTheme(repoUrl, destDir, themeName) {
  const git = simpleGit();
  const tempDir = join(tmpdir(), `jekyll-to-hyde-${Date.now()}`);

  try {
    console.log(`Cloning ${repoUrl}...`);
    await git.clone(repoUrl, tempDir);

    // Remove .git directory
    await fs.remove(join(tempDir, '.git'));

    // Extract theme name if not provided
    const finalThemeName = themeName || basename(repoUrl).replace(/\.git$/, '');
    const scopedThemeName = `@hydejs/theme-${finalThemeName}`;

    // Scaffold package.json
    const pkg = {
      name: scopedThemeName,
      version: '0.1.0',
      description: `HydeJS theme converted from ${repoUrl}`,
      main: 'index.js',
      type: 'module',
      license: 'MIT',
      files: [
        '_includes',
        '_layouts',
        '_sass',
        'assets',
        '_config.yml',
        'README.md',
        'LICENSE.txt'
      ]
    };

    await fs.writeJson(join(tempDir, 'package.json'), pkg, { spaces: 2 });

    // Scaffold GitHub Actions workflow for Trusted Publishing
    const workflowDir = join(tempDir, '.github', 'workflows');
    await fs.ensureDir(workflowDir);

    const workflowContent = `name: Publish to NPM
on:
  release:
    types: [published]
jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
      - run: npm install
      - run: npm publish --provenance --access public
        env:
          NODE_AUTH_TOKEN: \${{ secrets.NPM_TOKEN }}`;

    await fs.writeFile(join(workflowDir, 'publish.yml'), workflowContent);

    // Move to final destination
    await fs.ensureDir(destDir);
    await fs.copy(tempDir, destDir);
    
    console.log(`Successfully converted ${repoUrl} to ${scopedThemeName} at ${destDir}`);
  } finally {
    await fs.remove(tempDir);
  }
}
