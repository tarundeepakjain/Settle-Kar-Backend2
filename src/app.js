import express from "express";
import { errorHandler } from "./middleware/errorHandler";
const app = express();

/* Global middlewares */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Health check */
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});
/* Error handler (must be last) */
app.use(errorHandler);
export default app;
