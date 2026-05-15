import { createServer } from "http"
import mongoose from "mongoose"
import { Server } from "socket.io"
import mi_app from "./app.js"



const mi_servidor = createServer(mi_app)
const io_servidor = new Server(mi_servidor)
const PORT = 8080


io_servidor.on("connection", (socket) => {
   console.log("Nuevo cliente conectado")
 })

// servidor (puerto, callback)
mongoose.connect("mongodb://127.0.0.1:27017/ecommerce")
   .then(() => {
      console.log("conectado a la DB")
   })
   .catch(() => {
   })

mi_servidor.listen(PORT, () => {
    console.log("server up and running !")
})

