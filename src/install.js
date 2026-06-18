import fs from 'fs-extra';
import { join, basename } from 'path';
import { convertTheme } from '@hydejs/jekyll-to-hyde';
import childProcess from 'child_process';
import yaml from 'js-yaml';

export async function installTheme(repoUrl) {
  const themeName = basename(repoUrl).replace(/\.git$/, '');
  const destDir = join(process.cwd(), '.hydejs-themes', themeName);

  try {
    console.log(`Installing Jekyll theme from ${repoUrl}...`);
    await convertTheme(repoUrl, destDir, themeName);

    console.log(`Linking theme locally...`);
    childProcess.execSync(`npm install file:.hydejs-themes/${themeName} --silent`, { stdio: 'inherit' });

    const scopedThemeName = `@hydejs/theme-${themeName}`;
    console.log(`Theme ${scopedThemeName} installed and linked.`);

    // Update _config.yml if it exists
    const configPath = join(process.cwd(), '_config.yml');
    if (fs.existsSync(configPath)) {
      const configContent = fs.readFileSync(configPath, 'utf8');
      const config = yaml.load(configContent) || {};
      
      if (config.theme !== scopedThemeName) {
        config.theme = scopedThemeName;
        fs.writeFileSync(configPath, yaml.dump(config));
        console.log(`Updated _config.yml to use theme: ${scopedThemeName}`);
      }
    } else {
      console.log(`No _config.yml found. Please set 'theme: ${scopedThemeName}' manually.`);
    }

  } catch (err) {
    console.error(`Failed to install theme: ${err.message}`);
    process.exit(1);
  }
}
