(function () {
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mobileMenu = document.getElementById("mobileMenu");

  if (mobileMenuBtn && mobileMenu) {
    function toggleMenu(open) {
      const willOpen = open !== undefined ? open : mobileMenu.classList.contains("hidden");
      mobileMenu.classList.toggle("hidden", !willOpen);
      mobileMenuBtn.setAttribute("aria-expanded", String(willOpen));
    }

    mobileMenuBtn.addEventListener("click", () => toggleMenu());

    mobileMenu.addEventListener("click", (event) => {
      if (event.target.matches("a") || event.target.closest("a")) toggleMenu(false);
    });

    document.addEventListener("click", (event) => {
      if (!mobileMenu.contains(event.target) && !mobileMenuBtn.contains(event.target)) {
        toggleMenu(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") toggleMenu(false);
    });
  }

  const path = location.pathname.replace(/\/+$/, "") || "/";
  document.querySelectorAll('nav[aria-label="Primary"] a.nav-link, nav[aria-label="Mobile"] a.nav-link').forEach((link) => {
    const href = link.getAttribute("href") || "";
    const normalized = href.replace(/\/+$/, "") || "/";
    if (normalized === path) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  function initMapTabs() {
    const img = document.getElementById("svcMapImg");
    const tabs = document.querySelectorAll(".svc-tab");
    if (!img || tabs.length === 0) return;

    tabs.forEach((tab) => {
      const preload = new Image();
      preload.src = tab.dataset.img;
    });

    function setActive(el, on) {
      el.classList.remove("bg-red-600", "text-white", "shadow", "bg-white", "text-neutral-800", "ring-1", "ring-neutral-300");
      if (on) {
        el.classList.add("bg-red-600", "text-white", "shadow");
      } else {
        el.classList.add("bg-white", "text-neutral-800", "ring-1", "ring-neutral-300");
      }
    }

    function activate(button) {
      tabs.forEach((tab) => setActive(tab, tab === button));
      const nextSrc = button.dataset.img;
      img.style.opacity = "0";
      img.src = nextSrc;
      img.alt = button.dataset.alt || "";
      img.onload = () => {
        img.style.opacity = "1";
      };
      setTimeout(() => {
        img.style.opacity = "1";
      }, 350);
    }

    tabs.forEach((tab) => tab.addEventListener("click", () => activate(tab)));
  }

  function initCarousel(root) {
    if (!root) return;

    const viewport = root.querySelector(".viewport");
    const track = root.querySelector(".track");
    const slides = Array.from(root.querySelectorAll(".slide"));
    const prev = root.querySelector(".prev");
    const next = root.querySelector(".next");
    const dotsWrap = root.querySelector(".dots");

    if (!viewport || !track || slides.length === 0 || !dotsWrap) return;

    const shouldAutoplay = root.dataset.autoplay === "true";
    let index = 0;

    const width = () => viewport.clientWidth;

    dotsWrap.innerHTML = "";
    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "dot";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", "Go to slide " + (i + 1));
      dot.addEventListener("click", () => go(i, true));
      dotsWrap.appendChild(dot);
    });

    function setDot(i) {
      dotsWrap.querySelectorAll(".dot").forEach((dot, dotIndex) => {
        dot.setAttribute("aria-current", dotIndex === i ? "true" : "false");
      });
    }

    function translate() {
      track.style.transform = "translateX(" + (-index * width()) + "px)";
    }

    function go(i, userInitiated) {
      index = (i + slides.length) % slides.length;
      translate();
      setDot(index);
      if (userInitiated && shouldAutoplay) restart();
    }

    let resizeId;
    function onResize() {
      cancelAnimationFrame(resizeId);
      resizeId = requestAnimationFrame(translate);
    }

    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);

    if (prev) prev.addEventListener("click", () => go(index - 1, true));
    if (next) next.addEventListener("click", () => go(index + 1, true));

    let startX = 0;
    let active = false;

    viewport.addEventListener("pointerdown", (event) => {
      active = true;
      startX = event.clientX;
      viewport.setPointerCapture(event.pointerId);
      if (shouldAutoplay) pause();
    });

    viewport.addEventListener("pointerup", (event) => {
      if (!active) return;
      const dx = event.clientX - startX;
      active = false;
      if (Math.abs(dx) > 40) {
        dx < 0 ? go(index + 1, true) : go(index - 1, true);
      }
      if (shouldAutoplay) restart();
    });

    let intervalId = null;
    function play() {
      if (shouldAutoplay && !intervalId) intervalId = setInterval(() => go(index + 1, false), 4200);
    }
    function pause() {
      if (intervalId) clearInterval(intervalId);
      intervalId = null;
    }
    function restart() {
      pause();
      play();
    }

    if (shouldAutoplay) {
      document.addEventListener("visibilitychange", () => (document.hidden ? pause() : play()));
      [prev, next, viewport].forEach((el) => {
        if (!el) return;
        el.addEventListener("mouseenter", pause);
        el.addEventListener("mouseleave", play);
        el.addEventListener("focusin", pause);
        el.addEventListener("focusout", play);
      });
    }

    go(0, false);
    play();
  }

  function initCounters() {
    const counters = document.querySelectorAll(".count-up");
    if (!counters.length) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function format(value) {
      return Number(value).toLocaleString("en-US");
    }

    function animate(counter) {
      if (counter.dataset.done === "true") return;

      const target = Number(counter.dataset.target || 0);
      const suffix = counter.dataset.suffix || "";

      if (reducedMotion) {
        counter.textContent = format(target) + suffix;
        counter.dataset.done = "true";
        return;
      }

      const duration = 1300;
      const start = performance.now();

      function frame(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(target * eased);
        counter.textContent = format(value) + suffix;

        if (progress < 1) {
          requestAnimationFrame(frame);
        } else {
          counter.textContent = format(target) + suffix;
          counter.dataset.done = "true";
        }
      }

      requestAnimationFrame(frame);
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.45 });

    counters.forEach((counter) => observer.observe(counter));
  }

  initMapTabs();
  initCarousel(document.getElementById("revCarousel"));
  initCarousel(document.getElementById("svcCarouselMobile"));
  initCounters();
})();
