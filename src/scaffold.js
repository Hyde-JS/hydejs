import fs from 'fs-extra';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';
import { realpathSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function findThemePath(themeName) {
  // 1. Try to find in node_modules (the Node-way)
  // We check relative to the current file (src/scaffold.js -> ../node_modules)
  const nodeModulesPath = join(__dirname, '../node_modules', themeName);
  if (fs.existsSync(nodeModulesPath)) {
    return realpathSync(nodeModulesPath);
  }

  // 2. Try the local jekyll-themes directory (legacy/internal)
  const themesDir = join(__dirname, '../jekyll-themes');
  const internalPath = join(themesDir, themeName);
  if (fs.existsSync(internalPath)) {
    return internalPath;
  }

  return null;
}

export async function createNewSite(destPath, isBlank = false, themeName = '@hydejs/theme-default') {
  await fs.ensureDir(destPath);

  if (isBlank) {
    const dirs = ['_posts', '_layouts', '_includes', '_data', 'assets'];
    for (const dir of dirs) {
      await fs.ensureDir(join(destPath, dir));
    }
    const configContent = `title: My HydeJS Site
description: A new blank HydeJS site
baseurl: ""
url: "http://example.com"
`;
    await fs.writeFile(join(destPath, '_config.yml'), configContent);
    console.log(`New blank site created at ${destPath}`);
    return;
  }

  const themePath = await findThemePath(themeName);

  if (!themePath) {
    console.error(`Theme "${themeName}" not found in node_modules or jekyll-themes.`);
    if (themeName !== '@hydejs/theme-default') {
      console.log('Falling back to "@hydejs/theme-default" theme...');
      return createNewSite(destPath, isBlank, '@hydejs/theme-default');
    }
    return;
  }

  // "De-jekyllizing" process: filter out Ruby artifacts and theme development files
  const EXCLUDED_FILES = [
    '.git', '.github', '.gitignore', '.editorconfig',
    'Gemfile', 'Gemfile.lock', 'package.json', 'package-lock.json',
    'LICENSE.txt', 'CODE_OF_CONDUCT.md', 'History.markdown', 'README.md',
    'minima.gemspec', 'screenshot.png', 'readme_banner.svg', 'script',
    'node_modules', '_config_theme-dev.yml'
  ];

  // Copy theme files selectively
  await fs.copy(themePath, destPath, {
    filter: (src) => {
      const relPath = relative(themePath, src);
      if (!relPath) return true; // The root directory itself
      
      const firstPart = relPath.split(/[\\/]/)[0];
      // Exclude files matching our list, or any .gemspec file
      return !EXCLUDED_FILES.includes(firstPart) && !firstPart.endsWith('.gemspec');
    }
  });

  console.log(`New site created at ${destPath} using Jekyll theme "${themeName}" (de-jekyllized)`);
}

export async function createNewTheme(themeName) {
  const themesDir = join(__dirname, '../jekyll-themes');
  const destPath = join(themesDir, themeName);
  
  await fs.ensureDir(destPath);
  await fs.ensureDir(join(destPath, '_layouts'));
  await fs.ensureDir(join(destPath, '_includes'));
  await fs.ensureDir(join(destPath, 'assets'));
  
  const pkg = {
    name: themeName,
    version: '0.1.0',
    description: 'A HydeJS theme'
  };
  await fs.writeJson(join(destPath, 'package.json'), pkg, { spaces: 2 });
  
  console.log(`New theme scaffold created at ${destPath}`);
}
