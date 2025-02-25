const mongoose = require("mongoose");

const RideSchema = new mongoose.Schema({
	driverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
	source: { type: String, required: true },
	destination: { type: String, required: true },
	totalDistance: { type: Number, required: true },
	fuelCost: { type: Number, required: true },
	passengers: [
		{
			userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
			startLocation: { type: String, required: true },
			endLocation: { type: String, required: true },
			fare: { type: Number, required: true }
		}
	],
	isCompleted: { type: Boolean, default: false }
});

module.exports = mongoose.model("Ride", RideSchema);
