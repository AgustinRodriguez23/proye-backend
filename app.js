import express from "express"
import { engine } from "express-handlebars"

import landingRoutes from "./routes/landing.routes.js"
import productsRoutes from "./routes/products.routes.js"
import productApiRoutes from "./routes/products.api.routes.js"
import usersRoutes from "./routes/users.routes.js"
import cartApiRoutes from "./routes/carts.api.routes.js"

const mi_app = express()

// Middlewares
mi_app.use(express.static("public"))
mi_app.use(express.json())


// Views
mi_app.engine("handlebars", engine())
mi_app.set("view engine", "handlebars")

mi_app.use(landingRoutes)
mi_app.use(productsRoutes)
mi_app.use(usersRoutes)

mi_app.use("/api/products", productApiRoutes)
mi_app.use("/api/carts", cartApiRoutes)

export default mi_app