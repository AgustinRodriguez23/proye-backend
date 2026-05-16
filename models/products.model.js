import mongoose from "mongoose";
import validator from "validator"

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    code: {
    type: String,
    required: true,
    unique: true
    },

    price: {
    type: Number,
    required: true
    },

    status: {
    type: Boolean,
    default: true
    },

    stock: {
    type: Number,
    required: true
    },

    category: {
    type: String,
    required: true,
    enum: ["nike", "adidas", "puma"]
    },

    thumbnails: {
    type: [String],
    default: []
    }

}, {
    timestamps: true
});


const productModel = mongoose.model("product", productSchema)

export default productModel