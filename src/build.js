import fs from 'fs-extra';
import { join, dirname, relative, extname, parse } from 'path';
import { fileURLToPath } from 'url';
import { loadConfig } from './config.js';
import { getFiles, isMarkdown, isHtml } from './fs.js';
import { parseMarkdown } from './markdown.js';
import { createLiquidEngine, getHighlighterInstance } from './liquid.js';
import matter from 'gray-matter';
import * as sass from 'sass';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function clean(config) {
  const dest = join(config.source, config.destination);
  await fs.remove(dest);
  console.log(`Cleaned ${config.destination}`);
}

async function renderWithLayout(liquid, content, pageData, layoutName, config) {
  if (!layoutName) return content;

  const layoutPath = join(config.source, config.layouts_dir, `${layoutName}.html`);
  if (!fs.existsSync(layoutPath)) {
    console.warn(`Layout ${layoutName} not found at ${layoutPath}`);
    return content;
  }

  const layoutFile = await fs.readFile(layoutPath, 'utf8');
  const { data: layoutData, content: layoutContent } = matter(layoutFile);

  const rendered = await liquid.parseAndRender(layoutContent, {
    ...pageData,
    content
  });

  if (layoutData.layout) {
    return renderWithLayout(liquid, rendered, pageData, layoutData.layout, config);
  }

  return rendered;
}

async function loadData(config) {
  const dataDir = join(config.source, config.data_dir);
  const data = {};
  if (fs.existsSync(dataDir)) {
    const files = await getFiles(dataDir, '**/*.{yml,yaml,json}');
    for (const file of files) {
      const name = parse(file).name;
      const content = await fs.readFile(join(dataDir, file), 'utf8');
      if (file.endsWith('.json')) {
        data[name] = JSON.parse(content);
      } else {
        data[name] = yaml.load(content);
      }
    }
  }
  return data;
}

export async function build(config) {
  const sourceDir = config.source;
  const destDir = join(sourceDir, config.destination);
  const liquid = await createLiquidEngine(config);

  await fs.ensureDir(destDir);

  const allFiles = await getFiles(sourceDir);
  const siteDataObj = await loadData(config);
  
  const pages = [];
  const posts = [];

  const filesToProcess = allFiles.filter(f => {
    return !f.startsWith('_') && !f.startsWith('.') && !f.startsWith('node_modules') && !f.startsWith(config.destination);
  });

  const postFiles = await getFiles(join(sourceDir, config.posts_dir), '**/*.{md,markdown}');
  const allFilesToProcess = [
    ...filesToProcess.map(f => ({ path: f, isPost: false })),
    ...postFiles.map(f => ({ path: join(config.posts_dir, f), isPost: true }))
  ];

  for (const item of allFilesToProcess) {
    const filePath = join(sourceDir, item.path);
    if ((await fs.stat(filePath)).isDirectory()) continue;

    const url = '/' + item.path.replace(/\.(md|markdown)$/, '.html').replace(/index\.html$/, '');
    
    if (isMarkdown(item.path) || isHtml(item.path)) {
      const content = await fs.readFile(filePath, 'utf8');
      const { data, content: body } = matter(content);
      
      // Jekyll-like inference for posts
      if (item.isPost) {
        const filename = parse(item.path).name;
        const match = filename.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
        if (match) {
          if (!data.date) data.date = new Date(match[1] + 'T00:00:00');
          if (!data.title) {
            data.title = match[2]
              .split('-')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
          }
        }
      }

      const pageInfo = {
        ...data,
        body,
        url: data.permalink || url.replace(/^\/_posts\//, '/'), // Match Jekyll's clean post URLs
        path: item.path,
        isPost: item.isPost
      };

      if (item.isPost) {
        posts.push(pageInfo);
      } else {
        pages.push(pageInfo);
      }
    } else if (extname(item.path) === '.scss' || extname(item.path) === '.sass') {
      const content = await fs.readFile(filePath, 'utf8');
      const { data, content: body } = matter(content);
      pages.push({ 
        path: item.path, 
        isSass: true, 
        body,
        data,
        url: '/' + item.path.replace(/\.s[ac]ss$/, '.css') 
      });
    } else {
      pages.push({
        path: item.path,
        isAsset: true,
        url: '/' + item.path
      });
    }
  }

  posts.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  const siteData = {
    ...config,
    data: siteDataObj,
    posts,
    pages,
    time: new Date(),
    jekyll: {
      environment: process.env.NODE_ENV || 'development'
    },
    hydejs: {
      environment: process.env.NODE_ENV || 'development',
      version: '0.1.0'
    }
  };

  const pagesToRender = [];
  const paginateLimit = parseInt(config.paginate);
  const paginatePath = config.paginate_path || 'page:num/';

  for (const page of [...pages, ...posts]) {
    // Check if this page should be paginated
    // Jekyll usually paginates the index page if paginate is set
    const isIndexPage = page.path === 'index.md' || page.path === 'index.html';
    
    if (isIndexPage && paginateLimit > 0 && posts.length > 0) {
      const totalPages = Math.ceil(posts.length / paginateLimit);
      
      for (let i = 1; i <= totalPages; i++) {
        const start = (i - 1) * paginateLimit;
        const end = start + paginateLimit;
        const pagePosts = posts.slice(start, end);
        
        const paginator = {
          page: i,
          per_page: paginateLimit,
          posts: pagePosts,
          total_posts: posts.length,
          total_pages: totalPages,
          previous_page: i > 1 ? i - 1 : null,
          previous_page_path: i === 2 ? '/' : (i > 2 ? '/' + paginatePath.replace(':num', i - 1) : null),
          next_page: i < totalPages ? i + 1 : null,
          next_page_path: i < totalPages ? '/' + paginatePath.replace(':num', i + 1) : null
        };

        const pageUrl = i === 1 ? '/' : '/' + paginatePath.replace(':num', i);
        const paginatedPage = {
          ...page,
          url: pageUrl,
          paginator,
          // For the output path
          customDestPath: i === 1 ? 'index.html' : join(paginatePath.replace(':num', i), 'index.html')
        };
        pagesToRender.push(paginatedPage);
      }
    } else {
      pagesToRender.push(page);
    }
  }

  for (const page of pagesToRender) {
    let destPathRelative = page.customDestPath || page.path.replace(/\.(md|markdown)$/, '.html').replace(/\.s[ac]ss$/, '.css');
    
    if (!page.customDestPath && (page.isPost || page.permalink)) {
      const url = page.url;
      if (url.endsWith('/')) {
        destPathRelative = join(url, 'index.html');
      } else if (!extname(url)) {
        destPathRelative = url + '.html';
      } else {
        destPathRelative = url;
      }
      
      // Ensure relative path doesn't start with /
      if (destPathRelative.startsWith('/')) {
        destPathRelative = destPathRelative.slice(1);
      }
    }

    const destPath = join(destDir, destPathRelative);
    await fs.ensureDir(dirname(destPath));

    if (page.isAsset) {
      await fs.copy(join(sourceDir, page.path), destPath);
      continue;
    }

    const pageData = {
      page,
      site: siteData,
      paginator: page.paginator // Will be undefined for non-paginated pages
    };

    if (page.isSass) {
      try {
        const renderedSass = await liquid.parseAndRender(page.body, pageData);
        const result = sass.compileString(renderedSass, {
          loadPaths: [join(sourceDir, '_sass'), join(sourceDir, 'assets')],
          syntax: extname(page.path) === '.sass' ? 'indented' : 'scss',
          quietDeps: true,
          silenceDeprecations: ['import', 'global-builtin', 'color-functions']
        });
        await fs.writeFile(destPath, result.css);
      } catch (err) {
        console.error(`Sass error in ${page.path}:`, err.message);
      }
      continue;
    }

    try {
      const liquidRenderedBody = await liquid.parseAndRender(page.body, pageData);
      const highlighter = await getHighlighterInstance();
      const htmlContent = isMarkdown(page.path) ? parseMarkdown(liquidRenderedBody, highlighter).html : liquidRenderedBody;
      const finalHtml = await renderWithLayout(liquid, htmlContent, pageData, page.layout, config);
      await fs.writeFile(destPath, finalHtml);
    } catch (err) {
      console.error(`Error rendering ${page.path}:`, err.stack);
    }
  }

  console.log('Build complete');
}
