import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { parseMarkdown } from '../../src/markdown.js';

describe('Markdown Parser', () => {
  test('should parse simple markdown content into HTML', () => {
    const markdown = '# Hello World\nThis is a **bold** text.';
    const result = parseMarkdown(markdown);
    assert.match(result.html, /<h1>Hello World<\/h1>/);
    assert.match(result.html, /This is a <strong>bold<\/strong> text\./);
  });

  test('should support inline html rendering', () => {
    const markdown = '<div>HTML block</div>';
    const result = parseMarkdown(markdown);
    assert.match(result.html, /<div>HTML block<\/div>/);
  });

  test('should support typographer and linkify transformations', () => {
    const markdown = 'Go to https://example.com and see +- (plus-minus).';
    const result = parseMarkdown(markdown);
    assert.match(result.html, /<a href="https:\/\/example\.com">https:\/\/example\.com<\/a>/);
    assert.match(result.html, /±/); // +- typographer output
  });

  test('should use syntax highlighter when provided', () => {
    const markdown = '```javascript\nconst a = 1;\n```';
    const mockHighlighter = {
      codeToHtml: (code, options) => {
        return `<pre class="mock-shiki" data-lang="${options.lang}">${code.trim()}</pre>`;
      }
    };
    const result = parseMarkdown(markdown, mockHighlighter);
    assert.match(result.html, /<pre class="mock-shiki" data-lang="javascript">const a = 1;<\/pre>/);
  });

  test('should fallback gracefully if highlighter throws an error', () => {
    const markdown = '```javascript\nconst a = 1;\n```';
    const mockHighlighterWithError = {
      codeToHtml: () => {
        throw new Error('Highlighter failed');
      }
    };
    // If highlighter throws, markdown-it will use external default escaping
    const result = parseMarkdown(markdown, mockHighlighterWithError);
    assert.match(result.html, /<pre><code class="language-javascript">const a = 1;/);
  });
});
