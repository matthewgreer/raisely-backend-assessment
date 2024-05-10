/* Data model for profiles.
  NB: This is a simple in-memory data store. In a real-world application, this would be replaced with a database. The store will not persist between server restarts.
*/
const { v4: uuidv4 } = require("uuid");
const { validateProfile } = require("../utils/validators");
const { ValidationError, NotFoundError } = require("../utils/errors");

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

// Technically, I wasn't asked to provide an addProfile endpoint, but it will be useful to have more than two hierarchical profiles, no?
/**
 * @param {*} profile
 * @returns
 */
const addProfile = (profile) => {
  // validate profile
  validateProfile(profile);

  profiles.push(profile);
  return profile;
};

const getProfiles = () => profiles;

module.exports = { addProfile, getProfiles };
