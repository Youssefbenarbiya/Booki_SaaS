import React from 'react';

const HotelList = () => {
  // This is just example data - you would typically fetch this from an API
  const hotels = [
    {
      id: 1,
      name: "Grand Hotel",
      location: "Downtown",
      rating: 4.5,
      price: "$200/night"
    },
    {
      id: 2,
      name: "Seaside Resort",
      location: "Beach Front",
      rating: 4.8,
      price: "$350/night"
    },
    {
      id: 3,
      name: "Mountain Lodge",
      location: "Mountain View",
      rating: 4.3,
      price: "$180/night"
    }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Available Hotels</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hotels.map(hotel => (
          <div key={hotel.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{hotel.name}</h3>
            <p className="text-gray-600 mb-2">Location: {hotel.location}</p>
            <p className="text-gray-600 mb-2">Rating: {hotel.rating} ⭐</p>
            <p className="text-gray-600">Price: {hotel.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HotelList; 