const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

router.post("/register", async (req, res) => {
	const { name, email, password, phone } = req.body;
	let user = await User.findOne({ email });

	if (user) return res.status(400).json({ message: "User already exists" });

	user = new User({ name, email, password, phone });
	await user.save();

	const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1d" });
	res.json({ token, user });
});

router.post("/login", async (req, res) => {
	const { email, password } = req.body;
	const user = await User.findOne({ email });

	if (!user) return res.status(400).json({ message: "User not found" });

	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

	const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1d" });
	res.json({ token, user });
});

module.exports = router;
