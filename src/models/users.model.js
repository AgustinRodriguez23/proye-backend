import mongoose, { mongo } from "mongoose"
import validator from "validator"
//const mongoose = require("mongoose")


//const userSchema = new mongoose.Schema({
//    name: {
//        type: String,
//     required: true
//    },
//    age: {
//        type: Number,
//        validate: {
//            validator: function (v) {
//                return v >= 18
//            },
//            message: props =>
//            `${props.value} no es una edad válida. Debe ser mayor o igual a 18.`
//        }
//    },
//    createAt: {
//        type: Date,
//        default: Date.now
//    }
//})

//const User = mongoose.model("User", userSchema)


//export default User

const userSchema = new mongoose.Schema({
   nombre: {
      type: String,
      required: true,
      validate: {
         validator: (data) => {
            const isAlphaName = validator.isAlpha(data, "es-ES", {ignore: " " })
            return isAlphaName
         },
         message: "Error de validación de nombre"
      }
   },
   email: {
      type: String,
      required: true,
      unique: true,
      validate: {
         validator: (data) => {
            const isValidEmail = validator.isEmail(data)
            return isValidEmail
         },
         message: "Error de validación de email"
      }
   }
},{
   timestamps: true
})

const userModel = mongoose.model("user", userSchema)


export default userModel