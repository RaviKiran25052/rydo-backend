const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema({
	owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	vehicleType: { type: String, enum: ["Car", "Bike", "Auto"], required: true },
	model: { type: String, required: true },
	licensePlate: { type: String, unique: true, required: true },
	fuelType: { type: String, enum: ["Petrol", "Diesel", "Electric"], required: true },
	seatingCapacity: { type: Number, required: true },
	isAvailable: { type: Boolean, default: true },
});

module.exports = mongoose.model("Vehicle", vehicleSchema);
