import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE_PATH = path.join(__dirname, "../../../data/carts.json");

class CartManager {
  async #read() {
    const raw = await fs.readFile(FILE_PATH, "utf-8");
    return JSON.parse(raw);
  }

  async #write(data) {
    await fs.writeFile(FILE_PATH, JSON.stringify(data, null, 2));
  }

  #nextId(carts) {
    if (carts.length === 0) return "1";
    const max = Math.max(...carts.map((c) => Number(c.id)));
    return String(max + 1);
  }

  async createCart() {
    const carts = await this.#read();
    const newCart = { id: this.#nextId(carts), products: [] };
    carts.push(newCart);
    await this.#write(carts);
    return newCart;
  }

  async getCartById(id) {
    const carts = await this.#read();
    const cart = carts.find((c) => c.id === String(id));
    if (!cart) throw new Error(`Carrito con id ${id} no encontrado`);
    return cart;
  }

  async addProductToCart(cartId, productId, quantity = 1) {
    const carts = await this.#read();
    const cartIndex = carts.findIndex((c) => c.id === String(cartId));
    if (cartIndex === -1) throw new Error(`Carrito con id ${cartId} no encontrado`);

    const cart = carts[cartIndex];
    const existingItem = cart.products.find((p) => p.product === String(productId));

    if (existingItem) {
      existingItem.quantity += Number(quantity);
    } else {
      cart.products.push({ product: String(productId), quantity: Number(quantity) });
    }

    await this.#write(carts);
    return cart;
  }

  async removeProductFromCart(cartId, productId) {
    const carts = await this.#read();
    const cartIndex = carts.findIndex((c) => c.id === String(cartId));
    if (cartIndex === -1) throw new Error(`Carrito con id ${cartId} no encontrado`);

    const cart = carts[cartIndex];
    const productIndex = cart.products.findIndex((p) => p.product === String(productId));
    if (productIndex === -1) throw new Error(`Producto con id ${productId} no está en el carrito`);

    cart.products.splice(productIndex, 1);
    await this.#write(carts);
    return cart;
  }

  async updateCart(cartId, products) {
    const carts = await this.#read();
    const cartIndex = carts.findIndex((c) => c.id === String(cartId));
    if (cartIndex === -1) throw new Error(`Carrito con id ${cartId} no encontrado`);

    if (!Array.isArray(products)) throw new Error("products debe ser un arreglo");
    carts[cartIndex].products = products;

    await this.#write(carts);
    return carts[cartIndex];
  }

  async updateProductQuantity(cartId, productId, quantity) {
    const carts = await this.#read();
    const cartIndex = carts.findIndex((c) => c.id === String(cartId));
    if (cartIndex === -1) throw new Error(`Carrito con id ${cartId} no encontrado`);

    const cart = carts[cartIndex];
    const item = cart.products.find((p) => p.product === String(productId));
    if (!item) throw new Error(`Producto con id ${productId} no está en el carrito`);

    item.quantity = Number(quantity);
    await this.#write(carts);
    return cart;
  }

  async clearCart(cartId) {
    const carts = await this.#read();
    const cartIndex = carts.findIndex((c) => c.id === String(cartId));
    if (cartIndex === -1) throw new Error(`Carrito con id ${cartId} no encontrado`);

    carts[cartIndex].products = [];
    await this.#write(carts);
    return carts[cartIndex];
  }
}

export default new CartManager();
