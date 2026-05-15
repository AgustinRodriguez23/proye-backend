import productModel from "../models/products.model.js"

class ProductsController {
    static getProducts = (req, res) => {
    
    }


    static createProduct = (req, res) => {
        productModel.create(req.body)
            .then(() => {
                return res.send("ok")
            })
            .catch(() => {
                return res.status(500).send("hubo un error")
            })
    }
}

export default ProductsController