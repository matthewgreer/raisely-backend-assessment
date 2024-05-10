const request = require('supertest');
const app = require('../src/app');


describe('GET /', () => {
  test(' should return welcome messge', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toBe('Welcome to my fundraising API, Raisely team!');
  });
});
