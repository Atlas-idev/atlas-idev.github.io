(() => {
  "use strict";

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Écran de chargement ---------- */
  const startSite = () => {
    root.classList.add("is-ready");
    try { sessionStorage.setItem("jh-loaded", "1"); } catch (e) { /* navigation privée */ }
  };

  const counter = document.querySelector("[data-loader-count]");
  if (root.classList.contains("no-loader") || !counter) {
    startSite();
  } else {
    const duration = 1200;
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      counter.textContent = String(Math.round(eased * 100)).padStart(3, "0");
      if (p < 1) requestAnimationFrame(step);
      else setTimeout(startSite, 150);
    };
    requestAnimationFrame(step);
  }

  /* ---------- Découpage des titres en mots ---------- */
  document.querySelectorAll("[data-split]").forEach((el) => {
    let i = 0;
    const wrap = (content) => {
      const w = document.createElement("span");
      w.className = "w";
      const inner = document.createElement("span");
      inner.style.setProperty("--wi", i++);
      inner.append(content);
      w.append(inner);
      return w;
    };
    [...el.childNodes].forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        node.textContent.split(/([ \t\r\n]+)/).forEach((part) => {
          if (!part) return;
          frag.append(/^[ \t\r\n]+$/.test(part) ? document.createTextNode(" ") : wrap(part));
        });
        node.replaceWith(frag);
      } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== "BR") {
        node.replaceWith(wrap(node.cloneNode(true)));
      }
    });
  });

  /* Lettres du grand mot du footer */
  document.querySelectorAll("[data-chars]").forEach((el) => {
    const text = el.textContent.trim();
    el.textContent = "";
    [...text].forEach((ch, idx) => {
      const s = document.createElement("span");
      s.textContent = ch;
      s.style.setProperty("--ci", idx);
      el.append(s);
    });
  });

  /* ---------- Apparitions au scroll ---------- */
  const targets = document.querySelectorAll(".reveal, .reveal-img, [data-split], [data-chars]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });
    targets.forEach((el) => io.observe(el));
  } else {
    targets.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Navigation, progression, parallaxe ---------- */
  const nav = document.getElementById("nav");
  const progress = document.querySelector(".progress span");
  const heroImg = document.querySelector(".hero__media img");
  let lastY = window.scrollY;
  let scrollVelocity = 0;
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollVelocity = y - lastY;

    nav.classList.toggle("is-scrolled", y > 20);
    const menuOpen = document.body.classList.contains("menu-open");
    nav.classList.toggle("is-hidden", !menuOpen && y > lastY && y > 400);
    if (progress) progress.style.setProperty("--p", max > 0 ? (y / max).toFixed(4) : 0);

    if (heroImg && !reduceMotion && root.classList.contains("hero-settled") && y < window.innerHeight) {
      heroImg.style.transform = `translateY(${y * 0.18}px)`;
    }

    lastY = y;
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  if (heroImg) {
    heroImg.addEventListener("animationend", () => {
      heroImg.style.animation = "none";
      heroImg.style.opacity = "1";
      heroImg.style.transform = "none";
      root.classList.add("hero-settled");
      onScroll();
    }, { once: true });
  }

  /* ---------- Menu mobile ---------- */
  const toggle = document.querySelector(".nav__toggle");
  const menu = document.getElementById("mobile-menu");
  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    menu.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  };
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  /* ---------- Lien actif ---------- */
  const links = document.querySelectorAll(".nav__links a");
  const sections = [...links].map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  if (sections.length && "IntersectionObserver" in window) {
    const ao = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${entry.target.id}`));
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach((s) => ao.observe(s));
  }

  /* ---------- Compteurs ---------- */
  const pad = (n) => String(n).padStart(2, "0");
  const runCounters = () => {
    document.querySelectorAll("[data-count]").forEach((el) => {
      const target = Number(el.dataset.count);
      if (reduceMotion) { el.textContent = pad(target); return; }
      const t0 = performance.now();
      const step = (now) => {
        const p = Math.min((now - t0) / 1600, 1);
        el.textContent = pad(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  };
  const stats = document.querySelector("[data-stats]");
  if (stats && !reduceMotion && "IntersectionObserver" in window) {
    stats.querySelectorAll("[data-count]").forEach((el) => { el.textContent = "00"; });
    const waitReady = () => (root.classList.contains("is-ready") ? setTimeout(runCounters, 600) : setTimeout(waitReady, 100));
    const so = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) { waitReady(); so.disconnect(); }
    }, { threshold: 0.3 });
    so.observe(stats);
  }

  /* ---------- Horloge Antananarivo ---------- */
  const clock = document.querySelector("[data-clock]");
  if (clock) {
    const fmt = new Intl.DateTimeFormat("fr-FR", {
      timeZone: "Indian/Antananarivo", hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
    const tick = () => { clock.textContent = fmt.format(new Date()); };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- Bandeau qui réagit au scroll ---------- */
  const track = document.querySelector("[data-marquee]");
  if (track && !reduceMotion) {
    track.style.animation = "none";
    let x = 0;
    let dir = 1;
    let boost = 0;
    const loop = () => {
      const half = track.scrollWidth / 2;
      if (scrollVelocity !== 0) dir = scrollVelocity > 0 ? 1 : -1;
      boost += (Math.min(Math.abs(scrollVelocity), 60) * 0.12 - boost) * 0.08;
      scrollVelocity *= 0.9;
      x -= (0.7 + boost) * dir;
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      track.style.transform = `translate3d(${x}px, 0, 0)`;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /* ---------- Boutons magnétiques ---------- */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${dx * 0.22}px, ${dy * 0.3}px)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });

  }

  /* ---------- Année ---------- */
  const year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
})();
