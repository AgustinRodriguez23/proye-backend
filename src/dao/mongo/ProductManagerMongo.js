import Product from "../../models/product.model.js";

class ProductManagerMongo {
  /**
   * Get products with pagination, filtering and sorting.
   * @param {object} opts
   * @param {number} opts.limit   - results per page (default 10)
   * @param {number} opts.page    - page number (default 1)
   * @param {string} opts.query   - filter: "category:<value>" | "status:true|false"
   * @param {string} opts.sort    - "asc" | "desc" (by price)
   * @param {string} opts.baseUrl - used to build prev/next links
   */
  async getProducts({ limit = 10, page = 1, query = "", sort = "", baseUrl = "" } = {}) {
    const lim = parseInt(limit, 10) || 10;
    const pg = parseInt(page, 10) || 1;

    // ── filter ──────────────────────────────────────────────────────────────
    const filter = {};
    if (query) {
      const [field, value] = query.split(":");
      if (field === "category") filter.category = { $regex: new RegExp(`^${value}$`, "i") };
      else if (field === "status") filter.status = value === "true";
    }

    // ── sort ────────────────────────────────────────────────────────────────
    const sortOption = sort === "asc" ? { price: 1 } : sort === "desc" ? { price: -1 } : {};

    // ── paginate ─────────────────────────────────────────────────────────────
    const totalDocs = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalDocs / lim) || 1;
    const safePage = Math.min(Math.max(pg, 1), totalPages);

    const payload = await Product.find(filter)
      .sort(sortOption)
      .skip((safePage - 1) * lim)
      .limit(lim)
      .lean();

    const hasPrevPage = safePage > 1;
    const hasNextPage = safePage < totalPages;

    const buildLink = (targetPage) => {
      const params = new URLSearchParams({ limit: lim, page: targetPage });
      if (query) params.set("query", query);
      if (sort) params.set("sort", sort);
      return `${baseUrl}/api/products?${params.toString()}`;
    };

    return {
      status: "success",
      payload,
      totalPages,
      prevPage: hasPrevPage ? safePage - 1 : null,
      nextPage: hasNextPage ? safePage + 1 : null,
      page: safePage,
      hasPrevPage,
      hasNextPage,
      prevLink: hasPrevPage ? buildLink(safePage - 1) : null,
      nextLink: hasNextPage ? buildLink(safePage + 1) : null,
    };
  }

  async getProductById(id) {
    const product = await Product.findById(id).lean();
    if (!product) throw new Error(`Producto con id ${id} no encontrado`);
    return product;
  }

  async addProduct({ title, description, code, price, status = true, stock, category, thumbnails = [] }) {
    if (!title || !description || !code || price == null || stock == null || !category) {
      throw new Error("Todos los campos obligatorios deben estar presentes");
    }
    const newProduct = await Product.create({ title, description, code, price, status, stock, category, thumbnails });
    return newProduct.toObject();
  }

  async updateProduct(id, updates) {
    const { _id, ...safeUpdates } = updates;
    const updated = await Product.findByIdAndUpdate(id, safeUpdates, { new: true, runValidators: true }).lean();
    if (!updated) throw new Error(`Producto con id ${id} no encontrado`);
    return updated;
  }

  async deleteProduct(id) {
    const deleted = await Product.findByIdAndDelete(id).lean();
    if (!deleted) throw new Error(`Producto con id ${id} no encontrado`);
    return deleted;
  }
}

export default new ProductManagerMongo();
