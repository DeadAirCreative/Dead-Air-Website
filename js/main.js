(function () {
  "use strict";

  // Spotlight hover glow (.spotlight cards/thumbnails) — one global pointermove
  // listener sets --x/--y in viewport px on :root; every .spotlight element reads
  // the same vars via background-attachment:fixed, so this scales to any number
  // of cards without per-element listeners. Skipped entirely on touch-only devices
  // and under prefers-reduced-motion, since there's no hover/cursor to track.
  var hasSpotlightTargets = document.querySelector(".spotlight, .card, .portfolio-card");
  var supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var reduceMotionSpotlight = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (hasSpotlightTargets && supportsHover && !reduceMotionSpotlight) {
    var rootStyle = document.documentElement.style;
    document.addEventListener(
      "pointermove",
      function (e) {
        rootStyle.setProperty("--x", e.clientX + "px");
        rootStyle.setProperty("--y", e.clientY + "px");
      },
      { passive: true }
    );
  }

  // Footer year
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile menu toggle
  var menuToggle = document.getElementById("menu-toggle");
  var mobileMenu = document.getElementById("mobile-menu");
  var iconOpen = document.getElementById("icon-open");
  var iconClose = document.getElementById("icon-close");
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", function () {
      var isOpen = mobileMenu.classList.contains("hidden") === false;
      mobileMenu.classList.toggle("hidden");
      iconOpen.classList.toggle("hidden");
      iconClose.classList.toggle("hidden");
      menuToggle.setAttribute("aria-expanded", String(!isOpen));
      document.body.classList.toggle("overflow-hidden", !isOpen);
    });
    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileMenu.classList.add("hidden");
        iconOpen.classList.remove("hidden");
        iconClose.classList.add("hidden");
        menuToggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("overflow-hidden");
      });
    });
  }

  // Header background on scroll
  var header = document.getElementById("site-header");
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 12) {
        header.classList.add("bg-ink/95", "backdrop-blur", "border-border");
        header.classList.remove("border-transparent");
      } else {
        header.classList.remove("bg-ink/95", "backdrop-blur", "border-border");
        header.classList.add("border-transparent");
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Scroll reveal — rAF-throttled bounding-rect check (avoids relying solely on
  // IntersectionObserver timing, which can be throttled/delayed on background
  // or virtualized tabs and would otherwise leave content stuck at opacity:0).
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealEls = document.querySelectorAll(".reveal");
  if (reduceMotion || revealEls.length === 0) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var ticking = false;
    var pending = Array.prototype.slice.call(revealEls);
    var checkReveal = function () {
      ticking = false;
      pending = pending.filter(function (el) {
        var r = el.getBoundingClientRect();
        var inView = r.top < window.innerHeight - 60 && r.bottom > 0;
        if (inView) el.classList.add("is-visible");
        return !inView;
      });
      if (pending.length === 0) {
        window.removeEventListener("scroll", onScrollReveal);
        window.removeEventListener("resize", onScrollReveal);
      }
    };
    var onScrollReveal = function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(checkReveal);
      }
    };
    checkReveal();
    window.addEventListener("scroll", onScrollReveal, { passive: true });
    window.addEventListener("resize", onScrollReveal);
    // Hard safety net: guarantee nothing stays permanently invisible.
    setTimeout(function () {
      pending.forEach(function (el) { el.classList.add("is-visible"); });
    }, 4000);
  }

  // Portfolio filter (portfolio.html)
  var filterBar = document.getElementById("portfolio-filters");
  if (filterBar) {
    var buttons = filterBar.querySelectorAll("[data-filter]");
    var items = document.querySelectorAll("[data-category]");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var filter = btn.getAttribute("data-filter");
        buttons.forEach(function (b) {
          b.classList.remove("bg-signal", "text-white", "border-signal");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("bg-signal", "text-white", "border-signal");
        btn.setAttribute("aria-pressed", "true");
        items.forEach(function (item) {
          var match = filter === "all" || item.getAttribute("data-category") === filter;
          item.style.display = match ? "" : "none";
        });
      });
    });
  }

  // FAQ accordion (contact.html)
  document.querySelectorAll("[data-faq-trigger]").forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      var panel = document.getElementById(trigger.getAttribute("aria-controls"));
      var expanded = trigger.getAttribute("aria-expanded") === "true";
      trigger.setAttribute("aria-expanded", String(!expanded));
      if (panel) {
        panel.classList.toggle("hidden", expanded);
      }
      var icon = trigger.querySelector("[data-faq-icon]");
      if (icon) icon.classList.toggle("rotate-45", !expanded);
    });
  });

  // Contact form (contact.html) — front-end validation + no-backend fallback
  var form = document.getElementById("contact-form");
  if (form) {
    var status = document.getElementById("form-status");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var required = form.querySelectorAll("[required]");
      var valid = true;
      required.forEach(function (field) {
        var errorEl = document.getElementById(field.id + "-error");
        if (!field.value.trim() || (field.type === "email" && !/^\S+@\S+\.\S+$/.test(field.value))) {
          valid = false;
          field.setAttribute("aria-invalid", "true");
          if (errorEl) errorEl.classList.remove("hidden");
        } else {
          field.removeAttribute("aria-invalid");
          if (errorEl) errorEl.classList.add("hidden");
        }
      });
      if (!valid) {
        if (status) {
          status.textContent = "Please check the highlighted fields and try again.";
          status.className = "mt-6 text-signal font-medium";
        }
        return;
      }
      if (status) {
        status.textContent = "Thanks — your message is in. We'll be in touch within one business day.";
        status.className = "mt-6 text-acid font-medium";
      }
      form.reset();
    });
  }

  // Portfolio project view — full-page takeover showing every photo/video
  // for a project, not just a curated few (portfolio.html).
  var lightbox = document.getElementById("lightbox");
  if (lightbox) {
    var lbMedia = document.getElementById("lightbox-media");
    var lbTitle = document.getElementById("lightbox-title");
    var lbTag = document.getElementById("lightbox-tag");
    var lbDescription = document.getElementById("lightbox-description");
    var lbCounter = document.getElementById("lightbox-counter");
    var lbCloseBtn = document.getElementById("lightbox-close-btn");
    var lastFocused = null;

    var renderProjectMedia = function (project) {
      lbMedia.innerHTML = "";
      var frag = document.createDocumentFragment();
      project.media.forEach(function (item, i) {
        var el;
        if (item.type === "video") {
          el = document.createElement("video");
          el.src = item.src;
          if (item.poster) el.poster = item.poster;
          el.controls = true;
          el.playsInline = true;
          el.muted = true;
          el.setAttribute("preload", "none");
        } else {
          el = document.createElement("img");
          el.src = item.src;
          el.loading = "lazy";
          el.alt = project.title + " — image " + (i + 1);
        }
        el.className = "mb-4 block w-full h-auto border border-border break-inside-avoid bg-surface";
        frag.appendChild(el);
      });
      lbMedia.appendChild(frag);
    };

    var openLightbox = function (projectId) {
      if (!PORTFOLIO_PROJECTS[projectId]) return;
      var project = PORTFOLIO_PROJECTS[projectId];
      lbTitle.textContent = project.title;
      lbTag.textContent = project.tag;
      lbDescription.textContent = project.description || "";
      lbCounter.textContent = project.media.length + (project.media.length === 1 ? " item" : " items");
      renderProjectMedia(project);
      lastFocused = document.activeElement;
      lightbox.classList.remove("hidden");
      lightbox.scrollTop = 0;
      document.body.classList.add("overflow-hidden");
      if (lbCloseBtn) lbCloseBtn.focus();
    };

    var closeLightbox = function () {
      lightbox.classList.add("hidden");
      lbMedia.innerHTML = "";
      document.body.classList.remove("overflow-hidden");
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    };

    document.querySelectorAll(".portfolio-card").forEach(function (card) {
      card.addEventListener("click", function () {
        openLightbox(card.getAttribute("data-project"));
      });
    });
    document.querySelectorAll("[data-lightbox-close]").forEach(function (el) {
      el.addEventListener("click", closeLightbox);
    });
    document.addEventListener("keydown", function (e) {
      if (lightbox.classList.contains("hidden")) return;
      if (e.key === "Escape") closeLightbox();
    });
  }

  // Autoplay grid preview videos only while visible (portfolio.html)
  var reduceMotionVideos = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var gridVideos = document.querySelectorAll("video.portfolio-thumb");
  if (!reduceMotionVideos && gridVideos.length && "IntersectionObserver" in window) {
    var videoObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var vid = entry.target;
          if (entry.isIntersecting) {
            if (vid.getAttribute("preload") === "none") vid.setAttribute("preload", "auto");
            var playPromise = vid.play();
            if (playPromise && playPromise.catch) playPromise.catch(function () {});
          } else {
            vid.pause();
          }
        });
      },
      { threshold: 0.35 }
    );
    gridVideos.forEach(function (vid) { videoObserver.observe(vid); });
  }
})();
