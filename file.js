const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

router.get('/:name', (req, res) => {
  const filename = req.params.name;
  const filePath = path.join('/tmp', filename);

  if (!fs.existsSync(filePath)) return res.status(404).send('파일 없음');

  if (req.originalUrl.startsWith('/file/')) {
    res.download(filePath);
  } else {
    res.sendFile(filePath);
  }
});

module.exports = router;