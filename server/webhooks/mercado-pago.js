import express from "express";
import crypto from "crypto";
import axios from "axios";

import dotenv from "dotenv";
dotenv.config();

const app = express();

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`\n[${timestamp}] 📨 Incoming Request`);
  console.log("Method:", req.method);
  console.log("Path:", req.path);
  console.log("IP:", req.ip || req.connection.remoteAddress);
  console.log("User-Agent:", req.get("user-agent") || "Not provided");
  console.log("Headers:", JSON.stringify({
    "x-signature": req.get("x-signature"),
    "x-request-id": req.get("x-request-id"),
    "content-type": req.get("content-type")
  }, null, 2));
  next();
});

app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString(); // Needed for the signature
  }
}));

const MP_SECRET = process.env.MP_WEBHOOK_SECRET;
const ACCESS_TOKEN = process.env.MP_TEST_ACCESS_TOKEN;

console.log("\n=== Mercado Pago Webhook Configuration ===");
console.log("Webhook Secret:", MP_SECRET ? "✓ Loaded" : "✗ NOT SET");
console.log("Access Token:", ACCESS_TOKEN ? "✓ Loaded" : "✗ NOT SET");
console.log("==========================================\n");

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
    const timestamp = new Date().toISOString();
    console.log(`\n[${timestamp}] 📥 Webhook received`);

    // Validar firma
    if (!verifySignature(req)) {
      console.log("❌ Invalid signature - Request rejected");
      console.log("Headers:", {
        signature: req.headers["x-signature"],
        requestId: req.headers["x-request-id"]
      });
      return res.status(401).send("Unauthorized");
    }

    const { type, data, action } = req.body;

    console.log("✓ Signature verified successfully");
    console.log("Webhook Details:", {
      type,
      action,
      dataId: data?.id,
      timestamp
    });

    // ---- SUBSCRIPCIÓN ----
    if (type === "preapproval") {
      const preapprovalId = data.id;
      console.log(`\n🔄 Processing subscription (preapproval): ${preapprovalId}`);

      const response = await axios.get(
        `https://api.mercadopago.com/preapproval/${preapprovalId}`,
        {
          headers: { Authorization: `Bearer ${ACCESS_TOKEN}` }
        }
      );

      const preapproval = response.data;

      console.log("📋 Subscription Details:", preapproval);

      // TODO: Save in the DB
      console.log("⚠️  TODO: Save subscription to database");
    }

    // ---- PAYMENT ----
    if (type === "payment") {
      const paymentId = data.id;
      console.log(`\n💰 Processing payment: ${paymentId}`);

      const response = await axios.get(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: { Authorization: `Bearer ${ACCESS_TOKEN}` }
        }
      );

      const payment = response.data;

      if (payment.preapproval_id) {
        console.log("💳 Subscription Payment Details:", payment);

        // TODO: Save payment in the DB
        console.log("⚠️  TODO: Save payment to database");
      } else {

        console.log("💳 Subscription Response:", response);
        console.log("💳 Subscription Payment Details:", payment);

        console.log("ℹ️  Payment not associated with subscription - Skipping");
      }
    }

    console.log("✅ Webhook processed successfully\n");
    res.sendStatus(200);
  } catch (err) {
    console.error("\n❌ Webhook Error:", {
      message: err.message,
      stack: err.stack,
      response: err.response?.data
    });
    res.sendStatus(500);
  }
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log("\n🚀 Mercado Pago Webhook Server Started");
  console.log(`📡 Listening on port ${PORT}`);
  console.log(`🔗 Endpoint: http://localhost:${PORT}/webhook\n`);
});
