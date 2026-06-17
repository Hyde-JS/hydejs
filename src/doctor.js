import { existsSync } from 'fs';
import { join } from 'path';
import { loadConfig } from './config.js';

export function doctor() {
  const config = loadConfig();
  console.log('Checking configuration...');

  let issues = 0;

  const requiredDirs = [
    config.layouts_dir,
    config.posts_dir,
    config.includes_dir,
    'assets'
  ];

  for (const dir of requiredDirs) {
    if (!existsSync(join(config.source, dir))) {
      console.warn(`[Structure] Warning: Directory "${dir}" not found.`);
      issues++;
    }
  }

  // Check for Ruby/Jekyll leftovers
  const rubyFiles = [
    'Gemfile',
    'Gemfile.lock',
    'minima.gemspec',
    '.bundle',
    'vendor/bundle'
  ];

  for (const file of rubyFiles) {
    if (existsSync(join(config.source, file))) {
      console.warn(`[Migration] Found Ruby/Jekyll leftover: "${file}". In HydeJS, you should manage dependencies via package.json.`);
      issues++;
    }
  }

  const themeDevConfig = '_config_theme-dev.yml';
  if (existsSync(join(config.source, themeDevConfig))) {
    console.warn(`[Cleanup] Found theme development config: "${themeDevConfig}". This is usually only needed for theme developers.`);
    issues++;
  }

  if (issues === 0) {
    console.log('No major issues found. Site configuration looks good!');
  } else {
    console.log(`Found ${issues} potential issues.`);
  }
}
