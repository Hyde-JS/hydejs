import browserSync from 'browser-sync';
import chokidar from 'chokidar';
import { join } from 'path';
import { build } from './build.js';

export async function serve(config) {
  const bs = browserSync.create();
  const destDir = join(config.source, config.destination);

  // Initial build
  await build(config);

  bs.init({
    server: destDir,
    port: 4000,
    open: false,
    notify: false,
    ui: false
  });

  const watcher = chokidar.watch(config.source, {
    ignored: [
      /(^|[\/\\])\../, // ignore dotfiles
      join(config.source, config.destination, '**'),
      '**/node_modules/**',
      '.git/**'
    ],
    persistent: true,
    ignoreInitial: true
  });

  const handleReload = async (path) => {
    console.log(`File ${path} changed, rebuilding...`);
    try {
      await build(config);
      bs.reload();
    } catch (err) {
      console.error('Build failed:', err);
    }
  };

  watcher
    .on('add', handleReload)
    .on('change', handleReload)
    .on('unlink', handleReload);

  console.log(`Server started at http://localhost:4000`);
}
