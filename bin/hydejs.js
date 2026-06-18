#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { loadConfig } from '../src/config.js';
import { build, clean } from '../src/build.js';
import { serve } from '../src/serve.js';
import { createNewSite, createNewTheme } from '../src/scaffold.js';
import { installTheme } from '../src/install.js';
import { doctor } from '../src/doctor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read version from package.json
const pkgPath = join(__dirname, '../package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

const program = new Command();

program
  .name('hydejs')
  .description('A Node.js-based static site generator inspired by Jekyll')
  .version(pkg.version);

program
  .command('new <path>')
  .description('Creates a new HydeJS site at specified path')
  .option('--blank', 'Creates a blank site scaffold')
  .option('--theme <name>', 'Theme to use for scaffolding', '@hydejs/theme-default')
  .action(async (path, options) => {
    await createNewSite(path, options.blank, options.theme);
  });

program
  .command('build')
  .alias('b')
  .description('Performs a one-off build of your site')
  .option('-s, --source <dir>', 'Source directory')
  .option('-d, --destination <dir>', 'Destination directory')
  .action(async (options) => {
    const source = options.source || process.cwd();
    const config = loadConfig(source);
    config.source = source;
    if (options.destination) {
      config.destination = options.destination;
    }
    await build(config);
  });

program
  .command('serve')
  .alias('s')
  .description('Builds site and serves it locally with live-reload')
  .option('-s, --source <dir>', 'Source directory')
  .option('-d, --destination <dir>', 'Destination directory')
  .option('--config <path>', 'Alternative configuration file')
  .action(async (options) => {
    const source = options.source || process.cwd();
    const config = loadConfig(source);
    config.source = source;
    if (options.destination) {
      config.destination = options.destination;
    }
    await serve(config);
  });

program
  .command('clean')
  .description('Removes all generated files')
  .option('-s, --source <dir>', 'Source directory')
  .option('-d, --destination <dir>', 'Destination directory')
  .action(async (options) => {
    const source = options.source || process.cwd();
    const config = loadConfig(source);
    config.source = source;
    if (options.destination) {
      config.destination = options.destination;
    }
    await clean(config);
  });

program
  .command('install')
  .description('Installs and converts a Jekyll theme from a repository')
  .requiredOption('-t, --theme <repo_url>', 'URL of the Jekyll theme repository')
  .action(async (options) => {
    await installTheme(options.theme);
  });

program
  .command('new-theme <name>')
  .description('Creates a new HydeJS theme scaffold')
  .action(async (name) => {
    await createNewTheme(name);
  });

program
  .command('doctor')
  .description('Outputs any deprecation or configuration issues')
  .action(() => {
    doctor();
  });

program.parse();
