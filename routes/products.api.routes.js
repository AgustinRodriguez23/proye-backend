import { Router } from "express"
import ProductsController from "../controllers/products.controller.js"

const router = Router()

router.get("/", (req, res) => {
    res.send("hola /")
})
router.get("/id", (req, res) => {
    res.send("hola id")
})
router.post("/", ProductsController.createProduct)

router.put("/id", (req, res) =>{
    res.send("hola put")
})

router.delete("/id", (req, res) => {
    res.send("hola delete")
})

export default router