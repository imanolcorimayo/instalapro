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

    // Query for pending jobs with scheduledDate before now (to cancel)
    const pendingJobsQuery = db.collection('jobs')
      .where('status', '==', 'pending')
      .where('scheduledDate', '<', now);

    // Query for confirmed jobs with scheduledDate before now (to complete)
    const confirmedJobsQuery = db.collection('jobs')
      .where('status', '==', 'confirmed')
      .where('scheduledDate', '<', now);

    const [pendingSnapshot, confirmedSnapshot] = await Promise.all([
      pendingJobsQuery.get(),
      confirmedJobsQuery.get()
    ]);

    const totalJobs = pendingSnapshot.size + confirmedSnapshot.size;

    if (totalJobs === 0) {
      console.log('✅ No jobs found that need status update');
      return;
    }

    console.log(`📋 Found ${pendingSnapshot.size} pending job(s) to cancel`);
    console.log(`📋 Found ${confirmedSnapshot.size} confirmed job(s) to complete`);

    // Update each job based on current status
    const batch = db.batch();
    const updates = [];

    // Cancel pending jobs
    pendingSnapshot.forEach(doc => {
      const jobData = doc.data();
      console.log(`  - Job ${doc.id} (CANCELLING):`, {
        clientName: jobData.clientName,
        serviceType: jobData.serviceType,
        scheduledDate: jobData.scheduledDate.toDate().toISOString(),
        currentStatus: jobData.status
      });

      batch.update(doc.ref, {
        status: 'cancelled',
        updatedAt: now
      });

      updates.push({
        id: doc.id,
        clientName: jobData.clientName,
        serviceType: jobData.serviceType,
        scheduledDate: jobData.scheduledDate.toDate(),
        newStatus: 'cancelled'
      });
    });

    // Complete confirmed jobs
    confirmedSnapshot.forEach(doc => {
      const jobData = doc.data();
      console.log(`  - Job ${doc.id} (COMPLETING):`, {
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
        scheduledDate: jobData.scheduledDate.toDate(),
        newStatus: 'completed'
      });
    });

    // Commit the batch update
    await batch.commit();

    console.log('✅ Successfully updated job statuses:');
    updates.forEach(job => {
      const emoji = job.newStatus === 'cancelled' ? '❌' : '✓';
      console.log(`  ${emoji} ${job.id} - ${job.clientName} (${job.serviceType}) - ${job.scheduledDate.toISOString()} → ${job.newStatus}`);
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
