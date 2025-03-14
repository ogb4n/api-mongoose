import express from "express";
import profileRoutes from "./api/profiles";

export const routes = () => {
  const router = express.Router();

  // Routes pour les profils utilisateurs
  router.use("/profiles", profileRoutes);

  return router;
};
