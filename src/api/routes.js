const express = require('express');
const { getProfiles, getProfile } = require('../api/controllers/profiles_controller');
const { processDonation, getProfileDonations } = require('../api/controllers/donations_controller');
const { NotFoundError, ValidationError } = require('../utils/errors');

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
    console.log('Error in Routes GET /profiles/:profile:', error);
    if(error instanceof NotFoundError) {
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
    console.log('Error in Routes GET /profiles/:profile/donations:', error);
    if(error instanceof NotFoundError || error instanceof ValidationError) {
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
    console.log('Error in Routes POST /profiles/:profile/donations:', error);
    if(error instanceof NotFoundError || error instanceof ValidationError) {
      res.status(error.statusCode).send(error.message);
    } else {
      res.status(500).send('Internal server error');
    }
  }
});

// TODO: Add a donation to the campaign profile POST /donations

// TODO: Add a profile POST /profiles (bonus)

module.exports = router;
