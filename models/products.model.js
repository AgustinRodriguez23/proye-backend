import mongoose from "mongoose";
import validator from "validator"

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    }
})

const productModel = mongoose.model("product", productSchema)

export default productModel