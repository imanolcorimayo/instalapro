<template>
  <div class="mp-test-container">
    <h1>Mercado Pago Frontend SDK Test</h1>
    <p>This page will be used to test the card form integration.</p>
    <form id="form-checkout">
      <div id="form-checkout__cardNumber" class="container"></div>
      <div id="form-checkout__expirationDate" class="container"></div>
      <div id="form-checkout__securityCode" class="container"></div>
      <input type="text" id="form-checkout__cardholderName" />
      <select id="form-checkout__issuer"></select>
      <select id="form-checkout__installments"></select>
      <select id="form-checkout__identificationType"></select>
      <input type="text" id="form-checkout__identificationNumber" />
      <input type="email" id="form-checkout__cardholderEmail" />

      <button type="submit" id="form-checkout__submit">Pagar</button>
      <progress value="0" class="progress-bar">Carregando...</progress>
    </form>
    <div v-if="sdkLoaded" class="form-wrapper">
      <!-- 
        Container for the payment form.
        Mercado Pago's "Card Form" or "Payment Brick" will be mounted here.
      -->
    </div>
    <div v-else>
      <p>Loading Mercado Pago SDK...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

// This ref will track the SDK loading state
const sdkLoaded = ref(false);

// Get the public key from Nuxt runtime config
const config = useRuntimeConfig();
const mpPublicKey = config.public.mpPublicKey;

let mp; // Variable to hold the MercadoPago instance

/**
 * Dynamically loads the Mercado Pago SDK script.
 * @returns {Promise<void>}
 */
const loadMercadoPagoSDK = () => {
  return new Promise((resolve, reject) => {
    if (window.MercadoPago) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.async = true;
    script.onload = () => {
      console.log("Mercado Pago SDK script loaded.");
      resolve();
    };
    script.onerror = () => {
      console.error("Failed to load Mercado Pago SDK.");
      reject();
    };
    document.head.appendChild(script);
  });
};

onMounted(async () => {
  try {
    await loadMercadoPagoSDK();

    // Initialize the Mercado Pago SDK
    mp = new window.MercadoPago(mpPublicKey, {
      locale: "es-AR", // Set to Argentina
    });

    sdkLoaded.value = true;
    console.log("Mercado Pago SDK initialized.");

    // The next step will be to create and mount the Card Form here,
    // for example: const cardForm = await mp.cardForm(...)

    const cardForm = mp.cardForm({
      amount: "100.5",
      iframe: true,
      form: {
        id: "form-checkout",
        cardNumber: {
          id: "form-checkout__cardNumber",
          placeholder: "Número do cartão",
        },
        expirationDate: {
          id: "form-checkout__expirationDate",
          placeholder: "MM/YY",
        },
        securityCode: {
          id: "form-checkout__securityCode",
          placeholder: "Código de segurança",
        },
        cardholderName: {
          id: "form-checkout__cardholderName",
          placeholder: "Titular do cartão",
        },
        issuer: {
          id: "form-checkout__issuer",
          placeholder: "Banco emissor",
        },
        installments: {
          id: "form-checkout__installments",
          placeholder: "Parcelas",
        },
        identificationType: {
          id: "form-checkout__identificationType",
          placeholder: "Tipo de documento",
        },
        identificationNumber: {
          id: "form-checkout__identificationNumber",
          placeholder: "Número do documento",
        },
        cardholderEmail: {
          id: "form-checkout__cardholderEmail",
          placeholder: "E-mail",
        },
      },
      callbacks: {
        onFormMounted: (error) => {
          if (error)
            return console.warn("Form Mounted handling error: ", error);
          console.log("Form mounted");
        },
        onSubmit: (event) => {
          event.preventDefault();
          const cardDetails = cardForm.getCardFormData();
          console.log("Card Details: ", cardDetails);
          // fetch("/process_payment", {
          //   method: "POST",
          //   headers: {
          //     "Content-Type": "application/json",
          //   },
          //   body: JSON.stringify({
          //     token,
          //     issuer_id,
          //     payment_method_id,
          //     transaction_amount: Number(amount),
          //     installments: Number(installments),
          //     description: "Descrição do produto",
          //     payer: {
          //       email,
          //       identification: {
          //         type: identificationType,
          //         number: identificationNumber,
          //       },
          //     },
          //   }),
          // });
        },
        onFetching: (resource) => {
          console.log("Fetching resource: ", resource);
          // Animate progress bar
          const progressBar = document.querySelector(".progress-bar");
          progressBar.removeAttribute("value");
          return () => {
            progressBar.setAttribute("value", "0");
          };
        },
      },
    });
  } catch (error) {
    console.error("Error during Mercado Pago SDK setup:", error);
  }
});
</script>

<style scoped>
#form-checkout {
  display: flex;
  flex-direction: column;
  max-width: 600px;
}

.container {
  height: 18px;
  display: inline-block;
  border: 1px solid rgb(118, 118, 118);
  border-radius: 2px;
  padding: 1px 2px;
}
</style>
