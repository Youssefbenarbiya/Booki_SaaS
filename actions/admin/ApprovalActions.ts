"use server"

import {
  approveTrip as approveTripAction,
  rejectTrip as rejectTripAction,
  approveCar as approveCarAction,
  rejectCar as rejectCarAction,
  approveHotel as approveHotelAction,
  rejectHotel as rejectHotelAction,
  approveBlog as approveBlogAction,
  rejectBlog as rejectBlogAction,
} from "./tripApprovalActions"

// Define wrapper functions for each action
export async function approveTrip(tripId: number) {
  return approveTripAction(tripId)
}

export async function rejectTrip(tripId: number) {
  return rejectTripAction(tripId)
}

export async function approveCar(carId: number) {
  return approveCarAction(carId)
}

export async function rejectCar(carId: number) {
  return rejectCarAction(carId)
}

export async function approveHotel(hotelId: number) {
  return approveHotelAction(hotelId)
}

export async function rejectHotel(hotelId: number) {
  return rejectHotelAction(hotelId)
}

export async function approveBlog(blogId: number) {
  return approveBlogAction(blogId)
}

export async function rejectBlog(blogId: number) {
  return rejectBlogAction(blogId)
}
