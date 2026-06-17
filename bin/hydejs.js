#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { loadConfig } from '../src/config.js';
import { build, clean } from '../src/build.js';
import { serve } from '../src/serve.js';
import { createNewSite, createNewTheme } from '../src/scaffold.js';
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
  .option('--theme <name>', 'Theme to use for scaffolding', 'minima')
  .action(async (path, options) => {
    await createNewSite(path, options.blank, options.theme);
  });

program
  .command('build')
  .alias('b')
  .description('Performs a one-off build of your site')
  .action(async () => {
    const config = loadConfig();
    await build(config);
  });

program
  .command('serve')
  .alias('s')
  .description('Builds site and serves it locally with live-reload')
  .option('--config <path>', 'Alternative configuration file')
  .action(async (options) => {
    const config = loadConfig();
    if (options.config) {
      // Handle alternative config if needed, for now just load default
    }
    await serve(config);
  });

program
  .command('clean')
  .description('Removes all generated files')
  .action(async () => {
    const config = loadConfig();
    await clean(config);
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
