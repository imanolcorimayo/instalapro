// Script to create a Mercado Pago pre-approval plan (subscription)
// Usage: node server/console/scripts/mp/create-preapproval-plan.js

import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import admin from "firebase-admin";

// Load environment variables from the root .env file
import { config } from "dotenv";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, "../../../.env") });

const createPreapprovalPlan = async () => {
  // Initialize Firebase Admin
  const localPath = path.join(__dirname, "etc/secrets/service-account.json");
  const serviceAccountPath = localPath;

  let db;
  try {
    const serviceAccount = JSON.parse(
      fs.readFileSync(serviceAccountPath, "utf8")
    );

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    db = admin.firestore();
    console.log("✅ Firebase initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize Firebase:", error.message);
    process.exit(1);
  }

  // Select the correct token based on the environment
  const isProduction = process.env.NODE_ENV === "production";
  const MP_ACCESS_TOKEN = isProduction
    ? process.env.MP_PROD_ACCESS_TOKEN
    : process.env.MP_TEST_ACCESS_TOKEN;

  if (!MP_ACCESS_TOKEN) {
    const varName = isProduction
      ? "MP_PROD_ACCESS_TOKEN"
      : "MP_TEST_ACCESS_TOKEN";
    console.error(`❌ Missing required environment variable: ${varName}`);
    process.exit(1);
  }

  const url = "https://api.mercadopago.com/preapproval_plan";

  // Define the subscription plan details
  const planPayload = {
    reason: "Suscripción mensual Instalapro",
    auto_recurring: {
      frequency: 1,
      frequency_type: "months",
      repetitions: 12,
      billing_day: 10,
      billing_day_proportional: false,
      transaction_amount: 1000, // Corrected to 1,000 ARS
      currency_id: "ARS",
    },
    payment_methods_allowed: {
      payment_types: [
        {
          id: "credit_card",
        },
      ],
      // Removed specific payment_methods to allow all credit cards,
      // as 'bolbradesco' is not an Argentinian credit card method.
      payment_methods: [],
    },
    back_url: "https://www.instalapro.com/profile", // IMPORTANT: Change this to your actual success URL
  };

  try {
    console.log(
      `📤 Creating Mercado Pago pre-approval plan in ${
        isProduction ? "PRODUCTION" : "TEST"
      } mode...`
    );

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(planPayload),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Pre-approval plan created successfully!");
      console.log("   Plan ID:", data.id);
      console.log("   Subscription Link (init_point):", data.init_point);
      console.log("\nResponse Body:");
      console.log(JSON.stringify(data, null, 2));

      // Save to Firestore
      try {
        const planData = {
          id: data.id,
          back_url: data.back_url,
          collector_id: data.collector_id,
          application_id: data.application_id,
          reason: data.reason,
          status: data.status,
          date_created: data.date_created,
          last_modified: data.last_modified,
          init_point: data.init_point,
          auto_recurring: data.auto_recurring,
          payment_methods_allowed: data.payment_methods_allowed,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await db.collection("preapproval_plans").doc(data.id).set(planData);
        console.log("\n✅ Pre-approval plan saved to Firestore successfully!");
        console.log("   Collection: preapproval_plans");
        console.log("   Document ID:", data.id);
      } catch (firestoreError) {
        console.error(
          "\n❌ Failed to save pre-approval plan to Firestore:",
          firestoreError.message
        );
        console.error("   Plan was created in Mercado Pago but not saved to database");
      }
    } else {
      console.error("❌ Failed to create pre-approval plan");
      console.error("   Status:", response.status);
      console.error("   Error:", JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error("❌ An unexpected error occurred:", error.message);
  }
};

createPreapprovalPlan();
