import Usuario from "./Usuario.js"
import express from "express"
import { fileURLToPath } from "url"
import path from "path"
import { engine } from "express-handlebars"


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


const mi_servidor = express()


mi_servidor.use(express.static("public"))
mi_servidor.use(express.json())


mi_servidor.engine("handlebars", engine())
mi_servidor.set("view engine", "handlebars")


const usuarios = [
   {id:1, nombre:"luis",}, 
   {id:2, nombre:"carlos"} 
]

//end points get/post etc
mi_servidor.get("/", (req, res) => {
    res.render("index")
 })

 mi_servidor.get("/productos", (req, res) => {
    res.render("productos")
 })

mi_servidor.get("/usuarios", (req, res) => {
    res.send([usuarios])
 })

 mi_servidor.post("/usuarios", (req, res) => {
    usuarios.push(req.body)
    res.send("OK")
 })


// servidor (puerto, callback)
mi_servidor.listen(8080, () => {
    console.log("server up and running !")
})

