import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler.js";
import group from "./routes/group.js";
import dotenv from "dotenv";
import transaction from "./routes/transaction.js";
import upload from "./routes/upload.js";
const app = express();

/* =======================
   CORS Configuration
======================= */

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // mobile apps send no origin
    if (
      origin.includes("localhost") ||
      origin.includes("127.0.0.1") ||
      origin.includes("192.168.") || // allow all local IPs
      origin.startsWith("exp://")    // allow Expo dev client
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

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
app.use('/group',group);
app.use('/transaction',transaction);
app.use('/upload',upload);
/* =======================
   Error Handler (LAST)
======================= */
app.use(errorHandler);

export default app;
