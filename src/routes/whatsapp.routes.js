import express from "express";
import { handleIncomingWhatsAppMessage } from "../controllers/whatsapp.controller.js";

const router = express.Router();

router.post("/", handleIncomingWhatsAppMessage);

export default router;