const ProfilesModel = require('../../models/profile');
const CurrencyService = new (require('../../services/currency_service'))();

/**
 * Create a new profile
 *
 * @param {Object} profile
 * @returns {Object} the created profile
 * @throws {Error} if profile is invalid or if there is an error creating the profile
 */
const createProfile = async (profile) => {
  const { name, currency, parentId } = profile;

  if (!parentId) {
    // if no parentId is provided, we find and use the campaign profileId
    // ??? or should passing a parentId be mandatory ???
    try {
      profile.parentId = ProfilesModel.getCampaignProfileId();
    } catch (error) {
      throw error;
    }
  }

  try {
    // validate currency before passing it to profile validation
    await CurrencyService.isValidCurrency(currency);

    await ProfilesModel.isValidProfile(profile);
  } catch (error) {
    throw error;
  }

  return ProfilesModel.createProfile(
    profile.name,
    profile.currency,
    profile.parentId,
  );
};

/**
 * Get a specific profile by ID
 *
 * @param {String} profileId
 * @returns {Object} the profile
 * @throws {Error} if there is an error getting the profile
 */
const getProfile = async (profileId) => {
  try {
    return ProfilesModel.getProfile(profileId);
  } catch (error) {
    throw error;
  }
};

/**
 * Get all profiles
 *
 * @returns {Array} an array of all profiles, or an empty array if no profiles are found
 * @throws {Error} if there is an error getting the profiles, though since we're using a mock data store, this should never happen
 */
const getProfiles = async () => {
  try {
    return ProfilesModel.getProfiles();
  } catch (error) {
    throw error;
  }
};

module.exports = { createProfile, getProfiles, getProfile };
