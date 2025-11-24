import express from "express";
import crypto from "crypto";
import axios from "axios";

import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString(); // Needed for the signature
  }
}));

const MP_SECRET = process.env.MP_WEBHOOK_SECRET;
const ACCESS_TOKEN = process.env.MP_TEST_ACCESS_TOKEN;

console.log("Mercado Pago Webhook Secret:", MP_SECRET ? "Loaded" : "Not set");
console.log("Mercado Pago Access Token:", ACCESS_TOKEN ? "Loaded" : "Not set");

// Verificar firma
function verifySignature(req) {
  const signature = req.headers["x-signature"];
  const requestId = req.headers["x-request-id"];

  if (!signature || !requestId) return false;

  const payload = `id:${requestId};body:${req.rawBody}`;
  
  const hash = crypto
    .createHmac("sha256", MP_SECRET)
    .update(payload)
    .digest("hex");

  return hash === signature;
}

app.post("/webhook", async (req, res) => {
  try {
    // Validar firma
    if (!verifySignature(req)) {
      console.log("Firma inválida");
      return res.status(401).send("Unauthorized");
    }

    const { type, data, action } = req.body;

    console.log("valid Webhook:", { type, action });

    // ---- SUBSCRIPCIÓN ----
    if (type === "preapproval") {
      const preapprovalId = data.id;

      const response = await axios.get(
        `https://api.mercadopago.com/preapproval/${preapprovalId}`,
        {
          headers: { Authorization: `Bearer ${ACCESS_TOKEN}` }
        }
      );

      const preapproval = response.data;

      console.log("Subscription:", preapproval);

      // TODO: Save in the DB
    }

    // ---- PAYMENT ----
    if (type === "payment") {
      const paymentId = data.id;

      const response = await axios.get(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: { Authorization: `Bearer ${ACCESS_TOKEN}` }
        }
      );

      const payment = response.data;

      if (payment.preapproval_id) {
        console.log("Subscription payment:", payment);

        // TODO: Save payment in the DB
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Error:", err.message);
    res.sendStatus(500);
  }
});

const PORT = 8080;
app.listen(PORT, () => console.log(`Webhook activo en puerto ${PORT}`));
