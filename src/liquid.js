import { Liquid } from 'liquidjs';
import { join } from 'path';
import { parseMarkdown } from './markdown.js';
import { createHighlighter } from 'shiki';

let highlighter;

export async function getHighlighterInstance() {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: ['github-light', 'github-dark'],
      langs: [
        'javascript', 'typescript', 'ruby', 'python', 'html', 'css', 
        'scss', 'sass', 'bash', 'json', 'yaml', 'markdown', 'diff', 'liquid',
        'c', 'cpp', 'java', 'go', 'rust', 'php', 'sql'
      ]
    });
  }
  return highlighter;
}

export async function createLiquidEngine(config) {
  await getHighlighterInstance();

  const engine = new Liquid({
    root: [
      join(config.source, config.layouts_dir),
      join(config.source, config.includes_dir)
    ],
    extname: '.html',
    strictFilters: false,
    strictVariables: false,
    dynamicPartials: false
  });

  // Register Jekyll plugin stubs
  engine.registerTag('seo', {
    render: function(context) {
      const site = context.get(['site']);
      const page = context.get(['page']);
      const siteTitle = (site && site.title) || '';
      const pageTitle = (page && page.title) || '';
      const description = (page && page.description) || (site && site.description) || '';
      
      let title = siteTitle;
      if (pageTitle && siteTitle && pageTitle !== siteTitle) {
        title = `${pageTitle} | ${siteTitle}`;
      } else if (pageTitle) {
        title = pageTitle;
      }
      
      let output = title ? `<title>${title}</title>\n` : '';
      output += `<meta name="generator" content="HydeJS v0.1.0" />\n`;
      if (description) {
        output += `<meta name="description" content="${description}" />\n`;
      }
      output += `<meta property="og:title" content="${pageTitle || siteTitle}" />\n`;
      output += `<meta property="og:locale" content="${(page && page.lang) || (site && site.lang) || 'en_US'}" />\n`;
      output += `<link rel="canonical" href="${(site && site.url) || ''}${page && page.url}" />\n`;
      output += `<meta property="og:url" content="${(site && site.url) || ''}${page && page.url}" />\n`;
      output += `<meta property="og:site_name" content="${siteTitle}" />\n`;

      return output;
    }
  });

  engine.registerFilter('compact', (arr) => {
    if (!Array.isArray(arr)) return arr;
    return arr.filter(item => item !== null && item !== undefined && item !== '');
  });

  engine.registerFilter('where', (arr, key, value) => {
    if (!Array.isArray(arr)) return arr;
    return arr.filter(item => item[key] === value);
  });

  engine.registerFilter('markdownify', (content) => {
    const { html } = parseMarkdown(content, highlighter);
    return html;
  });

  engine.registerFilter('sort', (arr, property) => {
    if (!Array.isArray(arr)) return arr;
    const sorted = [...arr];
    return sorted.sort((a, b) => {
      const valA = property ? a[property] : a;
      const valB = property ? b[property] : b;
      if (valA < valB) return -1;
      if (valA > valB) return 1;
      return 0;
    });
  });

  engine.registerFilter('group_by', (arr, property) => {
    if (!Array.isArray(arr)) return arr;
    const groups = {};
    arr.forEach(item => {
      const key = item[property];
      if (!groups[key]) groups[key] = { name: key, items: [] };
      groups[key].items.push(item);
    });
    return Object.values(groups);
  });

  engine.registerFilter('json', (obj) => JSON.stringify(obj, null, 2));

  engine.registerTag('feed_meta', {
    render: () => '<link rel="alternate" type="application/rss+xml" title="Feed Stub" href="/feed.xml">'
  });

  engine.registerTag('highlight', {
    parse: function(tagToken, remainTokens) {
      const args = tagToken.args.trim().split(/\s+/);
      this.lang = args[0]; // First argument is the language
      // We ignore other Jekyll-specific args like mark_lines for now
      this.content = '';
      const stream = this.liquid.parser.parseStream(remainTokens);
      stream
        .on('token', token => {
          if (token.name === 'endhighlight') stream.stop();
          else this.content += token.getText();
        })
        .on('end', () => { throw new Error(`tag "highlight" not closed`); });
      stream.start();
    },
    render: async function() {
      try {
        const html = highlighter.codeToHtml(this.content, {
          lang: this.lang || 'text',
          theme: 'github-light'
        });
        return html;
      } catch (err) {
        console.warn(`Highlight error: ${err.message}. Falling back to plain code block.`);
        return `<pre><code>${this.content}</code></pre>`;
      }
    }
  });

  // Register Jekyll filters
  engine.registerFilter('relative_url', function(url) {
    const site = this.context.get(['site']);
    const baseurl = (site && site.baseurl) || '';
    if (!baseurl) return url;

    // Ensure baseurl starts with / but doesn't end with one, and url starts with /
    const normalizedBase = baseurl.startsWith('/') ? baseurl : `/${baseurl}`;
    const cleanBase = normalizedBase.endsWith('/') ? normalizedBase.slice(0, -1) : normalizedBase;
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    
    return `${cleanBase}${cleanUrl}`;
  });

  engine.registerFilter('absolute_url', function(url) {
    const site = this.context.get(['site']);
    const baseurl = (site && site.baseurl) || '';
    const url_root = (site && site.url) || '';
    if (!url_root && !baseurl) return url;

    const normalizedBase = baseurl.startsWith('/') ? baseurl : `/${baseurl}`;
    const cleanBase = normalizedBase.endsWith('/') ? normalizedBase.slice(0, -1) : normalizedBase;
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    const cleanRoot = url_root.endsWith('/') ? url_root.slice(0, -1) : url_root;

    return `${cleanRoot}${cleanBase}${cleanUrl}`;
  });

  return engine;
}
