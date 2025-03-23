"use server"

// Re-export all approval actions from tripApprovalActions.ts
export {
  approveTrip,
  rejectTrip,
  approveCar,
  rejectCar,
  approveHotel,
  rejectHotel,
} from "./tripApprovalActions"
