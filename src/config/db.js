import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("La variable de entorno MONGO_URI no está definida");
  }

  try {
    await mongoose.connect(uri, { dbName: "ecommerce" });
    console.log("✅  MongoDB conectado → base de datos: ecommerce");
  } catch (error) {
    console.error("❌  Error al conectar con MongoDB:", error.message);
    process.exit(1);
  }
};

export default connectDB;
