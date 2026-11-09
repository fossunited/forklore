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

  const searchInput = document.querySelector("[data-search-input]");
  const sortSelect = document.querySelector("[data-sort-select]");
  const list = document.querySelector(".maintainer-list");
  const emptyState = document.querySelector("[data-empty-state]");
  const shortcutLabel = document.querySelector("[data-shortcut-label]");

  if (shortcutLabel && /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent)) {
    shortcutLabel.textContent = "⌘+k";
  }

  function cards() {
    return Array.from(document.querySelectorAll("[data-maintainer-card]"));
  }

  function applyDirectoryState() {
    if (!list) return;
    const query = (searchInput?.value || "").trim().toLowerCase();
    const sorted = cards().sort((a, b) => {
      const mode = sortSelect?.value || "newest";
      if (mode === "a-z") return a.dataset.name.localeCompare(b.dataset.name);
      if (mode === "z-a") return b.dataset.name.localeCompare(a.dataset.name);
      const aDate = new Date(a.dataset.created || 0).getTime();
      const bDate = new Date(b.dataset.created || 0).getTime();
      return mode === "oldest" ? aDate - bDate : bDate - aDate;
    });

    let visible = 0;
    sorted.forEach((card) => {
      const haystack = `${card.dataset.name} ${card.dataset.username} ${card.dataset.projects}`.toLowerCase();
      const match = !query || haystack.includes(query);
      card.hidden = !match;
      if (match) visible += 1;
      list.insertBefore(card, emptyState || null);
    });

    if (emptyState) emptyState.hidden = visible !== 0;
  }

  searchInput?.addEventListener("input", applyDirectoryState);
  sortSelect?.addEventListener("change", applyDirectoryState);
  applyDirectoryState();

  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const isTyping =
      target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      searchInput?.focus();
    }
    if (!isTyping && event.key === "/") {
      event.preventDefault();
      searchInput?.focus();
    }
  });

  document.querySelector("[data-surprise]")?.addEventListener("click", () => {
    const visibleCards = cards().filter((card) => !card.hidden);
    const card = visibleCards[Math.floor(Math.random() * visibleCards.length)];
    const href = card?.querySelector(".card-hit")?.getAttribute("href");
    if (href) window.location.href = href;
  });

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

  const planetSearch = document.querySelector("[data-planet-search]");
  const planetEmpty = document.querySelector("[data-planet-empty]");
  const planetPostsContainer = document.querySelector("[data-planet-posts-container]");
  const planetPagination = document.querySelector("[data-planet-pagination]");
  const hasPlanetPosts = Boolean(document.querySelector("[data-planet-post]"));

  let allPlanetPosts = null;
  let planetFetchPromise = null;
  const initialPlanetHtml = planetPostsContainer ? planetPostsContainer.innerHTML : "";

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function formatPostDateISO(dateStr) {
    const value = new Date(dateStr);
    return Number.isNaN(value.getTime()) ? "" : value.toISOString();
  }

  function formatPostDate(dateStr) {
    const value = new Date(dateStr);
    if (Number.isNaN(value.getTime())) return "";
    return value.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function renderDynamicPlanetCard(post) {
    const title = escapeHtml(post.title || "Untitled");
    const username = escapeHtml(post.maintainerUsername || "");
    const authorName = escapeHtml(post.maintainerName || "");
    const photo = escapeHtml(post.maintainerPhoto || "/maintainer_photo_light.svg");
    const slug = escapeHtml(post.slug || "");
    const dateISO = escapeHtml(formatPostDateISO(post.pubDate));
    const dateFormatted = formatPostDate(post.pubDate);
    const snippet = escapeHtml(post.contentSnippet || "");
    const link = escapeHtml(post.link || "");
    const tags = Array.isArray(post.tags) ? post.tags : [];

    const tagsHtml = tags.length
      ? `<div class="planet-tags">${tags
          .slice(0, 6)
          .map((tag) => `<button type="button" data-planet-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</button>`)
          .join("")}</div>`
      : "";

    const linkHtml = link
      ? `<a href="${link}" class="button subtle" target="_blank" rel="noopener noreferrer">Original ↗</a>`
      : "";

    return `
<article
  class="planet-post"
  data-planet-post
  data-title="${title.toLowerCase()}"
  data-author="${authorName.toLowerCase()}"
  data-snippet="${snippet.toLowerCase()}"
  data-tags="${tags.map((t) => escapeHtml(t).toLowerCase()).join("|||")}"
>
  <div class="planet-post-title">
    <a href="/planet/${username}/${slug}/">${title}</a>
  </div>
  <div class="planet-post-body">
    <div class="planet-post-meta">
      <a href="/planet/${username}/" class="planet-author-inline">
        <img src="${photo}" alt="" class="avatar tiny">
        ${authorName}
      </a>
      <span>·</span>
      <time datetime="${dateISO}">${dateFormatted}</time>
    </div>
    ${tagsHtml}
    ${snippet ? `<p>${snippet}</p>` : ""}
    <div class="button-row">
      <a href="/planet/${username}/${slug}/" class="button subtle">Read more →</a>
      ${linkHtml}
    </div>
  </div>
</article>`;
  }

  function loadPlanetPosts() {
    if (allPlanetPosts) return Promise.resolve(allPlanetPosts);
    if (planetFetchPromise) return planetFetchPromise;

    planetFetchPromise = fetch("/planet/posts.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((posts) => {
        allPlanetPosts = posts;
        return posts;
      })
      .catch((err) => {
        console.error("Failed to load /planet/posts.json:", err);
        return null;
      });

    return planetFetchPromise;
  }

  function planetPosts() {
    return Array.from(document.querySelectorAll("[data-planet-post]"));
  }

  function setPlanetTag(tag) {
    const params = new URLSearchParams(window.location.search);
    const nextTag = normalize(tag);
    const activeTag = normalize(params.get("tag"));
    if (nextTag && nextTag !== activeTag) params.set("tag", tag);
    else params.delete("tag");
    const query = params.toString();
    history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
    applyPlanetState();
  }

  function syncPlanetTags(activeTag) {
    document.querySelectorAll("[data-planet-tag]").forEach((button) => {
      const selected = normalize(button.dataset.planetTag) === activeTag;
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-pressed", selected ? "true" : "false");
    });
  }

  let planetStateGeneration = 0;

  async function applyPlanetState() {
    const currentGen = ++planetStateGeneration;
    const params = new URLSearchParams(window.location.search);
    const activeTag = normalize(params.get("tag"));
    const query = normalize(planetSearch?.value || params.get("search"));
    const isFiltered = Boolean(activeTag || query);

    syncPlanetTags(activeTag);

    // Global Planet view with dynamic catalog support
    if (planetPostsContainer) {
      if (!isFiltered) {
        planetPostsContainer.innerHTML = initialPlanetHtml;
        if (planetPagination) planetPagination.hidden = false;
        if (planetEmpty) planetEmpty.hidden = true;
        return;
      }

      if (planetPagination) planetPagination.hidden = true;

      const posts = await loadPlanetPosts();
      // If a newer search/tag change was initiated while awaiting, ignore this stale execution
      if (currentGen !== planetStateGeneration) return;

      if (!posts) {
        // Fallback to DOM filtering if JSON fetch fails
        let visible = 0;
        planetPosts().forEach((post) => {
          const haystack = normalize(`${post.dataset.title} ${post.dataset.author} ${post.dataset.snippet}`);
          const tags = normalize(post.dataset.tags).split("|||").filter(Boolean);
          const match = (!query || haystack.includes(query)) && (!activeTag || tags.includes(activeTag));
          post.hidden = !match;
          if (match) visible += 1;
        });
        if (planetEmpty) planetEmpty.hidden = visible !== 0;
        return;
      }

      const filtered = posts.filter((post) => {
        const haystack = normalize(`${post.title} ${post.contentSnippet} ${post.maintainerName}`);
        const tags = (post.tags || []).map((t) => normalize(t));
        const matchesSearch = !query || haystack.includes(query);
        const matchesTag = !activeTag || tags.includes(activeTag);
        return matchesSearch && matchesTag;
      });

      if (filtered.length === 0) {
        planetPostsContainer.innerHTML = "";
        if (planetEmpty) planetEmpty.hidden = false;
      } else {
        planetPostsContainer.innerHTML = filtered.map(renderDynamicPlanetCard).join("");
        if (planetEmpty) planetEmpty.hidden = true;
      }
      return;
    }

    // Author profile page / fallback DOM filtering
    let visible = 0;
    planetPosts().forEach((post) => {
      const haystack = normalize(`${post.dataset.title} ${post.dataset.author} ${post.dataset.snippet}`);
      const tags = normalize(post.dataset.tags).split("|||").filter(Boolean);
      const matchesSearch = !query || haystack.includes(query);
      const matchesTag = !activeTag || tags.includes(activeTag);
      const match = matchesSearch && matchesTag;
      post.hidden = !match;
      if (match) visible += 1;
    });

    if (planetEmpty) planetEmpty.hidden = visible !== 0;
  }

  // Preload JSON on interaction
  planetSearch?.addEventListener("focus", loadPlanetPosts, { once: true });
  document.querySelectorAll("[data-planet-tag]").forEach((btn) => {
    btn.addEventListener("mouseenter", loadPlanetPosts, { once: true });
  });

  planetSearch?.addEventListener("input", () => {
    const params = new URLSearchParams(window.location.search);
    if (planetSearch.value) params.set("search", planetSearch.value);
    else params.delete("search");
    const query = params.toString();
    history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
    applyPlanetState();
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const tagButton = target.closest("[data-planet-tag]");
    if (!tagButton) return;
    event.preventDefault();
    setPlanetTag(tagButton.dataset.planetTag);
  });

  window.addEventListener("popstate", () => {
    if (planetSearch) {
      planetSearch.value = new URLSearchParams(window.location.search).get("search") || "";
    }
    applyPlanetState();
  });

  if (hasPlanetPosts) {
    if (planetSearch) {
      planetSearch.value = new URLSearchParams(window.location.search).get("search") || "";
    }
    applyPlanetState();
  }
})();
