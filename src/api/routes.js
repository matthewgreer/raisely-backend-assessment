const express = require('express');
const { getProfiles } = require('../api/controllers/profiles_controller');
const { getProfileDonations } = require('../api/controllers/donations_controller');
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
  const profileId = req.params.profile;
  const donations = await getProfileDonations(profileId);
  res.json(donations);
});

module.exports = router;
