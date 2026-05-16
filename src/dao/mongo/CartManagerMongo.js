import Cart from "../../models/cart.model.js";

class CartManagerMongo {
  async createCart() {
    const cart = await Cart.create({ products: [] });
    return cart.toObject();
  }

  async getCartById(id) {
    const cart = await Cart.findById(id).populate("products.product").lean();
    if (!cart) throw new Error(`Carrito con id ${id} no encontrado`);
    return cart;
  }

  async addProductToCart(cartId, productId, quantity = 1) {
    const cart = await Cart.findById(cartId);
    if (!cart) throw new Error(`Carrito con id ${cartId} no encontrado`);

    const existingItem = cart.products.find((p) => p.product.toString() === String(productId));
    if (existingItem) {
      existingItem.quantity += Number(quantity);
    } else {
      cart.products.push({ product: productId, quantity: Number(quantity) });
    }

    await cart.save();
    return cart.toObject();
  }

  async removeProductFromCart(cartId, productId) {
    const cart = await Cart.findById(cartId);
    if (!cart) throw new Error(`Carrito con id ${cartId} no encontrado`);

    const index = cart.products.findIndex((p) => p.product.toString() === String(productId));
    if (index === -1) throw new Error(`Producto con id ${productId} no está en el carrito`);

    cart.products.splice(index, 1);
    await cart.save();
    return cart.toObject();
  }

  async updateCart(cartId, products) {
    if (!Array.isArray(products)) throw new Error("products debe ser un arreglo");
    const cart = await Cart.findByIdAndUpdate(cartId, { products }, { new: true, runValidators: true }).lean();
    if (!cart) throw new Error(`Carrito con id ${cartId} no encontrado`);
    return cart;
  }

  async updateProductQuantity(cartId, productId, quantity) {
    const cart = await Cart.findById(cartId);
    if (!cart) throw new Error(`Carrito con id ${cartId} no encontrado`);

    const item = cart.products.find((p) => p.product.toString() === String(productId));
    if (!item) throw new Error(`Producto con id ${productId} no está en el carrito`);

    item.quantity = Number(quantity);
    await cart.save();
    return cart.toObject();
  }

  async clearCart(cartId) {
    const cart = await Cart.findByIdAndUpdate(cartId, { products: [] }, { new: true }).lean();
    if (!cart) throw new Error(`Carrito con id ${cartId} no encontrado`);
    return cart;
  }
}

export default new CartManagerMongo();
