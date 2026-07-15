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

  document.querySelector("[data-scroll-top]")?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  const planetSearch = document.querySelector("[data-planet-search]");
  const planetEmpty = document.querySelector("[data-planet-empty]");
  const hasPlanetPosts = Boolean(document.querySelector("[data-planet-post]"));

  function planetPosts() {
    return Array.from(document.querySelectorAll("[data-planet-post]"));
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
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

  function applyPlanetState() {
    const params = new URLSearchParams(window.location.search);
    const activeTag = normalize(params.get("tag"));
    const query = normalize(planetSearch?.value || params.get("search"));
    let visible = 0;

    planetPosts().forEach((post) => {
      const haystack = normalize(`${post.dataset.title} ${post.dataset.snippet}`);
      const tags = normalize(post.dataset.tags).split("|||").filter(Boolean);
      const matchesSearch = !query || haystack.includes(query);
      const matchesTag = !activeTag || tags.includes(activeTag);
      const match = matchesSearch && matchesTag;
      post.hidden = !match;
      if (match) visible += 1;
    });

    syncPlanetTags(activeTag);
    if (planetEmpty) planetEmpty.hidden = visible !== 0;
  }

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

  if (hasPlanetPosts) {
    if (planetSearch) {
      planetSearch.value = new URLSearchParams(window.location.search).get("search") || "";
    }
    applyPlanetState();
  }
})();
