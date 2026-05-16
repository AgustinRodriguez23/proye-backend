// factory.js — elige la capa de persistencia según PERSISTENCE en .env
// Valores válidos: "MONGO" (default) | "FS"

const persistence = process.env.PERSISTENCE?.toUpperCase() ?? "MONGO";

let productManager;
let cartManager;

if (persistence === "FS") {
  const { default: pmFS } = await import("./dao/fs/ProductManagerFS.js");
  const { default: cmFS } = await import("./dao/fs/CartManagerFS.js");
  productManager = pmFS;
  cartManager = cmFS;
  console.log("📁  Persistencia: FileSystem");
} else {
  const { default: pmMongo } = await import("./dao/mongo/ProductManagerMongo.js");
  const { default: cmMongo } = await import("./dao/mongo/CartManagerMongo.js");
  productManager = pmMongo;
  cartManager = cmMongo;
  console.log("🍃  Persistencia: MongoDB");
}

export { productManager, cartManager };
