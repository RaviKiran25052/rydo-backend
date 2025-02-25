const axios = require("axios");

// Function to fetch latitude & longitude from a place name
const getCoordinates = async (place) => {
	try {
		const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`;
		const response = await axios.get(url);

		if (response.data.length === 0) throw new Error("Location not found");

		const { lat, lon } = response.data[0];
		return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
	} catch (error) {
		console.error(`Error fetching coordinates for ${place}:`, error.message);
		return null;
	}
};

// Function to get distance using OpenStreetMap's OSRM
const getDistance = async (startPlace, endPlace) => {
	try {
		const start = await getCoordinates(startPlace);
		const end = await getCoordinates(endPlace);

		if (!start || !end) throw new Error("Invalid locations");

		const url = `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=false`;

		console.log("Fetching distance from:", url);
		const response = await axios.get(url);

		if (!response.data.routes.length) throw new Error("Invalid route");

		// Distance is in meters, convert to km
		return response.data.routes[0].distance / 1000;
	} catch (error) {
		console.error("Error fetching distance:", error.message);
		return null;
	}
};

const calculateFare = async (totalDistance, fuelCost, passengers) => {
	try {
		if (!passengers.length) return [];

		const costPerKm = fuelCost / totalDistance;

		// Calculate fare per passenger
		const updatedPassengers = await Promise.all(
			passengers.map(async (p) => {
				const distance = await getDistance(p.startLocation, p.endLocation);
				return {
					...p,
					fare: distance ? (distance * costPerKm).toFixed(2) : "N/A",
				};
			})
		);

		return updatedPassengers;
	} catch (error) {
		console.error("Error calculating fare:", error.message);
		return [];
	}
};

module.exports = { getDistance, calculateFare };
