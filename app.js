import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./src/config/db.js";
import initSocket from "./src/config/socket.js";
import productsRouter from "./src/routes/products.router.js";
import cartsRouter from "./src/routes/carts.router.js";
import viewsRouter from "./src/routes/views.router.js";
import errorHandler from "./src/middleware/errorHandler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const PORT = process.env.PORT || 8080;

// ── Handlebars ────────────────────────────────────────────────────────────────
app.engine(
  "handlebars",
  engine({
    layoutsDir: path.join(__dirname, "src/views/layouts"),
    defaultLayout: "main",
    partialsDir: path.join(__dirname, "src/views/partials"),
    helpers: {
      eq: (a, b) => a === b,
      multiply: (a, b) => (a * b).toFixed(2),
    },
  })
);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "src/views"));

// ── Middlewares ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// ── Rutas vistas ──────────────────────────────────────────────────────────────
app.use("/", viewsRouter);

// ── Rutas API ─────────────────────────────────────────────────────────────────
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

// Ruta raíz → redirige a /products
app.get("/", (req, res) => res.redirect("/products"));

// 404
app.use((req, res) => {
  res.status(404).json({ status: "error", error: `Ruta ${req.path} no encontrada` });
});

// Error handler
app.use(errorHandler);

// ── Socket.io ─────────────────────────────────────────────────────────────────
initSocket(io);

// ── Start ─────────────────────────────────────────────────────────────────────
const startServer = async () => {
  const persistence = process.env.PERSISTENCE?.toUpperCase() ?? "MONGO";
  if (persistence !== "FS") await connectDB();

  httpServer.listen(PORT, () => {
    console.log(`✅  Servidor corriendo en http://localhost:${PORT}`);
    console.log(`👟  Tienda     → http://localhost:${PORT}/products`);
    console.log(`🔌  Socket.io  → activo`);
  });
};

startServer();
