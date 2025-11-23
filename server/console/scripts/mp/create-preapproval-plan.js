// Script to create a Mercado Pago pre-approval plan (subscription)
// Usage: node server/console/scripts/mp/create-preapproval-plan.js

import path from "path";
import { fileURLToPath } from "url";

// Load environment variables from the root .env file
import { config } from "dotenv";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, "../../../.env") });

const createPreapprovalPlan = async () => {
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
      transaction_amount: 10000, // Corrected to 10,000 ARS
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
