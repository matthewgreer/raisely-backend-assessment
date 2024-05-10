const { v4: uuidv4 } = require("uuid");
const { NotFoundError, ValidationError } = require("../utils/errors");
const { dbDelay } = require("../utils/helpers");

/**
 * Data model for donations.
 *
 * NB: This is a simple in-memory data store. In a real-world application, this would be replaced with a database. The store will not persist between server restarts!
 *
 * I tend to favor OOP and encapsulation, and often prefer to use classes for data models. However, in this case, the models are so simplistic that I think it's fine to use functions. If the models were to grow in complexity, I would consider refactoring them into classes.
 *
 * Donations have the following shape:
 *
 * id - A unique identifier, UUID v4
 * donorName - The full name of the person making the donation
 * amount - The amount being donated, in cents
 * profileId - The profile the donation is made to
 * currency - The currency the donation is made in
 */
const donations = [
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

const isValidDonation = (donation) => {
  const { donorName, amount, currency, profileId } = donation;
  console.log("VALIDATING DONATION:",donation);

  if (!donorName || !amount || !currency || !profileId) {
    throw new ValidationError("Donation must include donorName, amount, currency, and profileId");
  }

  if (typeof donorName !== "string") {
    throw new ValidationError("Donor name must be a string");
  }

  if (typeof amount !== "number") {
    throw new ValidationError("Donation amount must be a number");
  }

  if (amount <= 0) {
    throw new ValidationError("Donation amount must be greater than 0");
  }

  if (typeof currency !== "string") {
    throw new ValidationError("Donation currency must be a string");
  }

  if (typeof profileId !== "string") {
    throw new ValidationError("Donation profileId must be a UUID string");
  }

  console.log("DONATION VALIDATED");
  return true;
}

module.exports = { addPendingDonation, finalizePendingDonation, getDonationsForProfile, isValidDonation, rollbackPendingDonation};
