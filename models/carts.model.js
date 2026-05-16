import mongoose from "mongoose";
import validator from "validator"

const cartSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    }
})

const cartModel = mongoose.model("cart", cartSchema)

export default cartModel