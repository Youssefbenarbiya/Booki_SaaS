import React from "react"

type EditHotelFormProps = {
  hotel: {
    id: string
    name: string
    address: string
    // ...other hotel properties...
  }
}

const EditHotelForm: React.FC<EditHotelFormProps> = ({ hotel }) => {
  return (
    <form>
      <h1>Edit Hotel: {hotel.name}</h1>
      {/* Form fields for editing hotel details */}
      <label>
        Name:
        <input type="text" defaultValue={hotel.name} />
      </label>
      <label>
        Address:
        <input type="text" defaultValue={hotel.address} />
      </label>
      {/* ...other form fields... */}
      <button type="submit">Save</button>
    </form>
  )
}

export default EditHotelForm
