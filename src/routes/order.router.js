import { Router } from "express";
import mongoose from "mongoose";


const router = Router()

const Order = mongoose.model("Order", new mongoose.Schema({
  orderId: String,
  cartId: String,
  createdAt: { type: Date, default: Date.now },
}));

router.post("/", async (req, res) => {
  try {
    const { orderId, cartId } = req.body;
    console.log("Pedido recibido:", req.body);

    const newOrder = new Order({ orderId, cartId });
    await newOrder.save();

    res.json({ ok: true });
  } catch (error) {
    console.error("Error al guardar pedido:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

export default router;