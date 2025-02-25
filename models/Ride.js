const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema({
	driverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
	source: { type: String, required: true },
	destination: { type: String, required: true },
	totalDistance: { type: Number, required: true }, // Distance in km
	fuelCost: { type: Number, required: true }, // Market price per km
	createdAt: { type: Date, default: Date.now },
	passengers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Passenger" }], // Reference to passengers
	isCompleted: { type: Boolean, default: false },
});

module.exports = mongoose.model("Ride", rideSchema);
