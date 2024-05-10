const request = require('supertest');
const app = require('../src/app');

const individualProfileId = '2ad19172-9683-407d-9732-8397d58ddcb2';


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

describe('GET /profiles/:profile/donations', () => {
  test(' should return all donations for a profile', async () => {
    const res = await request(app).get(`/profiles/${individualProfileId}/donations`);
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
        donorName: 'Fred Flintstone',
        amount: 1000,
        currency: 'AUD',
      });
    if (res.statusCode !== 200) {
      console.log(res.body);
    }
    expect(res.statusCode).toEqual(200);
  });
});
