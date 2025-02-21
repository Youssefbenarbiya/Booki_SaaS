import React from 'react';

const TripList = () => {
  // Example trip data
  const trips = [
    {
      id: 1,
      destination: "Paris",
      duration: "7 days",
      price: "$1,200",
      startDate: "2024-06-15"
    },
    {
      id: 2,
      destination: "Tokyo",
      duration: "10 days",
      price: "$2,500",
      startDate: "2024-07-01"
    },
    {
      id: 3,
      destination: "New York",
      duration: "5 days",
      price: "$1,500",
      startDate: "2024-08-10"
    }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Available Trips</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trips.map(trip => (
          <div key={trip.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{trip.destination}</h3>
            <p className="text-gray-600 mb-2">Duration: {trip.duration}</p>
            <p className="text-gray-600 mb-2">Start Date: {trip.startDate}</p>
            <p className="text-gray-600">Price: {trip.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TripList; 