(function () {
  const root = document.documentElement;
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const lightIcon = document.querySelector("[data-theme-icon-light]");
  const darkIcon = document.querySelector("[data-theme-icon-dark]");
  const logos = document.querySelectorAll("[data-theme-logo]");
  const footerLogo = document.querySelector("[data-footer-logo]");

  function setTheme(theme) {
    const isLight = theme === "light";
    root.classList.toggle("light-mode", isLight);
    root.classList.toggle("dark-mode", !isLight);
    localStorage.setItem("forklore-theme", isLight ? "light" : "dark");
    logos.forEach((logo) => {
      logo.setAttribute("src", isLight ? "/logo/logo_dark.svg" : "/logo/logo_light.svg");
    });
    footerLogo?.setAttribute(
      "src",
      isLight ? "/logo/unitedbyfoss_light.svg" : "/logo/unitedbyfoss_dark.svg",
    );
    if (themeToggle) {
      if (lightIcon) lightIcon.hidden = isLight;
      if (darkIcon) darkIcon.hidden = !isLight;
      themeToggle.setAttribute(
        "aria-label",
        isLight ? "Switch to Dark Mode" : "Switch to Light Mode",
      );
    }
  }

  setTheme(localStorage.getItem("forklore-theme") || "dark");
  themeToggle?.addEventListener("click", () => {
    setTheme(root.classList.contains("light-mode") ? "dark" : "light");
  });

  const hamburger = document.querySelector("[data-hamburger]");
  const siteNav = document.getElementById("site-nav");
  const navOverlay = document.getElementById("nav-overlay");

  function toggleNav(forceClose) {
    const open = forceClose ? false : !siteNav.classList.contains("open");
    siteNav.classList.toggle("open", open);
    navOverlay?.classList.toggle("open", open);
    hamburger?.setAttribute("aria-expanded", open ? "true" : "false");
  }

  hamburger?.addEventListener("click", () => toggleNav());
  navOverlay?.addEventListener("click", () => toggleNav(true));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && siteNav?.classList.contains("open")) toggleNav(true);
  });

  // ==========================================================================
  // Shared list utilities
  //
  // Both the maintainer directory and Planet Forklore are long, server
  // paginated lists. Search/sort/tag filtering has to reach every item, not
  // just the ones rendered on the current page, so each list publishes a JSON
  // index (/maintainers/cards.json, /planet/posts.json). The default (unfiltered)
  // view keeps the server-rendered cards and pager for fast first paint, SEO
  // and no-JS; the first time a filter is applied the index is fetched once
  // and the full matching set is rendered in place.
  // ==========================================================================

  const escapeHtml = (value) =>
    String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const normalize = (value) =>
    String(value || "")
      .trim()
      .toLowerCase();

  const indexCache = new Map();
  function fetchIndex(url) {
    if (indexCache.has(url)) return indexCache.get(url);
    const request = fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .catch((err) => {
        console.error(`Failed to load ${url}:`, err);
        return null;
      });
    indexCache.set(url, request);
    return request;
  }

  function formatDateISO(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toISOString();
  }

  function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function createIndexedList(cfg) {
    const container = cfg.container;
    if (!container) return null;
    const {
      searchInput,
      sortSelect,
      pager,
      emptyEl,
      indexUrl,
      cardSelector,
      render,
      itemText,
      itemTags,
      compare,
      domHaystack,
      domTags,
      defaultSort = "",
      syncUrl = false,
      emptyText = "No results found",
      fallbackText = "Could not load the full list. Showing matches from this page only.",
    } = cfg;
    const initialHtml = container.innerHTML;
    let generation = 0;

    function readState() {
      const params = new URLSearchParams(window.location.search);
      const query = normalize(
        syncUrl
          ? searchInput
            ? searchInput.value
            : params.get("search")
          : searchInput
            ? searchInput.value
            : "",
      );
      const tag = itemTags ? normalize(params.get("tag")) : "";
      const sort = sortSelect ? sortSelect.value || defaultSort : defaultSort;
      return {
        query,
        tag,
        sort,
        isDefault: !query && !tag && sort === defaultSort,
      };
    }

    function syncTags(tag) {
      if (!itemTags) return;
      document.querySelectorAll("[data-planet-tag]").forEach((button) => {
        const on = normalize(button.dataset.planetTag) === tag;
        button.classList.toggle("is-active", on);
        button.setAttribute("aria-pressed", on ? "true" : "false");
      });
    }

    function status(text) {
      if (!emptyEl) return;
      emptyEl.textContent = text;
      emptyEl.hidden = !text;
    }

    function showDefault() {
      container.innerHTML = initialHtml;
      if (pager) pager.hidden = false;
      status("");
    }

    function filterDom(query, tag) {
      let visible = 0;
      container.querySelectorAll(cardSelector).forEach((card) => {
        const haystack = normalize(domHaystack ? domHaystack(card) : card.textContent);
        const tags = domTags ? domTags(card) : [];
        const match = (!query || haystack.includes(query)) && (!tag || tags.includes(tag));
        card.hidden = !match;
        if (match) visible += 1;
      });
      return visible;
    }

    async function apply() {
      const current = ++generation;
      const { query, tag, sort, isDefault } = readState();
      syncTags(tag);

      if (isDefault) {
        showDefault();
        return;
      }

      const data = await fetchIndex(indexUrl);
      // A newer filter change may have started while awaiting; drop stale runs.
      if (current !== generation) return;

      // Index unavailable: degrade to the server-rendered page, keep the pager,
      // and say so, so an empty result is not read as "nothing matches anywhere".
      if (!data) {
        showDefault();
        const visible = filterDom(query, tag);
        status(visible ? "" : fallbackText);
        return;
      }

      let results = data.filter((item) => {
        const okQuery = !query || normalize(itemText(item)).includes(query);
        const okTag = !tag || (itemTags ? itemTags(item).map(normalize).includes(tag) : true);
        return okQuery && okTag;
      });
      if (compare && sort) results = results.slice().sort(compare(sort));

      // Full catalog is in hand, so the static pager no longer applies.
      if (pager) pager.hidden = true;
      if (!results.length) {
        container.innerHTML = "";
        status(emptyText);
      } else {
        container.innerHTML = results.map(render).join("");
        status("");
      }
    }

    return { apply, preload: () => fetchIndex(indexUrl) };
  }

  // ---- card renderers (kept in step with the Nunjucks card partials) ----

  function renderPlanetCard(post) {
    const title = escapeHtml(post.title || "Untitled");
    const username = escapeHtml(post.maintainerUsername || "");
    const authorName = escapeHtml(post.maintainerName || "");
    const photo = escapeHtml(post.maintainerPhoto || "/maintainer_photo_light.svg");
    const slug = escapeHtml(post.slug || "");
    const dateISO = escapeHtml(formatDateISO(post.pubDate));
    const dateText = formatDate(post.pubDate);
    const snippet = escapeHtml(post.contentSnippet || "");
    const link = escapeHtml(post.link || "");
    const tags = Array.isArray(post.tags) ? post.tags : [];

    const tagsHtml = tags.length
      ? `<div class="planet-tags">${tags
          .slice(0, 6)
          .map(
            (tag) =>
              `<button type="button" data-planet-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</button>`,
          )
          .join("")}</div>`
      : "";
    const originHtml = link
      ? `<a href="${link}" class="button subtle">Original <span aria-hidden="true">↗</span></a>`
      : "";

    return `<article class="planet-post" data-planet-post data-title="${title.toLowerCase()}" data-author="${authorName.toLowerCase()}" data-snippet="${snippet.toLowerCase()}" data-tags="${tags
      .map((tag) => escapeHtml(tag).toLowerCase())
      .join("|||")}">
  <div class="planet-post-title"><a href="/planet/${username}/${slug}/">${title}</a></div>
  <div class="planet-post-body">
    <div class="planet-post-meta">
      <a href="/planet/${username}/" class="planet-author-inline"><img src="${photo}" alt="" class="avatar tiny" width="24" height="24" loading="lazy" decoding="async">${authorName}</a>
      <span>·</span>
      <time datetime="${dateISO}">${dateText}</time>
    </div>
    ${tagsHtml}
    ${snippet ? `<p>${snippet}</p>` : ""}
    <div class="button-row">
      <a href="/planet/${username}/${slug}/" class="button subtle">Read more →</a>
      ${originHtml}
    </div>
  </div>
</article>`;
  }

  function renderMaintainerCard(maintainer) {
    const name = escapeHtml(maintainer.full_name || "");
    const username = escapeHtml(maintainer.username || "");
    const url = escapeHtml(maintainer.url || "");
    const photo = escapeHtml(maintainer.photo || "/maintainer_photo_light.svg");
    const created = escapeHtml(maintainer.created_on || "");
    const projectsText = escapeHtml(maintainer.projectsText || "");
    const projects = Array.isArray(maintainer.projects) ? maintainer.projects : [];
    const multi = projects.length > 1;
    const odd = projects.length % 2 === 1;
    const stripClass =
      "project-strip" +
      (multi ? " project-strip-grid" : "") +
      (multi && odd ? " project-strip-odd" : "");

    const projectHtml = projects
      .map((project) => {
        const projectName = escapeHtml(project.name || "");
        const logo = project.logo
          ? `<img src="${escapeHtml(project.logo)}" alt="Logo of ${projectName}" loading="lazy" decoding="async">`
          : `<div class="project-summary-logo-fallback" role="img" aria-label="Logo of ${projectName}"><span>${escapeHtml(project.shortLabel || "")}</span></div>`;
        const source = project.project_link
          ? `<a class="button subtle card-source" href="${escapeHtml(project.project_link)}">View Source <span aria-hidden="true">↗</span></a>`
          : "";
        // description is build-time rendered inline HTML (trusted).
        return `<div class="project-summary">${logo}<div><h3>${projectName}</h3>${source}<p>${project.description || ""}</p></div></div>`;
      })
      .join("");
    const filler =
      multi && odd
        ? `<div class="project-summary project-summary-empty" aria-hidden="true"></div>`
        : "";

    // designation is build-time rendered inline HTML (trusted).
    return `<article class="maintainer-card" data-maintainer-card data-name="${name}" data-username="${username}" data-projects="${projectsText}" data-created="${created}">
  <a class="card-hit" href="${url}" aria-label="Read ${name}'s profile"></a>
  <header class="maintainer-card-header">
    <img src="${photo}" alt="Photo of ${name}" class="avatar" width="56" height="56" loading="lazy" decoding="async">
    <div>
      <h2>${name}</h2>
      <p>${maintainer.designation || ""}</p>
    </div>
  </header>
  <div class="${stripClass}" aria-label="Projects">${projectHtml}${filler}</div>
</article>`;
  }

  // ==========================================================================
  // Maintainer directory (landing page)
  // ==========================================================================

  const dirSearch = document.querySelector("[data-search-input]");
  const dirSort = document.querySelector("[data-sort-select]");
  const dirContainer = document.querySelector("[data-maintainers-container]");
  const dirPager = document.querySelector("[data-maintainers-pagination]");
  const dirEmpty = document.querySelector("[data-empty-state]");
  const shortcutLabel = document.querySelector("[data-shortcut-label]");

  if (shortcutLabel && /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent)) {
    shortcutLabel.textContent = "⌘+k";
  }

  const directory = createIndexedList({
    container: dirContainer,
    searchInput: dirSearch,
    sortSelect: dirSort,
    pager: dirPager,
    emptyEl: dirEmpty,
    indexUrl: "/maintainers/cards.json",
    cardSelector: "[data-maintainer-card]",
    defaultSort: "newest",
    render: renderMaintainerCard,
    itemText: (m) => `${m.full_name} ${m.username} ${m.projectsText}`,
    domHaystack: (card) => `${card.dataset.name} ${card.dataset.username} ${card.dataset.projects}`,
    compare: (mode) => (a, b) => {
      if (mode === "a-z") return a.full_name.localeCompare(b.full_name);
      if (mode === "z-a") return b.full_name.localeCompare(a.full_name);
      const aDate = new Date(a.created_on || 0).getTime();
      const bDate = new Date(b.created_on || 0).getTime();
      return mode === "oldest" ? aDate - bDate : bDate - aDate;
    },
    emptyText: "No maintainers found",
    fallbackText: "Could not load the full directory. Showing matches from this page only.",
  });

  if (directory) {
    dirSearch?.addEventListener("input", directory.apply);
    dirSort?.addEventListener("change", directory.apply);
    dirSearch?.addEventListener("focus", directory.preload, { once: true });
    directory.apply();
  }

  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      dirSearch?.focus();
    }
    if (!isTyping && event.key === "/") {
      event.preventDefault();
      dirSearch?.focus();
    }
  });

  document.querySelector("[data-surprise]")?.addEventListener("click", async () => {
    let href = "";
    const data = directory ? await directory.preload() : null;
    if (Array.isArray(data) && data.length) {
      const pick = data[Math.floor(Math.random() * data.length)];
      href = pick && pick.url ? pick.url : "";
    }
    if (!href) {
      const cards = Array.from(document.querySelectorAll("[data-maintainer-card]")).filter(
        (card) => !card.hidden,
      );
      const card = cards[Math.floor(Math.random() * cards.length)];
      href = card?.querySelector(".card-hit")?.getAttribute("href") || "";
    }
    if (href) window.location.href = href;
  });

  // ==========================================================================
  // Scroll to top
  // ==========================================================================

  const scrollTopBtn = document.querySelector("[data-scroll-top]");
  if (scrollTopBtn) {
    const toggleScrollTop = () => {
      const scrolled = window.scrollY || document.documentElement.scrollTop || 0;
      scrollTopBtn.classList.toggle("is-visible", scrolled > 400);
    };
    toggleScrollTop();
    window.addEventListener("scroll", toggleScrollTop, { passive: true });
    scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ==========================================================================
  // Planet Forklore
  //
  // The global /planet/ view uses the shared controller against the index.
  // Author profile pages (/planet/:user/) render all of one author's posts on
  // a single page with no catalog container, so there we just filter the posts
  // already in the DOM by the active tag.
  // ==========================================================================

  const planetSearch = document.querySelector("[data-planet-search]");
  const planetContainer = document.querySelector("[data-planet-posts-container]");
  const planetPager = document.querySelector("[data-planet-pagination]");
  const planetEmpty = document.querySelector("[data-planet-empty]");
  const hasPlanetPosts = Boolean(document.querySelector("[data-planet-post]"));

  const planet = planetContainer
    ? createIndexedList({
        container: planetContainer,
        searchInput: planetSearch,
        pager: planetPager,
        emptyEl: planetEmpty,
        indexUrl: "/planet/posts.json",
        cardSelector: "[data-planet-post]",
        render: renderPlanetCard,
        itemText: (p) => `${p.title} ${p.contentSnippet} ${p.maintainerName}`,
        itemTags: (p) => p.tags || [],
        domHaystack: (card) =>
          `${card.dataset.title} ${card.dataset.author} ${card.dataset.snippet}`,
        domTags: (card) => normalize(card.dataset.tags).split("|||").filter(Boolean),
        syncUrl: true,
        emptyText: "No posts found",
        fallbackText: "Could not load the full archive. Showing matches from this page only.",
      })
    : null;

  function setParam(key, value) {
    const params = new URLSearchParams(window.location.search);
    if (value) params.set(key, value);
    else params.delete(key);
    const query = params.toString();
    history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  }

  function applyAuthorFilter() {
    const params = new URLSearchParams(window.location.search);
    const tag = normalize(params.get("tag"));
    const query = normalize(planetSearch ? planetSearch.value : params.get("search"));
    document.querySelectorAll("[data-planet-tag]").forEach((button) => {
      const on = normalize(button.dataset.planetTag) === tag;
      button.classList.toggle("is-active", on);
      button.setAttribute("aria-pressed", on ? "true" : "false");
    });
    let visible = 0;
    document.querySelectorAll("[data-planet-post]").forEach((card) => {
      const haystack = normalize(
        `${card.dataset.title} ${card.dataset.author} ${card.dataset.snippet}`,
      );
      const tags = normalize(card.dataset.tags).split("|||").filter(Boolean);
      const match = (!query || haystack.includes(query)) && (!tag || tags.includes(tag));
      card.hidden = !match;
      if (match) visible += 1;
    });
    if (planetEmpty) {
      planetEmpty.textContent = visible ? "" : "No posts found";
      planetEmpty.hidden = visible !== 0;
    }
  }

  function applyPlanet() {
    if (planet) planet.apply();
    else if (hasPlanetPosts) applyAuthorFilter();
  }

  if (planet || hasPlanetPosts) {
    if (planet) {
      planetSearch?.addEventListener("focus", planet.preload, { once: true });
      document.querySelectorAll("[data-planet-tag]").forEach((button) => {
        button.addEventListener("mouseenter", planet.preload, { once: true });
      });
    }

    planetSearch?.addEventListener("input", () => {
      setParam("search", planetSearch.value);
      applyPlanet();
    });

    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const button = target.closest("[data-planet-tag]");
      if (!button) return;
      event.preventDefault();
      const next = normalize(button.dataset.planetTag);
      const current = normalize(new URLSearchParams(window.location.search).get("tag"));
      setParam("tag", next && next !== current ? button.dataset.planetTag : "");
      applyPlanet();
    });

    window.addEventListener("popstate", () => {
      if (planetSearch) {
        planetSearch.value = new URLSearchParams(window.location.search).get("search") || "";
      }
      applyPlanet();
    });

    if (planetSearch) {
      planetSearch.value = new URLSearchParams(window.location.search).get("search") || "";
    }
    applyPlanet();
  }
})();
