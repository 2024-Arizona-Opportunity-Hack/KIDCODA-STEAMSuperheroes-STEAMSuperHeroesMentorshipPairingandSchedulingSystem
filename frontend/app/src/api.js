// src/api.js

import axios from "axios";

// Set the base URL for your backend API
const API_BASE_URL = "http://127.0.0.1:8000/api"; // Ensure no trailing slash

/**
 * Registers a mentor by sending form data to the backend.
 * @param {Object} mentorData - The mentor's form data.
 * @returns {Promise} - Axios response promise.
 */
export const registerMentor = (mentorData) => {
  return axios.post(`${API_BASE_URL}/mentor/register`, mentorData); // Removed trailing slash
};

/**
 * Registers a mentee by sending form data to the backend.
 * @param {Object} menteeData - The mentee's form data.
 * @returns {Promise} - Axios response promise.
 */
export const registerMentee = (menteeData) => {
  return axios.post(`${API_BASE_URL}/mentee/register`, menteeData); // Removed trailing slash
};

/**
 * Creates a matching between a mentor and a mentee.
 * @param {String} mentorId - The mentor's ID.
 * @param {String} menteeId - The mentee's ID.
 * @returns {Promise} - Axios response promise.
 */
export const createMatching = (mentorId, menteeId) => {
  return axios.post(`${API_BASE_URL}/matchings/create`, { mentor_id: mentorId, mentee_id: menteeId }); // Removed trailing slash
};

/**
 * Retrieves a specific matching by ID.
 * @param {String} matchingId - The matching's ID.
 * @returns {Promise} - Axios response promise.
 */
export const getMatching = (matchingId) => {
  return axios.get(`${API_BASE_URL}/matchings/${matchingId}`); // Removed trailing slash
};
