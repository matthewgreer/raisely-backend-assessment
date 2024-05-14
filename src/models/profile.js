const { v4: uuidv4 } = require('uuid');
const {
  NotFoundError,
  TransactionError,
  ValidationError,
} = require('../utils/errors');
const { dbDelay } = require('../utils/helpers');

/**
 * Data model for profiles.
 *
 * I tend to favor OOP and encapsulation, and often prefer to use classes for data models. However, in this case, the models are so simplistic that I think it's fine to use functions. If the models were to grow in complexity, I would consider refactoring them into classes.
 *
 * Fundraising profiles have the following shape:
 *
 * id - A unique identifier, UUID v4
 * name - The display name for the profile
 * total - The total amount raised, in cents
 * parentId - The id of the profile that this profile belongs to. An ID of null indicates that the profile belongs is the root campaign profile
 * currency - The currency the profile is tracking their total in
 *
 * Data Store for Profiles
 *
 * NB: This is a simple in-memory data store. In a real-world application, this would be replaced with a database. The store will not persist between server restarts!
 */
const profiles = [
  {
    currency: 'AUD',
    id: '78afca18-8162-4ed5-9a7b-212b98c9ec87',
    name: 'Campaign Profile',
    parentId: null,
    total: 5000, // includes the seeded donation
  },
  {
    currency: 'AUD',
    id: '2ad19172-9683-407d-9732-8397d58ddcb2',
    name: "Nick's Fundraising Profile",
    parentId: '78afca18-8162-4ed5-9a7b-212b98c9ec87',
    total: 5000, // includes the seeded donation
  },
];

/**
 * Data Store for Pending Profile Updates
 *
 * Updates have the following shape:
 *
 * profileId - The id of the profile to update
 * amount - The amount to add to the profile total (already converted to the profile's currency) in cents
 * donationId - The id of the donation that triggered the update
 */
const pendingProfileTotalUpdates = {};

/**
 * Cache for Campaign Profile ID
 *
 * Because it would be more efficient in a database-backed system for us to cache the root campaign profile ID, we will store it here. We can nullify it if we want to pretend the cache is invalidated or expired or something. Then we would simply fetch it from the database and re-cache it.
 */
let cachedCampaignProfileId = '78afca18-8162-4ed5-9a7b-212b98c9ec87';

/**
 * Add a new profile
 *
 * @param {String} name
 * @param {String} parentId
 * @param {String} currency
 * @returns {Object} The newly created profile
 * @throws {ValidationError} If the profile is invalid
 */
const createProfile = async (name, currency, parentId) => {
  const profile = { name, currency, parentId };
  profile.id = uuidv4();
  profile.total = 0;

  await dbDelay(); // simulate db write delay
  profiles.push(profile);

  try {
    isValidProfile(profile);

    return profile;
  } catch (error) {
    throw error;
  }
};

/**
 * Get a profile by ID
 *
 * @param {String} profileId
 * @returns {Object} The profile
 * @throws {NotFoundError} If the profile is not found
 */
const getProfile = async (profileId) => {
  await dbDelay(); // simulate db fetching profile
  const profile = profiles.find((profile) => profile.id === profileId);
  if (!profile) {
    throw new NotFoundError(`Profile ${profileId} not found`);
  }
  return profile;
};

/**
 * Get all profiles
 *
 * @returns {Array} An array of all profiles
 */
const getProfiles = async () => {
  // in a database-backed application, we would make an asynchronous query to fetch profiles. We simulate this with a delay here. We would also handle db errors, retries... possibly pagination depending on the implementation.
  await dbDelay(); // simulate db fetching profiles
  if (!profiles) {
    throw new NotFoundError('No profiles found'); // I think there always needs to be a campaign profile
  }
  return profiles;
};

/**
 * Get the ID of the campaign profile
 *
 * @returns {String} The ID of the campaign profile
 * @throws {NotFoundError} If the campaign profile is not found
 */
const getCampaignProfileId = () => {
  // if we have a cached campaign profile ID, return it. Otherwise, find it and cache it, then return it.
  if (!cachedCampaignProfileId) {
    const campaignProfileId = profiles.find(
      (profile) => profile.parentId === null,
    ).id;

    if (!campaignProfileId) {
      throw new NotFoundError('Uh oh! Campaign profile not found.');
    }
    // cache the campaign profile ID
    cachedCampaignProfileId = campaignProfileId;
  }
  return cachedCampaignProfileId;
};

/**
 * Get the profile and all its ancestors
 *
 * @param {string} profileId
 * @returns {Array} An array of the profile and all its ancestors
 * @throws {NotFoundError} If the profile or any of its ancestors are not found
 */
const getProfileAndAncestors = async (profileId) => {
  await dbDelay(); // simulate db query delay
  const profileAndAncestors = [];
  let currentProfile;

  try {
    // getProfile will throw a NotFoundError if a profile is not found
    currentProfile = await getProfile(profileId);
    while (currentProfile && currentProfile.parentId !== null) {
      profileAndAncestors.push(currentProfile);
      currentProfile = await getProfile(currentProfile.parentId);
    }
    // Add the root profile (with parentId === null) to the array
    if (currentProfile) {
      profileAndAncestors.push(currentProfile);
    }
  } catch (error) {
    throw error;
  }

  return profileAndAncestors;
};

/**
 *  Validate a profile
 *
 * @param {Object} profile
 * @returns {boolean} Whether the profile is valid
 * @throws {ValidationError} If the profile is invalid
 */
const isValidProfile = (profile) => {
  const { name, currency, parentId } = profile;

  if (!name || !parentId || !currency) {
    throw new ValidationError(
      'Profile must include name, parentId, and currency',
    );
  }

  if (typeof name !== 'string') {
    throw new ValidationError('Profile name must be a string');
  }

  if (typeof parentId !== 'string') {
    throw new ValidationError('Profile parentId must be a UUID string');
  }

  if (parentId !== null && !profiles.find((parent) => parent.id === parentId)) {
    throw new ValidationError(`Parent profile ${parent.id} not found`);
  }

  return true;
};

/**
 * Add a pending profile total update
 *
 * @param {String} donationId
 * @param {Array} updates
 * @returns
 * @throws {TransactionError} If the update fails
 */
const addPendingProfileTotalUpdates = async (donationID, updates) => {
  await dbDelay(); // simulate db query delay
  try {
    pendingProfileTotalUpdates[donationID] = updates;
  } catch (error) {
    throw new TransactionError('Error adding pending profile total update');
  }
};

/**
 * Move pending profile updates to profiles
 *
 * @param {string} pendingDonationId
 * @returns
 * @throws {TransactionError} If the updates fail
 */
const finalizeProfileUpdates = async (pendingDonationId) => {
  await dbDelay(); // simulate db query delay
  const approvedUpdates = pendingProfileTotalUpdates[pendingDonationId];
  if (!approvedUpdates) {
    throw new NotFoundError(
      `Pending profile updates for donation ${pendingDonationId} not found`,
    );
  }

  try {
    // remove the pending updates
    pendingProfileTotalUpdates[pendingDonationId] = null;

    approvedUpdates.forEach((update) => {
      updateProfileTotal(update.profileId, update.amount);
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Update the total amount raised for a profile
 *
 * @param {string} profileId
 * @param {number} amount
 * @throws {NotFoundError} If the profile is not found
 * @throws {TransactionError} If the update fails
 */
const updateProfileTotal = async (profileId, amount) => {
  await dbDelay(); // simulate db query delay
  const profile = profiles.find((profile) => profile.id === profileId);
  if (!profile) {
    throw new NotFoundError('Profile not found');
  }

  try {
    profile.total += amount; // this won't error in our simple model, but in a real system, we would want to handle
    await dbDelay(); // simulate db write delay
  } catch (error) {
    throw new TransactionError('Error updating profile total');
  }
};

/**
 * Rollback pending profile updates
 *
 * @param {string} pendingDonationId
 * @throws {NotFoundError} If the pending updates are not found
 * @throws {TransactionError} If the rollback fails
 */
const rollbackProfileUpdates = async (pendingDonationId) => {
  await dbDelay(); // simulate db query delay
  const pendingUpdates = pendingProfileTotalUpdates.find(
    (update) => update.donationId === pendingDonationId,
  );
  if (!pendingUpdates) {
    throw new NotFoundError(`Pending profile updates for transaction ${pendingDonationId} not found!`);
  }

  try {
    pendingProfileTotalUpdates = pendingProfileTotalUpdates.filter(
      (update) => update.donationId !== pendingDonationId,
    );
  } catch (error) {
    throw new TransactionError(
      `Error rolling back profile updates for donation ${pendingDonationId}`,
    );
  }
};

module.exports = {
  createProfile,
  getProfiles,
  getProfile,
  getCampaignProfileId,
  isValidProfile,
  addPendingProfileTotalUpdates,
  finalizeProfileUpdates,
  rollbackProfileUpdates,
  getProfileAndAncestors,
};
