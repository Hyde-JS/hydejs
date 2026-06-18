import browserSync from 'browser-sync';
import chokidar from 'chokidar';
import { join, resolve } from 'path';
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

  const absSource = resolve(config.source);
  const absDest = resolve(config.source, config.destination);

  const watcher = chokidar.watch(absSource, {
    ignored: (filePath) => {
      // Ignore dotfiles
      if (/(^|[\/\\])\../.test(filePath)) return true;
      // Ignore node_modules
      if (filePath.includes('node_modules')) return true;
      // Ignore git folder
      if (filePath.includes('.git')) return true;
      
      // Ignore build destination folder and its children
      const absFilePath = resolve(filePath);
      if (absFilePath.startsWith(absDest)) return true;
      
      return false;
    },
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
