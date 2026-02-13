const express = require('express');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const {
    uploadProfileImage,
    uploadHireWorkerImage,
    uploadHireWorkerGroupImage,
    uploadMachineRentalImage
} = require('../controllers/uploadController');

const router = express.Router();

router.post('/upload-profile', upload.single('image'), uploadProfileImage);
router.post('/hire-worker', upload.single('image'), uploadHireWorkerImage);
router.post('/hire-worker-group', upload.single('image'), uploadHireWorkerGroupImage);
router.post('/machine-rental', upload.single('image'), uploadMachineRentalImage);

module.exports = router;