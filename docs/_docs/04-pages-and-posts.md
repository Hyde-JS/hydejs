---
layout: doc
title: Pages & Posts
---

In HydeJS, content is created either as standalone **Pages** or chronological **Posts**.

---

## Front Matter

Any file containing a triple-dash (`---`) block at the top is processed by the compiler. This header contains YAML metadata parameters:

```yaml
---
layout: post
title: "Introducing HydeJS"
date: 2026-06-18 12:00:00 -0400
tags: [node, compiler]
---
Post markdown goes here.
```

---

## Pages

Pages are standalone files placed anywhere in your project directories.
*   **Routing**: The URL of a page matches its directory hierarchy. For example, `services/design.md` compiles to `services/design.html` (accessible at `/services/design/`).
*   **Custom URLs**: You can override the route by defining a custom `permalink` in the page's front matter:
    ```yaml
    permalink: /custom-route/
    ```

---

## Blog Posts

Posts represent date-ordered articles (like newsletters or announcements) located inside `_posts/`.

*   **Filename Format**: Files must follow the date structure: `YYYY-MM-DD-title-slug.md`.
*   **Automatic Parsing**: If `date` or `title` are omitted in the front matter, HydeJS automatically extracts them from the filename. E.g. `2026-06-18-welcome.md` sets the date to `2026-06-18` and the title to `Welcome`.
*   **Iteration**: Loop through posts in layouts using the `site.posts` namespace:
    ```html
    {% raw %}{% for post in site.posts %}
      <h2><a href="{{ post.url }}">{{ post.title }}</a></h2>
      <p>{{ post.excerpt }}</p>
    {% endfor %}{% endraw %}
    ```

---

## Native Pagination

To split your lists of blog posts across multiple pages, specify a pagination limit in `_config.yml`:

```yaml
paginate: 5
paginate_path: "page:num/"
```

When pagination is active, HydeJS paginates the homepage (`index.md` or `index.html`) automatically and exposes a local `paginator` object:

```html
{% raw %}{% for post in paginator.posts %}
  <h2>{{ post.title }}</h2>
{% endfor %}

{% if paginator.next_page_path %}
  <a href="{{ paginator.next_page_path }}">Older Posts</a>
{% endif %}{% endraw %}
```
