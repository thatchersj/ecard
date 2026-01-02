/* Generator page logic */

const state = {
  images: [],
};

function el(id){ return document.getElementById(id); }

async function loadManifest() {
  try {
    const res = await fetch("images/manifest.json", {cache:"no-store"});
    if (!res.ok) throw new Error("manifest fetch failed");
    state.images = await res.json();
  } catch (e) {
    state.images = [];
  }
}

function populateSelect(selectEl, {allowNone=false}={}) {
  selectEl.innerHTML = "";
  if (allowNone) {
    const o = document.createElement("option");
    o.value = "none";
    o.textContent = "None";
    selectEl.appendChild(o);
  }

  for (const img of state.images) {
    const o = document.createElement("option");
    o.value = `builtin:${img.name}`;
    o.textContent = img.label || img.name;
    selectEl.appendChild(o);
  }

  const oUrl = document.createElement("option");
  oUrl.value = "url";
  oUrl.textContent = "Use an image URL…";
  selectEl.appendChild(oUrl);
}

function showOrHideUrlField(selectId, wrapId) {
  const select = el(selectId);
  const wrap = el(wrapId);
  wrap.classList.toggle("hidden", select.value !== "url");
}

function setupImagePickers() {
  populateSelect(el("frontSelect"));
  populateSelect(el("secondSelect"), {allowNone:true});

  el("frontSelect").addEventListener("change", () => showOrHideUrlField("frontSelect","frontUrlWrap"));
  el("secondSelect").addEventListener("change", () => showOrHideUrlField("secondSelect","secondUrlWrap"));

  showOrHideUrlField("frontSelect","frontUrlWrap");
  showOrHideUrlField("secondSelect","secondUrlWrap");
}

function cmd(command, value=null){
  document.execCommand(command, false, value);
  el("editor").focus();
}


function getCurrentBlock() {
  const editor = el("editor");
  const sel = window.getSelection && window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;

  let node = sel.anchorNode;
  if (!node) return null;
  if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;

  while (node && node !== editor) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.tagName;
      if (["P","DIV","H1","H2","H3","H4","LI","BLOCKQUOTE"].includes(tag)) return node;
    }
    node = node.parentElement;
  }
  return null;
}

function setBlockAlignment(alignClass) {
  const block = getCurrentBlock();
  if (!block) return;

  block.classList.remove("align-left","align-center","align-right","align-justify");
  if (alignClass) block.classList.add(alignClass);

  // Nudge selection to keep editing smooth
  el("editor").focus();
}
function setupEditor() {
  el("boldBtn").addEventListener("click", () => cmd("bold"));
  el("italicBtn").addEventListener("click", () => cmd("italic"));
  el("underlineBtn").addEventListener("click", () => cmd("underline"));
  el("h1Btn").addEventListener("click", () => cmd("formatBlock", "h1"));
  el("h2Btn").addEventListener("click", () => cmd("formatBlock", "h2"));
  el("pBtn").addEventListener("click", () => cmd("formatBlock", "p"));
  el("alignLeftBtn").addEventListener("click", () => setBlockAlignment("align-left"));
  el("alignCenterBtn").addEventListener("click", () => setBlockAlignment("align-center"));
  el("alignRightBtn").addEventListener("click", () => setBlockAlignment("align-right"));
  el("alignJustifyBtn").addEventListener("click", () => setBlockAlignment("align-justify"));
  el("ulBtn").addEventListener("click", () => cmd("insertUnorderedList"));
  el("olBtn").addEventListener("click", () => cmd("insertOrderedList"));
  el("quoteBtn").addEventListener("click", () => cmd("formatBlock", "blockquote"));
  el("hrBtn").addEventListener("click", () => cmd("insertHorizontalRule"));

  el("linkBtn").addEventListener("click", () => {
    const url = prompt("Link URL (https://...)");
    if (!url) return;
    cmd("createLink", url);
  });

  el("colorInput").addEventListener("input", (e) => {
    cmd("foreColor", e.target.value);
  });

  // Provide a pleasant starter message
  el("editor").innerHTML = `<h2>Merry Christmas 🎄</h2><p>Wishing you a wonderful day and a happy new year!</p>`;
}

function parseImageSelection(selectEl, urlInputEl) {
  const v = selectEl.value;
  if (v === "none") return null;
  if (v.startsWith("builtin:")) return {type:"builtin", name: v.slice("builtin:".length)};
  if (v === "url") return {type:"url", url: (urlInputEl.value || "").trim()};
  return null;
}

function looksLikeImageUrl(url) {
  if (!url) return false;
  if (url.startsWith("data:image/")) return true;
  return /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(url);
}

function validateImageUrl(url) {
  return new Promise((resolve) => {
    if (!looksLikeImageUrl(url)) return resolve({ok:false, reason:"That doesn't look like an image URL (png/jpg/gif/webp/svg)."});
    const img = new Image();
    img.onload = () => resolve({ok:true});
    img.onerror = () => resolve({ok:false, reason:"Couldn't load that image URL. Check the link."});
    img.referrerPolicy = "no-referrer";
    img.src = url;
  });
}

async function generate() {
  const front = parseImageSelection(el("frontSelect"), el("frontUrl"));
  const second = parseImageSelection(el("secondSelect"), el("secondUrl"));
  const icon = (el("iconInput").value || "").trim();

  if (!front) return showError("Please choose a front image.");

  // Validate URLs if used
  if (front.type === "url") {
    const res = await validateImageUrl(front.url);
    if (!res.ok) return showError(`Front image: ${res.reason}`);
  }
  if (second && second.type === "url") {
    const res = await validateImageUrl(second.url);
    if (!res.ok) return showError(`Second image: ${res.reason}`);
  }

  const rawHtml = el("editor").innerHTML || "";
  const messageHtml = sanitizeMessageHTML(rawHtml);

  const payload = {
    v: 2,
    front,
    second,
    messageHtml,
    icon
  };

  const token = encodeCardPayload(payload);

  const cardUrl = new URL("card.html", window.location.href);
  cardUrl.searchParams.set("c", token);

  el("outUrl").textContent = cardUrl.toString();
  el("outWrap").classList.remove("hidden");
  el("errWrap").classList.add("hidden");
}

async function copyLink() {
  const text = el("outUrl").textContent;
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    el("copyBtn").textContent = "Copied!";
    setTimeout(() => el("copyBtn").textContent = "Copy link", 1200);
  } catch {
    alert("Couldn't copy automatically. Please copy the link manually.");
  }
}

function shareWhatsApp() {
  const url = el("outUrl").textContent;
  if (!url) return;
  const text = `Here's your card: ${url}`;
  const wa = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(wa, "_blank", "noopener,noreferrer");
}

function showError(msg) {
  el("errText").textContent = msg;
  el("errWrap").classList.remove("hidden");
  el("outWrap").classList.add("hidden");
}

window.addEventListener("DOMContentLoaded", async () => {
  await loadManifest();
  setupImagePickers();
  setupEditor();

  el("generateBtn").addEventListener("click", generate);
  el("copyBtn").addEventListener("click", copyLink);
  el("openBtn").addEventListener("click", () => {
    const url = el("outUrl").textContent;
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  });

  el("waBtn").addEventListener("click", shareWhatsApp);
});
