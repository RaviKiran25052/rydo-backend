const express = require("express");
const Ride = require("../models/Ride");
const Vehicle = require("../models/Vehicle");
const { getDistance } = require("../utils/fareCalculator");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create", authMiddleware, async (req, res) => {
	const { source, destination, vehicleId, fuelCost } = req.body;
	const totalDistance = await getDistance(source, destination);
	const vehicle = await Vehicle.findById(vehicleId);

	if (!vehicle) return res.status(400).json({ message: "Vehicle not found" });

	const ride = new Ride({
		driverId: req.user.id,
		vehicleId,
		source,
		destination,
		totalDistance,
		fuelCost,
	});

	await ride.save();
	res.json(ride);
});

router.get("/available", authMiddleware, async (req, res) => {
	const rides = await Ride.find({ isCompleted: false }).populate("driverId vehicleId passengers");
	res.json(rides);
});

router.put("/complete/:rideId", authMiddleware, async (req, res) => {
	const ride = await Ride.findById(req.params.rideId);
	if (!ride) return res.status(404).json({ message: "Ride not found" });

	ride.isCompleted = true;
	await ride.save();
	res.json({ message: "Ride completed!" });
});

module.exports = router;
