const express = require('express');
const cors = require('cors');
const path = require('path');
const admin = require('firebase-admin');

const rawConfig = process.env.FIREBASE_PROJECT_CONFIG;
if (!rawConfig) {
  console.error('Missing FIREBASE_PROJECT_CONFIG');
  process.exit(1);
}
const serviceAccount = JSON.parse(rawConfig);
if (serviceAccount.private_key) {
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

const app = express();
app.use(cors());
app.use(express.json({ limit: '20mb' })); // Base64 업로드 대비 20MB

// static 파일 제공
app.use(express.static(path.join(__dirname, '..', 'public')));

// 업로드
app.post('/upload', async (req, res) => {
  try {
    const { filename, mimeType, data } = req.body;
    if (!filename || !mimeType || !data) {
      return res.status(400).json({ success: false, error: '필수 항목 누락' });
    }
    const ref = db.collection('links').doc();
    await ref.set({
      filename,
      mimeType,
      data,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return res.json({ success: true, url: `/file/${ref.id}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: '서버 오류' });
  }
});

// 파일 제공
app.get('/file/:id', async (req, res) => {
  try {
    const snap = await db.collection('links').doc(req.params.id).get();
    if (!snap.exists) {
      return res.status(404).send('Not found');
    }
    const data = snap.data();
    const base64 = data.data;
    const mimeType = data.mimeType || 'application/octet-stream';
    const filename = data.filename || 'file';

    const buffer = Buffer.from(base64.split(',')[1], 'base64');

    res.set('Content-Type', mimeType);

    if (req.query.download) {
      res.set('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    }

    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).send('서버 오류');
  }
});

// 메타데이터 제공.
app.get('/api/links/:id', async (req, res) => {
  try {
    const snap = await db.collection('links').doc(req.params.id).get();
    // if (!snap.exists) {
    //   return res.status(404).json({ error: 'Not found' });
    // }
    const data = snap.data();
    res.json({
      filename: data.filename,
      mimeType: data.mimeType,
      data: data.data
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 공유 페이지 핸들러
const RESERVED = ['upload', 'api', 'file', 'favicon.ico'];
app.get('/:id', (req, res, next) => {
  const { id } = req.params;
  if (RESERVED.includes(id) || id.includes('.')) {
    return next();
  }
  res.sendFile(path.resolve(__dirname, '..', 'public', 'img', 'index.html'));
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
