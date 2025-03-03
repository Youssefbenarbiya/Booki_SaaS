import Image from "next/image"

type HotelGalleryProps = {
  images: string[] | undefined
  hotelName: string
}

export default function HotelGallery({ images, hotelName }: HotelGalleryProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Images</h2>
      <div className="grid grid-cols-2 gap-4">
        {images && images.length > 0 ? (
          images.map((image, index) => (
            <div
              key={index}
              className="relative aspect-video rounded-lg overflow-hidden shadow transition hover:shadow-lg"
            >
              <Image
                src={image}
                alt={`${hotelName} image ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))
        ) : (
          <p className="text-gray-500">No images available</p>
        )}
      </div>
    </div>
  )
}
