const axios = require("axios");

const getDistance = async (start, end) => {
	const GOOGLE_API_KEY = "your_google_maps_api_key";
	const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${start}&destinations=${end}&key=${GOOGLE_API_KEY}`;

	const response = await axios.get(url);
	return response.data.rows[0].elements[0].distance.value / 1000; // in km
};

const calculateFare = (totalDistance, fuelCost, passengers) => {
	const costPerKm = fuelCost / totalDistance;
	return passengers.map((p) => ({
		...p,
		fare: (getDistance(p.startLocation, p.endLocation) * costPerKm).toFixed(2),
	}));
};

module.exports = { getDistance, calculateFare };
