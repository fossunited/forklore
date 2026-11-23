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
  // Lists (maintainer directory, Planet Forklore)
  //
  // Every card is rendered server-side and carries a lowercased data-search
  // haystack. Filtering just hides non-matching cards, pagination caps how many
  // show behind a "Show more" button, and (for Planet) a tag toggles an exact
  // match. No index fetch, no client-side card rendering.
  // ==========================================================================

  function setupList(opts) {
    const grid = document.querySelector(opts.grid);
    if (!grid) return;
    const search = opts.search ? document.querySelector(opts.search) : null;
    const sortSelect = opts.sort ? document.querySelector(opts.sort) : null;
    const moreButton = opts.more ? document.querySelector(opts.more) : null;
    const status = opts.status ? document.querySelector(opts.status) : null;
    const step = opts.page || 12;
    let shown = step;
    let activeTag = "";

    function compare(a, b, mode) {
      if (mode === "a-z") return a.dataset.name.localeCompare(b.dataset.name);
      if (mode === "z-a") return b.dataset.name.localeCompare(a.dataset.name);
      const aDate = new Date(a.dataset.created || 0).getTime();
      const bDate = new Date(b.dataset.created || 0).getTime();
      return mode === "oldest" ? aDate - bDate : bDate - aDate;
    }

    function render() {
      const terms = (search ? search.value : "").trim().toLowerCase().split(/\s+/).filter(Boolean);
      if (sortSelect) {
        [...grid.querySelectorAll("[data-card]")]
          .sort((a, b) => compare(a, b, sortSelect.value))
          .forEach((card) => grid.appendChild(card));
      }
      let matched = 0;
      grid.querySelectorAll("[data-card]").forEach((card) => {
        const okText = terms.every((term) => card.dataset.search.includes(term));
        const okTag = !activeTag || (card.dataset.tags || "").split("|").includes(activeTag);
        const ok = okText && okTag;
        card.hidden = !ok || matched >= shown;
        if (ok) matched += 1;
      });
      if (moreButton) {
        const remaining = matched - shown;
        moreButton.hidden = remaining <= 0;
        if (remaining > 0) {
          moreButton.textContent = `Show ${Math.min(step, remaining)} more (${remaining} left)`;
        }
      }
      if (status) {
        if (matched === 0) {
          status.textContent = opts.emptyText;
          status.hidden = false;
        } else if (terms.length || activeTag) {
          status.textContent = `Showing ${Math.min(shown, matched)} of ${matched} ${opts.noun}`;
          status.hidden = false;
        } else {
          status.hidden = true;
        }
      }
    }

    search?.addEventListener("input", () => {
      shown = step;
      render();
    });
    sortSelect?.addEventListener("change", render);
    moreButton?.addEventListener("click", () => {
      shown += step;
      render();
    });

    if (opts.tags) {
      document.addEventListener("click", (event) => {
        const button = event.target instanceof Element ? event.target.closest("[data-planet-tag]") : null;
        if (!button) return;
        event.preventDefault();
        const tag = (button.dataset.planetTag || "").toLowerCase();
        activeTag = activeTag === tag ? "" : tag;
        document.querySelectorAll("[data-planet-tag]").forEach((other) => {
          other.setAttribute(
            "aria-pressed",
            (other.dataset.planetTag || "").toLowerCase() === activeTag ? "true" : "false",
          );
        });
        shown = step;
        render();
      });
    }

    render();
  }

  // Maintainer directory (landing page)
  setupList({
    grid: "[data-maintainers]",
    search: "[data-search-input]",
    sort: "[data-sort-select]",
    more: "[data-maintainers-more]",
    status: "[data-empty-state]",
    page: 12,
    noun: "maintainers",
    emptyText: "No maintainers found",
  });

  const searchInput = document.querySelector("[data-search-input]");
  const shortcutLabel = document.querySelector("[data-shortcut-label]");
  if (shortcutLabel && /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent)) {
    shortcutLabel.textContent = "⌘+k";
  }

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
    const cards = document.querySelectorAll("[data-maintainers] [data-card]");
    const card = cards[Math.floor(Math.random() * cards.length)];
    const href = card?.querySelector(".card-hit")?.getAttribute("href");
    if (href) window.location.href = href;
  });

  // Planet Forklore (global feed and author profile pages)
  setupList({
    grid: "[data-planet-posts]",
    search: "[data-planet-search]",
    more: "[data-planet-more]",
    status: "[data-planet-empty]",
    tags: true,
    page: 10,
    noun: "posts",
    emptyText: "No posts found",
  });

  // Scroll to top
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
})();
