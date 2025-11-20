// /src/api/profiles.js
import axiosClient from "./axiosClient";

/**
 * ----------------------------------------------------
 *  Fetch the current logged-in user's profile (/me)
 * ----------------------------------------------------
 */
export async function getMyProfile() {
  const res = await axiosClient.get("/api/profiles/me");
  return res.data;
}

/**
 * ----------------------------------------------------
 *  Fetch all profiles (admin-only endpoint)
 * ----------------------------------------------------
 */
export async function getProfiles() {
  const res = await axiosClient.get("/api/profiles");
  return res.data;
}

/**
 * ----------------------------------------------------
 *  Create a new profile
 * ----------------------------------------------------
 */
export async function addProfile(profile) {
  const res = await axiosClient.post("/api/profiles", profile, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}

/**
 * ----------------------------------------------------
 *  Update an existing profile
 * ----------------------------------------------------
 */
export async function updateProfile(id, profile) {
  const res = await axiosClient.put(`/api/profiles/${id}`, profile, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}

/**
 * ----------------------------------------------------
 *  Delete a profile
 * ----------------------------------------------------
 */
export async function deleteProfile(id) {
  const res = await axiosClient.delete(`/api/profiles/${id}`);
  return res.data;
}
