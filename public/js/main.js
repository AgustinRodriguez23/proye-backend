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

// Escucha actualizaciones del carrito en tiempo real
socket.on("cart:updated", (data) => {
  if (!data) return;
  // Actualiza qty y subtotal si el elemento existe en la vista
  const qtyEl = document.getElementById(`qty-${data.productId}`);
  const subEl = document.getElementById(`subtotal-${data.productId}`);
  if (qtyEl) qtyEl.textContent = data.quantity;
  if (subEl) subEl.textContent = `$${data.subtotal}`;
  const totalEl = document.getElementById("cart-total");
  if (totalEl) totalEl.textContent = `$${data.cartTotal}`;
});

// ── Toast ──────────────────────────────────────────────────────────────────
function showToast(msg, type = "success") {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.className = `toast ${type}`;
  setTimeout(() => { toast.className = "toast hidden"; }, 3000);
}

// ── Cart ID ────────────────────────────────────────────────────────────────
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

// ── Agregar al carrito (desde el listado) ─────────────────────────────────
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

// ── Agregar al carrito (desde el detalle) ─────────────────────────────────
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

// ── Cambiar cantidad en el carrito ────────────────────────────────────────
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

// ── Eliminar producto del carrito ─────────────────────────────────────────
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

// ── Vaciar carrito ────────────────────────────────────────────────────────
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