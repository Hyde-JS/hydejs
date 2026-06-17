import fs from 'fs-extra';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function createNewSite(destPath, isBlank = false, themeName = 'minima') {
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

  const themesDir = join(__dirname, '../jekyll-themes');
  const themePath = join(themesDir, themeName);

  if (!fs.existsSync(themePath)) {
    console.error(`Theme "${themeName}" not found in ${themesDir}`);
    if (themeName !== 'minima') {
      console.log('Falling back to "minima" theme...');
      return createNewSite(destPath, isBlank, 'minima');
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
