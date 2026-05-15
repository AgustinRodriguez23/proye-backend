import { Router } from "express"

const router = Router()

router.post("/", (req, res) => {
    res.send("Crear carrito con ID autogenerado")
})
router.get("/id", (req, res) => {
    res.send("Listar productos del carrito con populate")
})
router.post("/id/products/id", (req, res) => {
    res.send("Agregar producto al carrito o incrementar cantidad")
})
router.delete("/id/products/id", (req, res) => {
    res.send("Eliminar producto del carrito")
})
router.put("/id", (req, res) => {
    res.send("Actualizar productos del carrito")
})
router.put("/id/products/id", (req, res) => {
    res.send("Actualizar únicamente la cantidad de un producto")
})
router.delete("/id", (req, res) => {
    res.send("Vaciar el carrito entero")
})

export default router