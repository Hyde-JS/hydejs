import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';

const DEFAULT_CONFIG = {
  source: '.',
  destination: '_site',
  layouts_dir: '_layouts',
  posts_dir: '_posts',
  data_dir: '_data',
  includes_dir: '_includes',
  markdown: 'markdown-it',
  permalink: 'date',
  baseurl: '',
  url: '',
  title: 'My HydeJS Site',
  description: 'A Node.js-based static site generator inspired by Jekyll',
  author: {
    name: 'HydeJS User',
    email: 'user@example.com'
  },
  minima: {
    skin: 'classic',
    date_format: '%b %-d, %Y',
    show_excerpts: false
  },
  paginate: 0,
  paginate_path: 'page:num/'
};

export function loadConfig(root = process.cwd()) {
  const configPath = join(root, '_config.yml');
  let userConfig = {};

  if (existsSync(configPath)) {
    try {
      const fileContent = readFileSync(configPath, 'utf8');
      userConfig = yaml.load(fileContent) || {};
    } catch (e) {
      console.error(`Error parsing _config.yml: ${e.message}`);
    }
  }

  // Merge defaults with user config
  // We keep defaults minimal to avoid interfering with theme-specific configurations
  return { ...DEFAULT_CONFIG, ...userConfig };
}
