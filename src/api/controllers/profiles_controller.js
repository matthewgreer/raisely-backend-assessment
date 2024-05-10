const ProfilesModel = require('../../models/profile');

const getProfiles = async () => {
  return ProfilesModel.getProfiles();
}

module.exports = { getProfiles };
