import "dotenv/config";
// dotenv.config(); // 🔥 MUST be FIRST
import app from "./src/app.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
