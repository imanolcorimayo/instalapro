// Cron job to update pending jobs to completed status
// Runs daily at midnight Buenos Aires time (03:00 UTC)
import admin from "firebase-admin";
import serviceAccount from "../service-account.json" with { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

async function updateJobsStatus() {
  try {
    const now = new Date();
    console.log('🕐 Running job status update cron...');
    console.log('📅 Current datetime:', now.toISOString());
    console.log('🌍 Current datetime (UTC-3):', new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString());

    // Query for pending jobs with scheduledDate before now
    const jobsQuery = db.collection('jobs')
      .where('status', '==', 'pending')
      .where('scheduledDate', '<', now);

    const snapshot = await jobsQuery.get();

    if (snapshot.empty) {
      console.log('✅ No pending jobs found that need status update');
      return;
    }

    console.log(`📋 Found ${snapshot.size} pending job(s) to update`);

    // Update each job to completed status
    const batch = db.batch();
    const updates = [];

    snapshot.forEach(doc => {
      const jobData = doc.data();
      console.log(`  - Job ${doc.id}:`, {
        clientName: jobData.clientName,
        serviceType: jobData.serviceType,
        scheduledDate: jobData.scheduledDate.toDate().toISOString(),
        currentStatus: jobData.status
      });

      batch.update(doc.ref, {
        status: 'completed',
        updatedAt: now
      });

      updates.push({
        id: doc.id,
        clientName: jobData.clientName,
        serviceType: jobData.serviceType,
        scheduledDate: jobData.scheduledDate.toDate()
      });
    });

    // Commit the batch update
    await batch.commit();

    console.log('✅ Successfully updated jobs to completed status:');
    updates.forEach(job => {
      console.log(`  ✓ ${job.id} - ${job.clientName} (${job.serviceType}) - ${job.scheduledDate.toISOString()}`);
    });

    console.log(`🎉 Cron job completed successfully. Updated ${updates.length} job(s)`);

  } catch (error) {
    console.error('❌ Error updating job statuses:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the update
updateJobsStatus();
