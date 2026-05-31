import express from "express";
import dotenv from "dotenv";
import whatsappRouter from "./routes/whatsapp.routes.js";

dotenv.config();

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("WhatsApp Agent MVP is running.");
});

app.use("/webhook/whatsapp", whatsappRouter);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on("error", (error) => {
  console.error("Server error:", error);
});