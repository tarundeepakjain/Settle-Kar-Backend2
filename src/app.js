import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

/* =======================
   CORS Configuration
======================= */
const allowedOrigins = [
  process.env.FRONTEND_URL,      // Vercel frontend
  "http://localhost:3000",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow Postman, curl, server-to-server
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

/* =======================
   Body Parsers
======================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =======================
   Health Check
======================= */
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

/* =======================
   Error Handler (LAST)
======================= */
app.use(errorHandler);

export default app;
