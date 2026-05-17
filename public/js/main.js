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

// ── Vaciar carrito ────────────────────────────────────────────────────────
async function clearCart(cartId) {
  if (!confirm("¿Vaciar el carrito?")) return;
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