const express = require('express');
const { uploadProfileImage } = require('../controllers/uploadController');
const router = express.Router();
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/upload-profile', upload.single('image'), uploadProfileImage);

module.exports = router;