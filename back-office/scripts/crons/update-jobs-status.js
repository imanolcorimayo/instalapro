// Minimal server-side Firestore connection test
import admin from "firebase-admin";
import serviceAccount from "../service-account.json" with { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

async function testFirestoreConnection() {
  try {
    console.log('Testing Firestore connection...')

    // Insert random test object
    const testData = {
      timestamp: new Date().toISOString(),
      randomValue: Math.random(),
      message: 'Test connection from server-side script',
      createdAt: new Date()
    }

    const docRef = await db.collection('test-collection').add(testData)

    console.log(' Success! Document created with ID:', docRef.id)
    console.log('Test data:', testData)

  } catch (error) {
    console.error('L Error connecting to Firestore:', error)
  }
}

// Run the test
testFirestoreConnection()
