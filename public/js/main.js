// ── Socket.io ─────────────────────────────────────────────────────────────
const socket = io();

// Escucha cuando se agrega un producto en tiempo real (desde otra sesión)
socket.on("product:added", (product) => {
  showToast(`Nuevo producto agregado: ${product.title}`, "success");
});

// Escucha cuando se elimina un producto en tiempo real
socket.on("product:removed", (id) => {
  const card = document.getElementById(`product-${id}`);
  if (card) {
    card.style.transition = "opacity .4s";
    card.style.opacity = "0";
    setTimeout(() => card.remove(), 400);
  }
});

// Actualizaciones del carrito en tiempo real
socket.on("cart:updated", (data) => {
  if (!data) return;
  const qtyEl = document.getElementById(`qty-${data.productId}`);
  const subEl = document.getElementById(`subtotal-${data.productId}`);
  if (qtyEl) qtyEl.textContent = data.quantity;
  if (subEl) subEl.textContent = `$${data.subtotal}`;
  const totalEl = document.getElementById("cart-total");
  if (totalEl) totalEl.textContent = `$${data.cartTotal}`;
});

// Toast
function showToast(msg, type = "success") {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.className = `toast ${type}`;
  setTimeout(() => { toast.className = "toast hidden"; }, 3000);
}


// Guarda el cartId en localStorage para reutilizarlo entre páginas
function getCartId() {
  return localStorage.getItem("cartId");
}

async function ensureCart() {
  let cartId = getCartId();
  if (!cartId) {
    const res = await fetch("/api/carts", { method: "POST" });
    const data = await res.json();
    cartId = data.payload._id;
    localStorage.setItem("cartId", cartId);
  }
  return cartId;
}

// Agregar al carrito (desde el listado)
async function addToCart(productId) {
  try {
    const cartId = await ensureCart();
    const res = await fetch(`/api/carts/${cartId}/product/${productId}`, { method: "POST" });
    const data = await res.json();
    if (data.status === "success") {
      showToast("¡Producto agregado al carrito! 🛒", "success");
      socket.emit("cart:add", { cartId, productId, quantity: 1 });
    } else {
      showToast(data.error || "Error al agregar", "error");
    }
  } catch {
    showToast("Error de conexión", "error");
  }
}

// Agregar al carrito (desde el detalle)
async function addToCartDetail(productId) {
  const qty = parseInt(document.getElementById("quantity")?.value || "1", 10);
  try {
    const cartId = await ensureCart();
    const res = await fetch(`/api/carts/${cartId}/product/${productId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: qty }),
    });
    const data = await res.json();
    if (data.status === "success") {
      showToast(`${qty} par(es) agregado(s) al carrito 🛒`, "success");
      socket.emit("cart:add", { cartId, productId, quantity: qty });
    } else {
      showToast(data.error || "Error al agregar", "error");
    }
  } catch {
    showToast("Error de conexión", "error");
  }
}

// Cambiar cantidad en el carrito
async function changeQty(cartId, productId, currentQty, delta) {
  const newQty = currentQty + delta;
  if (newQty < 1) return removeFromCart(cartId, productId);

  try {
    const res = await fetch(`/api/carts/${cartId}/products/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: newQty }),
    });
    const data = await res.json();
    if (data.status === "success") {
      socket.emit("cart:update", { cartId, productId, quantity: newQty });
      location.reload();
    }
  } catch {
    showToast("Error al actualizar cantidad", "error");
  }
}

// Eliminar producto del carrito
async function removeFromCart(cartId, productId) {
  try {
    const res = await fetch(`/api/carts/${cartId}/products/${productId}`, { method: "DELETE" });
    const data = await res.json();
    if (data.status === "success") {
      const item = document.getElementById(`cart-item-${productId}`);
      if (item) {
        item.style.transition = "opacity .3s";
        item.style.opacity = "0";
        setTimeout(() => { item.remove(); location.reload(); }, 300);
      }
      socket.emit("cart:remove", { cartId, productId });
    }
  } catch {
    showToast("Error al eliminar producto", "error");
  }
}

function showConfirm({ title = "¿Confirmar?", message = "", confirmText = "Confirmar", cancelText = "Cancelar" } = {}) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 9999;
      background: rgba(0,0,0,0.45);
      display: flex; align-items: center; justify-content: center;
    `;

    overlay.innerHTML = `
      <div style="
        background: #fff; border-radius: 12px;
        padding: 24px 28px; width: 320px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.18);
        font-family: sans-serif;
      ">
        <p style="margin: 0 0 6px; font-weight: 600; font-size: 16px; color: #111;">${title}</p>
        ${message ? `<p style="margin: 0 0 20px; font-size: 14px; color: #666;">${message}</p>` : `<div style="margin-bottom:20px"></div>`}
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          <button id="modal-cancel" style="
            padding: 8px 16px; border-radius: 8px;
            border: 1px solid #ddd; background: #f5f5f5;
            font-size: 14px; cursor: pointer; color: #333;
          ">${cancelText}</button>
          <button id="modal-confirm" style="
            padding: 8px 16px; border-radius: 8px;
            border: none; background: #e53e3e;
            font-size: 14px; cursor: pointer; color: #fff; font-weight: 500;
          ">${confirmText}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector("#modal-confirm").onclick = () => { document.body.removeChild(overlay); resolve(true); };
    overlay.querySelector("#modal-cancel").onclick  = () => { document.body.removeChild(overlay); resolve(false); };
    overlay.addEventListener("click", (e) => { if (e.target === overlay) { document.body.removeChild(overlay); resolve(false); } });
  });
}

// Vaciar carrito
async function clearCart(cartId) {
  const ok = await showConfirm({
    title: "¿Vaciar el carrito?",
    message: "Esta acción no se puede deshacer.",
    confirmText: "Sí, vaciar",
    cancelText: "Cancelar",
  });
  if (!ok) return;

  try {
    const res = await fetch(`/api/carts/${cartId}`, { method: "DELETE" });
    const data = await res.json();
    if (data.status === "success") {
      socket.emit("cart:clear", { cartId });
      location.reload();
    }
  } catch {
    showToast("Error al vaciar el carrito", "error");
  }
}

async function irAlCarrito() {
  let cartId = getCartId();
  if (!cartId) {
    // Si no tiene carrito todavía, crea uno
    const res = await fetch("/api/carts", { method: "POST" });
    const data = await res.json();
    cartId = data.payload._id;
    localStorage.setItem("cartId", cartId);
  }
  window.location.href = `/carts/${cartId}`;
}

async function guardarPedido(orderId, cartId) {
  await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, cartId }),
  });
}

function showCheckout({
  title = "¿Finalizar compra?",
  summary = "",
  confirmText = "Confirmar pedido",
  cancelText = "Cancelar",
  orderId = null,
  email = null,
} = {}) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 9999;
      background: rgba(0,0,0,0.45);
      display: flex; align-items: center; justify-content: center;
    `;

    const footerEmail = email ? ` a <strong>${email}</strong>` : "";
    const footerOrderId = orderId
      ? `<span style="
            display: inline-block; margin-top: 4px;
            font-size: 11px; color: #888;
            font-family: monospace; letter-spacing: 0.5px;
          ">Pedido #${orderId}</span>`
      : "";

    overlay.innerHTML = `
      <div style="
        background: #fff; border-radius: 12px;
        padding: 24px 28px; width: 340px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.18);
        font-family: sans-serif;
      ">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          <p style="margin: 0; font-weight: 600; font-size: 16px; color: #111;">${title}</p>
        </div>

        ${summary ? `<p style="margin: 0 0 20px; font-size: 13px; color: #666;">${summary}</p>`
                  : `<div style="margin-bottom: 20px;"></div>`}

        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-bottom: 16px;">
          <button id="modal-cancel" style="
            padding: 8px 16px; border-radius: 8px;
            border: 1px solid #ddd; background: #f5f5f5;
            font-size: 14px; cursor: pointer; color: #333;
          ">${cancelText}</button>
          <button id="modal-confirm" style="
            padding: 8px 18px; border-radius: 8px;
            border: none; background: #16a34a;
            font-size: 14px; cursor: pointer; color: #fff; font-weight: 500;
            display: flex; align-items: center; gap: 6px;
          ">✓ ${confirmText}</button>
        </div>

        <div style="
          border-top: 1px solid #f0f0f0;
          padding-top: 12px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
        ">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="#aaa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            style="margin-top: 1px; flex-shrink: 0;">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
          </svg>
          <div style="font-size: 12px; color: #999; line-height: 1.5;">
            Recibirás los detalles de tu compra${footerEmail}.
            ${footerOrderId}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector("#modal-confirm").onclick = () => { document.body.removeChild(overlay); resolve(true); };
    overlay.querySelector("#modal-cancel").onclick  = () => { document.body.removeChild(overlay); resolve(false); };
    overlay.addEventListener("click", (e) => { if (e.target === overlay) { document.body.removeChild(overlay); resolve(false); } });
  });
}

// Finalizar compra
async function processCheckout(cartId, { itemCount, total, email = null } = {}) {
  const orderId = Math.random().toString(36).slice(2, 10).toUpperCase(); 

  const summary = itemCount && total
    ? `${itemCount} producto${itemCount !== 1 ? "s" : ""} · <strong>$${total.toLocaleString("es-AR")}</strong><br>
       <span style="color:#999;">Revisá tu pedido antes de confirmar.</span>`
    : "Revisá tu pedido antes de confirmar.";

  const ok = await showCheckout({
    title: "¿Finalizar compra?",
    summary,
    confirmText: "Confirmar pedido",
    cancelText: "Cancelar",
    orderId,
    email,
  });

  if (!ok) return;

  await guardarPedido(orderId, cartId);

  await fetch(`/api/carts/${cartId}/products`, { method: "DELETE" });
  location.reload();
}
