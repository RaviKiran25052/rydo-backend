const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const rideRoutes = require("./routes/rideRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const passengerRoutes = require("./routes/passengerRoutes");
const errorHandler = require("./middleware/errorHandler");

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/rydo/user", authRoutes);
app.use("/rydo/ride", rideRoutes);
app.use("/rydo/vehicle", vehicleRoutes);
app.use("/rydo/passenger", passengerRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
