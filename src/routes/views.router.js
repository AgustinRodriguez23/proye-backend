import { Router } from "express";
import { productManager, cartManager } from "../factory.js";

const router = Router();

// /products
router.get("/products", async (req, res) => {
  try {
    const { limit = 8, page = 1, query = "", sort = "" } = req.query;
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const data = await productManager.getProducts({ limit, page, query, sort, baseUrl });

    // Reemplaza los links de la API por links de la vista
    const toViewLink = (apiLink) => {
      if (!apiLink) return null;
      return apiLink.replace("/api/products", "/products");
    };

    res.render("products", {
      title: "Zapatillas",
      products: data.payload,
      totalDocs: data.totalPages * limit,
      totalPages: data.totalPages,
      page: data.page,
      hasPrevPage: data.hasPrevPage,
      hasNextPage: data.hasNextPage,
      prevLink: toViewLink(data.prevLink),
      nextLink: toViewLink(data.nextLink),
      activeQuery: query,
      activeSort: sort,
      activeLimit: String(limit),
    });
  } catch (error) {
    res.status(500).render("error", { title: "Error", message: error.message });
  }
});

// /products/:pid
router.get("/products/:pid", async (req, res) => {
  try {
    const product = await productManager.getProductById(req.params.pid);
    res.render("productDetail", { title: product.title, product });
  } catch (error) {
    res.status(404).render("error", { title: "No encontrado", message: error.message });
  }
});

// /carts/:cid
router.get("/carts/:cid", async (req, res) => {
  try {
    const cart = await cartManager.getCartById(req.params.cid);

    // Calcula el total del carrito
    const total = cart.products.reduce((acc, item) => {
      const price = item.product?.price ?? 0;
      return acc + price * item.quantity;
    }, 0);

    res.render("cart", { title: "Mi carrito", cart, total });
  } catch (error) {
    res.status(404).render("error", { title: "No encontrado", message: error.message });
  }
});

export default router;
