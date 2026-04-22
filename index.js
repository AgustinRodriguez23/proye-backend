import Usuario from "./Usuario.js"
import express from "express"


const mi_servidor = express()


//end points get/post etc
mi_servidor.get("/", (req, res) => {
    res.send("Data")
 })

mi_servidor.get("/usuarios", (req, res) => {
    res.send([{id:1, nombre:"luis",}, {id:2, nombre:"carlos"}])
 })


// servidor (puerto, callback)
mi_servidor.listen(8080, () => {
    console.log("server up and running !")
})

// const usuario_uno = new Usuario("Carlos", "carlitos@gmail", "777888")


// usuario_uno.saludar()
// usuario_uno.getPassword()