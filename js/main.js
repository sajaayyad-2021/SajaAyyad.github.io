// js/main.js
(function () {
  // ===== Utilities =====
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const safe = (v, fallback = "N/A") =>
    v === undefined || v === null || v === "" ? fallback : v;

  const create = (tag, opts = {}, children = []) => {
    const el = document.createElement(tag);
    if (opts.className) el.className = opts.className;
    if (opts.id) el.id = opts.id;
    if (opts.attrs) {
      for (const [k, v] of Object.entries(opts.attrs)) {
        if (v !== undefined && v !== null) el.setAttribute(k, String(v));
      }
    }
    if (opts.text) el.textContent = opts.text;
    children.forEach((c) => el.appendChild(c));
    return el;
  };

  // ===== Elements (hooks) =====
  const aboutRoot = $("#aboutMe");
  const projectsList = $("#projectsList");
  const spotlight = $("#spotlight");
  const btnPrev = $("#arrowPrev");
  const btnNext = $("#arrowNext");
  const contactForm = $("#contactForm");

  if (!aboutRoot || !projectsList || !spotlight) {
    console.warn("Missing required hooks: #aboutMe, #projectsList, #spotlight");
  }

  // Loading element (allowed by rubric)
  const loader = create("div", { id: "loading", className: "loading", text: "Loading…" });
  document.body.appendChild(loader);

  // ===== Fetch data =====
  async function loadData() {
    try {
      const res = await fetch("assets/data/data.json", { cache: "no-store" });
      if (!res.ok) throw new Error("Network error");
      return await res.json();
    } catch (e) {
      console.error("Failed loading data:", e);
      return { aboutMe: {}, projects: [] };
    } finally {
      loader.remove();
    }
  }

  // ===== Render About =====
  function renderAbout(about) {
    if (!aboutRoot) return;
    aboutRoot.replaceChildren(); // clear without innerHTML

    const frag = document.createDocumentFragment();

    const name = create("h2", { className: "section-title", text: safe(about.name, "About Me") });
    const role = create("p", { className: "about-role", text: safe(about.role, "") });
    const bio = create("p", { className: "about-bio", text: safe(about.bio, "") });

    // Headshot as BACKGROUND (per rubric)
    const head = create("div", {
      className: "about-headshot",
      attrs: { role: "img", "aria-label": `${safe(about.name, "User")} headshot` }
    });
    if (about.headshot) {
      head.style.backgroundImage = `url("${about.headshot}")`;
      head.style.backgroundSize = "cover";
      head.style.backgroundPosition = "center";
    }

    // Contacts (graceful fallbacks)
    const links = about.links || {};
    const ul = create("ul", { className: "about-links" });
    const liPhone = create("li", {}, [
      create("a", {
        attrs: { href: links.phone ? `tel:${links.phone}` : "#", "aria-disabled": links.phone ? "false" : "true" },
        text: safe(links.phone, "Phone: N/A")
      })
    ]);
    const liMail = create("li", {}, [
      create("a", {
        attrs: { href: links.email ? `mailto:${links.email}` : "#", "aria-disabled": links.email ? "false" : "true" },
        text: safe(links.email, "Email: N/A")
      })
    ]);
    const liLn = create("li", {}, [
      create("a", {
        attrs: { href: links.linkedin || "#", target: links.linkedin ? "_blank" : "_self", "aria-disabled": links.linkedin ? "false" : "true" },
        text: "LinkedIn"
      })
    ]);
    const liGh = create("li", {}, [
      create("a", {
        attrs: { href: links.github || "#", target: links.github ? "_blank" : "_self", "aria-disabled": links.github ? "false" : "true" },
        text: "GitHub"
      })
    ]);
    [liPhone, liMail, liLn, liGh].forEach((li) => ul.appendChild(li));

    frag.appendChild(name);
    frag.appendChild(role);
    frag.appendChild(bio);
    frag.appendChild(head);
    frag.appendChild(ul);
    aboutRoot.appendChild(frag);
  }

  // ===== Spotlight =====
  function renderSpotlight(project) {
    if (!spotlight || !project) return;
    spotlight.replaceChildren();

    // Spotlight card uses background image, not <img>
    const card = create("article", {
      className: "spotlight-card",
      attrs: { tabindex: "0", "aria-label": project.title || "Selected project" }
    });
    if (project.image) {
      card.style.backgroundImage = `url("${project.image}")`;
      card.style.backgroundSize = "cover";
      card.style.backgroundPosition = "center";
    }

    // Content region
    const content = create("div", { className: "spotlight-content" });
    const title = create("h3", { className: "spotlight-title", text: safe(project.title) });
    const desc = create("p", { className: "spotlight-desc", text: safe(project.desc, "No description") });

    // Links (gracefully handle missing)
    const linksWrap = create("p", { className: "spotlight-links" });
    if (project.repo) {
      linksWrap.appendChild(create("a", { attrs: { href: project.repo, target: "_blank" }, text: "Repository" }));
    }
    if (project.demo) {
      if (linksWrap.childNodes.length) linksWrap.appendChild(document.createTextNode(" · "));
      linksWrap.appendChild(create("a", { attrs: { href: project.demo, target: "_blank" }, text: "Demo" }));
    }
    if (!project.repo && !project.demo) {
      linksWrap.appendChild(create("span", { text: "Links: N/A" }));
    }

    content.appendChild(title);
    content.appendChild(desc);
    content.appendChild(linksWrap);

    card.appendChild(content);
    spotlight.appendChild(card);
  }

  // ===== Projects List =====
  function renderProjects(projects) {
    if (!projectsList) return;
    projectsList.replaceChildren();

    const frag = document.createDocumentFragment();

    projects.forEach((p, idx) => {
      const card = create("article", {
        className: "projectCard",
        attrs: { tabindex: "0", "aria-label": p.title || `Project ${idx + 1}` }
      });

      // Background image only
      if (p.image) {
        card.style.backgroundImage = `url("${p.image}")`;
        card.style.backgroundSize = "cover";
        card.style.backgroundPosition = "center";
      }

      // Content container (no innerHTML)
      const content = create("div", { className: "projectCard__content" });
      const title = create("h4", { className: "projectCard__title", text: safe(p.title, "Untitled Project") });
      const desc = create("p", { className: "projectCard__desc", text: safe(p.desc, "") });

      // “skeleton” links area to keep structure stable
      const links = create("p", { className: "projectCard__links" });
      if (p.repo) {
        links.appendChild(create("a", { attrs: { href: p.repo, target: "_blank" }, text: "Repo" }));
      }
      if (p.demo) {
        if (p.repo) links.appendChild(document.createTextNode(" · "));
        links.appendChild(create("a", { attrs: { href: p.demo, target: "_blank" }, text: "Demo" }));
      }

      content.appendChild(title);
      content.appendChild(desc);
      content.appendChild(links);

      card.appendChild(content);

      // Click / keyboard to set spotlight
      const activate = () => renderSpotlight(p);
      card.addEventListener("click", activate);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activate();
        }
      });

      frag.appendChild(card);
    });

    projectsList.appendChild(frag);
  }

  // ===== Continuous Scroll with arrows =====
  function setupScrolling(container, prevBtn, nextBtn) {
    if (!container || !prevBtn || !nextBtn) return;

    const isVertical = () => container.scrollHeight > container.clientHeight && window.matchMedia("(min-width: 900px)").matches;

    const step = 20; // px per tick
    let intervalId = null;

    const startScroll = (dir) => {
      stopScroll();
      intervalId = setInterval(() => {
        if (isVertical()) {
          container.scrollBy({ top: dir * step, behavior: "auto" });
        } else {
          container.scrollBy({ left: dir * step, behavior: "auto" });
        }
      }, 16); // ~60fps
    };

    const stopScroll = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const bind = (btn, dir) => {
      btn.addEventListener("mousedown", () => startScroll(dir));
      btn.addEventListener("touchstart", () => startScroll(dir), { passive: true });
      ["mouseup", "mouseleave", "touchend", "touchcancel"].forEach((ev) =>
        btn.addEventListener(ev, stopScroll)
      );
      // Click nudge (for accessibility)
      btn.addEventListener("click", () => {
        if (isVertical()) {
          container.scrollBy({ top: dir * 200, behavior: "smooth" });
        } else {
          container.scrollBy({ left: dir * 200, behavior: "smooth" });
        }
      });
      // Keyboard
      btn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          startScroll(dir);
        }
      });
      btn.addEventListener("keyup", stopScroll);
      document.addEventListener("mouseup", stopScroll);
    };

    bind(prevBtn, -1);
    bind(nextBtn, +1);
  }

  // ===== Form Validation + Live Counter (300 char) =====
  function setupFormValidation(form) {
    if (!form) return;

    const name = $("#name", form);
    const email = $("#email", form);
    const message = $("#message", form);

    // Live counter (create if missing)
    let counter = $("#msg-remaining");
    if (!counter) {
      counter = create("div", { id: "msg-remaining", className: "message-counter" });
      message && message.insertAdjacentElement("afterend", counter);
    }

    const max = 300;
    const updateCounter = () => {
      const len = (message?.value || "").length;
      const left = max - len;
      counter.textContent = `${left} characters remaining`;
      counter.classList.toggle("error", len > max); // rely on existing .error style
    };

    message?.addEventListener("input", updateCounter);
    updateCounter();

    const showError = (input, msg) => {
      // Remove previous error
      const prev = input?.parentElement?.querySelector(".error-text");
      if (prev) prev.remove();

      if (!msg) {
        input?.classList.remove("error");
        return;
      }
      input?.classList.add("error");
      const err = create("div", { className: "error-text error", text: msg });
      input?.insertAdjacentElement("afterend", err);
    };

    const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

    form.addEventListener("submit", (e) => {
      e.preventDefault(); // no page refresh

      let ok = true;

      if (!name?.value.trim()) {
        showError(name, "Please enter your name.");
        ok = false;
      } else showError(name, "");

      if (!email?.value.trim() || !isEmail(email.value)) {
        showError(email, "Please enter a valid email address.");
        ok = false;
      } else showError(email, "");

      const len = (message?.value || "").length;
      if (len === 0) {
        showError(message, "Message cannot be empty.");
        ok = false;
      } else if (len > max) {
        showError(message, "Message exceeds 300 characters.");
        ok = false;
      } else showError(message, "");

      if (ok) {
        alert("Submitted successfully. Validation passed!");
        form.reset();
        updateCounter();
        // Clear any error styles
        [name, email, message].forEach((el) => el && el.classList.remove("error"));
        $$(".error-text", form).forEach((n) => n.remove());
      }
    });
  }

  // ===== Init =====
  (async function init() {
    const data = await loadData();

    renderAbout(data.aboutMe);
    renderProjects(data.projects || []);

    // Default spotlight: first project
    if (Array.isArray(data.projects) && data.projects.length > 0) {
      renderSpotlight(data.projects[0]);
    }

    setupScrolling(projectsList, btnPrev, btnNext);
    setupFormValidation(contactForm);
  })();
})();
