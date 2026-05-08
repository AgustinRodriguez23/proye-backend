import Usuario from "./Usuario.js"
import express from "express"
import { engine } from "express-handlebars"
import { createServer } from "http"
import mongoose, { mongo } from "mongoose"
import { Server } from "socket.io"


const mi_app = express()
const mi_servidor = createServer(mi_app)
const io_servidor = new Server(mi_servidor)
const PORT = 8080

const userSchema = new mongoose.Schema({
   nombre : String 
})

const userModel = mongoose.model("user", userSchema)

mi_app.use(express.static("public"))
mi_app.use(express.json())


mi_app.engine("handlebars", engine())
mi_app.set("view engine", "handlebars")


const usuarios = [
   {id:1, nombre:"luis",}, 
   {id:2, nombre:"carlos"} 
]

//end points get/post etc
mi_app.get("/", (req, res) => {
    res.render("index")
 })

 mi_app.get("/productos", (req, res) => {
    res.render("productos")
 })

mi_app.get("/usuarios", (req, res) => {
    res.send([usuarios])
 })

 mi_app.post("/usuarios", (req, res) => {
   userModel.create({ nombre: req.body.nombre })
   .then(() => {
      res.send("OK")
   })
   .catch(() => {
      res.status(500).send("error")
   })
   
 })


io_servidor.on("connection", (socket) => {
   console.log("Nuevo cliente conectado")
 })

// servidor (puerto, callback)
mongoose.connect("mongodb://127.0.0.1:27017")
   .then(() => {
      console.log("conectado a la DB")
   })
   .catch(() => {
   })

mi_servidor.listen(PORT, () => {
    console.log("server up and running !")
})

