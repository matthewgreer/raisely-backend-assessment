const { v4: uuidv4 } = require('uuid');
const { NotFoundError, ValidationError } = require('../utils/errors');
const { dbDelay } = require('../utils/helpers');

/*
  Data model for donations.

  NB: This is a simple in-memory data store. In a real-world application, this would be replaced with a database. The store will not persist between server restarts!

  I tend to favor OOP and encapsulation, and often prefer to use classes for data models. However, in this case, the models are so simplistic that I think it's fine to use functions. If the models were to grow in complexity, I would consider refactoring them into classes.
*/

/**
 * Donations Data Store
 *
 * Donations have the following shape:
 *
 * amount - The amount being donated, in cents
 * currency - The currency the donation is made in
 * donorName - The full name of the person making the donation
 * id - A unique identifier, UUIDv4
 * profileId - The UUIDv4 ID of the profile the donation is made to
 */
const donations = [
  {
    amount: 5000,
    currency: 'AUD',
    donorName: 'Nick',
    id: 'f6a2b4f0-2b0c-4f8e-9b5b-6a6f1e1b4f0a',
    profileId: '2ad19172-9683-407d-9732-8397d58ddcb2',
  },
];

/**
 * Pending Donations Data Store
 *
 * Pending donations are donations that have been submitted but have not yet been processed.
 * This is to ensure that if there is an error processing the donation, we can roll back the transaction.
 * Pending donations have the following shape:
 * amount - The amount being donated, in cents
 * currency - The currency the donation is made in
 * donorName - The full name of the person making the donation
 * id - A unique identifier, UUIDv4
 * profileId - The UUIDv4 ID of the profile the donation is made to
 */
let pendingDonations = [];

/**
 * Add a donation to the pending donations list, awaiting successful payment processing
 *
 * @param {string} donorName
 * @param {number} amount
 * @param {string} currency
 * @param {string} profileId
 * @returns {string} donationId
 * @throws {ValidationError} if donation fails validation
 */
const addPendingDonation = async (donorName, amount, currency, profileId) => {
  const donation = { donorName, amount, currency, profileId };

  try {
    await isValidDonation(donation);
  } catch (error) {
    throw error;
  }

  donation.id = uuidv4();

  await dbDelay(); // simulate db write delay
  await pendingDonations.push(donation);

  return donation.id;
};

/**
 * Get all donations for a specific profile by ID
 *
 * @param {string} profileId
 * @returns {Array} donation objects (see data store shape above)
 * returns an empty array if no donations are found for the profile
 */
const getDonationsForProfile = async (profileId) => {
  await dbDelay(); // simulate db read delay
  const profileDonations = await donations.filter(
    (donation) => donation.profileId === profileId,
  );
  return profileDonations; // we want to return an empty array if no donations are found rather than throw an error
};

/**
 * Move a donation from pending store to donations store
 *
 * @param {string} id
 * @returns
 * @throws {NotFoundError} if donation is not found
 */
const finalizePendingDonation = async (id) => {
  await dbDelay(); // simulate db query delay
  const donation = await pendingDonations.find((donation) => donation.id === id);
  if (!donation) {
    throw new NotFoundError('Donation not found');
  }
  // move donation from pending to donations
  await dbDelay(); // simulate db write delay
  pendingDonations = await pendingDonations.filter((donation) => donation.id !== id);
  donations.push(donation);
};

/**
 * Remove a failed donation from pending donations without adding it to donations
 *
 * @param {string} id
 * @returns
 * @throws {NotFoundError} if donation is not found
 */
const rollbackPendingDonation = async (id) => {
  await dbDelay(); // simulate db query delay
  const donation = pendingDonations.find((donation) => donation.id === id);
  if (!donation) {
    throw new NotFoundError(
      'Transaction Failed! Donation not found among pending donations. Donation not saved.',
    );
  }
  pendingDonations = pendingDonations.filter((donation) => donation.id !== id);
};

/**
 * Validate a donation
 *
 * @param {Object} donation
 * @returns {boolean} true if donation is valid
 * @throws {ValidationError} if donation is invalid
 */
const isValidDonation = (donation) => {
  const { donorName, amount, currency, profileId } = donation;

  if (!donorName || !amount || !currency || !profileId) {
    throw new ValidationError(
      'Donation must include donorName, amount, currency, and profileId',
    );
  }

  if (typeof donorName !== 'string') {
    throw new ValidationError('Donor name must be a string');
  }

  if (typeof amount !== 'number') {
    throw new ValidationError('Donation amount must be a number');
  }

  if (amount <= 0) {
    throw new ValidationError('Donation amount must be greater than 0');
  }

  if (typeof currency !== 'string') {
    throw new ValidationError('Donation currency must be a string');
  }

  if (typeof profileId !== 'string') {
    throw new ValidationError('Donation profileId must be a UUID string');
  }

  return true;
};

module.exports = {
  addPendingDonation,
  finalizePendingDonation,
  getDonationsForProfile,
  isValidDonation,
  rollbackPendingDonation,
};
