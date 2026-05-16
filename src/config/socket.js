const initSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`🔌 Cliente conectado: ${socket.id}`);

    // ── Carrito ──────────────────────────────────────────────────────────
    // Agrega producto → notifica a todos los clientes del mismo carrito
    socket.on("cart:add", ({ cartId, productId, quantity }) => {
      socket.broadcast.emit("cart:updated", { cartId, productId, quantity });
    });

    // Actualiza cantidad → broadcast
    socket.on("cart:update", ({ cartId, productId, quantity }) => {
      socket.broadcast.emit("cart:updated", { cartId, productId, quantity });
    });

    // Elimina producto → broadcast
    socket.on("cart:remove", ({ cartId, productId }) => {
      socket.broadcast.emit("cart:itemRemoved", { cartId, productId });
    });

    // Vacía carrito → broadcast
    socket.on("cart:clear", ({ cartId }) => {
      socket.broadcast.emit("cart:cleared", { cartId });
    });

    // ── Productos ─────────────────────────────────────────────────────────
    // Nuevo producto creado → broadcast a todos
    socket.on("product:new", (product) => {
      socket.broadcast.emit("product:added", product);
    });

    // Producto eliminado → broadcast a todos
    socket.on("product:delete", (id) => {
      socket.broadcast.emit("product:removed", id);
    });

  });
};

export default initSocket;
