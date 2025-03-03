import Image from "next/image"

type HotelGalleryProps = {
  images: string[] | undefined
  hotelName: string
}

export default function HotelGallery({ images, hotelName }: HotelGalleryProps) {
  if (!images || images.length === 0) {
    return <p className="text-gray-500">No images available</p>
  }

  const mainImage = images[0]
  const thumbnails = images.slice(1, 5)

  return (
    <div className="grid grid-cols-4 gap-2 h-[400px]">
      <div className="col-span-2 row-span-2 relative rounded-lg overflow-hidden">
        <Image
          src={mainImage || "/placeholder.svg"}
          alt={`${hotelName} main image`}
          fill
          className="object-cover"
        />
      </div>
      {thumbnails.map((image, index) => (
        <div key={index} className="relative rounded-lg overflow-hidden">
          <Image
            src={image || "/placeholder.svg"}
            alt={`${hotelName} image ${index + 2}`}
            fill
            className="object-cover"
          />
        </div>
      ))}
      <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 text-sm font-semibold shadow-md">
        <span className="text-black">$740</span>
        <span className="text-yellow-500 ml-1">/ night</span>
      </div>
    </div>
  )
}
