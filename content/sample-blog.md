---
title: TITLE
author: username (if in maintainers list or simply name)
date: 2025-10-17 (ISO format YYYY-MM-DD)
description: Content appears as small description.
tags: ["blog", "hello"]
---

NOTE: Please start writing heading from level-2 (##)

## Heading One

Welcome to the **prose formatting demo**. This blog post covers most of the Markdown formatting styles you'll use.

## Heading Two

Lorem ipsum dolor sit amet, *consectetur* adipiscing elit. `Inline code` looks like this.

Here’s a simple [link to Nuxt](https://nuxt.com).

### Heading Three (`h3`)

> This is a blockquote.
> It supports multiple lines and renders with indentation.

#### Heading Four

- Unordered list item 1
- Unordered list item 2
  - Nested item
  - Another nested item
- Final unordered item

1. Ordered list item one
2. Ordered list item two
3. Ordered list item three

---

## 📸 Images

![forklore logo](../public/logo/logo.svg)

---

## 🧠 Code Blocks

### JavaScript Example

```js
export default defineNuxtConfig({
  modules: ['@nuxt/content'],
})
```


### Html

```html
<div class="prose dark:prose-invert">
  <p>Hello world</p>
</div>
```

## Table

| Key | Type      | Description |
| --- | --------- | ----------- |
| 1   | Wonderful | Table       |
| 2   | Wonderful | Data        |
| 3   | Wonderful | Website     |


| Feature        | Supported | Notes                      |
|----------------|-----------|----------------------------|
| Headings       | ✅        | `#`, `##`, `###`, etc.     |
| Lists          | ✅        | Ordered + unordered        |
| Code blocks    | ✅        | Syntax highlighting works  |
| Blockquotes    | ✅        | Fully styled               |
| Tables         | ✅        | Supported by Markdown      |
