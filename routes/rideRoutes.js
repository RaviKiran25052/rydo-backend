const express = require("express");
const Ride = require("../models/Ride");
const Vehicle = require("../models/Vehicle");
const { getDistance, calculateFare } = require("../utils/fareCalculator");
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

router.post("/:rideId/join", authMiddleware, async (req, res) => {
	try {
		const { rideId } = req.params;
		const { startLocation, endLocation } = req.body;
		const userId = req.user.id;

		// Find the ride
		const ride = await Ride.findById(rideId);
		if (!ride) return res.status(404).json({ message: "Ride not found" });

		// Check if start & end locations are within ride's path
		const rideDistance = await getDistance(ride.source, ride.destination);
		const passengerDistance = await getDistance(startLocation, endLocation);

		if (!passengerDistance || passengerDistance > rideDistance) {
			return res.status(400).json({ message: "Invalid route" });
		}

		// Add new passenger & calculate updated fares
		const updatedPassengers = await calculateFare(ride.totalDistance, ride.fuelCost, [
			...ride.passengers,
			{ userId, startLocation, endLocation },
		]);

		// Update ride with new passenger list
		ride.passengers = updatedPassengers;
		await ride.save();

		return res.status(200).json({
			message: "Passenger added successfully",
			updatedRide: ride,
		});
	} catch (error) {
		console.error("Error adding passenger:", error);
		return res.status(500).json({ message: "Server error" });
	}
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
