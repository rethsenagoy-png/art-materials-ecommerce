/* =========================================================
   Artistic You - JavaScript effects
   1. Floating fireflies (glowing particles in the background)
   2. Scroll reveal (sections and cards fade in as you scroll)
   3. Paint splash (colorful dots burst wherever you click)
   4. Working cart (Buy Now! adds items, badge counts, cart popup)
   5. Back-to-top button
   ========================================================= */

//    For Testing Purposes huhu..... But it turns out to be good
(function () {
  "use strict";

  // People who turn off animations in their device settings get no motion effects.
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const PAINT_COLORS = [
    "#E5486E",
    "#F2B632",
    "#2F6FDB",
    "#1FA37A",
    "#7A4FD6",
    "#F28A32",
  ];

  /* ---------- Styles used by the effects (kept here so you only need this one file) ---------- */
  const style = document.createElement("style");
  style.textContent = `
    #fireflies { position: fixed; inset: 0; width: 100%; height: 100%; z-index: -1; pointer-events: none; }
    .paint-dot { position: fixed; border-radius: 50%; pointer-events: none; z-index: 9999; }
    .back-to-top {
      position: fixed; left: 1rem; bottom: 1rem; width: 48px; height: 48px; z-index: 1030;
      opacity: 0; visibility: hidden; transform: translateY(20px);
      transition: opacity .3s, transform .3s, visibility .3s;
    }
    .back-to-top.visible { opacity: 1; visibility: visible; transform: none; }
    @media (prefers-reduced-motion: no-preference) {
      .reveal { opacity: 0; transform: translateY(40px) scale(0.97); transition: opacity .9s ease, transform .9s ease; }
      .reveal.show { opacity: 1; transform: none; }
      .cart-badge.bump { animation: cartBump .5s ease; }
      @keyframes cartBump { 0% { transform: scale(1); } 40% { transform: scale(1.8); } 100% { transform: scale(1); } }
      @keyframes pageIn { from { opacity: 0; } to { opacity: 1; } }
      body { animation: pageIn 1.2s ease; }
    }
  `;
  document.head.appendChild(style);

  /* =========================================================
     1. FIREFLIES - glowing particles drifting upward
     ========================================================= */
  function startFireflies() {
    if (reduceMotion) return;

    const canvas = document.createElement("canvas");
    canvas.id = "fireflies";
    document.body.prepend(canvas);
    const ctx = canvas.getContext("2d");

    const GLOWS = ["255,210,127", "255,180,90", "255,150,170", "170,200,255"];
    let width, height;
    const flies = [];

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    function makeFly(randomY) {
      return {
        baseX: Math.random() * width,
        y: randomY ? Math.random() * height : height + 20,
        r: 1.5 + Math.random() * 3, // size
        speed: 0.15 + Math.random() * 0.45, // how fast it floats up
        sway: 10 + Math.random() * 40, // how far it drifts sideways
        swaySpeed: 0.0004 + Math.random() * 0.0008,
        twinkle: 0.001 + Math.random() * 0.002,
        phase: Math.random() * Math.PI * 2,
        glow: GLOWS[Math.floor(Math.random() * GLOWS.length)],
      };
    }

    resize();
    const amount = window.innerWidth < 768 ? 22 : 45;
    for (let i = 0; i < amount; i++) flies.push(makeFly(true));
    window.addEventListener("resize", resize);

    function draw(time) {
      ctx.clearRect(0, 0, width, height);
      for (const f of flies) {
        f.y -= f.speed;
        if (f.y < -20) Object.assign(f, makeFly(false));
        const x = f.baseX + Math.sin(time * f.swaySpeed + f.phase) * f.sway;
        const alpha =
          0.25 + 0.5 * (0.5 + 0.5 * Math.sin(time * f.twinkle + f.phase));
        ctx.beginPath();
        ctx.arc(x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${f.glow}, ${alpha})`;
        ctx.shadowColor = `rgba(${f.glow}, 0.9)`;
        ctx.shadowBlur = f.r * 6;
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  /* =========================================================
     2. SCROLL REVEAL - things rise and fade in when you scroll to them
     ========================================================= */
  function setupReveal() {
    if (reduceMotion || !("IntersectionObserver" in window)) return;

    const targets = document.querySelectorAll(
      "section h1, section h2, .card, .gallery-img, footer .row > div",
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          el.classList.add("show");
          observer.unobserve(el);
          // Clean up afterwards so the normal card hover effect still works.
          setTimeout(() => {
            el.classList.remove("reveal", "show");
            el.style.transitionDelay = "";
          }, 1500);
        });
      },
      { threshold: 0.15 },
    );

    targets.forEach((el) => {
      const unit = el.closest(".col") || el;
      const position = unit.parentElement
        ? Array.from(unit.parentElement.children).indexOf(unit)
        : 0;
      el.style.transitionDelay = (position % 4) * 120 + "ms"; // cards appear one after another
      el.classList.add("reveal");
      observer.observe(el);
    });
  }

  /* =========================================================
     3. PAINT SPLASH - colorful dots burst where you click
     ========================================================= */
  function paintSplash(x, y) {
    for (let i = 0; i < 9; i++) {
      const dot = document.createElement("span");
      const size = 6 + Math.random() * 16;
      dot.className = "paint-dot";
      dot.style.left = x + "px";
      dot.style.top = y + "px";
      dot.style.width = size + "px";
      dot.style.height = size + "px";
      dot.style.background =
        PAINT_COLORS[Math.floor(Math.random() * PAINT_COLORS.length)];
      document.body.appendChild(dot);

      const angle = Math.random() * Math.PI * 2;
      const distance = 30 + Math.random() * 80;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;

      const animation = dot.animate(
        [
          { transform: "translate(-50%, -50%) scale(0.2)", opacity: 0.95 },
          {
            transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1)`,
            opacity: 0,
          },
        ],
        {
          duration: 700 + Math.random() * 400,
          easing: "cubic-bezier(.2,.8,.3,1)",
        },
      );
      animation.onfinish = () => dot.remove();
    }
  }

  document.addEventListener("click", (e) => {
    if (reduceMotion) return;
    if (e.target.closest("input, textarea, select")) return;
    if (e.clientX === 0 && e.clientY === 0) return; // keyboard-triggered click
    paintSplash(e.clientX, e.clientY);
  });

  /* =========================================================
     4. CART - Buy Now! adds items, the navbar badge counts them
     (This is a demo cart. It saves in the browser, there is no real checkout.)
     ========================================================= */
  const CART_KEY = "artisticYouCart";

  function loadCart() {
    try {
      const saved = JSON.parse(localStorage.getItem(CART_KEY));
      return Array.isArray(saved) ? saved : [];
    } catch (e) {
      return [];
    }
  }
  function saveCart() {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (e) {
      /* storage not available, the cart just won't be remembered */
    }
  }

  let cart = loadCart();
  const cartCount = () => cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = () =>
    cart.reduce((sum, item) => sum + item.qty * item.price, 0);
  const peso = (n) =>
    "₱" +
    n.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Find the Cart button in the navbar and give it a number badge
  const cartLinks = Array.from(document.querySelectorAll("a.btn")).filter((a) =>
    a.querySelector(".bi-cart3"),
  );
  const badges = cartLinks.map((link) => {
    const badge = document.createElement("span");
    badge.className = "cart-badge badge rounded-pill text-bg-danger ms-1";
    link.appendChild(badge);
    return badge;
  });

  function updateBadges(bump) {
    const n = cartCount();
    badges.forEach((b) => {
      b.textContent = n;
      b.style.display = n > 0 ? "" : "none";
      if (bump) {
        b.classList.remove("bump");
        void b.offsetWidth; // restart the animation
        b.classList.add("bump");
      }
    });
  }

  // Little green message in the corner (Bootstrap Toast)
  function showToast(message) {
    if (typeof bootstrap === "undefined") return;
    let wrap = document.querySelector(".toast-container");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "toast-container position-fixed bottom-0 end-0 p-3";
      wrap.style.zIndex = 1090;
      document.body.appendChild(wrap);
    }
    const toast = document.createElement("div");
    toast.className = "toast align-items-center text-bg-success border-0";
    toast.setAttribute("role", "status");
    const row = document.createElement("div");
    row.className = "d-flex";
    const body = document.createElement("div");
    body.className = "toast-body";
    body.textContent = message;
    const close = document.createElement("button");
    close.type = "button";
    close.className = "btn-close btn-close-white me-2 m-auto";
    close.setAttribute("data-bs-dismiss", "toast");
    close.setAttribute("aria-label", "Close");
    row.append(body, close);
    toast.appendChild(row);
    wrap.appendChild(toast);
    toast.addEventListener("hidden.bs.toast", () => toast.remove());
    new bootstrap.Toast(toast, { delay: 2200 }).show();
  }

  // The cart popup (Bootstrap Modal)
  let cartModal = null;
  function buildCartModal() {
    const modal = document.createElement("div");
    modal.className = "modal fade";
    modal.id = "cartModal";
    modal.tabIndex = -1;
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Your Cart</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" id="cartBody"></div>
          <div class="modal-footer justify-content-between">
            <small class="text-muted">Demo cart: checkout isn't connected.</small>
            <div>
              <button type="button" class="btn btn-outline-danger" id="cartClear">Clear cart</button>
              <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Keep browsing</button>
            </div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(modal);

    modal.querySelector("#cartClear").addEventListener("click", () => {
      cart = [];
      saveCart();
      renderCart();
      updateBadges(false);
    });
    modal.querySelector("#cartBody").addEventListener("click", (e) => {
      const remove = e.target.closest("[data-remove]");
      if (!remove) return;
      cart.splice(Number(remove.dataset.remove), 1);
      saveCart();
      renderCart();
      updateBadges(false);
    });
    return modal;
  }

  function renderCart() {
    const body = document.getElementById("cartBody");
    if (!body) return;
    body.replaceChildren();
    if (cart.length === 0) {
      const empty = document.createElement("p");
      empty.className = "text-center text-muted my-4";
      empty.textContent = "Your cart is empty. Time to find some art supplies!";
      body.appendChild(empty);
      return;
    }
    const list = document.createElement("ul");
    list.className = "list-group list-group-flush";
    cart.forEach((item, index) => {
      const li = document.createElement("li");
      li.className =
        "list-group-item d-flex justify-content-between align-items-center px-0";
      const label = document.createElement("span");
      label.textContent = item.name + "  ×" + item.qty;
      const right = document.createElement("span");
      right.className = "d-flex align-items-center gap-3";
      if (item.price > 0) {
        const price = document.createElement("strong");
        price.textContent = peso(item.price * item.qty);
        right.appendChild(price);
      }
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "btn btn-sm btn-outline-secondary";
      remove.dataset.remove = index;
      remove.setAttribute("aria-label", "Remove " + item.name);
      remove.textContent = "Remove";
      right.appendChild(remove);
      li.append(label, right);
      list.appendChild(li);
    });
    body.appendChild(list);
    if (cartTotal() > 0) {
      const total = document.createElement("p");
      total.className = "text-end fw-bold fs-5 mt-3 mb-0";
      total.textContent = "Total: " + peso(cartTotal());
      body.appendChild(total);
    }
  }

  function openCart() {
    if (typeof bootstrap === "undefined") return;
    if (!cartModal) cartModal = buildCartModal();
    renderCart();
    bootstrap.Modal.getOrCreateInstance(cartModal).show();
  }

  document.addEventListener("click", (e) => {
    // Navbar Cart button opens the popup
    const cartLink = e.target.closest("a.btn");
    if (cartLink && cartLinks.includes(cartLink)) {
      e.preventDefault();
      openCart();
      return;
    }

    // Any "Buy Now!" button on a product card adds that product
    const btn = e.target.closest(".card .btn");
    if (!btn || btn.textContent.trim().toLowerCase() !== "buy now!") return;
    e.preventDefault();

    const card = btn.closest(".card");
    const titleEl = card.querySelector(".card-title");
    const name = titleEl ? titleEl.textContent.trim() : "Art supply";
    const priceEl = card.querySelector(".fw-bold");
    const price = priceEl
      ? parseFloat(priceEl.textContent.replace(/[^0-9.]/g, "")) || 0
      : 0;

    const existing = cart.find((item) => item.name === name);
    if (existing) existing.qty += 1;
    else cart.push({ name, price, qty: 1 });

    saveCart();
    updateBadges(true);
    showToast(name + " added to your cart");
  });

  /* =========================================================
     5. BACK-TO-TOP BUTTON
     ========================================================= */
  function setupBackToTop() {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "back-to-top btn btn-primary rounded-circle shadow";
    btn.setAttribute("aria-label", "Back to top");
    btn.textContent = "↑";
    document.body.appendChild(btn);

    window.addEventListener(
      "scroll",
      () => btn.classList.toggle("visible", window.scrollY > 400),
      { passive: true },
    );
    btn.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }),
    );
  }

  /* ---------- Start everything ---------- */
  function init() {
    startFireflies();
    setupReveal();
    setupBackToTop();
    updateBadges(false);
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
})();
