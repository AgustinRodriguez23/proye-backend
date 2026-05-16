import { Router } from "express";
import { cartManager } from "../factory.js";

const router = Router();

// POST /api/carts  → crear carrito vacío
router.post("/", async (req, res) => {
  try {
    const cart = await cartManager.createCart();
    res.status(201).json({ status: "success", payload: cart });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

// GET /api/carts/:cid  → obtener carrito con sus productos
router.get("/:cid", async (req, res) => {
  try {
    const cart = await cartManager.getCartById(req.params.cid);
    res.json({ status: "success", payload: cart });
  } catch (error) {
    res.status(404).json({ status: "error", error: error.message });
  }
});

// POST /api/carts/:cid/product/:pid  → agregar producto al carrito
router.post("/:cid/product/:pid", async (req, res) => {
  try {
    const { quantity = 1 } = req.body;
    const cart = await cartManager.addProductToCart(req.params.cid, req.params.pid, quantity);
    res.json({ status: "success", payload: cart });
  } catch (error) {
    res.status(400).json({ status: "error", error: error.message });
  }
});

// DELETE /api/carts/:cid/products/:pid  → eliminar un producto del carrito
router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const cart = await cartManager.removeProductFromCart(req.params.cid, req.params.pid);
    res.json({ status: "success", payload: cart });
  } catch (error) {
    res.status(404).json({ status: "error", error: error.message });
  }
});

// PUT /api/carts/:cid  → reemplazar todos los productos del carrito
router.put("/:cid", async (req, res) => {
  try {
    const { products } = req.body;
    const cart = await cartManager.updateCart(req.params.cid, products);
    res.json({ status: "success", payload: cart });
  } catch (error) {
    res.status(400).json({ status: "error", error: error.message });
  }
});

// PUT /api/carts/:cid/products/:pid  → actualizar cantidad de un producto
router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity == null) throw new Error("El campo 'quantity' es requerido");
    const cart = await cartManager.updateProductQuantity(req.params.cid, req.params.pid, quantity);
    res.json({ status: "success", payload: cart });
  } catch (error) {
    res.status(400).json({ status: "error", error: error.message });
  }
});

// DELETE /api/carts/:cid  → vaciar el carrito
router.delete("/:cid", async (req, res) => {
  try {
    const cart = await cartManager.clearCart(req.params.cid);
    res.json({ status: "success", payload: cart });
  } catch (error) {
    res.status(404).json({ status: "error", error: error.message });
  }
});

export default router;
