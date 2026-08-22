(function () {
  "use strict";

  // Spotlight outline glow (.spotlight/.card/.portfolio-card) — one global
  // pointermove listener writes the cursor position into each box's own
  // --x/--y in ELEMENT-LOCAL px. An earlier version set viewport coords once
  // on :root and had every box read them via background-attachment:fixed, but
  // fixed-attachment backgrounds re-anchor to any transformed/filtered
  // ancestor instead of the viewport — .reveal alone leaves a permanent
  // translateY(0) transform after animating in — which silently misplaced the
  // glow on pages whose boxes sit inside such subtrees. Local coords make the
  // glow immune to transforms anywhere in the tree. ~20 rect reads per move
  // with no interleaved writes that invalidate layout, so there's no thrash.
  // Skipped entirely on touch-only devices and under prefers-reduced-motion,
  // since there's no hover/cursor to track.
  var spotlightEls = document.querySelectorAll(".spotlight, .card, .portfolio-card");
  var supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var reduceMotionSpotlight = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (spotlightEls.length && supportsHover && !reduceMotionSpotlight) {
    document.addEventListener(
      "pointermove",
      function (e) {
        for (var i = 0; i < spotlightEls.length; i++) {
          var el = spotlightEls[i];
          var r = el.getBoundingClientRect();
          el.style.setProperty("--x", e.clientX - r.left - el.clientLeft + "px");
          el.style.setProperty("--y", e.clientY - r.top - el.clientTop + "px");
        }
      },
      { passive: true }
    );
  }

  // Scroll-expansion hero (index.html) — the media frame grows from a small
  // centred card to a near-full-height portrait frame as the page scrolls
  // through the tall #hero-track; the sticky child pins the visuals while the
  // track supplies the distance. Progress comes from scroll position rather
  // than hijacked wheel/touch events (the usual React implementation of this
  // pattern preventDefaults wheel+touchmove), so trackpads, touch, keyboard
  // scrolling and scrollbar drags all behave identically and nothing can trap
  // the user at the top of the page. Styles update synchronously — no rAF,
  // which this project avoids (see spotlight note above).
  var heroTrack = document.getElementById("hero-track");
  if (heroTrack) {
    var heroMedia = document.getElementById("hero-media");
    var heroVideo = document.getElementById("hero-video");
    var heroBg = document.getElementById("hero-bg");
    var heroScrim = document.getElementById("hero-scrim");
    var heroTitleLeft = document.getElementById("hero-title-left");
    var heroTitleRight = document.getElementById("hero-title-right");
    var heroEyebrow = document.getElementById("hero-eyebrow");
    var heroHintLeft = document.getElementById("hero-hint-left");
    var heroHintRight = document.getElementById("hero-hint-right");
    var heroCopy = document.getElementById("hero-copy");
    var reduceMotionHero = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotionHero) {
      // Static hero: collapse the scroll track, show everything expanded,
      // leave the video on its poster (no autoplaying motion).
      heroTrack.classList.add("hero-static");
    } else {
      heroTrack.classList.add("hero-anim");

      // Split the headline into per-word spans so each word can fade/rise in
      // on its own slice of the scroll progress. The full sentence stays on
      // the h1 as an aria-label (and in the DOM for crawlers); the visual
      // spans are marked aria-hidden so screen readers hear one clean phrase.
      var heroWords = [];
      var heroTitle = heroTitleLeft.parentElement;
      heroTitle.setAttribute("aria-label", heroTitle.textContent.replace(/\s+/g, " ").trim());
      [heroTitleLeft, heroTitleRight].forEach(function (line) {
        var words = line.textContent.trim().split(/\s+/);
        line.textContent = "";
        line.setAttribute("aria-hidden", "true");
        words.forEach(function (word, i) {
          var span = document.createElement("span");
          span.className = "hero-word";
          span.textContent = word;
          line.appendChild(span);
          if (i < words.length - 1) line.appendChild(document.createTextNode(" "));
          heroWords.push(span);
        });
      });

      var heroUpdate = function () {
        var rect = heroTrack.getBoundingClientRect();
        var vh = window.innerHeight;
        var vw = window.innerWidth;
        var travel = rect.height - vh;
        var p = travel > 0 ? Math.min(Math.max(-rect.top / travel, 0), 1) : 1;

        // The frame opens as a tall centre column and expands out from the
        // sides (the object-cover crop reveals the reel's edges as the width
        // grows), rather than a small card inflating in both directions.
        // Desktop keeps the reel's native 16:9; mobile crops to 4:5 portrait,
        // because a landscape strip on a phone is a sliver of screen and the
        // headline dwarfs it. hwRatio is height/width.
        var mobile = vw < 768;
        var hwRatio = mobile ? 1.25 : 0.5625;
        var maxH = Math.min(vh * 0.82, 900);
        var targetW = Math.min(vw * 0.92, maxH / hwRatio);
        var targetH = targetW * hwRatio;
        var startW = vw * (mobile ? 0.62 : 0.38);
        var startH = targetH * (mobile ? 0.92 : 0.88);
        var frameH = startH + (targetH - startH) * p;
        heroMedia.style.width = startW + (targetW - startW) * p + "px";
        heroMedia.style.height = frameH + "px";

        // On mobile the eyebrow lives in the black band above the frame, not
        // over the video: centre it vertically between the header and the
        // (vertically centred) frame's top edge so it tracks the frame at any
        // phone height, clamped so it never tucks under the 80px header.
        // Desktop keeps it in the centred title stack (clear the overrides).
        if (mobile) {
          var frameTop = (vh - frameH) / 2;
          var ebTop = (81 + frameTop) / 2 - (heroEyebrow.offsetHeight || 32) / 2;
          if (ebTop < 84) ebTop = 84;
          heroEyebrow.style.top = ebTop + "px";
          heroEyebrow.style.bottom = "auto";
        } else {
          heroEyebrow.style.top = "";
          heroEyebrow.style.bottom = "";
        }

        // Eyebrow leads the reveal, then the headline builds word by word
        // across the scroll, settling fully visible over the expanded reel.
        var eq = Math.min(Math.max((p - 0.02) / 0.1, 0), 1);
        heroEyebrow.style.opacity = String(eq);
        heroEyebrow.style.transform = "translateY(" + (1 - eq) * 10 + "px)";

        var revealStart = 0.08;
        var revealSpan = 0.62;
        var wordWindow = 0.16;
        for (var i = 0; i < heroWords.length; i++) {
          var q = (p - (revealStart + (revealSpan * i) / heroWords.length)) / wordWindow;
          q = q < 0 ? 0 : q > 1 ? 1 : q;
          heroWords[i].style.opacity = String(q);
          heroWords[i].style.transform = "translateY(" + (1 - q) * 0.45 + "em)";
        }

        var slide = p * (vw < 768 ? 120 : 90);
        heroHintLeft.style.transform = "translateX(" + -slide + "vw)";
        heroHintRight.style.transform = "translateX(" + slide + "vw)";
        var hintFade = String(Math.max(1 - p * 1.6, 0));
        heroHintLeft.style.opacity = hintFade;
        heroHintRight.style.opacity = hintFade;

        heroBg.style.opacity = String(1 - p);
        // Scrim deepens slightly as the headline lands so white text stays
        // legible over the brightest video moments.
        heroScrim.style.opacity = String(0.25 + p * 0.15);

        heroCopy.classList.toggle("is-visible", p > 0.85);
      };

      heroUpdate();
      window.addEventListener("scroll", heroUpdate, { passive: true });
      // Fast flick-scrolls can throttle away the final scroll event in some
      // browsers, freezing the headline mid-fade; scrollend guarantees one
      // last correct update where supported.
      window.addEventListener("scrollend", heroUpdate);
      window.addEventListener("resize", heroUpdate);

      var heroPlay = function () {
        var pr = heroVideo.play();
        if (pr && pr.catch) pr.catch(function () {});
      };
      heroPlay();
      // Pause the loop while the hero is scrolled out of view
      var heroInView = true;
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            heroInView = entry.isIntersecting;
            if (heroInView) heroPlay();
            else heroVideo.pause();
          });
        }, { threshold: 0.05 }).observe(heroTrack);
      }
      // Browsers pause muted autoplay when the tab is backgrounded or under
      // power saving; resume when the user comes back to a visible hero.
      document.addEventListener("visibilitychange", function () {
        if (!document.hidden && heroInView) heroPlay();
      });
    }
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
    window.addEventListener("scrollend", onScroll);
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

  // Rotate the photography service thumbnail every 2s through every real photo
  // in the portfolio (all `type: "image"` entries from portfolio-data.js —
  // this skips video files and their poster frames, which read as blurry
  // grabbed-from-video stills next to actual photography). Only two <img>
  // layers ever exist in the DOM; each cycle preloads the next photo off-
  // screen before crossfading so there's no flash of a half-loaded image.
  var photoCycles = document.querySelectorAll(".photo-cycle");
  if (!reduceMotion && photoCycles.length && typeof PORTFOLIO_PROJECTS !== "undefined") {
    var allPhotos = [];
    Object.keys(PORTFOLIO_PROJECTS).forEach(function (key) {
      PORTFOLIO_PROJECTS[key].media.forEach(function (item) {
        if (item.type === "image") allPhotos.push(item.src);
      });
    });
    for (var si = allPhotos.length - 1; si > 0; si--) {
      var sj = Math.floor(Math.random() * (si + 1));
      var tmp = allPhotos[si];
      allPhotos[si] = allPhotos[sj];
      allPhotos[sj] = tmp;
    }
    if (allPhotos.length > 1) {
      photoCycles.forEach(function (cycle) {
        var layers = cycle.querySelectorAll(".photo-cycle-img");
        if (layers.length < 2) return;
        var front = layers[0];
        var back = layers[1];
        var idx = 0;
        setInterval(function () {
          idx = (idx + 1) % allPhotos.length;
          var nextSrc = allPhotos[idx];
          var preload = new Image();
          preload.onload = function () {
            back.src = nextSrc;
            back.classList.replace("opacity-0", "opacity-100");
            front.classList.replace("opacity-100", "opacity-0");
            var swap = front;
            front = back;
            back = swap;
          };
          preload.src = nextSrc;
        }, 2000);
      });
    }
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
          // data-category can hold multiple space-separated values (e.g. a
          // project shot in both video and photography shows under either
          // filter) rather than forcing one bucket per project.
          var cats = item.getAttribute("data-category").split(/\s+/);
          var match = filter === "all" || cats.indexOf(filter) !== -1;
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

    // Full-size viewer (opens from any gallery tile; steps through the whole
    // project). Refs exist only on portfolio.html, alongside #lightbox.
    var viewer = document.getElementById("media-viewer");
    var viewerStage = document.getElementById("viewer-stage");
    var viewerCounter = document.getElementById("viewer-counter");
    var viewerPrev = document.getElementById("viewer-prev");
    var viewerNext = document.getElementById("viewer-next");
    var currentMedia = [];
    var currentIndex = 0;

    // A tile's poster/first-frame element. Videos autoplay muted in place
    // once scrolled into view (see galleryVideoObserver below) rather than
    // sitting static until clicked, so the gallery reads as alive while you
    // scroll; preload stays "none" until the observer switches it on so a
    // 60+ item project doesn't request every clip up front.
    var buildThumb = function (item, i, project) {
      var el;
      if (item.type === "video") {
        el = document.createElement("video");
        el.src = item.src;
        if (item.poster) el.poster = item.poster;
        el.muted = true;
        el.loop = true;
        el.playsInline = true;
        el.tabIndex = -1;
        el.setAttribute("preload", "none");
      } else {
        el = document.createElement("img");
        el.src = item.src;
        el.loading = "lazy";
        el.alt = project.title + " image " + (i + 1);
      }
      return el;
    };

    var makeTile = function (item, i, project, className) {
      var tile = document.createElement("button");
      tile.type = "button";
      tile.className = className;
      tile.appendChild(buildThumb(item, i, project));
      tile.addEventListener("click", function () { openViewer(i); });
      return tile;
    };

    // Autoplay gallery video tiles only while visible, muted, same pattern as
    // the outer grid preview cards. Recreated on every project open since
    // renderProjectMedia rebuilds the tiles from scratch each time.
    var galleryVideoObserver = null;
    var observeGalleryVideos = function () {
      if (galleryVideoObserver) galleryVideoObserver.disconnect();
      if (!("IntersectionObserver" in window)) return;
      galleryVideoObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            var vid = entry.target;
            if (entry.isIntersecting) {
              if (vid.getAttribute("preload") === "none") vid.setAttribute("preload", "auto");
              var pr = vid.play();
              if (pr && pr.catch) pr.catch(function () {});
            } else {
              vid.pause();
            }
          });
        },
        { root: lightbox, threshold: 0.35 }
      );
      lbMedia.querySelectorAll("video").forEach(function (vid) {
        galleryVideoObserver.observe(vid);
      });
    };

    // Large projects use a dense square mosaic (contact sheet) so a 184-item
    // set doesn't take forever to scroll; a 2x2 feature on a steady cadence and
    // tall video tiles keep it from reading as a flat grid. Smaller projects
    // keep the roomy uncropped columns. Threshold: more than 12 items.
    var MOSAIC_MIN = 13;

    var renderProjectMedia = function (project) {
      lbMedia.innerHTML = "";
      var mosaic = project.media.length >= MOSAIC_MIN;
      lbMedia.className = "container-px max-w-content mx-auto py-10 sm:py-14 " +
        (mosaic ? "lightbox-mosaic" : "lightbox-columns");
      var frag = document.createDocumentFragment();
      project.media.forEach(function (item, i) {
        var cls;
        if (mosaic) {
          cls = "mosaic-item";
          if (item.type === "video") cls += " mosaic-item--tall";
          else if (i === 0 || i % 11 === 5) cls += " mosaic-item--feature";
        } else {
          cls = "column-item";
        }
        frag.appendChild(makeTile(item, i, project, cls));
      });
      lbMedia.appendChild(frag);
      observeGalleryVideos();
    };

    var renderViewerItem = function () {
      viewerStage.innerHTML = "";
      var item = currentMedia[currentIndex];
      if (!item) return;
      var el;
      if (item.type === "video") {
        el = document.createElement("video");
        el.src = item.src;
        if (item.poster) el.poster = item.poster;
        el.controls = true;
        el.autoplay = true;
        el.loop = true;
        el.playsInline = true;
        el.setAttribute("preload", "auto");
        var pr = el.play();
        if (pr && pr.catch) pr.catch(function () {});
      } else {
        el = document.createElement("img");
        el.src = item.src;
        el.alt = "";
      }
      el.className = "max-h-full max-w-full object-contain border border-border";
      viewerStage.appendChild(el);
      viewerCounter.textContent = (currentIndex + 1) + " / " + currentMedia.length;
      var many = currentMedia.length > 1;
      viewerPrev.style.display = many ? "" : "none";
      viewerNext.style.display = many ? "" : "none";
    };

    // Tiles keep autoplaying muted behind the modal unless paused — with the
    // viewer's own clip now playing WITH sound, pause whichever tile(s) were
    // running so they don't compete for attention/bandwidth, then hand
    // playback back to them (still muted) once the viewer closes.
    var pausedTileVideos = [];
    var openViewer = function (index) {
      currentIndex = index;
      pausedTileVideos = Array.prototype.filter.call(lbMedia.querySelectorAll("video"), function (v) {
        return !v.paused;
      });
      pausedTileVideos.forEach(function (v) { v.pause(); });
      renderViewerItem();
      viewer.classList.remove("hidden");
    };

    var closeViewer = function () {
      viewer.classList.add("hidden");
      viewerStage.innerHTML = "";
      pausedTileVideos.forEach(function (v) {
        var pr = v.play();
        if (pr && pr.catch) pr.catch(function () {});
      });
      pausedTileVideos = [];
    };

    var viewerStep = function (dir) {
      if (!currentMedia.length) return;
      currentIndex = (currentIndex + dir + currentMedia.length) % currentMedia.length;
      renderViewerItem();
    };

    var openLightbox = function (projectId) {
      if (!PORTFOLIO_PROJECTS[projectId]) return;
      var project = PORTFOLIO_PROJECTS[projectId];
      currentMedia = project.media;
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
      closeViewer();
      lightbox.classList.add("hidden");
      lbMedia.innerHTML = "";
      document.body.classList.remove("overflow-hidden");
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    };

    if (viewerPrev) viewerPrev.addEventListener("click", function () { viewerStep(-1); });
    if (viewerNext) viewerNext.addEventListener("click", function () { viewerStep(1); });
    document.querySelectorAll("[data-viewer-close]").forEach(function (el) {
      el.addEventListener("click", closeViewer);
    });
    if (viewer) {
      viewer.addEventListener("click", function (e) {
        if (e.target === viewer || e.target === viewerStage) closeViewer();
      });
    }

    document.querySelectorAll(".portfolio-card").forEach(function (card) {
      card.addEventListener("click", function () {
        openLightbox(card.getAttribute("data-project"));
      });
    });
    document.querySelectorAll("[data-lightbox-close]").forEach(function (el) {
      el.addEventListener("click", closeLightbox);
    });
    document.addEventListener("keydown", function (e) {
      if (viewer && !viewer.classList.contains("hidden")) {
        if (e.key === "Escape") closeViewer();
        else if (e.key === "ArrowLeft") viewerStep(-1);
        else if (e.key === "ArrowRight") viewerStep(1);
        return;
      }
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
