const express = require("express");
const Vehicle = require("../models/Vehicle");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", authMiddleware, async (req, res) => {
	const { vehicleType, model, licensePlate, fuelType, seatingCapacity } = req.body;

	const vehicle = new Vehicle({
		owner: req.user.id,
		vehicleType,
		model,
		licensePlate,
		fuelType,
		seatingCapacity,
	});

	await vehicle.save();
	res.json(vehicle);
});

router.get("/my-vehicles", authMiddleware, async (req, res) => {
	const vehicles = await Vehicle.find({ owner: req.user.id });
	res.json(vehicles);
});

module.exports = router;
