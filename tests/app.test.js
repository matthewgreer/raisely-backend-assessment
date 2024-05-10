const request = require('supertest');
const app = require('../src/app');


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
    const res = await request(app).get('/profiles/2ad19172-9683-407d-9732-8397d58ddcb2/donations');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });
});
