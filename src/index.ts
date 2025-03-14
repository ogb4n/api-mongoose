import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.API_LISTENING_PORT ?? 5678;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
