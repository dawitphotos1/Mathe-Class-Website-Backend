// const admin = require("firebase-admin");
// const admin = require("firebase-admin");
// const serviceAccount = require("../path/to/your-serviceAccountKey.json"); 
// const serviceAccount = {
//   projectId: process.env.FIREBASE_PROJECT_ID,
//   privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
//   clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
// };

// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
//   });
// }

// const storage = admin.storage();

// module.exports = { storage };



const admin = require("firebase-admin");

const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

module.exports = admin;
