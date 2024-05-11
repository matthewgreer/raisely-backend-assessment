const ProfilesModel = require('../../models/profile');
const CurrencyService = new (require('../../services/currency_service'))();

/**
 *
 * @param {Object} profile
 * @returns
 */
const createProfile = async (profile) => {
  const { name, currency, parentId } = profile;

  if (!parentId) {
    // if no parentId is provided, we need to find the campaign profileId (or should it be mandatory?)
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
 *
 * @returns
 */
const getProfiles = async () => {
  return ProfilesModel.getProfiles();
};

/**
 *
 * @param {String} profileId
 * @returns
 */
const getProfile = async (profileId) => {
  return ProfilesModel.getProfile(profileId);
};

module.exports = { createProfile, getProfiles, getProfile };
