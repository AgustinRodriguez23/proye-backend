import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE_PATH = path.join(__dirname, "../../../data/products.json");

class ProductManager {
  async #read() {
    const raw = await fs.readFile(FILE_PATH, "utf-8");
    return JSON.parse(raw);
  }

  async #write(data) {
    await fs.writeFile(FILE_PATH, JSON.stringify(data, null, 2));
  }

  #nextId(products) {
    if (products.length === 0) return "1";
    const max = Math.max(...products.map((p) => Number(p.id)));
    return String(max + 1);
  }


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
    let products = await this.#read();

    if (query) {
      const [field, value] = query.split(":");
      if (field === "category") {
        products = products.filter(
          (p) => p.category.toLowerCase() === value.toLowerCase()
        );
      } else if (field === "status") {
        const bool = value === "true";
        products = products.filter((p) => p.status === bool);
      }
    }

    if (sort === "asc") {
      products.sort((a, b) => a.price - b.price);
    } else if (sort === "desc") {
      products.sort((a, b) => b.price - a.price);
    }

    const lim = parseInt(limit, 10) || 10;
    const pg = parseInt(page, 10) || 1;
    const totalDocs = products.length;
    const totalPages = Math.ceil(totalDocs / lim) || 1;
    const safePage = Math.min(Math.max(pg, 1), totalPages);

    const start = (safePage - 1) * lim;
    const payload = products.slice(start, start + lim);

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
    const products = await this.#read();
    const product = products.find((p) => p.id === String(id));
    if (!product) throw new Error(`Producto con id ${id} no encontrado`);
    return product;
  }

  async addProduct({ title, description, code, price, status = true, stock, category, thumbnails = [] }) {
    if (!title || !description || !code || price == null || stock == null || !category) {
      throw new Error("Todos los campos obligatorios deben estar presentes");
    }

    const products = await this.#read();

    if (products.some((p) => p.code === code)) {
      throw new Error(`Ya existe un producto con el código ${code}`);
    }

    const newProduct = {
      id: this.#nextId(products),
      title,
      description,
      code,
      price: Number(price),
      status: Boolean(status),
      stock: Number(stock),
      category,
      thumbnails,
    };

    products.push(newProduct);
    await this.#write(products);
    return newProduct;
  }

  async updateProduct(id, updates) {
    const products = await this.#read();
    const index = products.findIndex((p) => p.id === String(id));
    if (index === -1) throw new Error(`Producto con id ${id} no encontrado`);

    const { id: _ignored, ...safeUpdates } = updates;
    products[index] = { ...products[index], ...safeUpdates };

    await this.#write(products);
    return products[index];
  }

  async deleteProduct(id) {
    const products = await this.#read();
    const index = products.findIndex((p) => p.id === String(id));
    if (index === -1) throw new Error(`Producto con id ${id} no encontrado`);

    const [deleted] = products.splice(index, 1);
    await this.#write(products);
    return deleted;
  }
}

export default new ProductManager();
