---
layout: doc
title: Liquid Filters & Tags
---

HydeJS integrates custom overrides and filter additions on top of LiquidJS to achieve Jekyll parity.

---

## Template Tags

### 1. `seo`
Automatically generates standardized SEO header tags (meta description, site title, generator info, canonical URL, open graph mappings, etc.) based on your site config and page front matter.

```html
{% raw %}<head>
  {% seo %}
</head>{% endraw %}
```

### 2. `feed_meta`
Renders an alternate feed link tag mapping.

```html
{% raw %}{% feed_meta %}
<!-- Renders: <link rel="alternate" type="application/rss+xml" title="Feed Stub" href="/feed.xml"> -->{% endraw %}
```

### 3. `highlight`
Wraps syntax highlighted code snippets using Shiki. The first parameter specifies the language token:

```liquid
{% raw %}{% highlight javascript %}
const greet = () => console.log("Hello, World!");
{% endhighlight %}{% endraw %}
```

---

## Template Filters

### `compact`
Filters out `null`, `undefined`, and `""` (empty string) values from arrays.
```liquid
{% raw %}{{ array | compact | join: ", " }}{% endraw %}
```

### `where`
Filters a list of objects matching a key/value criteria.
```liquid
{% raw %}{% assign filtered = site.pages | where: "layout", "post" %}{% endraw %}
```

### `markdownify`
Converts markdown text to HTML format on the fly.
```liquid
{% raw %}{{ page.description_markdown | markdownify }}{% endraw %}
```

### `sort`
Sorts arrays alphabetically, or sorts lists of objects by a designated key.
```liquid
{% raw %}{% assign sorted_members = site.team | sort: "order" %}{% endraw %}
```

### `group_by`
Aggregates lists of objects into arrays grouped by property.
```liquid
{% raw %}{% assign posts_by_author = site.posts | group_by: "author" %}{% endraw %}
```

### `json`
Serializes object datasets into formatted JSON strings.
```liquid
{% raw %}<script>
  const pageData = {{ page | json }};
</script>{% endraw %}
```

### `relative_url`
Prepends the site's `baseurl` to create relative links.
```liquid
{% raw %}<link rel="stylesheet" href="{{ '/assets/css/style.css' | relative_url }}">{% endraw %}
```

### `absolute_url`
Combines site's `url` and `baseurl` to build absolute URLs (ideal for metadata headers and RSS links).
```liquid
{% raw %}<link rel="canonical" href="{{ page.url | absolute_url }}">{% endraw %}
```
