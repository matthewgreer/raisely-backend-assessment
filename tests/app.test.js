const request = require('supertest');
const app = require('../src/app');

const individualProfileId = '2ad19172-9683-407d-9732-8397d58ddcb2';
const campaignProfileId = '78afca18-8162-4ed5-9a7b-212b98c9ec87';

describe('GET /', () => {
  test(' should return welcome messge', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toBe('Welcome to my fundraising API, Raisely team!');
  });
});

describe('GET /profiles', () => {
  test(' should return all profiles', async () => {
    const res = await request(app).get('/profiles');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });
});

describe('GET /profiles/:profile', () => {
  test(' should return a profile', async () => {
    const res = await request(app).get(`/profiles/${individualProfileId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', individualProfileId);
  });

  test(' should return an error if profile does not exist', async () => {
    const res = await request(app).get('/profiles/im-the-wrong-id');
    expect(res.statusCode).toEqual(404);
  });
});

describe('GET /profiles/:profile/donations', () => {
  test(' should return all donations for a profile', async () => {
    const res = await request(app).get(
      `/profiles/${individualProfileId}/donations`,
    );
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  test(' should return an error if profile does not exist', async () => {
    const res = await request(app).get('/profiles/im-the-wrong-id/donations');
    expect(res.statusCode).toEqual(404);
  });
});

describe('POST /profiles/:profile/donations', () => {
  test(' should add a donation to the given profile', async () => {
    const res = await request(app)
      .post(`/profiles/${individualProfileId}/donations`)
      .send({
        donorName: 'Judith Neilson',
        amount: 1000,
        currency: 'AUD',
      });
    expect(res.statusCode).toEqual(200);
    expect(res.text).toBe('Donation added');
  });

  test(' should accurately increase the profile total when a donation is added', async () => {
    // Get the initial total for the profile
    let profile = await request(app).get(`/profiles/${individualProfileId}`);
    const initialTotal = profile.body.total;

    // Make a donation
    const donationAmount = 1000;
    await request(app).post(`/profiles/${individualProfileId}/donations`).send({
      donorName: 'Judith Neilson',
      amount: donationAmount,
      currency: 'AUD',
    });

    // Get the updated total for the profile
    profile = await request(app).get(`/profiles/${individualProfileId}`);
    const updatedTotal = profile.body.total;

    // Check that the updated total is correct
    expect(updatedTotal).toEqual(initialTotal + donationAmount);
  });

  test(' should accurately increase the campaign total when a donation is added to a child profile', async () => {
    // Get the initial totals for the profiles
    const campaignProfile = await request(app).get(
      `/profiles/${campaignProfileId}`,
    );
    const initialCampaignTotal = campaignProfile.body.total;

    const individualProfile = await request(app).get(
      `/profiles/${individualProfileId}`,
    );
    const initialIndividualTotal = individualProfile.body.total;

    // Make a donation
    const donationAmount = 1000;
    await request(app).post(`/profiles/${individualProfileId}/donations`).send({
      donorName: 'Judith Neilson',
      amount: donationAmount,
      currency: 'AUD',
    });

    // Get the updated totals for the profiles
    const newCampaignProfile = await request(app).get(
      `/profiles/${campaignProfileId}`,
    );
    const updatedCampaignTotal = newCampaignProfile.body.total;
    const newIndividualProfile = await request(app).get(
      `/profiles/${individualProfileId}`,
    );
    const updatedIndividualTotal = newIndividualProfile.body.total;

    // Check that the updated totals are correct
    expect(updatedCampaignTotal).toEqual(initialCampaignTotal + donationAmount);
    expect(updatedIndividualTotal).toEqual(
      initialIndividualTotal + donationAmount,
    );
  });

  test(' should return an error if profile does not exist', async () => {
    const res = await request(app)
      .post('/profiles/im-the-wrong-id/donations')
      .send({
        donorName: 'Judith Neilson',
        amount: 1000,
        currency: 'AUD',
      });
    expect(res.statusCode).toEqual(404);
  });

  test(' should return an error if donation is invalid', async () => {
    const res = await request(app)
      .post(`/profiles/${individualProfileId}/donations`)
      .send({
        donorName: 'Judith Neilson',
        amount: -1000,
        currency: 'AUD',
      });
    expect(res.statusCode).toEqual(400);
  });

  test(' should return an error if donation currency is invalid', async () => {
    const res = await request(app)
      .post(`/profiles/${individualProfileId}/donations`)
      .send({
        donorName: 'Judith Neilson',
        amount: 1000,
        currency: 'XYZ',
      });
    expect(res.statusCode).toEqual(400);
  });

  test(' should return an error if donation currency is missing', async () => {
    const res = await request(app)
      .post(`/profiles/${individualProfileId}/donations`)
      .send({
        donorName: 'Judith Neilson',
        amount: 1000,
      });
    expect(res.statusCode).toEqual(400);
  });

  test(' should return an error if donor name is missing', async () => {
    const res = await request(app)
      .post(`/profiles/${individualProfileId}/donations`)
      .send({
        amount: 1000,
        currency: 'AUD',
      });
    expect(res.statusCode).toEqual(400);
  });

  test(' should return an error if amount is missing', async () => {
    const res = await request(app)
      .post(`/profiles/${individualProfileId}/donations`)
      .send({
        donorName: 'Judith Neilson',
        currency: 'AUD',
      });
    expect(res.statusCode).toEqual(400);
  });

  test(' should return an error if amount is not a number', async () => {
    const res = await request(app)
      .post(`/profiles/${individualProfileId}/donations`)
      .send({
        donorName: 'Judith Neilson',
        amount: '1000',
        currency: 'AUD',
      });
    expect(res.statusCode).toEqual(400);
  });

  test(' should return an error if donor name is not a string', async () => {
    const res = await request(app)
      .post(`/profiles/${individualProfileId}/donations`)
      .send({
        donorName: 123,
        amount: 1000,
        currency: 'AUD',
      });
    expect(res.statusCode).toEqual(400);
  });

  test(' should return an error if profile id is missing from URL', async () => {
    const res = await request(app).post(`/profiles/donations`).send({
      donorName: 'Judith Neilson',
      amount: 1000,
      currency: 'AUD',
    });
    expect(res.statusCode).toEqual(404);
  });
});

describe('POST /donations', () => {
  test(' should add a donation to the campaign profile', async () => {
    const res = await request(app).post('/donations').send({
      donorName: 'Judith Neilson',
      amount: 1000,
      currency: 'AUD',
    });
    expect(res.statusCode).toEqual(200);
    expect(res.text).toBe('Donation added');
  });

  test(' should accurately increase the campaign total when a donation is added', async () => {
    // Get the initial total for the campaign profile
    let profile = await request(app).get(`/profiles/${campaignProfileId}`);
    const initialTotal = profile.body.total;

    // Make a donation
    const donationAmount = 1000;
    await request(app).post('/donations').send({
      donorName: 'Judith Neilson',
      amount: donationAmount,
      currency: 'AUD',
    });

    // Get the updated total for the campaign profile
    profile = await request(app).get(`/profiles/${campaignProfileId}`);
    const updatedTotal = profile.body.total;

    // Check that the updated total is correct
    expect(updatedTotal).toEqual(initialTotal + donationAmount);
  });

  test(' should return an error if donation amount is invalid', async () => {
    const res = await request(app).post('/donations').send({
      donorName: 'Judith Neilson',
      amount: -1000,
      currency: 'AUD',
    });
    expect(res.statusCode).toEqual(400);
  });
});

describe('POST /profiles', () => {
  test(' should create a new profile', async () => {
    const res = await request(app).post('/profiles').send({
      name: 'New Profile',
      parentId: campaignProfileId,
      currency: 'AUD',
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id');
  });

  test(' should return an error if profile is invalid', async () => {
    const res = await request(app).post('/profiles').send({
      name: 'New Profile',
      parentId: campaignProfileId,
    });
    expect(res.statusCode).toEqual(400);
  });
});
