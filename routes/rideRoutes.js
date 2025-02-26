const express = require("express");
const Ride = require("../models/Ride");
const Vehicle = require("../models/Vehicle");
const Passenger = require("../models/Passenger");
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

		// Find the ride with passenger details
		const ride = await Ride.findById(rideId).populate("passengers");
		if (!ride) return res.status(404).json({ message: "Ride not found" });

		// Validate the route
		const rideDistance = await getDistance(ride.source, ride.destination);
		const passengerDistance = await getDistance(startLocation, endLocation);

		if (!passengerDistance || passengerDistance > rideDistance) {
			return res.status(400).json({ message: "Invalid route" });
		}

		// Check if user is already in the ride
		let passenger = ride.passengers.find(p => p.userId.toString() === userId);

		if (passenger) {
			// Update existing passenger's start & end location
			passenger.startLocation = startLocation;
			passenger.endLocation = endLocation;
			await passenger.save();
		} else {
			// Create a new passenger entry
			passenger = new Passenger({
				userId,
				rideId,
				startLocation,
				endLocation,
				fare: 0, // Placeholder, will update after fare calculation
			});
			await passenger.save();

			// Add passenger ID to ride
			ride.passengers.push(passenger._id);
		}

		// Fetch all updated passengers
		const passengers = await Passenger.find({ rideId });

		// Recalculate and update fares including the rider’s share
		const updatedFares = await calculateFare(ride.totalDistance, ride.fuelCost, passengers, ride.source, ride.destination);

		// Update fares in the database
		await Promise.all(
			updatedFares.map(async (p) => {
				await Passenger.findByIdAndUpdate(p._id, { fare: p.fare });
			})
		);

		// Save updated ride
		await ride.save();

		return res.status(200).json({
			message: passenger ? "Passenger details updated" : "Passenger added successfully",
			updatedRide: ride,
		});
	} catch (error) {
		console.error("Error adding/updating passenger:", error);
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
