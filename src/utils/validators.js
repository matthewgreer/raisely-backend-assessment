const { ValidationError } = require('./errors');
const { currencies } = require('../models/currencies');

const validateCurrency = (currency) => {
  if (typeof currency !== "string") {
    throw new ValidationError("Currency must be a string");
  }

  if (!currencies[currency]) {
    const supportedCurrencies = Object.keys(currencies).join(", ");
    throw new ValidationError(`Currency must be a valid currency code. This API supports the following currencies: ${supportedCurrencies}`);
  }
};

const validateDonation = (donation) => {
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

  if (typeof currency !== "string") {
    throw new ValidationError("Donation currency must be a string");
  }

  if (typeof profileId !== "string") {
    throw new ValidationError("Donation profileId must be a UUID string");
  }

  // if (!profiles.find((profile) => profile.id === profileId)) {
  //   throw new ValidationError(`Profile ${profileId} not found`);
  // }

  validateCurrency(currency);
  console.log("DONATION VALIDATED");
};

const validateProfile = (profile) => {
  const { name, parentId, currency } = profile;
  if (!name || !parentId || !currency) {
    throw new ValidationError("Profile must include name, parentId, and currency");
  }

  if (typeof name !== "string") {
    throw new ValidationError("Profile name must be a string");
  }

  if (typeof parentId !== "string") {
    throw new ValidationError("Profile parentId must be a UUID string");
  }

  if (parentId !== null && !profiles.find((parent) => parent.id === parentId)) {
    throw new ValidationError(`Parent profile ${parent.id} not found`);
  }

  validateCurrency(currency);
};

module.exports = { validateCurrency, validateDonation, validateProfile };
