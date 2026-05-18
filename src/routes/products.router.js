import { Router } from "express";
import { productManager } from "../factory.js";

const router = Router();

// GET /api/products
// Query params: limit, page, query, sort
router.get("/", async (req, res) => {
  try {
    const { limit = 10, page = 1, query = "", sort = "" } = req.query;
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const result = await productManager.getProducts({ limit, page, query, sort, baseUrl });
    res.json(result);
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

// GET /api/products/:pid
router.get("/:pid", async (req, res) => {
  try {
    const product = await productManager.getProductById(req.params.pid);
    res.json({ status: "success", payload: product });
  } catch (error) {
    res.status(404).json({ status: "error", error: error.message });
  }
});

// POST /api/products
router.post("/", async (req, res) => {
  try {
    const { title, description, code, price, status, stock, category, thumbnails } = req.body;
    const newProduct = await productManager.addProduct({
      title,
      description,
      code,
      price,
      status,
      stock,
      category,
      thumbnails,
    });
    res.status(201).json({ status: "success", payload: newProduct });
  } catch (error) {
    res.status(400).json({ status: "error", error: error.message });
  }
});

// PUT /api/products/:pid
router.put("/:pid", async (req, res) => {
  try {
    const updated = await productManager.updateProduct(req.params.pid, req.body);
    res.json({ status: "success", payload: updated });
  } catch (error) {
    res.status(404).json({ status: "error", error: error.message });
  }
});

// DELETE /api/products/:pid
router.delete("/:pid", async (req, res) => {
  try {
    const deleted = await productManager.deleteProduct(req.params.pid);
    res.json({ status: "success", payload: deleted });
  } catch (error) {
    res.status(404).json({ status: "error", error: error.message });
  }
});

export default router;
