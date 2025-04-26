const express = require('express');
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const router = express.Router();

const firebaseConfig = JSON.parse(process.env.FIREBASE_PROJECT_CONFIG.replace(/\\n/g, '\n'));
initializeApp({ credential: cert(firebaseConfig) });
const db = getFirestore();

router.post('/upload', async (req, res) => {
  try {
    const { base64, customName, mimeType } = req.body;
    if (!base64 || !mimeType) {
      return res.status(400).json({ success: false, error: 'Invalid data' });
    }

    const docRef = await db.collection('uploads').add({
      base64: base64,
      mimeType: mimeType,
      createdAt: Date.now(),
      customName: customName
    });

    res.json({ success: true, id: docRef.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
