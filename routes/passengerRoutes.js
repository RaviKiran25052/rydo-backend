const express = require("express");
const Ride = require("../models/Ride");
const Passenger = require("../models/Passenger");
const { calculateFare, getDistance } = require("../utils/fareCalculator");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/join", authMiddleware, async (req, res) => {
	const { rideId, startLocation, endLocation } = req.body;
	const ride = await Ride.findById(rideId);

	if (!ride) return res.status(404).json({ message: "Ride not found" });

	const newPassenger = new Passenger({
		userId: req.user.id,
		rideId,
		startLocation,
		endLocation,
		fare: 0, // Will be calculated dynamically
	});

	await newPassenger.save();
	ride.passengers.push(newPassenger._id);

	// Recalculate fares for all passengers
	const passengers = await Passenger.find({ rideId });
	ride.passengers = calculateFare(ride.totalDistance, ride.fuelCost, passengers);
	await ride.save();

	res.json({ message: "Ride Joined!", newPassenger });
});

module.exports = router;
