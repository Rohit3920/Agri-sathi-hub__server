const MachineRentalId = require('../models/machineRentalModel');
const mongoose = require('mongoose');

exports.likeMachineRental = async (req, res) => {
    const { machineRentalId } = req.params;
    const userId = req.body.userId;

    try {
        const machineRental = await MachineRentalId.findById(machineRentalId);
        if (!machineRental) {
            return res.status(404).json({ error: 'MachineRental not found.', code: 'MACHINE_RENTAL_NOT_FOUND' });
        }

        // const alreadyLiked = machineRental.like.includes(userId);
        // if (alreadyLiked) {
        //     return res.status(400).json({ error: 'You have already liked this MachineRental.', code: 'ALREADY_LIKED' });
        // }

        // machineRental.like.push(userId);
        const data = await machineRental.save();
        res.status(200).json({
            message: 'MachineRental liked successfully.',
            machineRentalId: machineRental._id,
            userId: userId,
            results: data,
            // likesCount: machineRental.like.length
        });

    } catch (error) {
        console.error('Error liking MachineRental:', error);
        if (error.name === 'CastError' && error.path === '_id') {
            return res.status(400).json({ error: 'Invalid MachineRental ID format.', code: 'INVALID_MACHINE_RENTAL_ID' });
        }
        res.status(500).json({ error: 'Internal server error.' });
    }
};

exports.unlikeMachineRental = async (req, res) => {
    const { machineRentalId, userId } = req.params;

    try {
        const machineRental = await MachineRentalId.findById(machineRentalId);
        if (!machineRental) {
            return res.status(404).json({ error: 'MachineRental not found.', code: 'MACHINE_RENTAL_NOT_FOUND' });
        }

        if (!Array.isArray(machineRental.like)) {
            machineRental.like = [];
        }

        const likedIndex = machineRental.like.indexOf(userId);
        if (likedIndex === -1) {
            return res.status(400).json({ error: 'You have not liked this MachineRental.', code: 'NOT_LIKED' });
        }

        machineRental.like.splice(likedIndex, 1);
        await machineRental.save();
        res.status(200).json({
            message: 'MachineRental unliked successfully.',
            machineRentalId: machineRental._id,
            userId: userId,
            likesCount: machineRental.like.length
        });

    } catch (error) {
        console.error('Error unliking MachineRental:', error);
        if (error.name === 'CastError' && error.path === '_id') {
            return res.status(400).json({ error: 'Invalid MachineRental ID format.', code: 'INVALID_MACHINE_RENTAL_ID' });
        }
        res.status(500).json({ error: 'Internal server error.' });
    }
};

exports.getLikedByUserId = async (req, res) => {
    const machineOwner = req.params.userId;

    try {
        const likedMachineRentals = await MachineRentalId.find({ like: machineOwner }).populate('machineOwner', 'username email profilePicture');

        res.status(200).json(likedMachineRentals);
    } catch (error) {
        console.error('Error fetching liked MachineRentals:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

exports.getLikedByMachineRental = async (req, res) => {
    const { machineRentalId } = req.params;

    try {
        const machineRental = await MachineRentalId.findById(machineRentalId).populate('machineOwner', 'username email profilePicture');
        if (!machineRental) {
            return res.status(404).json({ error: 'MachineRental not found.', code: 'MACHINE_RENTAL_NOT_FOUND' });
        }

        res.status(200).json(machineRental);

    } catch (error) {
        console.error('Error fetching MachineRental by ID:', error);
        if (error.name === 'CastError' && error.path === '_id') {
            return res.status(400).json({ error: 'Invalid MachineRental ID format.', code: 'INVALID_MACHINE_RENTAL_ID' });
        }
        res.status(500).json({ error: 'Internal server error.' });
    }
};
