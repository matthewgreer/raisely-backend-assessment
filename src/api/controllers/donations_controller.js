const DonationModel = require('../../models/donation');
const ProfileModel = require('../../models/profile');
const CurrencyService = new (require('../../services/currency_service'))();
const { TransactionError } = require('../../utils/errors');

/**
 * Process a donation, ensuring that a failure at any point in the process will not leave the system in an inconsistent state.
 *
 * @param {String} donorName
 * @param {Number} amount
 * @param {String} currency
 * @param {String} profileId
 * @returns
 * @throws {Error} if donation is invalid, currency is invalid, or if there is an error processing the donation
 */
const processDonation = async (donorName, amount, currency, profileId) => {
  // if no profileId is provided, we need to find the campaign profileId.
  if (!profileId) {
    profileId = ProfileModel.getCampaignProfileId();
  }

  let pendingDonationId;

  try {
    // validate the donation
    await CurrencyService.isValidCurrency(currency);

    pendingDonationId = await DonationModel.addPendingDonation(
      donorName,
      amount,
      currency,
      profileId,
    );

    const pendingProfileTotalUpdates = [];

    // get profile and all parent profiles -- AVOID N+1 QUERIES, SIMULATE USE OF A SINGLE QUERY

    const profileAndAncestors =
      await ProfileModel.getProfileAndAncestors(profileId);

    profileAndAncestors.forEach((profile) => {
      const convertedAmount = CurrencyService.convertAmount(
        amount,
        currency,
        profile.currency,
      );

      pendingProfileTotalUpdates.push({
        profileId: profile.id,
        amount: convertedAmount,
      });
    });

    ProfileModel.addPendingProfileTotalUpdates(
      pendingDonationId,
      pendingProfileTotalUpdates,
    );
  } catch (error) {
    throw error;
  }

  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  // charge card here
  const chargeSuccessful = true;
  // if charge is successful, move donation from pending to donations and profile updates to profiles

  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  if (chargeSuccessful) {
    try {
      await DonationModel.finalizePendingDonation(pendingDonationId);
      await ProfileModel.finalizeProfileUpdates(pendingDonationId);
    } catch (error) {
      throw error;
    }
  } else {
    // if charge is unsuccessful, remove donation and profile updates from their pending states
    try {
      await DonationModel.rollbackPendingDonation(pendingDonationId);
      await ProfileModel.rollbackProfileUpdates(pendingDonationId);

      // if rollback successful, we still want to throw an error to let the user know the transaction failed
      throw new TransactionError(
        'Transaction Failed! Charge was unsuccessful. Donation not saved.',
      );
    } catch (error) {
      // if rollback fails, we want to throw a different error
      throw error;
    }
  }
};

/**
 * Get donations for a specific profile by ID
 *
 * @param {String} profileId
 * @returns {Array} donation objects
 * @throws {Error} if profile does not exist
 */
const getProfileDonations = async (profileId) => {
  try {
    // ensure profile exists, if not getProfile will throw an error
    const profile = await ProfileModel.getProfile(profileId);
    const donations = await DonationModel.getDonationsForProfile(profile.id);

    return donations;
  } catch (error) {
    throw error;
  }
};

module.exports = { processDonation, getProfileDonations };
