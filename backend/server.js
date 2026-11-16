import "dotenv/config";
import app from "./app.js";
import connectDB from "./src/config/db.js";
import dns from "node:dns";

if (process.env.NODE_ENV !== "production") {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
  console.error(
    "Missing MONGODB_URI or JWT_SECRET",
  );
  process.exit(1);
}
await connectDB();
const port = Number(process.env.PORT) || 5000;
const server = app.listen(port, () =>
  console.log(`Coffee House API: http://localhost:${port}/api`),
);
server.on("error", (error) => {
  console.error(error.message);
  process.exit(1);
});
