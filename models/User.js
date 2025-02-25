const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
	name: { type: String, required: true },
	email: { type: String, unique: true, required: true },
	password: { type: String, required: true },
	phone: { type: String, required: true },
	currentLocation: { type: String, default: "" },
	vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
});

userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
	next();
});

module.exports = mongoose.model("User", userSchema);

// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");

// const userSchema = new mongoose.Schema({
// 	name: String,
// 	email: { type: String, unique: true, required: true },
// 	password: { type: String, required: true },
// 	phone: { type: String, required: true },
// 	currentLocation: { type: String, default: "" },
// 	role: { type: String, enum: ["rider", "driver"], default: "rider" },
// 	createdAt: { type: Date, default: Date.now },
// });

// // Hash password before saving
// userSchema.pre("save", async function (next) {
// 	if (!this.isModified("password")) return next();
// 	const salt = await bcrypt.genSalt(10);
// 	this.password = await bcrypt.hash(this.password, salt);
// 	next();
// });

// module.exports = mongoose.model("User", userSchema);
