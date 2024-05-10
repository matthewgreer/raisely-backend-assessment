/* Data model for donations.
  NB: This is a simple in-memory data store. In a real-world application, this would be replaced with a database. The store will not persist between server restarts.
*/
const { v4: uuidv4 } = require("uuid");
const { dbDelay } = require("../utils/helpers");
const { validateDonation } = require("../utils/validators");
const { ValidationError, NotFoundError } = require("../utils/errors");

/**
 * Donations have the following shape:
 * id - A unique identifier, UUID v4
 * donorName - The full name of the person making the donation
 * amount - The amount being donated, in cents
 * profileId - The profile the donation is made to
 * currency - The currency the donation is made in
 */
let donations = [
  {
    amount: 5000,
    currency: "AUD",
    donorName: "Nick",
    id: "f6a2b4f0-2b0c-4f8e-9b5b-6a6f1e1b4f0a",
    profileId: "2ad19172-9683-407d-9732-8397d58ddcb2",
  }
]


let pendingDonations = [];

/**
 * @param {string} donorName
 * @param {number} amount
 * @param {string} currency
 * @param {string} profileId
 * @returns
 */
const addPendingDonation = (donorName, amount, currency, profileId) => {
  const donation = { donorName, amount, currency, profileId };
  console.log('Adding pending donation:', donation)

  try {
    validateDonation(donation);
  } catch (error) {
    console.log('Error in Donation Model addPendingDonation:', error)
    throw new ValidationError(error.message);
  }

  donation.id = uuidv4();
  pendingDonations.push(donation);
  return donation.id;
};

const getDonationsForProfile = async (profileId) => {
  await dbDelay();
  const profileDonations = donations.filter(donation => donation.profileId === profileId);
  return profileDonations; // we want to return an empty array if no donations are found rather than throw an error
}

const finalizePendingDonation = async (id) => {
  await dbDelay();
  const donation = pendingDonations.find(donation => donation.id === id);
  if (!donation) {
    console.log('Error in Donation Model finalizePendingDonation:', error)
    throw new NotFoundError("Donation not found");
  }
  // move donation from pending to donations
  pendingDonations = pendingDonations.filter(donation => donation.id !== id);
  donations.push(donation);
}

const rollbackPendingDonation = async (id) => {
  await dbDelay();
  const donation = pendingDonations.find(donation => donation.id === id);
  if (!donation) {
    console.log('Error in Donation Model rollbackPendingDonation:', error)
    throw new NotFoundError("Transaction Failed! Donation not found among pending donations. Donation not saved.");
  }
  pendingDonations = pendingDonations.filter(donation => donation.id !== id);
}

module.exports = { addPendingDonation, finalizePendingDonation, getDonationsForProfile, rollbackPendingDonation};
