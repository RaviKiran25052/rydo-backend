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

		const response = await axios.get(url);
		
		if (!response.data.routes.length) throw new Error("Invalid route");
		const distance = response.data.routes[0].distance / 1000;
		console.log("Fetching distance from:", startPlace, " to ", endPlace, ": ", distance.toFixed(2));

		// Distance is in meters, convert to km
		return response.data.routes[0].distance / 1000;
	} catch (error) {
		console.error("Error fetching distance:", error.message);
		return null;
	}
};

const calculateFare = async (totalDistance, fuelCost, passengers, riderSource, riderDestination) => {
	try {
		if (!passengers.length) return [];

		// Get distances for each passenger
		const passengerDistances = await Promise.all(
			passengers.map(async (p) => {
				const distance = await getDistance(p.startLocation, p.endLocation);
				return { ...p.toObject(), distance };
			})
		);

		// Calculate rider’s own travel distance
		const riderDistance = await getDistance(riderSource, riderDestination);

		// Calculate total distance covered by all passengers + rider
		const totalCoveredDistance = passengerDistances.reduce((sum, p) => sum + (p.distance || 0), 0) + riderDistance;

		if (totalCoveredDistance === 0) return passengers.map(p => ({ ...p, fare: "N/A" }));

		// Compute cost per km
		const costPerKm = fuelCost / totalDistance;

		// Calculate fare per passenger + rider's share
		const updatedPassengers = passengerDistances.map(p => ({
			...p,
			fare: ((p.distance * costPerKm) / (totalCoveredDistance / totalDistance)).toFixed(2),
		}));

		// Calculate rider's share
		const riderFare = ((riderDistance * costPerKm) / (totalCoveredDistance / totalDistance)).toFixed(2);

		console.log(`Rider's share of fare: ${riderFare}`);

		return updatedPassengers;
	} catch (error) {
		console.error("Error calculating fare:", error.message);
		return [];
	}
};

module.exports = { getDistance, calculateFare };
