const body = document.body;
const topbar = document.querySelector(".topbar");
const navToggle = document.querySelector(".nav-toggle");
const filterButtons = document.querySelectorAll("[data-filter]");
const portfolioCards = document.querySelectorAll(".portfolio-card");
const revealItems = document.querySelectorAll(".reveal");
const themeToggle = document.querySelector(".theme-toggle");
const themeStorageKey = "plakat-pablo-theme";
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const sectionNodes = document.querySelectorAll("main section[id]");
const navLinks = document.querySelectorAll('.nav a[href^="#"]');
const yearNode = document.getElementById("year");
const contactForm = document.querySelector(".contact-form");

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

if (navToggle && topbar) {
  navToggle.addEventListener("click", () => {
    const isOpen = topbar.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  document.querySelectorAll('.nav a, .topbar-actions a').forEach((link) => {
    link.addEventListener("click", () => {
      topbar.classList.remove("nav-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

filterButtons.forEach((button) => {
  button.setAttribute("aria-pressed", button.classList.contains("is-active") ? "true" : "false");

  button.addEventListener("click", () => {
    const filter = button.dataset.filter || "all";

    filterButtons.forEach((item) => {
      item.classList.remove("is-active");
      item.setAttribute("aria-pressed", "false");
    });
    button.classList.add("is-active");
    button.setAttribute("aria-pressed", "true");

    portfolioCards.forEach((card) => {
      const categories = (card.dataset.category || "").split(" ");
      const shouldShow = filter === "all" || categories.includes(filter);
      card.classList.toggle("is-hidden", !shouldShow);
    });
  });
});

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const applyTheme = (theme) => {
  if (theme === "dark") {
    body.setAttribute("data-theme", "dark");
    if (themeColorMeta) {
      themeColorMeta.setAttribute("content", "#090909");
    }
  } else {
    body.removeAttribute("data-theme");
    if (themeColorMeta) {
      themeColorMeta.setAttribute("content", "#111111");
    }
  }

  if (themeToggle) {
    const isDark = theme === "dark";
    themeToggle.setAttribute("aria-label", isDark ? "Hellmodus aktivieren" : "Dunkelmodus aktivieren");
  }
};

const storedTheme = window.localStorage.getItem(themeStorageKey);
if (storedTheme) {
  applyTheme(storedTheme);
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = body.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    window.localStorage.setItem(themeStorageKey, nextTheme);
  });
}

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        navLinks.forEach((link) => {
          const isCurrent = link.getAttribute("href") === `#${entry.target.id}`;
          if (isCurrent) {
            link.setAttribute("aria-current", "page");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      });
    },
    {
      threshold: 0.45,
      rootMargin: "-20% 0px -45% 0px"
    }
  );

  sectionNodes.forEach((section) => sectionObserver.observe(section));
}

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const feedback = contactForm.querySelector(".form-feedback");
    const formData = new FormData(contactForm);
    const mailtoTarget = contactForm.getAttribute("data-mailto") || "";
    const name = String(formData.get("name") || "").trim();
    const company = String(formData.get("company") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const projectType = String(formData.get("projectType") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (!mailtoTarget || mailtoTarget.includes("beispiel.de")) {
      if (feedback) {
        feedback.textContent = "Vor dem Livegang bitte zuerst die echte Kontakt-E-Mail eintragen.";
      }
      return;
    }

    const subject = encodeURIComponent(`Anfrage Website: ${projectType}`);
    const bodyLines = [
      `Name: ${name}`,
      `Unternehmen/Verein: ${company || "-"}`,
      `E-Mail: ${email}`,
      `Projektart: ${projectType}`,
      "",
      "Anfrage:",
      message
    ];
    const body = encodeURIComponent(bodyLines.join("\n"));

    window.location.href = `mailto:${mailtoTarget}?subject=${subject}&body=${body}`;

    if (submitButton) {
      submitButton.textContent = "E-Mail wird vorbereitet";
    }

    if (feedback) {
      feedback.textContent = "Ihr E-Mail-Programm wurde mit der vorbereiteten Anfrage geöffnet.";
    }
  });
}
