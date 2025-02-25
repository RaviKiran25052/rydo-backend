const mongoose = require("mongoose");

const passengerSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	rideId: { type: mongoose.Schema.Types.ObjectId, ref: "Ride", required: true },
	startLocation: { type: String, required: true },
	endLocation: { type: String, required: true },
	fare: { type: Number, required: true },
});

module.exports = mongoose.model("Passenger", passengerSchema);
