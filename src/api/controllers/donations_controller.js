const DonationsModel = require('../../models/donation');
const ProfileModel = require('../../models/profile');
const { TransactionError } = require('../../utils/errors');

const processDonation = async (donorName, amount, currency, profileId) => {
  // if no profileId is provided, we need to find the campaign profileId.
  if (!profileId) {
    profileId = ProfileModel.getCampaignProfileId();
  }

  let pendingDonationId;

  try {
    pendingDonationId = await DonationsModel.addPendingDonation(donorName, amount, currency, profileId);
  } catch (error) {
    console.log('Error in Donations Controller processDonation pending:', error);
    throw error;
  }

  // charge card here
  const chargeSuccessful = true;
  // if charge is successful, move donation from pending to donations
  if (chargeSuccessful) {
    try {
      await DonationsModel.finalizePendingDonation(pendingDonationId);
    } catch (error) {
      console.log('Error in Donations Controller processDonation approval:', error);
      throw error;
    }
    try {
      const profile = await ProfileModel.getProfile(profileId);
      await ProfileModel.updateProfileTotal(profileId, amount);
    } catch (error) {
      console.log('Error in Donations Controller processDonation update:', error);
      throw error;
    }
  } else {
    // if charge is unsuccessful, remove donation from pending
    try {
      await DonationsModel.rollbackPendingDonation(pendingDonationId);
      // if rollback successful, we still want to throw an error to let the user know the transaction failed
      console.log('Error in Donations Controller processDonation rollback success:', error)
      throw new TransactionError('Transaction Failed! Charge was unsuccessful. Donation not saved.')
    } catch (error) {
      // if rollback fails, we want to throw a different error
      console.log('Error in Donations Controller processDonation rollback failure:', error)
      throw error;
    }
  }
};

const getProfileDonations = async (profileId) => {
  // get donations for a profile
  try {
    // ensure profile exists, if not getProfile will throw an error
    const profile = await ProfileModel.getProfile(profileId);
    const donations = await DonationsModel.getDonationsForProfile(profile.id);

    return donations;
  } catch (error) {
    console.log('Error in Donations Controller getProfileDonations:', error);
    throw error;
  }
};

module.exports = { processDonation, getProfileDonations };
