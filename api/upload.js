const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const upload = multer({ dest: '/tmp' });

router.post('/', upload.single('file'), async (req, res) => {
  const file = req.file;
  const customName = req.body.customName || Date.now().toString();
  const ext = path.extname(file.originalname);

  const safeName = customName.replace(/[^a-zA-Z0-9-_]/g, '');
  const finalName = `${safeName}${ext}`;

  const uploadsPath = path.join('/tmp', finalName);
  fs.renameSync(file.path, uploadsPath);

  res.json({ success: true, name: finalName });
});

module.exports = router;
