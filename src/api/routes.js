const express = require('express');
const { getProfiles } = require('../api/controllers/profiles_controller');
const { getProfileDonations } = require('../api/controllers/donations_controller');

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
  const profileId = req.params.profile;
  const donations = await getProfileDonations(profileId);
  res.json(donations);
});

module.exports = router;
