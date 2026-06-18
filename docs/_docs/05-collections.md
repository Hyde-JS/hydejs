---
layout: doc
title: Jekyll Collections
---

Collections allow you to group related contents (e.g. project portfolios, team members, tutorials) that do not fit the chronological post format.

---

## 1. Setup in `_config.yml`

Define your custom collections in the config file.

*   **Sequence (Array)**: Sets collection items to private metadata by default (`output: false`):
    ```yaml
    collections:
      - team
      - services
    ```
*   **Mapping (Object)**: Allows custom output flags and custom routing patterns:
    ```yaml
    collections:
      portfolio:
        output: true
        permalink: /projects/:path/
    ```

---

## 2. Directory Layout

Place collection files inside root directories named identically to the collection name, prefixed with an underscore:
```text
my-blog/
├── _team/
│   ├── alice-smith.md
│   └── bob-jones.md
└── _portfolio/
    ├── project-one.md
    └── project-two.md
```

---

## 3. Exposing in Templates

Collection documents are accessible on the site object via their collection name:

```html
{% raw %}<ul>
  {% for member in site.team %}
    <li>{{ member.name }} - {{ member.role }}</li>
  {% endfor %}
</ul>{% endraw %}
```

You can inspect all collections metadata using the `site.collections` variable:
```html
{% raw %}{% for collection in site.collections %}
  <p>Collection Label: {{ collection.label }} (Docs count: {{ collection.docs.size }})</p>
{% endfor %}{% endraw %}
```

---

## 4. Output Render Switches

*   **`output: false`** (Default): Documents are parsed and accessible via Liquid iterations, but no HTML files are generated for them in the `_site/` directory.
*   **`output: true`**: HydeJS compiles each document in the collection into its own HTML file inside the build directory.

---

## 5. Permalinks

For output-enabled collections, customize the generated route patterns using standard Jekyll placeholders:
*   `:collection` – replaced with collection name (e.g. `portfolio`).
*   `:path` – replaced with relative path of the file sans extension (useful for matching subdirectory folders).
*   `:name` or `:title` – replaced with filename base name without extension.

```yaml
permalink: /work/:collection/:path/
```

---

## 6. Document Sorting

Choose how collection documents are sorted in Liquid lists:
*   **Default Sort**: Sorts by `date` key if present, breaking ties alphabetically by the file's path.
*   **Front Matter Key (`sort_by`)**: Sorts by increasing value of a designated front matter field:
    ```yaml
    collections:
      portfolio:
        sort_by: order_index
    ```
*   **Manual Order (`order`)**: Rearranges documents by specifying their filenames sequentially:
    ```yaml
    collections:
      tutorials:
        order:
          - introduction.md
          - basic-concepts.md
          - sub/advanced.md
    ```
