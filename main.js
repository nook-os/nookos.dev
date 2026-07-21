/* nookos.dev — progressive enhancement only. Nothing here is required for the
   page to be readable; JS off gives you the same content with the nav expanded
   and no copy buttons. No dependencies, no build step. */
(() => {
  "use strict";

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── mobile nav ─────────────────────────────────────────────────── */
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("nav");

  if (toggle && nav) {
    const setOpen = (open) => {
      nav.dataset.open = String(open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "close" : "menu";
    };

    toggle.addEventListener("click", () => {
      setOpen(nav.dataset.open !== "true");
    });

    // Following a link should not leave the menu covering the target.
    nav.addEventListener("click", (e) => {
      if (e.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.dataset.open === "true") {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  /* ── copy buttons on code blocks ────────────────────────────────── */
  // Prompts are decorative, so they are stripped before the clipboard sees
  // them — pasting "$ nook run" into a shell is a small, avoidable insult.
  document.querySelectorAll(".code").forEach((block) => {
    const pre = block.querySelector("pre");
    if (!pre || !navigator.clipboard) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copy";
    btn.textContent = "copy";
    btn.setAttribute("aria-label", "Copy this command to the clipboard");

    btn.addEventListener("click", async () => {
      const text = Array.from(pre.childNodes)
        .map((n) =>
          n.nodeType === Node.ELEMENT_NODE && n.classList.contains("prompt")
            ? ""
            : n.textContent
        )
        .join("")
        .trim();

      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = "copied";
        btn.dataset.copied = "true";
        setTimeout(() => {
          btn.textContent = "copy";
          delete btn.dataset.copied;
        }, 1600);
      } catch {
        btn.textContent = "failed";
        setTimeout(() => (btn.textContent = "copy"), 1600);
      }
    });

    block.appendChild(btn);
  });

  /* ── reveal on scroll ───────────────────────────────────────────── */
  const revealables = document.querySelectorAll(".reveal");

  if (reduced || !("IntersectionObserver" in window)) {
    revealables.forEach((el) => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
    );
    revealables.forEach((el) => io.observe(el));
  }

  /* ── footer year ────────────────────────────────────────────────── */
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
