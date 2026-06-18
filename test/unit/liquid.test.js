import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { createLiquidEngine } from '../../src/liquid.js';

describe('Liquid Engine', () => {
  let engine;
  const mockConfig = {
    source: '.',
    layouts_dir: '_layouts',
    includes_dir: '_includes',
    title: 'Test Site',
    description: 'Test Site Description',
    url: 'http://test.com',
    baseurl: '/blog'
  };

  before(async () => {
    engine = await createLiquidEngine(mockConfig);
  });

  describe('Filters', () => {
    test('compact filter should remove null, undefined, and empty string elements', async () => {
      const template = '{{ array | compact | join: "," }}';
      const context = { array: ['a', null, 'b', undefined, '', 'c'] };
      const result = await engine.parseAndRender(template, context);
      assert.equal(result, 'a,b,c');
    });

    test('where filter should filter array of objects by key/value', async () => {
      const template = '{% assign filtered = items | where: "category", "news" %}{{ filtered | map: "title" | join: "," }}';
      const context = {
        items: [
          { title: 'A', category: 'news' },
          { title: 'B', category: 'sports' },
          { title: 'C', category: 'news' }
        ]
      };
      const result = await engine.parseAndRender(template, context);
      assert.equal(result, 'A,C');
    });

    test('markdownify filter should parse markdown to HTML', async () => {
      const template = '{{ content | markdownify }}';
      const context = { content: 'This is **bold**' };
      const result = await engine.parseAndRender(template, context);
      assert.match(result, /This is <strong>bold<\/strong>/);
    });

    test('markdownify filter should return empty string for non-string input', async () => {
      const template = '{{ content | markdownify }}';
      const context = { content: null };
      const result = await engine.parseAndRender(template, context);
      assert.equal(result, '');
    });

    test('sort filter should sort elements in an array', async () => {
      const template = '{{ array | sort | join: "," }}';
      const context = { array: ['c', 'a', 'b'] };
      const result = await engine.parseAndRender(template, context);
      assert.equal(result, 'a,b,c');
    });

    test('sort filter should sort objects by key', async () => {
      const template = '{% assign sorted = items | sort: "order" %}{{ sorted | map: "name" | join: "," }}';
      const context = {
        items: [
          { name: 'A', order: 3 },
          { name: 'B', order: 1 },
          { name: 'C', order: 2 }
        ]
      };
      const result = await engine.parseAndRender(template, context);
      assert.equal(result, 'B,C,A');
    });

    test('group_by filter should group array elements by property', async () => {
      const template = '{% assign groups = items | group_by: "category" %}{% for g in groups %}{{ g.name }}:{{ g.items | map: "name" | join: ";" }} {% endfor %}';
      const context = {
        items: [
          { name: 'A', category: 'x' },
          { name: 'B', category: 'y' },
          { name: 'C', category: 'x' }
        ]
      };
      const result = await engine.parseAndRender(template, context);
      assert.match(result, /x:A;C/);
      assert.match(result, /y:B/);
    });

    test('json filter should return a pretty-printed JSON string', async () => {
      const template = '{{ obj | json }}';
      const context = { obj: { foo: 'bar' } };
      const result = await engine.parseAndRender(template, context);
      assert.deepEqual(JSON.parse(result), { foo: 'bar' });
    });

    test('relative_url filter should prepend baseurl', async () => {
      const template = '{{ "/assets/style.css" | relative_url }}';
      const context = {
        site: {
          baseurl: '/my-sub-path'
        }
      };
      const result = await engine.parseAndRender(template, context);
      assert.equal(result, '/my-sub-path/assets/style.css');
    });

    test('absolute_url filter should prefix url and baseurl', async () => {
      const template = '{{ "/assets/style.css" | absolute_url }}';
      const context = {
        site: {
          url: 'https://example.com',
          baseurl: '/my-sub-path'
        }
      };
      const result = await engine.parseAndRender(template, context);
      assert.equal(result, 'https://example.com/my-sub-path/assets/style.css');
    });
  });

  describe('Tags', () => {
    test('feed_meta tag should render alternate RSS link', async () => {
      const template = '{% feed_meta %}';
      const result = await engine.parseAndRender(template, {});
      assert.match(result, /<link rel="alternate" type="application\/rss\+xml"/);
    });

    test('seo tag should render title, og:title, generator, and canonical url', async () => {
      const template = '{% seo %}';
      const context = {
        site: {
          title: 'My Site',
          description: 'Default Description',
          url: 'https://mysite.com'
        },
        page: {
          title: 'About Page',
          description: 'Page Description',
          url: '/about/'
        }
      };
      const result = await engine.parseAndRender(template, context);
      assert.match(result, /<title>About Page \| My Site<\/title>/);
      assert.match(result, /<meta name="description" content="Page Description" \/>/);
      assert.match(result, /<meta name="generator" content="HydeJS v/);
      assert.match(result, /<link rel="canonical" href="https:\/\/mysite\.com\/about\/" \/>/);
    });

    test('highlight tag should render text inside highlighter tags', async () => {
      const template = '{% highlight javascript %}const test = 123;{% endhighlight %}';
      const result = await engine.parseAndRender(template, {});
      // Shiki renders code inside class-highlighted divs or spans
      assert.match(result, /test/);
      assert.match(result, /123/);
    });
  });
});
