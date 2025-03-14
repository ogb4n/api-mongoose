import express from "express";
import dotenv from "dotenv";
import { routes } from "./routes";
import { connect } from "./mongodb";
dotenv.config();

const app = express();
const port = process.env.API_LISTENING_PORT ?? 5678;

app.use(express.json());

app.use("/api", routes());

connect()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });
