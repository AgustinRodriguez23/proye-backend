import { Router } from "express"
import ViewsController from "../controllers/views.controller.js"
import mongoose from "mongoose"
import Product from "../models/products.model.js"

const router = Router()

// router.get("/products", ViewsController.getProducts)

router.get("/products", async (req, res) => {
    const products = await Product.find().lean()
    res.render("products", { products })
})

router.get("/products/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send("Producto no encontrado")
        }
        const product = await Product.findById(req.params.id).lean()
        if (!product) return res.status(404).render("404")
        res.render("product", { product })
    } catch (error) {
        console.log(error)
        res.status(500).send(error.message)
    }
})

 export default router