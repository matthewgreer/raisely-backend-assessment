/* Data model for profiles.
  NB: This is a simple in-memory data store. In a real-world application, this would be replaced with a database. The store will not persist between server restarts.
*/
const { v4: uuidv4 } = require("uuid");
// const { validateProfile } = require("../utils/validators");
const { NotFoundError } = require("../utils/errors");
const { dbDelay } = require('../utils/helpers')

/**
 * Fundraising profiles have the following shape:
 * id - A unique identifier, UUID v4
 * name - The display name for the profile
 * total - The total amount raised, in cents
 * parentId - The id of the profile that this profile belongs to. An ID of null indicates that the profile belongs is the root campaign profile
 * currency - The currency the profile is tracking their total in
 */
let profiles = [
  {
    currency: "AUD",
    id: "78afca18-8162-4ed5-9a7b-212b98c9ec87",
    name: "Campaign Profile",
    parentId: null,
    total: 5000, // includes the seeded donation
  },
  {
    currency: "AUD",
    id: "2ad19172-9683-407d-9732-8397d58ddcb2",
    name: "Nick's Fundraising Profile",
    parentId: "78afca18-8162-4ed5-9a7b-212b98c9ec87",
    total: 5000, // includes the seeded donation
  }
];

let cachedCampaignProfileId = "78afca18-8162-4ed5-9a7b-212b98c9ec87";

// Because it would be more efficient for us to cache the campaign profile ID, we will store it here. We can nullify it if we want to pretend the cache is invalidated or expired or something. Then we would fetch it from the database and re-cache it.

// Technically, I wasn't asked to provide an addProfile endpoint, but it will be useful to have more than two hierarchical profiles, no?
/**
 * @param {string} name
 * @param {string} parentId
 * @param {string} currency
 * @returns
 */
const addProfile = async (name, parentId, currency) => {
  await dbDelay();
  const profile = { name, parentId, currency };
  profile.id = uuidv4();
  profiles.push(profile);
  return profile.id;
};

const getProfiles = async () => {
  // in a database-backed application, we would make an asynchronous query to fetch profiles. We simulate this with a delay here. We would also handle errors, retries, and possibly pagination depending on the implementation.
  await dbDelay();
  return profiles;
};

const getProfile = async (profileId) => {
  await dbDelay();
  const profile = profiles.find(profile => profile.id === profileId);
  if (!profile) {
    console.log('Error in Profile Model getProfile: Profile not found')
    throw new NotFoundError(`Profile ${profileId} not found`);
  }
  return profile;
};

const getCampaignProfileId = () => {
  //It would be most efficient to cache this value (in this implementation, caching will mean storing it in a variable in the model). We can check to see if a cachedCampaignProfileId exists, but if not, we can fetch it from the database and re-cache it.

  if (!cachedCampaignProfileId) {
    const campaignProfileId = profiles.find(profile => profile.parentId === null).id;

    if(!campaignProfileId) {
      console.log('Error in Profile Model getCampaignProfileId: Campaign profile not found')
      throw new NotFoundError('Uh oh! Campaign profile not found.');
    }
    // cache the campaign profile ID
    cachedCampaignProfileId = campaignProfileId;
  }
  return cachedCampaignProfileId;
};

module.exports = { addProfile, getProfiles, getProfile, getCampaignProfileId };
