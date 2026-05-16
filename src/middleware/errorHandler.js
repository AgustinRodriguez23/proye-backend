// Middleware global de manejo de errores
const errorHandler = (err, req, res, _next) => {
  console.error(`[ERROR] ${req.method} ${req.path} →`, err.message);
  res.status(err.status || 500).json({
    status: "error",
    error: err.message || "Error interno del servidor",
  });
};

export default errorHandler;
