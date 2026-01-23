const express = require('express');
const router = express.Router();
const {likeMachineRental, unlikeMachineRental, getLikedByUserId, getLikedByMachineRental} = require('../controllers/likeController');

router.post('/machine-rental/:machineRentalId', likeMachineRental);
router.delete('/machine-rental/:machineRentalId/:userId', unlikeMachineRental);
router.get('/liked-machine-rentals/:userId', getLikedByUserId);
router.get('/machine-rental/:machineRentalId/is-liked', getLikedByMachineRental);

module.exports = router;