const DonationsModel = require('../../models/donation');
const ProfileModel = require('../../models/profile');

const addDonation = async (donorName, amount, currency, profileId) => {
  // if no profileId is provided, we need to find the campaign profileId. Now it would be most efficient to cache this value (in this case store it in a variable in the model). We can check to see if a cachedCampaignProfileId exists, but if not, we can fetch it from the database and re-cache it.
  if (!profileId) {
    if (!ProfileModel.cachedCampaignProfileId) {
      const campaignProfile = await ProfilenModel.getCampaignProfileId();
      profileId = campaignProfile.id;
      ProfileModel.cachedCampaignProfileId = profileId;
    } else {
      profileId = ProfileModel.cachedCampaignProfileId;
    }
  }

  // add donation
  const donation = await DonationsModel.addDonation(donorName, amount, currency, profileId);
};

const getProfileDonations = async (profileId) => {
  // get donations for a profile
  try {
    // ensure profile exists, if not getProfile will throw an error
    const profile = await ProfileModel.getProfile(profileId);
    const donations = await DonationsModel.getDonationsForProfile(profile.id);

    return donations;
  } catch (error) {
    return error;
  }
};

module.exports = { addDonation, getProfileDonations };
