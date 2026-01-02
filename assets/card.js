/* Card viewer logic */

function el(id){ return document.getElementById(id); }

function show404(reason="") {
  el("viewer").classList.add("hidden");
  el("nf").classList.remove("hidden");
  const r = el("nfReason");
  r.textContent = reason ? `Reason: ${reason}` : "";
}

function setImg(imgEl, url) {
  if (!url) {
    imgEl.classList.add("hidden");
    return;
  }
  imgEl.classList.remove("hidden");
  imgEl.referrerPolicy = "no-referrer";
  imgEl.src = url;
}

function renderDesktop(payload) {
  const desk = el("desk");
  const coverImg = el("deskCoverImg");
  const backImg = el("deskBackImg");
  const msg = el("deskMsg");

  setImg(coverImg, resolveImage(payload.front));
  const backUrl = resolveImage(payload.second);
  setImg(backImg, backUrl);

  msg.innerHTML = sanitizeMessageHTML(payload.messageHtml || "");
  desk.classList.remove("open");

  desk.addEventListener("click", () => desk.classList.toggle("open"));
  desk.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      desk.classList.toggle("open");
    }
  });
}

function renderMobile(payload) {
  const mobile = el("mobile");
  const frontImg = el("mobileFront");
  const secondImg = el("mobileSecond");
  const msg = el("mobileMsg");

  const frontUrl = resolveImage(payload.front);
  const secondUrl = resolveImage(payload.second);

  setImg(frontImg, frontUrl);
  setImg(secondImg, secondUrl);
  msg.innerHTML = sanitizeMessageHTML(payload.messageHtml || "");

  // states: 0 front, 1 message, 2 second (if present), then loop
  let state = 0;
  function apply() {
    el("paneFront").classList.toggle("hidden", state !== 0);
    el("paneMsg").classList.toggle("hidden", state !== 1);
    el("paneSecond").classList.toggle("hidden", state !== 2);
  }
  function next() {
    if (secondUrl) state = (state + 1) % 3;
    else state = (state + 1) % 2;
    apply();
  }

  apply();
  mobile.addEventListener("click", next);
  mobile.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      next();
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("c");

  if (!token) return show404("No card data found in the URL.");

  let payload;
  try {
    payload = decodeCardPayload(token);
    if (!payload || (payload.v !== 1 && payload.v !== 2)) throw new Error("Unsupported payload version");
  } catch (e) {
    return show404("Invalid or corrupted card data.");
  }

  el("nf").classList.add("hidden");
  el("viewer").classList.remove("hidden");

  // Falling icons (optional)
  if (payload.icon) makeFallingIcons(payload.icon);

  // Responsive rendering
  const useMobile = isMobile();
  el("desk").classList.toggle("hidden", useMobile);
  el("mobile").classList.toggle("hidden", !useMobile);

  if (useMobile) renderMobile(payload);
  else renderDesktop(payload);

  // Re-render on breakpoint change
  const mq = window.matchMedia("(max-width: 860px)");
  mq.addEventListener?.("change", () => location.reload());
});
