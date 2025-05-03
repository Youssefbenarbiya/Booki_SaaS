import Image from "next/image";

export default function TopDestinations() {
  const destinations = [
    { id: 1, name: "Grèce", image: "/assets/destination1.jpg" },
    { id: 2, name: "Paris", image: "/assets/destination2.jpg" },
    { id: 3, name: "Turkey", image: "/assets/trk.jpg" },
    { id: 4, name: "Bali, Indonésie", image: "/assets/destination4.png" },
  ];

  const PinIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block w-5 h-5 text-red-600 mr-2"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
    </svg>
  );

  return (
    <section className="flex flex-col items-center py-16">
      <div className="text-center mb-12">
        <div className="relative inline-block">
          <h1 className="text-5xl font-bold tracking-tight text-black">
            <span className="text-orange-500 absolute -top-10 left-1/2 -translate-x-1/2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transform rotate-45"
              >
                <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
              </svg>
            </span>
            Top destinations
          </h1>
        </div>
        <p className="text-base mt-2">
          The most popular options among travelers living in Tunisia
        </p>
      </div>

      <div className="my-8 flex h-fit w-4/5 flex-col gap-6 px-4 lg:h-[550px] lg:w-full lg:flex-row xl:px-24">
        {/* Large left image (Grèce) */}
        <div className="relative h-full w-full flex-[3] rounded-xl overflow-hidden group">
          <Image
            src={
              destinations[0].image || "/placeholder.svg?height=800&width=600"
            }
            alt={destinations[0].name}
            width={600}
            height={800}
            className="h-[400px] w-full rounded-xl lg:h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center">
            <h2 className="text-3xl font-bold text-white absolute bottom-8">
              <PinIcon />
              {destinations[0].name}
            </h2>
          </div>
        </div>

        {/* Middle block (Paris + Turkey) */}
        <div className="flex h-full w-full flex-[2] flex-col items-center justify-center gap-6">
          {/* Paris */}
          <div className="relative w-full max-w-[100%] rounded-xl overflow-hidden group h-[400px] lg:h-[60%]">
            <Image
              src={
                destinations[1].image || "/placeholder.svg?height=400&width=500"
              }
              alt={destinations[1].name}
              width={500}
              height={400}
              className="h-full w-full rounded-xl object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center">
              <h2 className="text-2xl font-bold text-white absolute bottom-6">
                <PinIcon />
                {destinations[1].name}
              </h2>
            </div>
          </div>

          {/* Turkey */}
          <div className="relative w-full max-w-[100%] rounded-xl overflow-hidden group h-[400px] lg:h-[35%]">
            <Image
              src={
                destinations[2].image || "/placeholder.svg?height=300&width=500"
              }
              alt={destinations[2].name}
              width={500}
              height={300}
              className="h-full w-full rounded-xl object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center">
              <h2 className="text-2xl font-bold text-white absolute bottom-6">
                <PinIcon />
                {destinations[2].name}
              </h2>
            </div>
          </div>
        </div>

        {/* Right image (Bali) */}
        <div className="relative h-full w-full flex-[2] rounded-xl overflow-hidden group">
          <Image
            src={
              destinations[3].image || "/placeholder.svg?height=800&width=500"
            }
            alt={destinations[3].name}
            width={500}
            height={800}
            className="h-[400px] w-full rounded-xl lg:h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center">
            <h2 className="text-3xl font-bold text-white absolute bottom-8">
              <PinIcon />
              {destinations[3].name}
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}
