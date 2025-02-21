import React, { useState } from 'react';
import HotelList from './components/HotelList';
import TripList from './components/TripList';

function App() {
  const [searchType, setSearchType] = useState('hotels');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero section with search */}
      <div className="relative h-[300px] bg-cover bg-center" 
           style={{ backgroundImage: "url('/beach-resort.jpg')" }}>
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 container mx-auto px-4 pt-12">
          <h1 className="text-4xl font-bold text-white text-center mb-8">
            Find Your Perfect Stay
          </h1>
          
          {/* Search Container */}
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-4">
            {/* Toggle Buttons */}
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => setSearchType('hotels')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors
                  ${searchType === 'hotels' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Hotels
              </button>
              <button
                onClick={() => setSearchType('trips')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors
                  ${searchType === 'trips' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Trips
              </button>
            </div>

            {/* Search Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={searchType === 'hotels' ? "Where are you going?" : "Search destinations"}
                className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 transition-colors">
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* Featured Hotels Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Featured Hotels
            <span className="text-sm font-normal text-gray-500 ml-2">
              Find the best places to stay
            </span>
          </h2>
          <HotelList />
        </section>

        {/* Popular Trips Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Popular Trips
            <span className="text-sm font-normal text-gray-500 ml-2">
              Explore curated travel experiences
            </span>
          </h2>
          <TripList />
        </section>
      </main>
    </div>
  );
}

export default App; 