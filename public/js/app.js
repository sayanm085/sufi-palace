const entrance = document.querySelector("#entrance");
const skip = document.querySelector("#skip");
const introRoot = document.documentElement;
const introMotion = matchMedia("(prefers-reduced-motion: reduce)");
const introContent = [
  ...document.querySelectorAll("main, footer, .whatsapp-widget"),
];
let introDone = false;
let introOpening = false;
let openingTimer;
let cleanupTimer;
let failOpenTimer;

function finishIntro() {
  if (introDone) return;
  introDone = true;
  clearTimeout(openingTimer);
  clearTimeout(cleanupTimer);
  clearTimeout(failOpenTimer);
  introRoot.classList.remove("intro-pending", "intro-opening");
  introContent.forEach((element) => {
    element.inert = false;
  });
  entrance?.remove();
  skip.hidden = true;
  if (document.activeElement === skip)
    document.querySelector(".brand")?.focus({ preventScroll: true });
}

function openDoors() {
  if (introDone || introOpening) return;
  introOpening = true;
  introRoot.classList.add("intro-opening");
  entrance.classList.add("open");
  cleanupTimer = setTimeout(finishIntro, 2600);
}

if (!introRoot.classList.contains("intro-pending") || introMotion.matches) {
  finishIntro();
} else {
  skip.hidden = false;
  introContent.forEach((element) => {
    element.inert = true;
  });
  skip.addEventListener("click", finishIntro);
  failOpenTimer = setTimeout(finishIntro, 5200);
  const door = entrance.querySelector("img");
  // Start only once the door is decoded, so a slow connection never reveals an empty panel.
  door
    .decode()
    .then(() => {
      if (!introDone) openingTimer = setTimeout(openDoors, 600);
    })
    .catch(finishIntro);
}
introMotion.addEventListener("change", (event) => {
  if (event.matches) finishIntro();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !introDone) finishIntro();
});
const toggle = document.querySelector(".menu-toggle"),
  nav = document.querySelector("#nav");
toggle.addEventListener("click", () => {
  const open = toggle.getAttribute("aria-expanded") === "true";
  toggle.setAttribute("aria-expanded", String(!open));
  toggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
  nav.classList.toggle("show", !open);
});
nav.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    nav.classList.remove("show");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  }),
);
const gallery = document.querySelector("#real-gallery");
document
  .querySelector("#gallery-prev")
  ?.addEventListener("click", () =>
    gallery.scrollBy({ left: -420, behavior: "smooth" }),
  );
document
  .querySelector("#gallery-next")
  ?.addEventListener("click", () =>
    gallery.scrollBy({ left: 420, behavior: "smooth" }),
  );
// Seamless decorative ticker, with two exactly matching copies.
const track = document.querySelector(".ticker-track");
if (track) {
  const content =
    "✥　 BIRYANI　 ✦　 KEBABS　 ✦　 COLLEGE STREET　 ✥　 MUGHLAI FLAVOURS　 ✦　 GOOD COMPANY　 ";
  track.replaceChildren(
    ...[0, 1].map((i) => {
      const span = document.createElement("span");
      span.textContent = content.repeat(3);
      if (i) span.setAttribute("aria-hidden", "true");
      return span;
    }),
  );
}
const platformDetails = [
  [
    "Zomato",
    "892 dining ratings",
    "18K+ delivery ratings",
    "Listing snapshot · Oct 2026",
  ],
  [
    "Swiggy",
    "9K+ ratings",
    "Explore delivery options",
    "Listing snapshot · Oct 2026",
  ],
  [
    "Tripadvisor",
    "9 traveller reviews",
    "Photos and visitor experiences",
    "Listing snapshot · Oct 2026",
  ],
  [
    "District",
    "892 dining ratings",
    "Explore menus and dining",
    "Listing snapshot · Oct 2026",
  ],
];
document.querySelectorAll(".platform-tile").forEach((el, i) => {
  const data = platformDetails[i];
  el.dataset.hoverTitle = data[0];
  el.dataset.hoverSummary = data.slice(1).join(" · ");
  const info = document.createElement("small");
  info.className = "platform-facts";
  info.textContent = data[1];
  el.insertBefore(info, el.lastElementChild);
});
document.querySelectorAll(".media-card").forEach((el) => {
  const img = el.querySelector("img"),
    iframe = el.querySelector("iframe");
  el.dataset.hoverTitle = iframe
    ? "Visitor film"
    : img?.alt || "Restaurant media";
  el.dataset.hoverSummary = iframe
    ? "A visitor’s Sufi Palace experience. Watch on YouTube."
    : el.querySelector(".external-video")
      ? "Open the full film on YouTube."
      : "Real restaurant photograph. Open the credited source for more.";
});
document.querySelectorAll(".dish-item").forEach((el) => {
  el.dataset.hoverTitle = el
    .querySelector(".dish-name")
    ?.textContent.replace("✥", "")
    .trim();
  el.dataset.hoverSummary =
    "Illustrative food artwork. Explore the menu for current dishes.";
});
// Offer context throughout the page, including navigation and guest reviews.
document.querySelectorAll(".light-reviews blockquote").forEach((el) => {
  el.dataset.hoverTitle = el.querySelector("cite").textContent;
  el.dataset.hoverSummary = el.querySelector("p").textContent;
});
const pageContext = {
  "#top": [
    "Welcome to Sufi Palace",
    "Mughlai flavours in the heart of College Street, Kolkata.",
  ],
  "#story": [
    "Our story",
    "Discover the people, place and flavours behind Sufi Palace.",
  ],
  "#menu": [
    "Explore our menu",
    "Turn the pages of our menu to discover biryani, kebabs and more.",
  ],
  "#moments": [
    "Guest stories",
    "Explore real restaurant photographs, visitor films and selected reviews.",
  ],
  "#visit": [
    "Visit Sufi Palace",
    "113 Mahatma Gandhi Road, College Street Market, Kolkata.",
  ],
};
document.querySelectorAll("a,button").forEach((el) => {
  if (el.closest("[data-hover-title]")) return;
  const href = el.getAttribute("href") || "";
  const label = (el.getAttribute("aria-label") || el.textContent)
    .replace(/\s+/g, " ")
    .trim();
  let content = pageContext[href];
  if (!content && href.startsWith("tel:"))
    content = [
      "Let’s talk",
      "Call Sufi Palace on +91 84500 77775 for tables, timings and enquiries.",
    ];
  if (!content && href.includes("maps"))
    content = [
      "Find your way",
      "Open directions to Sufi Palace in College Street, Kolkata.",
    ];
  if (!content && href.includes("instagram"))
    content = [
      "Follow Sufi Palace",
      "Visit the restaurant’s Instagram for more moments and updates.",
    ];
  if (!content && label)
    content = [
      label,
      href.startsWith("http")
        ? "Open the original listing for more details."
        : "Explore more of the Sufi Palace experience.",
    ];
  if (content) {
    el.dataset.hoverTitle = content[0];
    el.dataset.hoverSummary = content[1];
  }
});
const ring = document.createElement("div");
ring.className = "custom-cursor";
ring.setAttribute("aria-hidden", "true");
document.body.append(ring);
const bubble = document.createElement("div");
bubble.className = "hover-orb";
bubble.setAttribute("role", "tooltip");
bubble.id = "hover-orb";
bubble.hidden = true;
document.body.append(bubble);
const fine = matchMedia("(hover: hover) and (pointer: fine)");
let mx = 0,
  my = 0,
  rx = 0,
  ry = 0,
  active = null,
  animation;
function moveRing() {
  rx += (mx - rx) * 0.2;
  ry += (my - ry) * 0.2;
  ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
  if (Math.abs(mx - rx) + Math.abs(my - ry) > 0.2)
    animation = requestAnimationFrame(moveRing);
  else animation = null;
}
function positionBubble(el) {
  const rect = el.getBoundingClientRect(),
    width = bubble.offsetWidth,
    height = bubble.offsetHeight;
  const left = Math.max(
    16,
    Math.min(innerWidth - width - 16, rect.right - width * 0.35),
  );
  const above = rect.top - height - 14;
  const top =
    above >= 16
      ? above
      : Math.max(16, Math.min(innerHeight - height - 16, rect.bottom + 14));
  bubble.style.left = left + "px";
  bubble.style.top = top + "px";
}
function show(el) {
  active = el;
  ring.classList.add("hovering");
  if (!el.dataset.hoverTitle) return;
  bubble.replaceChildren();
  const ornament = document.createElement("span");
  ornament.className = "hover-card-label";
  ornament.textContent = "✥  SUFI PALACE";
  const heading = document.createElement("strong");
  heading.textContent = el.dataset.hoverTitle;
  const summary = document.createElement("p");
  summary.textContent = el.dataset.hoverSummary;
  const foot = document.createElement("span");
  foot.className = "hover-card-foot";
  foot.textContent = "COLLEGE STREET · KOLKATA";
  bubble.append(ornament, heading, summary, foot);
  bubble.hidden = false;
  el.setAttribute("aria-describedby", "hover-orb");
  positionBubble(el);
}
function hide() {
  active?.removeAttribute("aria-describedby");
  active = null;
  ring.classList.remove("hovering");
  bubble.hidden = true;
}
function hoverTarget(target) {
  return target instanceof Element &&
    document.querySelector("#whatsapp-panel").hidden &&
    !target.closest(
      ".whatsapp-widget, #chapter-rail, #book-prev, #book-next, .scroll-begin",
    )
    ? target.closest("[data-hover-title]")
    : null;
}
document.addEventListener("pointermove", (e) => {
  if (!fine.matches || e.pointerType === "touch") return;
  mx = e.clientX;
  my = e.clientY;
  ring.classList.add("visible");
  if (!animation) animation = requestAnimationFrame(moveRing);
});
document.addEventListener("pointerover", (e) => {
  if (!fine.matches) return;
  const el = hoverTarget(e.target);
  if (el && el !== active) {
    hide();
    show(el);
  }
});
document.addEventListener("pointerout", (e) => {
  if (active && !active.contains(e.relatedTarget)) hide();
});
document.addEventListener("focusin", (e) => {
  const el = hoverTarget(e.target);
  if (el) {
    hide();
    show(el);
  }
});
document.addEventListener("focusout", hide);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") hide();
});
document.addEventListener(
  "scroll",
  () => {
    if (active && !bubble.hidden) positionBubble(active);
  },
  true,
);
window.addEventListener("resize", hide);
document.documentElement.addEventListener("pointerleave", () => {
  ring.classList.remove("visible");
  hide();
});

// The visitor reviews and sends this enquiry in WhatsApp; nothing is sent here.
const waToggle = document.querySelector("#whatsapp-toggle");
const waPanel = document.querySelector("#whatsapp-panel");
const waForm = document.querySelector("#whatsapp-form");
function closeWhatsApp(restoreFocus = false) {
  waPanel.hidden = true;
  waToggle.setAttribute("aria-expanded", "false");
  if (restoreFocus) waToggle.focus();
}
waToggle.addEventListener("click", () => {
  if (!waPanel.hidden) {
    closeWhatsApp();
    return;
  }
  hide();
  waPanel.hidden = false;
  waToggle.setAttribute("aria-expanded", "true");
  document.querySelector("#wa-name").focus({ preventScroll: true });
});
document
  .querySelector("#whatsapp-close")
  .addEventListener("click", () => closeWhatsApp(true));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !waPanel.hidden) closeWhatsApp(true);
});
document.addEventListener("pointerdown", (e) => {
  if (!e.target.closest(".whatsapp-widget") && !waPanel.hidden) closeWhatsApp();
});
function updateEnquiryFields() {
  const groupEnquiry = ["Table enquiry", "Catering"].includes(
    new FormData(waForm).get("topic"),
  );
  document.querySelector("#wa-visit-details").hidden = !groupEnquiry;
}
waForm.addEventListener("change", updateEnquiryFields);
waForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!waForm.reportValidity()) return;
  const data = new FormData(waForm),
    name = data.get("name").trim();
  if (!name) {
    document
      .querySelector("#wa-name")
      .setCustomValidity("Please enter your name.");
    waForm.reportValidity();
    return;
  }
  const topic = data.get("topic"),
    lines = [
      `Hello Sufi Palace! My name is ${name}.`,
      `I’m contacting you about: ${topic}.`,
    ];
  if (["Table enquiry", "Catering"].includes(topic)) {
    if (data.get("guests")) lines.push(`Guests: ${data.get("guests")}`);
    if (data.get("date")) lines.push(`Preferred date: ${data.get("date")}`);
  }
  const message = data.get("message").trim();
  if (message) lines.push(message);
  lines.push("Please share the details and confirm availability. Thank you!");
  window.location.assign(
    "https://wa.me/918450077775?text=" + encodeURIComponent(lines.join("\n")),
  );
});
document
  .querySelector("#wa-name")
  .addEventListener("input", (e) => e.target.setCustomValidity(""));

// A chapter guide follows normal scrolling; it never intercepts the wheel or touch gesture.
const chapterLinks = [...document.querySelectorAll("#chapter-rail a")];
const chapterSections = chapterLinks.map((link) =>
  document.querySelector(link.getAttribute("href")),
);
const readingFill = document.querySelector("#reading-progress-fill");
let readingFrame = 0;
function updateReadingGuide() {
  readingFrame = 0;
  const distance = document.documentElement.scrollHeight - innerHeight;
  readingFill.style.transform = `scaleX(${distance > 0 ? Math.max(0, Math.min(1, scrollY / distance)) : 0})`;
  const marker = innerHeight * 0.4;
  let selected = 0;
  chapterSections.forEach((section, index) => {
    if (section.getBoundingClientRect().top <= marker) selected = index;
  });
  chapterLinks.forEach((link, index) => {
    if (index === selected) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
  document
    .querySelector("#chapter-rail")
    .classList.toggle("on-ivory", selected === 4);
}
function requestReadingUpdate() {
  if (!readingFrame) readingFrame = requestAnimationFrame(updateReadingGuide);
}
window.addEventListener("scroll", requestReadingUpdate, { passive: true });
window.addEventListener("resize", requestReadingUpdate);
window.addEventListener("load", requestReadingUpdate);
updateReadingGuide();
