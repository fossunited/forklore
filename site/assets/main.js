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
  const list = document.querySelector("[data-directory-list]") || document.querySelector(".maintainer-list");
  const directoryType = list?.dataset.directory || "maintainers";
  const cardSelector = directoryType === "projects" ? "[data-project-card]" : "[data-maintainer-card]";
  const emptyState = document.querySelector("[data-empty-state]");
  const shortcutLabel = document.querySelector("[data-shortcut-label]");

  if (shortcutLabel && /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent)) {
    shortcutLabel.textContent = "⌘+k";
  }

  function cards() {
    return Array.from(document.querySelectorAll(cardSelector));
  }

  function layoutOrbitLogos() {
    cards().forEach((card) => {
      const logos = Array.from(card.querySelectorAll("[data-project-logo]"));
      const count = logos.length;
      if (!count) return;
      const size = Math.max(17, Math.min(24, 31 - count * 1.4));
      const radius = Math.max(52, Math.min(68, 50 + count * 2.7));
      logos.forEach((logo, index) => {
        const angle = -90 + (360 / count) * index;
        logo.style.setProperty("--orbit-angle", `${angle}deg`);
        logo.style.setProperty("--orbit-radius", `${radius}px`);
        logo.style.setProperty("--orbit-logo-size", `${size}px`);
      });
    });
  }

  function resetCardSliders() {
    cards().forEach((card) => {
      card.classList.remove("has-scrollable-preview", "is-opening");
      const slider = card.querySelector("[data-card-slide]");
      if (!slider) return;
      slider.value = 0;
      slider.disabled = true;
    });
    document.querySelector("[data-wall-preview]")?.classList.remove("is-opening");
  }

  function updateSliderAvailability(card, panel) {
    cards().forEach((otherCard) => {
      if (otherCard === card) return;
      otherCard.classList.remove("has-scrollable-preview", "is-opening");
      const otherSlider = otherCard.querySelector("[data-card-slide]");
      if (!otherSlider) return;
      otherSlider.value = 0;
      otherSlider.disabled = true;
    });
    window.requestAnimationFrame(() => {
      const slider = card.querySelector("[data-card-slide]");
      if (!slider) return;
      const canScroll = panel.scrollHeight > panel.clientHeight + 2;
      card.classList.toggle("has-scrollable-preview", canScroll);
      slider.disabled = !canScroll;
      if (!canScroll) slider.value = 0;
    });
  }

  function updatePreview(card) {
    const panel = document.querySelector("[data-wall-preview]");
    if (!panel || !card) return;
    const projects = Array.from(card.querySelectorAll("[data-project-logo]"));
    const profileUrl = card.dataset.url || "#";
    panel.innerHTML = `
      <p class="eyebrow">Preview</p>
      <div class="wall-preview-header">
        <img src="${card.dataset.photo || "/maintainer_photo_light.svg"}" alt="">
        <div>
          <h2>${card.dataset.name || ""}</h2>
          <p>${card.dataset.designation || ""}</p>
        </div>
      </div>
      ${projects
        .map(
          (project) => `
            <article class="wall-preview-project">
              <span class="wall-preview-project-logo" aria-hidden="true">
                ${
                  project.dataset.projectImage
                    ? `<img src="${project.dataset.projectImage}" alt="">`
                    : `${(project.dataset.projectName || "?").charAt(0)}`
                }
              </span>
              <div>
                <h3>${project.dataset.projectName || ""}</h3>
                <p>${project.dataset.projectDescription || ""}</p>
              </div>
            </article>
          `,
        )
        .join("")}
      <a class="button solid" href="${profileUrl}">Open profile →</a>
    `;
    panel.classList.add("is-visible");
    updateSliderAvailability(card, panel);
  }

  function bindCardSliders() {
    const panel = document.querySelector("[data-wall-preview]");
    if (!panel) return;
    const openThreshold = 130;
    let isNavigating = false;
    cards().forEach((card) => {
      const slider = card.querySelector("[data-card-slide]");
      if (!slider) return;
      slider.disabled = true;
      slider.addEventListener("input", (event) => {
        if (isNavigating) return;
        updatePreview(card);
        const value = Number(event.currentTarget.value);
        const scrollable = panel.scrollHeight - panel.clientHeight;
        panel.scrollTop = scrollable * Math.min(value, 100) / 100;
        if (value >= openThreshold && card.dataset.url) {
          isNavigating = true;
          card.classList.add("is-opening");
          panel.classList.add("is-opening");
          window.setTimeout(() => {
            window.location.href = card.dataset.url;
          }, 260);
        }
      });
      slider.addEventListener("change", (event) => {
        if (Number(event.currentTarget.value) < openThreshold) {
          event.currentTarget.value = 0;
          card.classList.remove("is-opening");
          panel.classList.remove("is-opening");
        }
      });
    });
  }

  function bindPreviewPanel() {
    const panel = document.querySelector("[data-wall-preview]");
    if (!panel) return;
    let closeTimer;
    const cancelClose = () => {
      window.clearTimeout(closeTimer);
    };
    const closePreview = () => {
      panel.classList.remove("is-visible");
    };
    const scheduleClose = () => {
      cancelClose();
      closeTimer = window.setTimeout(closePreview, 120);
    };
    cards().forEach((card) => {
      card.addEventListener("mouseenter", () => {
        cancelClose();
        updatePreview(card);
      });
      card.addEventListener("focusin", () => updatePreview(card));
      card.addEventListener("mouseleave", scheduleClose);
      card.addEventListener("focusout", (event) => {
        if (!card.contains(event.relatedTarget) && !panel.contains(event.relatedTarget)) scheduleClose();
      });
      card.addEventListener("click", (event) => {
        if (window.matchMedia("(min-width: 900px)").matches && event.target.closest("summary")) {
          event.preventDefault();
          updatePreview(card);
        }
      });
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closePreview();
      }
    });
    panel.addEventListener("mouseenter", cancelClose);
    panel.addEventListener("focusin", cancelClose);
    panel.addEventListener("mouseleave", closePreview);
    panel.addEventListener("focusout", (event) => {
      if (!panel.contains(event.relatedTarget)) scheduleClose();
    });
  }

  function bindProjectPreviewPanel() {
    const panel = document.querySelector("[data-project-preview]");
    if (!panel) return;
    let closeTimer;
    const cancelClose = () => window.clearTimeout(closeTimer);
    const closePreview = () => panel.classList.remove("is-visible");
    const scheduleClose = () => {
      cancelClose();
      closeTimer = window.setTimeout(closePreview, 120);
    };
    const updateProjectPreview = (card) => {
      const sourceUrl = card.dataset.source;
      const websiteUrl = card.dataset.website;
      const primaryUrl = card.dataset.url || "#";
      panel.innerHTML = `
        <p class="eyebrow">Project preview</p>
        <div class="project-preview-header">
          <span class="project-preview-logo" aria-hidden="true">
            ${
              card.dataset.logo
                ? `<img src="${card.dataset.logo}" alt="">`
                : `${(card.dataset.name || "?").charAt(0)}`
            }
          </span>
          <div>
            <h2>${card.dataset.name || ""}</h2>
            <p>${card.dataset.description || ""}</p>
          </div>
        </div>
        <a class="project-preview-maintainer" href="${card.dataset.maintainerUrl || "#"}">
          <img src="${card.dataset.maintainerPhoto || "/maintainer_photo_light.svg"}" alt="">
          <span>
            <strong>${card.dataset.maintainer || ""}</strong>
            <small>@${card.dataset.username || ""}</small>
          </span>
        </a>
        <div class="button-row project-preview-actions">
          <a class="button solid" href="${primaryUrl}">Open project →</a>
          ${sourceUrl ? `<a class="button subtle" href="${sourceUrl}">Source ↗</a>` : ""}
          ${websiteUrl ? `<a class="button subtle" href="${websiteUrl}">Website ↗</a>` : ""}
        </div>
      `;
      panel.classList.add("is-visible");
    };

    cards().forEach((card) => {
      card.addEventListener("mouseenter", () => {
        cancelClose();
        updateProjectPreview(card);
      });
      card.addEventListener("focusin", () => updateProjectPreview(card));
      card.addEventListener("mouseleave", scheduleClose);
      card.addEventListener("focusout", (event) => {
        if (!card.contains(event.relatedTarget) && !panel.contains(event.relatedTarget)) scheduleClose();
      });
    });
    panel.addEventListener("mouseenter", cancelClose);
    panel.addEventListener("focusin", cancelClose);
    panel.addEventListener("mouseleave", closePreview);
    panel.addEventListener("focusout", (event) => {
      if (!panel.contains(event.relatedTarget)) scheduleClose();
    });
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
      const haystack =
        directoryType === "projects"
          ? `${card.dataset.name} ${card.dataset.maintainer} ${card.dataset.username} ${card.dataset.description}`.toLowerCase()
          : `${card.dataset.name} ${card.dataset.username} ${card.dataset.projects}`.toLowerCase();
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
  if (directoryType === "maintainers") {
    layoutOrbitLogos();
    resetCardSliders();
    bindPreviewPanel();
    bindCardSliders();
    window.addEventListener("pageshow", resetCardSliders);
  } else {
    bindProjectPreviewPanel();
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
    const visibleCards = cards().filter((card) => !card.hidden);
    const card = visibleCards[Math.floor(Math.random() * visibleCards.length)];
    const href =
      card?.dataset.url ||
      card?.querySelector(".profile-link")?.getAttribute("href") ||
      card?.querySelector(".project-tile-hit")?.getAttribute("href");
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
