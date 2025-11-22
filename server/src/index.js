// https:://server.instalapro.com/webhooks/mercado-pago
import admin from 'firebase-admin'
import serviceAccount from '../../etc/secrets/service-account.json' with { type: 'json' }

import { config } from 'dotenv';
config();

import express from "express"
import cors from "cors"


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();


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
app.get('/', async (req, res) => {
  res.json({ message: 'InstalaPro Server is running' });

  // Query for pending jobs with scheduledDate before now (to cancel)
  const pendingJobsQuery = db.collection('jobs')
    .where('status', '==', 'pending');


  let pendings = await pendingJobsQuery.get();

  console.log("pendingJobsQuery:", pendings);
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
