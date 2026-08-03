import request from 'supertest';
import app from '../src/app.js';

describe('Auth REST API Endpoints', () => {
  it('should return 400 when registering with invalid email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'invalid-email',
      password: '123',
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should return health check status OK', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('OK');
  });
});
