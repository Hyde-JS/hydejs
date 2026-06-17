import MarkdownIt from 'markdown-it';

let md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});

export function parseMarkdown(content, highlighter) {
  if (highlighter) {
    md.set({
      highlight: (code, lang) => {
        try {
          return highlighter.codeToHtml(code, {
            lang: lang || 'text',
            theme: 'github-light'
          });
        } catch (e) {
          return ''; // use external default escaping
        }
      }
    });
  }
  const html = md.render(content);
  return { html };
}
