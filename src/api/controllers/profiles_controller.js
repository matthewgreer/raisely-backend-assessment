const ProfilesModel = require('../../models/profile');
const CurrencyService = new (require('../../services/currency_service'));

const addProfile = async (profile) => {
  const { name, parentId, currency } = profile;

  try {
    // validate currency before passing it to profile validation
    await CurrencyService.isValidCurrency(currency);

    await ProfilesModel.isValidProfile(profile);
  } catch (error) {
    console.log('Error in Profiles Controller addProfile validation:', error);
    throw error;
  }

  return ProfilesModel.addProfile(name, parentId, currency);
};

const getProfiles = async () => {
  return ProfilesModel.getProfiles();
};

module.exports = { addProfile, getProfiles };
