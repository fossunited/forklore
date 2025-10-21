## Get Featured

Looking to get yourself up there along with others? It's easy!

### Prerequisites:

- Be an open-source maintainer, who has at-least one open source project which they actively maintain.

### Steps:

- Open a "Get Featured" issue via https://github.com/fossunited/forklore/issues/new/choose
- Add your information and responses to the questions in the issue template

## Submit a blog post

You can submit a blog post by creating a pull request that adds a Markdown file to the `content/blog/` directory.

### Steps:

1. Create markdown file:

```sh
touch content/blog/<your-post-slug>.md
```

2. Add front-matter metadata to top of the file:

```markdown
---
title: TITLE
author: username # (if in maintainers list) or simple name to represent
date: 2025-10-17 # ISO format: YYYY-MM-DD
description: A short summary of your post that appears in previews.
tags: ["blog", "example", "topic"] # keep it short
---
```

That's it, you can do `yarn run dev` to see the live changes in localhost:3000 or do a PR and let us take care!
