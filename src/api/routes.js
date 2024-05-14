const express = require('express');
const {
  createProfile,
  getProfiles,
  getProfile,
} = require('../api/controllers/profiles_controller');
const {
  processDonation,
  getProfileDonations,
} = require('../api/controllers/donations_controller');
const { isCustomError, NotFoundError, ValidationError } = require('../utils/errors');

const router = express.Router();

// Root endpoint
router.get('/', (req, res) => {
  res.send('Welcome to my fundraising API, Raisely team!');
});

// Get all profiles
router.get('/profiles', async (req, res) => {
  const profiles = await getProfiles();
  res.json(profiles);
});

// Bonus! Get indiviual profile by ID
router.get('/profiles/:profile', async (req, res) => {
  try {
    const profileId = req.params.profile;
    const profile = await getProfile(profileId);
    res.json(profile);
  } catch (error) {
    if (isCustomError(error)) {
      res.status(error.statusCode).send(error.message);
    } else {
      res.status(500).send('Internal server error');
    }
  }
});

// Get all donations for a profile
router.get('/profiles/:profile/donations', async (req, res) => {
  try {
    const profileId = req.params.profile;
    const donations = await getProfileDonations(profileId);
    res.json(donations);
  } catch (error) {
    if (isCustomError(error)) {
      res.status(error.statusCode).send(error.message);
    } else {
      res.status(500).send('Internal server error');
    }
  }
});

// Add a donation to a profile
router.post('/profiles/:profile/donations', async (req, res) => {
  try {
    const profileId = req.params.profile;
    const { donorName, amount, currency } = req.body;
    await processDonation(donorName, amount, currency, profileId);
    res.status(200).send('Donation added');
  } catch (error) {
    if (isCustomError(error)) {
      res.status(error.statusCode).send(error.message);
    } else {
      res.status(500).send('Internal server error');
    }
  }
});

// Add a donation to the campaign profile POST /donations
router.post('/donations', async (req, res) => {
  try {
    const { donorName, amount, currency } = req.body;
    await processDonation(donorName, amount, currency);
    res.status(200).send('Donation added');
  } catch (error) {
    if (isCustomError(error)) {
      res.status(error.statusCode).send(error.message);
    } else {
      res.status(500).send('Internal server error');
    }
  }
});

// Add a profile POST /profiles (bonus)
// Technically, I wasn't asked to provide an createProfile endpoint, but it will be useful to test hierarchy with more than 2 profiles, no?
router.post('/profiles', async (req, res) => {
  try {
    const { name, currency, parentId } = req.body;
    const profile = await createProfile({ name, currency, parentId });
    res.json(profile);
  } catch (error) {
    if (isCustomError(error)) {
      res.status(error.statusCode).send(error.message);
    } else {
      res.status(500).send('Internal server error');
    }
  }
});

module.exports = router;
