/* Common utilities (no dependencies) */

function base64UrlEncode(str) {
  // UTF-8 safe base64url encoding with wide browser support (no TextEncoder required)
  const b64 = btoa(unescape(encodeURIComponent(str)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(b64url) {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((b64url.length + 3) % 4);
  const bin = atob(b64);
  // UTF-8 safe decode (no TextDecoder required)
  return decodeURIComponent(escape(bin));
}

function encodeCardPayload(obj) {
  return base64UrlEncode(JSON.stringify(obj));
}

function decodeCardPayload(token) {
  return JSON.parse(base64UrlDecode(token));
}

function resolveImage(imgObj) {
  if (!imgObj) return null;
  if (imgObj.type === "builtin") return `images/${imgObj.name}`;
  if (imgObj.type === "url") return imgObj.url;
  return null;
}

// Very small allowlist sanitizer for message HTML.
// Keeps basic formatting and links; strips scripts, inline handlers, and javascript: URLs.
function sanitizeMessageHTML(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html || "", "text/html");

  const allowed = new Set([
    "P","BR","B","STRONG","I","EM","U","S","DEL",
    "H1","H2","H3","H4",
    "UL","OL","LI",
    "BLOCKQUOTE",
    "A",
    "SPAN",
    "DIV",
    "HR",
    "CODE"
  ]);

  // Remove dangerous nodes entirely
  doc.querySelectorAll("script, style, iframe, object, embed, link, meta").forEach(n => n.remove());

  // Walk all elements
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT, null);
  const toClean = [];
  while (walker.nextNode()) toClean.push(walker.currentNode);

  for (const el of toClean) {
    if (!allowed.has(el.tagName)) {
      // unwrap unknown tags but keep their children
      const frag = doc.createDocumentFragment();
      while (el.firstChild) frag.appendChild(el.firstChild);
      el.replaceWith(frag);
      continue;
    }

    // Remove all event handlers and suspicious attributes
    [...el.attributes].forEach(attr => {
      const name = attr.name.toLowerCase();
      const value = (attr.value || "").trim();

      if (name.startsWith("on")) el.removeAttribute(attr.name);
      if (name === "style") el.removeAttribute("style"); // keep it simple (and safe)
      if (name === "srcdoc") el.removeAttribute("srcdoc");

      if (el.tagName === "A" && name === "href") {
        // allow http(s), mailto, and relative
        const v = value.toLowerCase();
        if (v.startsWith("javascript:") || v.startsWith("data:")) el.removeAttribute("href");
      } else if (name === "href") {
        el.removeAttribute("href");
      }
    });

    if (el.tagName === "A") {
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener noreferrer");
    }
  }

  return doc.body.innerHTML;
}

function isMobile() {
  return window.matchMedia && window.matchMedia("(max-width: 860px)").matches;
}

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

function makeFallingIcons(iconChar) {
  const ch = (iconChar || "").trim();
  if (!ch) return;

  // Use just the first *grapheme-ish* chunk to keep it simple.
  const icon = [...ch][0] || ch[0];

  const layer = document.createElement("div");
  layer.className = "fall-layer";
  layer.setAttribute("aria-hidden", "true");

  // Create ~28 icons (scales with viewport)
  const count = clamp(Math.floor((window.innerWidth * window.innerHeight) / 45000), 18, 42);

  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    s.className = "fall";
    s.textContent = icon;
    s.style.setProperty("--left", `${Math.random() * 100}vw`);
    s.style.setProperty("--delay", `${(-Math.random() * 12).toFixed(2)}s`);
    s.style.setProperty("--duration", `${(8 + Math.random() * 10).toFixed(2)}s`);
    s.style.setProperty("--size", `${(12 + Math.random() * 22).toFixed(0)}px`);
    s.style.setProperty("--opacity", `${(0.35 + Math.random() * 0.55).toFixed(2)}`);
    layer.appendChild(s);
  }

  document.body.appendChild(layer);

  // Refresh on resize (lightweight)
  let t;
  window.addEventListener("resize", () => {
    clearTimeout(t);
    t = setTimeout(() => {
      layer.remove();
      makeFallingIcons(iconChar);
    }, 250);
  }, {passive:true});
}
