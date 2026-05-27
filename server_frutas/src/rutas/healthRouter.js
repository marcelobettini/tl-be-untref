import { Router } from "express";
import client from "../services/data.js";

const router = Router();

/**
 * Endpoint de salud (Health Check)
 * Verifica el estado del servidor y la conexión a la base de datos.
 */
router.get("/", async (req, res) => {
  const healthStatus = {
    status: "UP",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: {
      database: "DOWN",
    },
  };

  try {
    // Intentamos realizar un ping a la base de datos para verificar conectividad real
    await client.db("admin").command({ ping: 1 });
    healthStatus.services.database = "UP";

    res.status(200).json(healthStatus);
  } catch (error) {
    healthStatus.status = "PARTIALLY_DEGRADED";
    healthStatus.error = error.message;
    res.status(503).json(healthStatus);
  }
});

export default router;
