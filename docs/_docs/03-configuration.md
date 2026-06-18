---
layout: doc
title: Configuration
---

Global settings and metadata are declared in the `_config.yml` file located at the root of your project directory.

---

## Configuration Settings

If a key is omitted from your configuration file, HydeJS automatically falls back to these default variables:

| Key | Default | Description |
| :--- | :--- | :--- |
| `title` | `My HydeJS Site` | The title of your website. |
| `description` | `A Node.js-based static site generator` | Short description for SEO meta headers. |
| `author` | `{ name: "HydeJS User", email: "user@example.com" }` | Default author information. |
| `source` | `.` | Root directory of your site files. |
| `destination` | `_site` | Target folder for built assets. |
| `layouts_dir` | `_layouts` | Directory containing page templates. |
| `posts_dir` | `_posts` | Directory containing blog posts. |
| `includes_dir` | `_includes` | Directory containing layout partials. |
| `data_dir` | `_data` | Directory containing data JSON/YAMLs. |
| `collections_dir`| *null* | Directory containing all collection folders. |
| `baseurl` | `""` | Subpath your site is served from (e.g. `/blog`). |
| `url` | `""` | The full domain URL (e.g. `https://mysite.com`). |
| `paginate` | `0` | Number of posts per page on paginated templates. |
| `paginate_path` | `page:num/` | Destination subfolder index for paginated posts. |

---

## Accessing Configuration Variables

All variables specified in your configuration file are exposed globally in your Liquid templates under the `site` namespace.

```html
{% raw %}<h1>{{ site.title }}</h1>
<p>{{ site.description }}</p>{% endraw %}
```

---

## Custom Settings

You can add any custom attributes to `_config.yml`, and they will immediately become accessible in templates:

```yaml
socials:
  github: https://github.com/mjmiller41
  twitter: https://twitter.com/jekyllrb
```

Exposing in template:
```html
{% raw %}<a href="{{ site.socials.github }}">GitHub Link</a>{% endraw %}
```
