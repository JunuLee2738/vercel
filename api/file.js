const express = require('express');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const router = express.Router();

const firebaseConfig = JSON.parse(process.env.FIREBASE_PROJECT_CONFIG.replace(/\\n/g, '\n'));
initializeApp({ credential: cert(firebaseConfig) });
const db = getFirestore();

router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const doc = await db.collection('uploads').doc(id).get();
    if (!doc.exists) {
      return res.status(404).send('Not found');
    }
    const data = doc.data();
    const buffer = Buffer.from(data.base64, 'base64');
    if (req.originalUrl.startsWith('/file/')) {
      res.setHeader('Content-Disposition', `attachment; filename="${data.customName || id}"`);
    }
    res.contentType(data.mimeType);
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
