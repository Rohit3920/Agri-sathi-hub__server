    const express = require('express');
    const { AddMachine, RentMachine, UpdateRentalStatus, UpdateMachineDetails, RemoveMachine, ListMachines, GetRentalHistory, GetAvailableMachines, GetMachineByUserId, GetMachineById } = require('../controllers/machineRentalController');
    const router = express.Router();

    router.post('/add-machine', AddMachine);
    router.post('/rent-machine', RentMachine);
    router.post('/update-rental-status', UpdateRentalStatus);

    router.put('/update-machine-details/:machineId', UpdateMachineDetails);

    router.delete('/remove-machine', RemoveMachine);

    router.get('/list-machines', ListMachines);
    router.get('/rental-history', GetRentalHistory);
    router.get('/available-machines', GetAvailableMachines);
    router.get('/get-machine-by-userId/:userId', GetMachineByUserId);
    router.get('/get-machine-by-id/:machineId', GetMachineById);

    module.exports = router;