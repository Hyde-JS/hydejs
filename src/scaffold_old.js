import fs from 'fs-extra';
import { join } from 'path';

export async function createNewSite(destPath, isBlank = false) {
  await fs.ensureDir(destPath);

  const dirs = ['_posts', '_layouts', '_includes', '_data', 'assets', 'assets/css'];
  for (const dir of dirs) {
    await fs.ensureDir(join(destPath, dir));
  }

  const configContent = `title: My HydeJS Site
description: >-
  Write an awesome description for your new site here. You can edit this
  line in _config.yml. It will appear in your document head meta (for
  Google search results) and in your feed.xml site description.
baseurl: ""
url: "http://example.com"
twitter_username: jekyllrb
github_username: jekyll
`;
  await fs.writeFile(join(destPath, '_config.yml'), configContent);

  if (isBlank) {
    console.log(`New blank site created at ${destPath}`);
    return;
  }

  // Assets
  const mainCss = `body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
  line-height: 1.6;
  color: #333;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}
header { border-bottom: 1px solid #eee; margin-bottom: 2rem; }
footer { border-top: 1px solid #eee; margin-top: 2rem; color: #777; font-size: 0.9rem; }
h1, h2, h3 { color: #111; }
a { color: #007bff; text-decoration: none; }
a:hover { text-decoration: underline; }
.post-meta { color: #828282; }
`;
  await fs.writeFile(join(destPath, 'assets/css/main.css'), mainCss);

  // Includes
  await fs.writeFile(join(destPath, '_includes/head.html'), `<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{ page.title }} | {{ site.title }}</title>
  <link rel="stylesheet" href="/assets/css/main.css">
</head>`);

  await fs.writeFile(join(destPath, '_includes/header.html'), `<header>
  <h1><a href="/">{{ site.title }}</a></h1>
  <nav>
    <a href="/about.html">About</a>
  </nav>
</header>`);

  await fs.writeFile(join(destPath, '_includes/footer.html'), `<footer>
  <p>{{ site.description }}</p>
  <p>&copy; {{ site.time | date: "%Y" }} {{ site.title }}</p>
</footer>`);

  // Layouts
  await fs.writeFile(join(destPath, '_layouts/default.html'), `<!DOCTYPE html>
<html lang="en">
{% include "head.html" %}
<body>
  {% include "header.html" %}
  <main>
    {{ content }}
  </main>
  {% include "footer.html" %}
</body>
</html>`);

  await fs.writeFile(join(destPath, '_layouts/post.html'), `---
layout: default
---
<article>
  <header>
    <h1>{{ page.title }}</h1>
    <p class="post-meta">{{ page.date | date: "%b %d, %Y" }}</p>
  </header>
  <div class="post-content">
    {{ content }}
  </div>
</article>`);

  await fs.writeFile(join(destPath, '_layouts/page.html'), `---
layout: default
---
<article>
  <header>
    <h1>{{ page.title }}</h1>
  </header>
  <div class="page-content">
    {{ content }}
  </div>
</article>`);

  // Content
  await fs.writeFile(join(destPath, 'index.md'), `---
layout: default
title: Home
---
# Welcome to HydeJS!

This is your new static site generated with Node.js.

## Recent Posts
<ul>
{% for post in site.posts %}
  <li>
    <a href="{{ post.url }}">{{ post.title }}</a>
    <span class="post-meta">- {{ post.date | date: "%b %d, %Y" }}</span>
  </li>
{% endfor %}
</ul>`);

  await fs.writeFile(join(destPath, 'about.md'), `---
layout: page
title: About
---
This is the about page for your HydeJS site. 

HydeJS is a static site generator built with Node.js, LiquidJS, and Markdown-it.
`);

  const today = new Date().toISOString().split('T')[0];
  const samplePost = `---
layout: post
title: Welcome to HydeJS!
date: ${today}
categories: hydejs update
---
You'll find this post in your \`_posts\` directory. Go ahead and edit it and re-build the site to see your changes.

HydeJS is designed to be a familiar alternative to Jekyll for Node.js developers. It supports:
- Markdown content
- Liquid templating
- YAML Frontmatter
- Live-reloading during development

Check out the [HydeJS documentation](https://github.com/mjmiller41/hyde-js) for more info on how to get the most out of your site.
`;
  await fs.writeFile(join(destPath, `_posts/${today}-welcome-to-hydejs.md`), samplePost);

  console.log(`New site created at ${destPath}`);
}

export async function createNewTheme(themeName) {
  const destPath = themeName;
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
