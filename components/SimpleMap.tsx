"use client"

interface SimpleMapProps {
  latitude?: string | number
  longitude?: string | number
  height?: string
  width?: string
  zoom?: number
}

export default function SimpleMap({
  latitude = 51.505,
  longitude = -0.09,
  height = "400px",
  width = "100%",
  zoom = 14
}: SimpleMapProps) {
  // Convert string coordinates to numbers
  const lat = typeof latitude === 'string' ? parseFloat(latitude) : latitude;
  const lng = typeof longitude === 'string' ? parseFloat(longitude) : longitude;
  
  // Create Google Maps URL
  const mapUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;
  
  return (
    <div style={{ height, width }} className="rounded-md overflow-hidden border border-gray-200">
      <iframe
        src={mapUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen={false}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Map"
      />
    </div>
  );
} 