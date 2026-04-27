import Usuario from "./Usuario.js"
import express from "express"
import { fileURLToPath } from "url"
import path from "path"
import { engine } from "express-handlebars"


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


const mi_servidor = express()


mi_servidor.engine("handlebars", engine())
mi_servidor.set("view engine", "handlebars")

//end points get/post etc
mi_servidor.get("/", (req, res) => {
    res.render("index")
 })

mi_servidor.get("/usuarios", (req, res) => {
    res.send([{id:1, nombre:"luis",}, {id:2, nombre:"carlos"}])
 })


// servidor (puerto, callback)
mi_servidor.listen(8080, () => {
    console.log("server up and running !")
})

