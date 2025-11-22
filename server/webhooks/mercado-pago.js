// https:://mercado-pago.instalapro.com/webhooks/mercado-pago

require('dotenv').config();
const express = require('express');
const cors = require('cors');


console.log("process.env.PORT", process.env.PORT)
const app = express();
const PORT = process.env.PORT || 3005;

// MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// WEBHOOKS





// ROUTES



// Basic route
app.get('/webhooks/mercado-pago', (req, res) => {

  // Receive the MP request

  // 


});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});


// POST Subscription (preapproval)

// POST new card















// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
