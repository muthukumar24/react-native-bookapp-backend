import express from "express";
import cors from 'cors';
import "dotenv/config";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import job from "./lib/cro.js";

const app = express();
const port = process.env.PORT || 5000;

job.start();
app.use(cors());
app.use(express.json()); // allows you to access the users data from request
app.use("/api/auth", authRoutes);
app.use("/api/auth", bookRoutes);

app.listen(port, () => {
  console.log(`Server is running on Port ${port}`);
  connectDB();
});
